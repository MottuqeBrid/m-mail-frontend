// Fixed domain used for all temporary email addresses
export const DOMAIN = "@toytree.top";

// Generate a random alphanumeric string (used as default email prefix)
export const randStr = () => Math.random().toString(36).substring(2, 10);

// Decode quoted-printable encoded string
const decodeQP = (str) => {
  // Remove soft line breaks first
  const withoutSoftBreaks = str.replace(/=\r?\n/g, "");

  // Convert =XX sequences to bytes, then decode as UTF-8
  const bytes = [];
  let i = 0;
  while (i < withoutSoftBreaks.length) {
    if (
      withoutSoftBreaks[i] === "=" &&
      /[0-9A-Fa-f]{2}/.test(withoutSoftBreaks.substr(i + 1, 2))
    ) {
      bytes.push(parseInt(withoutSoftBreaks.substr(i + 1, 2), 16));
      i += 3;
    } else {
      bytes.push(withoutSoftBreaks.charCodeAt(i));
      i += 1;
    }
  }

  // Decode byte array as UTF-8
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
};

// Decode base64 encoded string (handles line-wrapped base64 with \r\n)
const decodeBase64 = (str) => {
  try {
    const cleaned = str.replace(/[\r\n\s]+/g, "");
    // atob -> binary string -> bytes -> UTF-8 decode
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.error(e);
    return str;
  }
};

// Remove quoted reply and forwarded content from email body.
// Strips lines starting with >, and everything after a reply header (On ... wrote:).
const stripQuoted = (text) => {
  const lines = text.split("\n");
  const clean = [];
  let inReply = false;

  for (let idx = 0; idx < lines.length; idx++) {
    if (inReply) continue;
    const line = lines[idx];
    const trimmed = line.trim();
    if (trimmed === "") continue;
    if (trimmed.startsWith(">")) continue;

    // "On ... wrote:" possibly spanning this line + next line
    if (/^On\b.*[,]?\s*$/.test(trimmed) && /^On\b/.test(trimmed)) {
      const next = (lines[idx + 1] || "").trim();
      if (/wrote:\s*$/.test(trimmed) || /wrote:\s*$/.test(next)) {
        inReply = true;
        continue;
      }
    }
    if (/^wrote:\s*$/.test(trimmed)) {
      inReply = true;
      continue;
    }

    clean.push(line);
  }
  return clean.join("\n").trim();
};

// Split a MIME part string into [headerBlock, bodyBlock]
const splitPart = (part) => {
  const idx = part.indexOf("\n\n");
  if (idx === -1) return ["", part.trim()];
  return [part.substring(0, idx).trim(), part.substring(idx + 2).trim()];
};

// Extract the display name from a From header like "Name <email>" or just "email"
const extractName = (from) => {
  const match = from.match(/^"?(.+?)"?\s*<[^>]+>$/);
  return match ? match[1].trim() : from.split("@")[0];
};

// Decode body content based on its Content-Transfer-Encoding header
const decodeByEncoding = (body, encoding) => {
  const enc = (encoding || "").toLowerCase();
  if (enc === "base64") return decodeBase64(body);
  if (enc === "quoted-printable") return decodeQP(body);
  return body;
};

// Get a header value from a part's header block (simple, single-line lookup)
const getPartHeader = (partHeaders, name) => {
  const re = new RegExp(`^${name}\\s*:(.*)$`, "im");
  const match = partHeaders.match(re);
  return match ? match[1].trim() : "";
};

// Recursively find the best body part (prefers text/plain, falls back to text/html)
// Handles nested multipart structures (e.g. multipart/mixed containing multipart/alternative)
const findBestBodyPart = (partHeaders, partBody) => {
  const contentType = getPartHeader(partHeaders, "content-type").toLowerCase();
  const encoding = getPartHeader(partHeaders, "content-transfer-encoding");

  // Nested multipart: recurse into sub-parts
  const nestedBoundary = contentType.match(/boundary="?([^";\s]+)"?/);
  if (nestedBoundary) {
    const subParts = partBody.split(`--${nestedBoundary[1]}`);
    let htmlFallback = null;

    for (const subPart of subParts) {
      const trimmed = subPart.trim();
      if (!trimmed || trimmed === "--") continue;
      const [subHeaders, subBody] = splitPart(trimmed);
      const result = findBestBodyPart(subHeaders, subBody);
      if (!result) continue;

      if (result.type === "text/plain") {
        return result;
      }
      if (result.type === "text/html" && !htmlFallback) {
        htmlFallback = result;
      }
    }
    return htmlFallback;
  }

  // Leaf part
  if (contentType.includes("text/plain")) {
    return { type: "text/plain", text: decodeByEncoding(partBody, encoding) };
  }
  if (contentType.includes("text/html")) {
    return { type: "text/html", text: decodeByEncoding(partBody, encoding) };
  }

  return null;
};

// Strip HTML tags down to readable text (basic fallback for HTML-only emails)
const htmlToText = (html) => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|td|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#8217;/gi, "’")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Parse a raw RFC 2822 email string into structured headers and body.
// Handles MIME multipart (including nested multipart/alternative), base64
// and quoted-printable decoding, header folding, and strips quoted reply text.
export const parseRawEmail = (raw) => {
  if (!raw) return { subject: "", from: "", date: "", body: "", preview: "" };

  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const headers = {};
  let body = "";
  let isBody = false;
  let lastKey = null; // track last header key for folding

  for (const line of lines) {
    if (!isBody && line === "") {
      isBody = true;
      continue;
    }
    if (!isBody) {
      // Folded header continuation line (starts with space/tab)
      if (/^[ \t]/.test(line) && lastKey) {
        headers[lastKey] += " " + line.trim();
        continue;
      }

      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim().toLowerCase();
        const value = line.substring(colonIdx + 1).trim();
        if (!headers[key]) {
          headers[key] = value;
          lastKey = key;
        } else {
          lastKey = null;
        }
      }
    } else {
      body += line + "\n";
    }
  }

  let cleanBody = body.trim();
  let bodyType = "text/plain";
  const fromRaw = headers.from || "";
  const contentType = (headers["content-type"] || "").toLowerCase();

  // Handle multipart: extract best text part (recursively handles nested multipart)
  const boundary = contentType.match(/boundary="?([^";\s]+)"?/);
  if (boundary) {
    const rawParts = cleanBody.split(`--${boundary[1]}`);
    let textPlain = null;
    let textHtml = null;

    for (const rawPart of rawParts) {
      const trimmed = rawPart.trim();
      if (!trimmed || trimmed === "--") continue;
      const [partHeaders, partBody] = splitPart(trimmed);
      const result = findBestBodyPart(partHeaders, partBody);
      if (!result) continue;

      if (result.type === "text/plain" && !textPlain) {
        textPlain = result.text;
      } else if (result.type === "text/html" && !textHtml) {
        textHtml = result.text;
      }
    }

    if (textPlain !== null) {
      cleanBody = textPlain;
      bodyType = "text/plain";
    } else if (textHtml !== null) {
      cleanBody = htmlToText(textHtml);
      bodyType = "text/html";
    }
  } else {
    // Single-part message: decode according to its own encoding
    cleanBody = decodeByEncoding(
      cleanBody,
      headers["content-transfer-encoding"],
    );
    if (contentType.includes("text/html")) {
      cleanBody = htmlToText(cleanBody);
      bodyType = "text/html";
    }
  }

  const preview = stripQuoted(cleanBody);

  return {
    subject: headers.subject || "(No Subject)",
    from: fromRaw,
    fromName: extractName(fromRaw),
    to: headers.to || "",
    date: headers.date || "",
    body: cleanBody,
    bodyType,
    preview,
  };
};

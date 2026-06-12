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

// Parse a raw RFC 2822 email string into structured headers and body.
// Handles MIME multipart (text/plain extraction), quoted-printable decoding,
// and strips quoted reply text.
// export const parseRawEmail = (raw) => {
//   if (!raw) return { subject: "", from: "", date: "", body: "", preview: "" };

//   const normalized = raw.replace(/\r\n/g, "\n");
//   const lines = normalized.split("\n");
//   const headers = {};
//   let body = "";
//   let isBody = false;

//   for (const line of lines) {
//     if (line === "") {
//       isBody = true;
//       continue;
//     }
//     if (!isBody) {
//       const colonIdx = line.indexOf(":");
//       if (colonIdx > 0) {
//         const key = line.substring(0, colonIdx).trim().toLowerCase();
//         const value = line.substring(colonIdx + 1).trim();
//         if (!headers[key]) {
//           headers[key] = value;
//         }
//       }
//     } else {
//       body += line + "\n";
//     }
//   }

//   let cleanBody = body.trim();
//   const fromRaw = headers.from || "";

//   // Handle multipart: extract text/plain section
//   const boundary = headers["content-type"]?.match(/boundary="?([^";\s]+)"?/);
//   if (boundary) {
//     const rawParts = cleanBody.split(`--${boundary[1]}`);
//     for (const rawPart of rawParts) {
//       const trimmed = rawPart.trim();
//       if (!trimmed || trimmed === "--") continue;
//       const [partHeaders, partBody] = splitPart(trimmed);
//       if (partHeaders.toLowerCase().includes("text/plain")) {
//         cleanBody = partBody;
//         if (partHeaders.toLowerCase().includes("quoted-printable")) {
//           cleanBody = decodeQP(cleanBody);
//         }
//         break;
//       }
//     }
//   } else {
//     if (headers["content-transfer-encoding"]?.toLowerCase() === "quoted-printable") {
//       cleanBody = decodeQP(cleanBody);
//     }
//   }

//   const preview = stripQuoted(cleanBody);

//   return {
//     subject: headers.subject || "(No Subject)",
//     from: fromRaw,
//     fromName: extractName(fromRaw),
//     date: headers.date || "",
//     body: cleanBody,
//     preview,
//   };
// };

export const parseRawEmail = (raw) => {
  if (!raw) return { subject: "", from: "", date: "", body: "", preview: "" };

  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const headers = {};
  let body = "";
  let isBody = false;
  let lastKey = null; // 👈 track last header key for folding

  for (const line of lines) {
    if (!isBody && line === "") {
      isBody = true;
      continue;
    }
    if (!isBody) {
      // 👇 Folded header continuation line (starts with space/tab)
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
  const fromRaw = headers.from || "";

  // Handle multipart: extract text/plain section
  const boundary = headers["content-type"]?.match(/boundary="?([^";\s]+)"?/);
  if (boundary) {
    const rawParts = cleanBody.split(`--${boundary[1]}`);
    for (const rawPart of rawParts) {
      const trimmed = rawPart.trim();
      if (!trimmed || trimmed === "--") continue;
      const [partHeaders, partBody] = splitPart(trimmed);
      if (partHeaders.toLowerCase().includes("text/plain")) {
        cleanBody = partBody;
        if (partHeaders.toLowerCase().includes("quoted-printable")) {
          cleanBody = decodeQP(cleanBody);
        }
        break;
      }
    }
  } else {
    if (
      headers["content-transfer-encoding"]?.toLowerCase() === "quoted-printable"
    ) {
      cleanBody = decodeQP(cleanBody);
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
    preview,
  };
};

import { parseRawEmail } from "./utils";

const EmailRow = ({ email, onClick, isActive }) => {
  const parsed = parseRawEmail(email.raw);

  const sender = parsed.fromName || parsed.from || email.from || "Unknown";
  const initials = sender
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-base-200/50 transition-colors ${
        isActive ? "bg-base-200" : ""
      }`}
      onClick={() => onClick(email)}
    >
      <div className="avatar placeholder shrink-0">
        <div className="bg-primary text-primary-content rounded-full w-9 h-9 flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm truncate">{sender}</p>
          <span className="text-xs text-base-content/40 shrink-0">
            {formatTime(parsed.date || email.createdAt)}
          </span>
        </div>
        <p className="text-sm text-base-content/70 truncate">
          {parsed.subject}
        </p>
        <p className="text-xs text-base-content/40 truncate">
          {parsed.preview}
        </p>
      </div>
    </div>
  );
};

export default EmailRow;

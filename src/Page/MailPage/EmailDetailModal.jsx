import { MdClose, MdOutlineReply, MdMoreVert } from "react-icons/md";
import { parseRawEmail } from "./utils";

// Full-screen overlay modal displaying a clean email detail view.
// Shows sender, recipient, subject, date, and clean body text.
const EmailDetailModal = ({ email, onClose }) => {
  if (!email?.raw) return null;
  const parsed = parseRawEmail(email.raw);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sender = parsed.fromName || parsed.from || email.from || "Unknown";
  const initials = sender
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 bg-base-300/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 shrink-0">
          <h2 className="text-base font-semibold truncate mr-3">
            {parsed.subject}
          </h2>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm btn-square" title="Reply">
              <MdOutlineReply size={18} />
            </button>
            <button className="btn btn-ghost btn-sm btn-square" title="More">
              <MdMoreVert size={18} />
            </button>
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={onClose}
              title="Close"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Sender row */}
        <div className="px-5 py-4 border-b border-base-200 bg-base-100/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{sender}</p>
              <p className="text-xs text-base-content/50 truncate">
                to {email.to}
              </p>
            </div>
            <span className="text-xs text-base-content/40 whitespace-nowrap shrink-0">
              {formatDate(parsed.date || email.createdAt)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {parsed.preview ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {parsed.preview}
            </div>
          ) : parsed.body ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-base-content/70">
              {parsed.body}
            </div>
          ) : (
            <p className="text-sm text-base-content/40 italic">No content</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetailModal;

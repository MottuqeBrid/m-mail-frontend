import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Swal from "sweetalert2";
import {
  MdContentCopy,
  MdRefresh,
  MdEmail,
  MdInbox,
  MdAdd,
  MdOutlineInbox,
} from "react-icons/md";
import EmailRow from "./EmailRow";
import EmailDetailModal from "./EmailDetailModal";
import CreateMailModal from "./CreateMailModal";

const MailPage = () => {
  const { user } = useAuth();
  const app = useAxios();

  const [allTempMails, setAllTempMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const activeMail =
    selectedMail || allTempMails[0]?.email || allTempMails[0] || null;
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailEmail, setDetailEmail] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const addTempMail = (email) => {
    setAllTempMails((prev) => [email, ...prev]);
    setSelectedMail(email);
  };

  const fetchEmails = useCallback(async () => {
    if (!activeMail) return;
    setLoading(true);
    try {
      const { data } = await app.get(`mail/${activeMail}`);
      setEmails(data.emails || []);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setLoading(false);
    }
  }, [activeMail, app]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (user?.tempMail) {
      setAllTempMails(
        user.tempMail.map((m) => (typeof m === "string" ? m : m.email)),
      );
    }
  }, [user]);

  useEffect(() => {
    setEmails([]);
    setInitialFetchDone(false);
  }, [activeMail]);

  useEffect(() => {
    if (activeMail && !initialFetchDone) {
      setInitialFetchDone(true);
      fetchEmails();
    }
  }, [activeMail, initialFetchDone, fetchEmails]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!activeMail) return;
    const interval = setInterval(fetchEmails, 15000);
    return () => clearInterval(interval);
  }, [activeMail, fetchEmails]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Email address copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Failed to copy", "error");
    }
  };

  const viewEmailDetail = (email) => {
    setDetailEmail(email);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <MdEmail size={48} className="mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/50">
            Please log in to access your mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Address bar */}
      <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm mb-4 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-base-200 bg-base-100/50">
          <MdEmail className="text-primary shrink-0" size={20} />
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <select
              className="select select-bordered select-sm text-sm max-w-[240px]"
              value={selectedMail || ""}
              onChange={(e) => setSelectedMail(e.target.value)}
            >
              {allTempMails.length === 0 && (
                <option value="">No addresses</option>
              )}
              {allTempMails.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {activeMail && (
              <span className="text-sm text-base-content/60 hidden sm:inline truncate">
                {activeMail}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setShowCreate(true)}
              title="New email address"
            >
              <MdAdd size={18} />
            </button>
            {activeMail && (
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => copyToClipboard(activeMail)}
                title="Copy address"
              >
                <MdContentCopy size={18} />
              </button>
            )}
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={fetchEmails}
              disabled={loading}
              title="Refresh"
            >
              <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Main inbox */}
      <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm min-h-[400px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-200 bg-base-100/50">
          <div className="flex items-center gap-2 text-sm font-medium text-base-content/70">
            <MdOutlineInbox size={16} />
            Inbox
            {activeMail && (
              <span className="text-xs text-base-content/40 font-normal">
                — {emails.length} message{emails.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-base-content/40">
            <MdRefresh size={11} className={loading ? "animate-spin" : ""} />
            Auto-refresh 15s
          </div>
        </div>

        {!activeMail ? (
          <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
            <MdInbox size={48} className="mb-3" />
            <p className="text-sm">No temporary email addresses.</p>
          </div>
        ) : loading && emails.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
            <MdOutlineInbox size={48} className="mb-3" />
            <p className="text-sm font-medium">Inbox is empty</p>
            <p className="text-xs mt-1">Waiting for incoming emails...</p>
          </div>
        ) : (
          <div className="divide-y divide-base-200">
            {emails.map((email) => (
              <EmailRow
                key={email._id}
                email={email}
                onClick={viewEmailDetail}
                isActive={detailEmail?._id === email._id}
              />
            ))}
          </div>
        )}
      </div>

      {detailEmail && (
        <EmailDetailModal
          email={detailEmail}
          onClose={() => setDetailEmail(null)}
        />
      )}

      {showCreate && (
        <CreateMailModal
          onClose={() => setShowCreate(false)}
          onCreated={addTempMail}
        />
      )}
    </div>
  );
};

export default MailPage;

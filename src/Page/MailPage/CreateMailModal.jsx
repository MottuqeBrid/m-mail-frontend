import { useState } from "react";
import { MdClose } from "react-icons/md";
import useAxios from "../../hooks/useAxios";
import Swal from "sweetalert2";
import { DOMAIN, randStr } from "./utils";

// Modal to create a new temporary email address.
// The domain is fixed to DOMAIN; the user only enters the local prefix.
// Sends POST /create-temp-mail with the full address.
const CreateMailModal = ({ onClose, onCreated }) => {
  const app = useAxios();
  const [prefix, setPrefix] = useState(randStr);
  const [creating, setCreating] = useState(false);

  const fullEmail = `${prefix.toLowerCase()}${DOMAIN}`;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!prefix.trim()) {
      return Swal.fire("Error", "Enter a name for your email", "error");
    }
    setCreating(true);
    try {
      const { data } = await app.post("create-temp-mail", {
        email: fullEmail,
      });
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: fullEmail,
          timer: 1500,
          showConfirmButton: false,
        });
        onCreated(fullEmail);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create email";
      Swal.fire("Error", msg, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-semibold">New Temporary Email</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <MdClose size={18} />
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-4 space-y-4">
          <label className="form-control">
            <span className="label-text mb-1">Email name</span>
            <div className="join w-full">
              <input
                type="text"
                className="input input-bordered join-item flex-1 font-mono"
                placeholder="name"
                value={prefix}
                onChange={(e) =>
                  setPrefix(e.target.value.replace(/[^a-z0-9._-]/gi, ""))
                }
                autoFocus
              />
              <span className="join-item flex items-center px-3 bg-base-300 text-base-content/60 text-sm font-mono">
                {DOMAIN}
              </span>
            </div>
            <p className="text-xs text-base-content/50 mt-1">
              Full address:{" "}
              <span className="font-mono font-semibold">{fullEmail}</span>
            </p>
          </label>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={creating}
          >
            {creating && <span className="loading loading-spinner" />}
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMailModal;

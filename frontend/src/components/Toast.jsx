import { useEffect } from "react";

function Toast({
  type,
  message,
  onClose,
}) {
  useEffect(() => {
    const timer =
      setTimeout(() => {
        onClose();
      }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className={`toast toast-${type}`}
    >
      <div className="toast-icon">
        {type === "error"
          ? "!"
          : "✓"}
      </div>

      <p>
        {message}
      </p>

      <button
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
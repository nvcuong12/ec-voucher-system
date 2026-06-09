import {
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiQuestionLine,
} from "react-icons/ri";

const variantIcons = {
  danger: <RiErrorWarningLine />,
  warning: <RiAlertLine />,
  success: <RiCheckLine />,
  primary: <RiQuestionLine />,
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "primary",
  onConfirm,
  onCancel,
  requireInput = false,
  inputLabel = "",
  inputPlaceholder = "",
  inputValue = "",
  onInputChange,
  inputRequired = false,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-close-btn" onClick={onCancel} aria-label="Đóng">
          <RiCloseLine />
        </button>
        <div className={`confirm-icon-ring confirm-icon-${variant}`}>
          {variantIcons[variant]}
        </div>
        <h3 className="confirm-title">{title}</h3>
        {message && <p className="confirm-msg">{message}</p>}
        {requireInput && (
          <div className="confirm-input-wrap">
            {inputLabel && <label className="confirm-input-label">{inputLabel}</label>}
            <textarea
              className="input"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              autoFocus
              style={{ minHeight: "80px", resize: "vertical", width: "100%" }}
            />
          </div>
        )}
        <div className="confirm-action-row">
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn btn-${variant}`}
            onClick={onConfirm}
            disabled={requireInput && inputRequired && !inputValue?.trim()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

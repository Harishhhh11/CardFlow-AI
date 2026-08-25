import { useRef, useState } from "react";

function CardUploader({ title, required = false, preview, onFileChange, onOpenCamera, onRemove }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState("");

  const openFilePicker = () => fileInputRef.current?.click();

  const validateAndSendFile = (selectedFile) => {
    if (!selectedFile) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setImageError("Please upload JPG, PNG, or WEBP.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setImageError("Image size must be less than 10 MB.");
      return;
    }
    setImageError("");
    onFileChange(selectedFile);
  };

  const handleFileChange = (event) => {
    validateAndSendFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSendFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className={`card-uploader capture-station ${required ? "is-primary" : "is-secondary"}`}>
      <div className="uploader-header">
        <div className="uploader-title-group">
          <div className={`side-indicator ${required ? "side-indicator-primary" : ""}`}>
            {required ? "01" : "02"}
          </div>
          <div>
            <div className="capture-eyebrow">{required ? "PRIMARY SOURCE" : "OPTIONAL SOURCE"}</div>
            <h3>{title}</h3>
            <p>{required ? "Front of the business card" : "Back of the business card"}</p>
          </div>
        </div>
        <span className={required ? "badge-required" : "badge-optional"}>
          {required ? "Required" : "Optional"}
        </span>
      </div>

      {!preview ? (
        <div
          className={`upload-empty-state capture-dropzone ${isDragging ? "upload-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          <div className="capture-visual-stack" aria-hidden="true">
            <div className="capture-ring ring-a" />
            <div className="capture-ring ring-b" />
            <div className="capture-card-ghost">
              <div className="ghost-brand-dot" />
              <div className="ghost-lines"><span /><span /><span /></div>
              <div className="ghost-chip-row"><i /><i /><i /></div>
            </div>
            <div className="capture-scan-glow" />
          </div>

          <div className="capture-copy">
            <span className="capture-kicker">{isDragging ? "DROP TO ATTACH" : "READY TO CAPTURE"}</span>
            <h4>{required ? "Scan the front side" : "Add the back side"}</h4>
            <p>{required ? "Use your camera for the fastest scan, or upload a clear card image." : "Only add this side when it contains extra contact information."}</p>
          </div>

          <div className="upload-actions capture-actions-primary">
            <button type="button" className="primary-upload-button" onClick={onOpenCamera}>
              <span className="button-icon">◉</span>
              Use camera
              <span className="button-arrow">→</span>
            </button>
            <button type="button" className="secondary-upload-button" onClick={openFilePicker}>
              <span>↑</span>
              Choose image
            </button>
          </div>

          <div className="capture-divider"><span>or</span></div>
          <div className="upload-drop-text"><strong>Drag & drop</strong> your card image here</div>

          {imageError && (
            <div className="upload-error"><span>⚠</span>{imageError}</div>
          )}

          <div className="upload-supported capture-formats">
            <span>JPG</span><span>PNG</span><span>WEBP</span><small>Up to 10 MB</small>
          </div>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" capture="environment" hidden onChange={handleFileChange} />
        </div>
      ) : (
        <div className="captured-card capture-result">
          <div className="captured-image-container capture-preview-frame">
            <img src={preview} alt={title} />
            <div className="image-overlay" />
            <div className="captured-badge"><span className="captured-check">✓</span> Card attached</div>
            <div className="image-file-status"><span className="image-status-dot" /> Ready for AI</div>
            <div className="preview-scan-line" />
            <div className="preview-corners" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>
          <div className="captured-card-info">
            <div className="captured-card-info-left">
              <div className="image-success-icon">✓</div>
              <div>
                <strong>{required ? "Front side ready" : "Back side ready"}</strong>
                <span>Image quality looks ready for extraction</span>
              </div>
            </div>
            <div className="ready-pulse"><span /> READY</div>
          </div>
          <div className="captured-actions">
            <button type="button" className="retake-button" onClick={onOpenCamera}>◉ Retake</button>
            <button type="button" className="replace-button" onClick={openFilePicker}>↑ Replace</button>
            <button type="button" className="remove-card-button" onClick={onRemove} title="Remove card">×</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" capture="environment" hidden onChange={handleFileChange} />
        </div>
      )}
    </div>
  );
}

export default CardUploader;

import {
  useRef,
  useState
} from "react";


function CardUploader({
  title,
  required = false,
  preview,
  onFileChange,
  onOpenCamera,
  onRemove
}) {

  const fileInputRef =
    useRef(null);


  const [
    isDragging,
    setIsDragging
  ] =
    useState(false);


  const [
    imageError,
    setImageError
  ] =
    useState("");


  const openFilePicker = () => {

    fileInputRef.current?.click();

  };


  const validateAndSendFile =
    (selectedFile) => {

      if (!selectedFile) {
        return;
      }


      const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

      ];


      if (
        !allowedTypes.includes(
          selectedFile.type
        )
      ) {

        setImageError(
          "Please upload a JPG, PNG, or WEBP image."
        );

        return;

      }


      const maxSize =
        10 * 1024 * 1024;


      if (
        selectedFile.size >
        maxSize
      ) {

        setImageError(
          "Image size must be less than 10 MB."
        );

        return;

      }


      setImageError("");

      onFileChange(
        selectedFile
      );

    };


  const handleFileChange =
    (event) => {

      const selectedFile =
        event.target.files?.[0];


      validateAndSendFile(
        selectedFile
      );


      event.target.value =
        "";

    };


  const handleDragOver =
    (event) => {

      event.preventDefault();

      setIsDragging(
        true
      );

    };


  const handleDragLeave =
    (event) => {

      event.preventDefault();

      setIsDragging(
        false
      );

    };


  const handleDrop =
    (event) => {

      event.preventDefault();

      setIsDragging(
        false
      );


      const droppedFile =
        event.dataTransfer.files?.[0];


      validateAndSendFile(
        droppedFile
      );

    };


  const handleRemove = () => {

    setImageError("");

    onRemove();

  };


  return (

    <div
      className={`card-uploader ${
        required
          ? "card-uploader-required"
          : "card-uploader-optional"
      }`}
    >


      {/* ============================= */}
      {/* CARD HEADER */}
      {/* ============================= */}

      <div className="uploader-header">


        <div className="uploader-title-group">


          <div
            className={`side-indicator ${
              required
                ? "side-indicator-primary"
                : ""
            }`}
          >

            {required
              ? "01"
              : "02"}

          </div>


          <div>

            <h3>

              {title}

            </h3>


            <p>

              {required
                ? "Primary card image"
                : "Additional information"}

            </p>

          </div>

        </div>


        <span
          className={
            required
              ? "badge-required"
              : "badge-optional"
          }
        >

          <span
            className="badge-dot"
          />

          {required
            ? "Required"
            : "Optional"}

        </span>

      </div>


      {/* ============================= */}
      {/* EMPTY UPLOAD STATE */}
      {/* ============================= */}

      {!preview ? (

        <div
          className={`upload-empty-state ${
            isDragging
              ? "upload-dragging"
              : ""
          }`}
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={
            handleDrop
          }
        >


          <div className="upload-visual">


            <div className="upload-glow" />


            <div className="upload-icon">

              <span>

                🪪

              </span>

            </div>


            <div className="upload-spark spark-one">

              ✦

            </div>


            <div className="upload-spark spark-two">

              ✦

            </div>

          </div>


          <h4>

            {required
              ? "Add your visiting card"
              : "Add the other side"}

          </h4>


          <p>

            {required
              ? "Capture it live or upload a clear image to begin AI extraction."
              : "Upload this only if the back side contains additional contact details."}

          </p>


          <div className="upload-actions">


            <button
              type="button"
              className="primary-upload-button"
              onClick={
                onOpenCamera
              }
            >

              <span className="button-icon">

                📷

              </span>


              Open Camera


              <span className="button-arrow">

                →

              </span>

            </button>


            <button
              type="button"
              className="secondary-upload-button"
              onClick={
                openFilePicker
              }
            >

              <span>

                ↑

              </span>

              Upload Image

            </button>

          </div>


          <div className="upload-drop-text">

            <span>

              or

            </span>

            Drag and drop your image here

          </div>


          {imageError && (

            <div className="upload-error">

              <span>

                ⚠

              </span>

              {imageError}

            </div>

          )}


          <div className="upload-supported">

            <span>

              JPG

            </span>

            <span>

              PNG

            </span>

            <span>

              WEBP

            </span>

            <small>

              Maximum 10 MB

            </small>

          </div>


          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            hidden
            onChange={
              handleFileChange
            }
          />

        </div>

      ) : (

        /* ============================= */
        /* IMAGE PREVIEW STATE */
        /* ============================= */

        <div className="captured-card">


          <div className="captured-image-container">


            <img
              src={preview}
              alt={title}
            />


            <div className="image-overlay" />


            <div className="captured-badge">

              <span className="captured-check">

                ✓

              </span>

              Ready to scan

            </div>


            <div className="image-file-status">

              <span className="image-status-dot" />

              Image attached

            </div>


            <div className="preview-scan-line" />

          </div>


          <div className="captured-card-info">


            <div className="captured-card-info-left">

              <div className="image-success-icon">

                ✓

              </div>


              <div>

                <strong>

                  Card image ready

                </strong>


                <span>

                  AI can now extract contact details

                </span>

              </div>

            </div>


            <div className="ready-pulse">

              <span />

              Ready

            </div>

          </div>


          <div className="captured-actions">


            <button
              type="button"
              className="retake-button"
              onClick={
                onOpenCamera
              }
            >

              <span>

                📷

              </span>

              Retake

            </button>


            <button
              type="button"
              className="replace-button"
              onClick={
                openFilePicker
              }
            >

              <span>

                ↑

              </span>

              Replace

            </button>


            <button
              type="button"
              className="remove-card-button"
              onClick={
                handleRemove
              }
              title="Remove card"
            >

              ✕

            </button>

          </div>


          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            hidden
            onChange={
              handleFileChange
            }
          />

        </div>

      )}

    </div>

  );

}


export default CardUploader;
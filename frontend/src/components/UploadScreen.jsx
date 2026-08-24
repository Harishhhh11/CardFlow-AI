import CardUploader from "./CardUploader";

function UploadScreen({
  side1,
  side2,
  side1Preview,
  side2Preview,
  onSideChange,
  onRemove,
  onBack,
  onScan,
}) {
  return (
    <section className="upload-screen">
      <div className="screen-heading">
        <span className="screen-eyebrow">
          STEP 01
        </span>

        <h1>
          Upload your visiting card
        </h1>

        <p>
          Add the front side of the card. You can also
          upload the back side if it contains additional
          information.
        </p>
      </div>

      <div className="upload-grid">
        <CardUploader
          title="Front Side"
          required={true}
          file={side1}
          preview={side1Preview}
          onFileChange={(file) =>
            onSideChange(
              file,
              "side1"
            )
          }
          onRemove={() =>
            onRemove("side1")
          }
        />

        <CardUploader
          title="Back Side"
          required={false}
          file={side2}
          preview={side2Preview}
          onFileChange={(file) =>
            onSideChange(
              file,
              "side2"
            )
          }
          onRemove={() =>
            onRemove("side2")
          }
        />
      </div>

      <div className="upload-security-note">
        <span>🔒</span>

        Your images are securely processed only for
        extracting contact information.
      </div>

      <div className="screen-navigation">
        <button
          className="secondary-navigation-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          className="primary-navigation-button"
          disabled={!side1}
          onClick={onScan}
        >
          <span>
            ✨
          </span>

          Scan with AI

          <span>
            →
          </span>
        </button>
      </div>
    </section>
  );
}

export default UploadScreen;
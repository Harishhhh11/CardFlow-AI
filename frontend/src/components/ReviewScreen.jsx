import { useState } from "react";

import ContactForm from "./ContactForm";

function ReviewScreen({
  contact,
  setContact,
  side1Preview,
  side2Preview,
  onBack,
  onSave,
}) {
  const [saving, setSaving] =
    useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="review-screen">
      <div className="screen-heading review-heading">
        <div>
          <span className="screen-eyebrow">
            STEP 03
          </span>

          <h1>
            Review extracted details
          </h1>

          <p>
            Check the information extracted by AI and
            edit anything before saving.
          </p>
        </div>

        <div className="extraction-complete-badge">
          <span>✦</span>

          AI Extraction Complete
        </div>
      </div>

      <div className="review-layout">
        <aside className="review-card-preview">
          <h3>
            Scanned Card
          </h3>

          {side1Preview && (
            <img
              src={side1Preview}
              alt="Front side"
            />
          )}

          {side2Preview && (
            <img
              src={side2Preview}
              alt="Back side"
            />
          )}

          <div className="review-preview-note">
            <span>🔍</span>

            Compare the extracted information with
            your original card.
          </div>
        </aside>

        <div className="review-form-container">
          <ContactForm
            contact={contact}
            setContact={setContact}
          />
        </div>
      </div>

      <div className="screen-navigation review-navigation">
        <button
          className="secondary-navigation-button"
          onClick={onBack}
          disabled={saving}
        >
          ← Back to Upload
        </button>

        <button
          className="save-navigation-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="save-spinner" />

              Saving Contact...
            </>
          ) : (
            <>
              <span>
                💾
              </span>

              Save Contact

              <span>
                →
              </span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

export default ReviewScreen;
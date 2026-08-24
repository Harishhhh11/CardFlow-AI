function SuccessScreen({
  contact,
  onNewScan,
  onHome,
}) {
  return (
    <section className="success-screen">
      <div className="success-animation">
        <div className="success-ring ring-one" />
        <div className="success-ring ring-two" />

        <div className="success-check">
          ✓
        </div>
      </div>

      <div className="success-copy">
        <span className="success-eyebrow">
          SUCCESSFULLY SAVED
        </span>

        <h1>
          Contact saved successfully!
        </h1>

        <p>
          {contact?.name
            ? `${contact.name}'s contact details are now safely stored.`
            : "The contact details are now safely stored."}
        </p>
      </div>

      <div className="saved-contact-card">
        <div className="saved-avatar">
          {contact?.name
            ? contact.name
                .split(" ")
                .slice(0, 2)
                .map(
                  (part) =>
                    part[0]
                )
                .join("")
                .toUpperCase()
            : "CF"}
        </div>

        <div>
          <strong>
            {contact?.name ||
              "New Contact"}
          </strong>

          <span>
            {contact?.designation ||
              "Contact Information"}
          </span>

          <small>
            {contact?.company_name ||
              "CardFlow AI"}
          </small>
        </div>
      </div>

      <div className="success-actions">
        <button
          className="primary-navigation-button"
          onClick={onNewScan}
        >
          <span>
            ＋
          </span>

          Scan Another Card

          <span>
            →
          </span>
        </button>

        <button
          className="success-home-button"
          onClick={onHome}
        >
          Back to Home
        </button>
      </div>
    </section>
  );
}

export default SuccessScreen;
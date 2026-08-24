function ProcessingScreen() {
  const messages = [
    "Reading your visiting card...",
    "Detecting names and companies...",
    "Extracting phone numbers...",
    "Finding email addresses...",
    "Organizing contact details...",
  ];

  return (
    <section className="processing-screen">
      <div className="processing-orbit">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="orbit orbit-three" />

        <div className="processing-core">
          ✨
        </div>
      </div>

      <div className="processing-copy">
        <span className="processing-eyebrow">
          CARD FLOW AI
        </span>

        <h1>
          AI is analyzing your card
        </h1>

        <p>
          Please wait while we extract and organize
          all the contact information.
        </p>
      </div>

      <div className="processing-steps">
        {messages.map(
          (message, index) => (
            <div
              className="processing-step"
              key={message}
            >
              <div
                className={`processing-step-dot ${
                  index === 0
                    ? "active"
                    : ""
                }`}
              />

              <span>
                {message}
              </span>
            </div>
          )
        )}
      </div>

      <div className="processing-loader">
        <div className="processing-loader-bar" />
      </div>

      <small className="processing-footer">
        This usually takes only a few seconds
      </small>
    </section>
  );
}

export default ProcessingScreen;
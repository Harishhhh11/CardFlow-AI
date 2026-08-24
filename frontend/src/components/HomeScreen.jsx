function HomeScreen({
  onStart,
}) {
  return (
    <section className="home-screen">
      <div className="home-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />

          POWERED BY AI
        </div>

        <h1>
          Your visiting cards.
          <br />

          <span>
            Organized instantly.
          </span>
        </h1>

        <p>
          Capture or upload a visiting card and let
          CardFlow AI automatically extract contact
          information in seconds.
        </p>

        <div className="home-actions">
          <button
            className="primary-hero-button"
            onClick={onStart}
          >
            <span className="hero-button-icon">
              ✨
            </span>

            Scan a Visiting Card

            <span className="button-arrow">
              →
            </span>
          </button>
        </div>

        <div className="hero-features">
          <div>
            <span>⚡</span>

            AI Extraction
          </div>

          <div>
            <span>🔒</span>

            Secure Processing
          </div>

          <div>
            <span>✓</span>

            Review Before Save
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-glow glow-one" />
        <div className="visual-glow glow-two" />

        <div className="floating-card back-card">
          <div className="mini-card-line long" />
          <div className="mini-card-line medium" />
          <div className="mini-card-line short" />
        </div>

        <div className="main-visual-card">
          <div className="card-top">
            <div className="avatar-placeholder">
              JD
            </div>

            <div>
              <div className="visual-name">
                John David
              </div>

              <div className="visual-role">
                Product Manager
              </div>
            </div>
          </div>

          <div className="visual-divider" />

          <div className="visual-contact">
            <span>📱</span>

            +91 98765 43210
          </div>

          <div className="visual-contact">
            <span>✉</span>

            john@company.com
          </div>

          <div className="visual-contact">
            <span>🌐</span>

            www.company.com
          </div>

          <div className="ai-verified">
            <span>✦</span>

            Extracted by AI
          </div>
        </div>

        <div className="floating-stat stat-one">
          <span className="stat-icon">
            ✦
          </span>

          <div>
            <strong>
              AI Powered
            </strong>

            <small>
              Smart extraction
            </small>
          </div>
        </div>

        <div className="floating-stat stat-two">
          <strong>
            99%
          </strong>

          <span>
            Accuracy
          </span>
        </div>
      </div>
    </section>
  );
}

export default HomeScreen;
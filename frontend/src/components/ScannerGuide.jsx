function ScannerGuide({
  onBack,
  onContinue,
}) {
  return (
    <section className="guide-screen">
      <div className="screen-heading centered-heading">
        <span className="screen-eyebrow">
          BEFORE YOU START
        </span>

        <h1>
          Get the perfect scan
        </h1>

        <p>
          Follow these simple tips for the best AI
          extraction results.
        </p>
      </div>

      <div className="guide-grid">
        <div className="guide-card">
          <div className="guide-icon">
            💡
          </div>

          <h3>
            Good Lighting
          </h3>

          <p>
            Make sure the visiting card is clearly
            visible and well illuminated.
          </p>
        </div>

        <div className="guide-card">
          <div className="guide-icon">
            🎯
          </div>

          <h3>
            Keep It Straight
          </h3>

          <p>
            Position the entire card inside the frame
            and avoid excessive rotation.
          </p>
        </div>

        <div className="guide-card">
          <div className="guide-icon">
            🔍
          </div>

          <h3>
            Keep Text Clear
          </h3>

          <p>
            Avoid blur, glare and shadows covering
            important information.
          </p>
        </div>
      </div>

      <div className="guide-example">
        <div className="guide-example-card">
          <div className="guide-check">
            ✓
          </div>

          <span className="example-label">
            GOOD SCAN
          </span>

          <div className="example-lines">
            <div />
            <div />
            <div />
          </div>
        </div>

        <div className="guide-arrow">
          →
        </div>

        <div className="guide-result">
          <div className="result-icon">
            ✨
          </div>

          <div>
            <strong>
              AI Ready
            </strong>

            <p>
              Clear information = better extraction
            </p>
          </div>
        </div>
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
          onClick={onContinue}
        >
          Continue to Upload

          <span>→</span>
        </button>
      </div>
    </section>
  );
}

export default ScannerGuide;
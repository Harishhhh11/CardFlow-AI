function Navbar({
  onLogoClick,
  onNewScan,
}) {
  return (
    <header className="navbar">
      <button
        className="brand-button"
        onClick={onLogoClick}
      >
        <div className="brand-logo">
          CF
        </div>

        <div className="brand-text">
          <strong>
            CardFlow AI
          </strong>

          <span>
            Smart Contact Scanner
          </span>
        </div>
      </button>

      <div className="navbar-right">
        <div className="ai-status">
          <span className="status-pulse" />

          AI Ready
        </div>

        <button
          className="nav-new-scan"
          onClick={onNewScan}
        >
          <span>＋</span>

          <span className="nav-button-text">
            New Scan
          </span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
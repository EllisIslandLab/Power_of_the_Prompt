/* global React */
const { useState, useRef, useEffect, useCallback, useLayoutEffect } = React;

/* ----------------------------- Icons ----------------------------- */
const Icon = ({ d, size = 17, sw = 1.7, fill = "none", children, vb = 24 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);
const MobileIcon = (p) => <Icon {...p} children={<><rect x="7" y="2.5" width="10" height="19" rx="2.4" /><line x1="11" y1="18.3" x2="13" y2="18.3" /></>} />;
const DesktopIcon = (p) => <Icon {...p} children={<><rect x="2.5" y="4" width="19" height="13" rx="2" /><line x1="8.5" y1="20.5" x2="15.5" y2="20.5" /><line x1="12" y1="17" x2="12" y2="20.5" /></>} />;
const ReloadIcon = (p) => <Icon {...p} children={<><path d="M20 11a8 8 0 1 0-2.3 5.4" /><path d="M20 5.5V11h-5.5" /></>} />;
const ArrowUpIcon = (p) => <Icon {...p} d="M12 19V5M6 11l6-6 6 6" />;
const ArrowDownIcon = (p) => <Icon {...p} d="M12 5v14M6 13l6 6 6-6" />;
const SunIcon = (p) => <Icon {...p} children={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>} />;
const MoonIcon = (p) => <Icon {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />;
const CheckIcon = (p) => <Icon {...p} d="M20 6 9 17l-5-5" />;

/* status bar glyphs (inherit color via currentColor) */
const SignalGlyph = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
    <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
    <rect x="5" y="5" width="3" height="7" rx="1" />
    <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
    <rect x="15" y="0" width="3" height="12" rx="1" />
  </svg>
);
const WifiGlyph = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="M1.5 3.6a11 11 0 0 1 14 0" />
    <path d="M4 6.4a7 7 0 0 1 9 0" />
    <path d="M6.5 9.1a3 3 0 0 1 4 0" />
    <circle cx="8.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);
const BatteryGlyph = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
    <rect x="0.5" y="0.5" width="22" height="12" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
    <rect x="2.2" y="2.2" width="18.6" height="8.6" rx="1.8" fill="currentColor" />
    <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
  </svg>
);

/* ----------------------------- Status bar ----------------------------- */
function StatusBar() {
  return (
    <div className="statusbar">
      <div className="sb-time">9:41</div>
      <div className="notch" />
      <div className="sb-icons"><SignalGlyph /><WifiGlyph /><BatteryGlyph /></div>
    </div>
  );
}

/* ----------------------------- Mobile frame ----------------------------- */
const MobilePhoneFrame = React.forwardRef(function MobilePhoneFrame({ src, iframeKey, onLoad }, ref) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const FRAME_W = 416, FRAME_H = 870;
    const fit = () => {
      const aw = stage.clientWidth - 36;
      const ah = stage.clientHeight - 36;
      setScale(Math.min(1, aw / FRAME_W, ah / FRAME_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="stage" ref={stageRef}>
      <div className="phone-fit" style={{ transform: `scale(${scale})` }}>
        <div className="phone">
          <div className="screen">
            <StatusBar />
            <iframe
              key={iframeKey}
              ref={ref}
              className="pf-iframe"
              src={src}
              title="Mobile preview"
              onLoad={onLoad}
            />
            <div className="home-indicator" />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ----------------------------- Desktop frame ----------------------------- */
const DesktopFrame = React.forwardRef(function DesktopFrame({ src, iframeKey, onLoad, displayUrl }, ref) {
  return (
    <div className="stage">
      <div className="desktop-window">
        <div className="dw-bar">
          <div className="dw-dots"><i /><i /><i /></div>
          <div className="dw-url">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {displayUrl}
          </div>
          <span className="dw-tag">Preview</span>
        </div>
        <iframe
          key={iframeKey}
          ref={ref}
          className="dw-iframe"
          src={src}
          title="Desktop preview"
          onLoad={onLoad}
        />
      </div>
    </div>
  );
});

/* ----------------------------- Control bar ----------------------------- */
function ControlBar({ viewMode, setViewMode, theme, toggleTheme, onReload, onScroll, isLoading }) {
  return (
    <div className="controlbar">
      <div className="cb-left">
        <div className="seg" role="tablist" aria-label="Preview viewport">
          <button
            role="tab" aria-selected={viewMode === "mobile"}
            className={viewMode === "mobile" ? "active" : ""}
            onClick={() => setViewMode("mobile")}>
            <MobileIcon size={15} /> Mobile
          </button>
          <button
            role="tab" aria-selected={viewMode === "desktop"}
            className={viewMode === "desktop" ? "active" : ""}
            onClick={() => setViewMode("desktop")}>
            <DesktopIcon size={15} /> Desktop
          </button>
        </div>
        <span className="dims mono">{viewMode === "mobile" ? "390 × 844" : "responsive"}</span>
      </div>

      <div className="cb-right">
        <button className={"iconbtn" + (isLoading ? " spinning" : "")} onClick={onReload}
          aria-label="Reload preview" title="Reload preview">
          <ReloadIcon size={16} />
        </button>
        <div className="divider" />
        <button className="iconbtn" onClick={() => onScroll("top")} aria-label="Scroll to top" title="Scroll to top">
          <ArrowUpIcon size={16} />
        </button>
        <button className="iconbtn" onClick={() => onScroll("bottom")} aria-label="Scroll to bottom" title="Scroll to bottom">
          <ArrowDownIcon size={16} />
        </button>
        <div className="divider" />
        <button className="iconbtn" onClick={toggleTheme} aria-label="Toggle portal theme" title="Toggle light / dark">
          {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Preview panel ----------------------------- */
function PreviewPanel({ previewUrl = "client-site/index.html", displayUrl = "driftwood-coffee.vercel.app" }) {
  const [viewMode, setViewMode] = useState("mobile");
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const mobileRef = useRef(null);
  const desktopRef = useRef(null);
  const activeRef = viewMode === "mobile" ? mobileRef : desktopRef;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const onReload = useCallback(() => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const onLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // when load finishes via a reload (not the very first), confirm
  const firstLoad = useRef(true);
  const handleLoad = useCallback(() => {
    onLoad();
    if (firstLoad.current) { firstLoad.current = false; return; }
    showToast("Preview reloaded");
  }, [onLoad, showToast]);

  const onScroll = useCallback((dir) => {
    const iframe = activeRef.current;
    try {
      const win = iframe && iframe.contentWindow;
      const doc = win && win.document;
      if (!win || !doc) return;
      const top = dir === "top" ? 0 : doc.body.scrollHeight;
      win.scrollTo({ top, behavior: "smooth" });
    } catch (e) { /* cross-origin */ }
  }, [activeRef]);

  return (
    <div className="portal">
      <header className="portal-head">
        <div className="ph-left">
          <div className="logo"><span className="logo-mark" />Launch<b>Academy</b></div>
          <span className="crumb mono">portal / preview</span>
        </div>
        <div className="ph-right mono">
          <span className="status-dot" /> connected · {displayUrl}
        </div>
      </header>

      <ControlBar
        viewMode={viewMode} setViewMode={setViewMode}
        theme={theme} toggleTheme={toggleTheme}
        onReload={onReload} onScroll={onScroll} isLoading={isLoading}
      />

      <div className="preview-area">
        <div className={"mode-layer" + (viewMode === "mobile" ? " visible" : "")}>
          <MobilePhoneFrame ref={mobileRef} src={previewUrl} iframeKey={"m" + iframeKey} onLoad={handleLoad} />
        </div>
        <div className={"mode-layer" + (viewMode === "desktop" ? " visible" : "")}>
          <DesktopFrame ref={desktopRef} src={previewUrl} iframeKey={"d" + iframeKey} onLoad={handleLoad} displayUrl={displayUrl} />
        </div>

        {isLoading && (
          <div className="loading">
            <div className="spinner" />
            <span className="mono">Loading preview…</span>
          </div>
        )}

        {toast && (
          <div className="toast">
            <span className="toast-check"><CheckIcon size={13} /></span>{toast}
          </div>
        )}
      </div>
    </div>
  );
}

window.PreviewPanel = PreviewPanel;

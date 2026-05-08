// MyDay — Swipeable task row & bottom tab bar

const Tt = window.TOKENS;

// ─── Swipeable row ───────────────────────────────────────────────────────
// Swipe right = complete (green). Swipe left = delete (red).
// Spring-back on release if not past threshold.
function SwipeRow({ children, onComplete, onDelete, completed, height = 'auto' }) {
  const [dx, setDx] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const [exitDir, setExitDir] = React.useState(null); // 'left' | 'right' | null
  const startRef = React.useRef({ x: 0, y: 0 });
  const lockedRef = React.useRef(null); // 'h' | 'v' | null

  const THRESHOLD = 80;

  const onDown = (e) => {
    if (completed) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    lockedRef.current = null;
    setAnimating(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!startRef.current) return;
    if (e.buttons === 0 && e.pressure === 0) return; // only when pressing
    const dxRaw = e.clientX - startRef.current.x;
    const dyRaw = e.clientY - startRef.current.y;
    if (lockedRef.current === null) {
      if (Math.abs(dxRaw) < 6 && Math.abs(dyRaw) < 6) return;
      lockedRef.current = Math.abs(dxRaw) > Math.abs(dyRaw) ? 'h' : 'v';
    }
    if (lockedRef.current === 'h') {
      e.preventDefault?.();
      // Rubber-band past threshold
      let next = dxRaw;
      const max = 160;
      if (Math.abs(next) > max) {
        next = Math.sign(next) * (max + (Math.abs(next) - max) * 0.3);
      }
      setDx(next);
    }
  };
  const onUp = () => {
    if (lockedRef.current !== 'h') { setDx(0); return; }
    setAnimating(true);
    if (dx > THRESHOLD) {
      // complete
      setExitDir('right');
      setDx(400);
      setTimeout(() => { onComplete?.(); setDx(0); setExitDir(null); setAnimating(false); }, 280);
    } else if (dx < -THRESHOLD) {
      setExitDir('left');
      setDx(-400);
      setTimeout(() => { onDelete?.(); setDx(0); setExitDir(null); setAnimating(false); }, 280);
    } else {
      setDx(0);
      setTimeout(() => setAnimating(false), 280);
    }
    lockedRef.current = null;
  };

  // Action visibility
  const completeProgress = Math.min(1, Math.max(0, dx / THRESHOLD));
  const deleteProgress   = Math.min(1, Math.max(0, -dx / THRESHOLD));

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, height }}>
      {/* Right action — complete */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-start', paddingLeft: 24,
        background: `linear-gradient(90deg, var(--c-success) 0%, rgba(52,211,153,0.7) 100%)`,
        opacity: completeProgress,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          transform: `scale(${0.8 + completeProgress * 0.4})`,
          transition: animating ? `transform ${Tt.dur.base}ms ${Tt.ease.spring}` : 'none',
        }}>
          <window.IconCheck size={28} color="#fff" />
          <span style={{
            fontFamily: Tt.font.display, fontWeight: 700, fontSize: 16, color: '#fff',
            opacity: completeProgress > 0.6 ? 1 : 0,
          }}>Done</span>
        </div>
      </div>
      {/* Left action — delete */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', paddingRight: 24,
        background: `linear-gradient(270deg, var(--c-danger) 0%, rgba(248,113,113,0.7) 100%)`,
        opacity: deleteProgress,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          transform: `scale(${0.8 + deleteProgress * 0.4})`,
          transition: animating ? `transform ${Tt.dur.base}ms ${Tt.ease.spring}` : 'none',
        }}>
          <span style={{
            fontFamily: Tt.font.display, fontWeight: 700, fontSize: 16, color: '#fff',
            opacity: deleteProgress > 0.6 ? 1 : 0,
          }}>Delete</span>
          <window.IconTrash size={26} color="#fff" />
        </div>
      </div>
      {/* The row */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          position: 'relative', touchAction: 'pan-y',
          transform: `translateX(${dx}px)`,
          transition: animating ? `transform ${Tt.dur.base}ms ${Tt.ease.spring}` : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'today',    label: { en: 'Today',    ru: 'Сегодня' },  Icon: () => window.IconToday({ size: 24 }) },
  { id: 'tasks',    label: { en: 'Tasks',    ru: 'Задачи' },   Icon: () => window.IconChecklist({ size: 24 }) },
  { id: 'finance',  label: { en: 'Finance',  ru: 'Финансы' },  Icon: () => window.IconWallet({ size: 24 }) },
  { id: 'settings', label: { en: 'Settings', ru: 'Настройки'}, Icon: () => window.IconSettings({ size: 24 }) },
];

function TabBar({ active, onChange, lang = 'en' }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(15,15,20,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid var(--c-hairline)',
      paddingBottom: 28,
      paddingTop: 10,
      zIndex: 5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none', padding: '6px 0', cursor: 'pointer',
                color: isActive ? 'var(--c-accent)' : 'var(--c-textMute)',
                transition: `color ${Tt.dur.fast}ms ${Tt.ease.out}`,
              }}
            >
              <div style={{
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                transition: `transform ${Tt.dur.base}ms ${Tt.ease.spring}`,
              }}>
                <Icon />
                {isActive && (
                  <div style={{
                    position: 'absolute', inset: -6, borderRadius: 9999,
                    background: 'var(--c-accentSoft)', zIndex: -1,
                  }} />
                )}
              </div>
              <span style={{
                fontFamily: Tt.font.body, fontSize: 10.5, fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.01em',
              }}>{label[lang]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Floating action button (FAB) ────────────────────────────────────────
function FAB({ onClick, icon, style = {} }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        position: 'absolute', right: 20, bottom: 100,
        width: 56, height: 56, borderRadius: 9999, border: 'none',
        background: 'var(--c-accent)', color: 'var(--c-accentInk)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(167,139,250,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer', zIndex: 4,
        transform: pressed ? 'scale(0.9)' : 'scale(1)',
        transition: `transform ${Tt.dur.fast}ms ${Tt.ease.spring}`,
        ...style,
      }}
    >
      {icon}
    </button>
  );
}

window.SwipeRow = SwipeRow;
window.TabBar = TabBar;
window.FAB = FAB;
window.TABS = TABS;

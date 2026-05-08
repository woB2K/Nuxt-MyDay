// MyDay — UI Component library

const T = window.TOKENS;

// ─── Button ──────────────────────────────────────────────────────────────
function Button({ variant = 'primary', size = 'md', icon, children, onClick, full, style = {}, disabled, ...rest }) {
  const [pressed, setPressed] = React.useState(false);
  const sizes = {
    sm: { h: 36, px: 14, fs: 14 },
    md: { h: 48, px: 20, fs: 16 },
    lg: { h: 56, px: 24, fs: 17 },
  }[size];
  const variants = {
    primary: {
      background: 'var(--c-accent)',
      color: 'var(--c-accentInk)',
      boxShadow: pressed ? 'none' : '0 4px 14px rgba(167,139,250,0.25)',
    },
    secondary: {
      background: 'var(--c-bgElev2)',
      color: 'var(--c-text)',
      border: '1px solid var(--c-hairline)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--c-text)',
    },
    danger: {
      background: 'var(--c-danger)',
      color: '#fff',
    },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: 8,
        fontFamily: T.font.body, fontSize: sizes.fs, fontWeight: 600, letterSpacing: '-0.01em',
        border: 'none', outline: 'none', cursor: 'pointer',
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.4 : 1,
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: `transform ${T.dur.fast}ms ${T.ease.spring}, box-shadow ${T.dur.fast}ms ${T.ease.out}`,
        ...variants, ...style,
      }} {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, icon, label, multiline, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {label && (
        <label style={{
          fontFamily: T.font.body, fontSize: 13, fontWeight: 500,
          color: 'var(--c-textDim)', letterSpacing: '0',
        }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 10,
        background: 'var(--c-bgElev2)', borderRadius: 12, padding: '0 14px',
        border: `1px solid ${focused ? 'var(--c-accent)' : 'var(--c-hairline)'}`,
        boxShadow: focused ? `0 0 0 4px var(--c-accentSoft)` : 'none',
        transition: `all ${T.dur.fast}ms ${T.ease.out}`,
        minHeight: multiline ? 96 : 48,
        paddingTop: multiline ? 14 : 0,
      }}>
        {icon && <span style={{ color: 'var(--c-textMute)', display: 'flex', flexShrink: 0 }}>{icon}</span>}
        <Tag
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={multiline ? 3 : undefined}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--c-text)',
            fontFamily: T.font.body, fontSize: 16, fontWeight: 400, letterSpacing: '-0.005em',
            padding: multiline ? 0 : '14px 0',
            resize: multiline ? 'none' : undefined,
            fontFamily: T.font.body,
          }}
          {...rest}
        />
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────
function Card({ children, padding = 16, radius = 16, style = {}, onClick, elev = 1 }) {
  const [pressed, setPressed] = React.useState(false);
  const elevs = {
    1: { background: 'var(--c-bgElev1)', border: '1px solid var(--c-hairline)' },
    2: { background: 'var(--c-bgElev2)', border: '1px solid var(--c-hairline)' },
  };
  return (
    <div
      onClick={onClick}
      onPointerDown={() => onClick && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        borderRadius: radius, padding,
        cursor: onClick ? 'pointer' : 'default',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: `transform ${T.dur.fast}ms ${T.ease.spring}`,
        ...elevs[elev], ...style,
      }}
    >{children}</div>
  );
}

// ─── Badge / Pill ────────────────────────────────────────────────────────
function Badge({ children, color = 'accent', soft = true, icon, style = {} }) {
  const colorMap = {
    accent:  ['var(--c-accent)', 'var(--c-accentSoft)'],
    success: ['var(--c-success)', 'rgba(52,211,153,0.14)'],
    warning: ['var(--c-warning)', 'rgba(251,191,36,0.14)'],
    danger:  ['var(--c-danger)',  'rgba(248,113,113,0.14)'],
    info:    ['var(--c-info)',    'rgba(96,165,250,0.14)'],
    neutral: ['var(--c-textDim)', 'rgba(255,255,255,0.07)'],
  };
  const [fg, bg] = colorMap[color] || colorMap.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 22, padding: '0 8px', borderRadius: 9999,
      background: soft ? bg : fg,
      color: soft ? fg : '#0F0F14',
      fontFamily: T.font.body, fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
      ...style,
    }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </span>
  );
}

// ─── Pill selector (horizontal options) ──────────────────────────────────
function PillSelect({ options, value, onChange, full }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: 4, background: 'var(--c-bgElev2)',
      borderRadius: 12, border: '1px solid var(--c-hairline)',
      width: full ? '100%' : 'fit-content',
    }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: full ? 1 : '0 0 auto',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
              background: active ? (opt.color || 'var(--c-accent)') : 'transparent',
              color: active ? (opt.inkColor || 'var(--c-accentInk)') : 'var(--c-textDim)',
              fontFamily: T.font.body, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em',
              cursor: 'pointer',
              transition: `all ${T.dur.fast}ms ${T.ease.out}`,
            }}
          >
            {opt.icon}{opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Switch ──────────────────────────────────────────────────────────────
function Switch({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 51, height: 31, borderRadius: 9999, border: 'none', padding: 2,
        background: checked ? 'var(--c-accent)' : 'rgba(255,255,255,0.12)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: `background ${T.dur.fast}ms ${T.ease.out}`,
      }}
    >
      <div style={{
        width: 27, height: 27, borderRadius: 9999, background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        transition: `all ${T.dur.fast}ms ${T.ease.spring}`,
      }} />
    </button>
  );
}

// ─── Checkbox circle (task complete) ─────────────────────────────────────
function CheckCircle({ checked, onChange, color = 'var(--c-accent)', size = 26 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      style={{
        width: size, height: size, borderRadius: 9999,
        border: checked ? 'none' : `2px solid var(--c-textMute)`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer', padding: 0,
        transition: `all ${T.dur.fast}ms ${T.ease.spring}`,
      }}
    >
      {checked && (
        <svg width={size*0.6} height={size*0.6} viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0F0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ─── Section header (with optional caption) ──────────────────────────────
function SectionHeader({ title, caption, icon, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 4px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
        {icon && <span style={{ color: 'var(--c-textDim)', display: 'flex' }}>{icon}</span>}
        <h3 style={{
          margin: 0, fontFamily: T.font.display, whiteSpace: 'nowrap',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--c-textDim)',
        }}>{title}</h3>
        {caption && (
          <span style={{
            fontFamily: T.font.body, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
            color: 'var(--c-textMute)',
          }}>· {caption}</span>
        )}
      </div>
      {action}
    </div>
  );
}

window.Button = Button;
window.Input = Input;
window.Card = Card;
window.Badge = Badge;
window.PillSelect = PillSelect;
window.Switch = Switch;
window.CheckCircle = CheckCircle;
window.SectionHeader = SectionHeader;

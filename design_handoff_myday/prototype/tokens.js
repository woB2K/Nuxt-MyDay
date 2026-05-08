// MyDay — Design Tokens
// Mobile-first, dark-first. iOS-inspired minimalism, somewhere between Linear & Apple Reminders.

const TOKENS = {
  // ── Color ────────────────────────────────────────────────────────────
  color: {
    // Surfaces (deep slate, never pure black)
    bg:        '#0F0F14',   // page background
    bgElev1:   '#15151C',   // elevated card background
    bgElev2:   '#1C1C25',   // sheets / modals / inputs
    bgElev3:   '#26262F',   // pressed / hover state on dark
    hairline:  'rgba(255,255,255,0.06)',
    hairline2: 'rgba(255,255,255,0.10)',

    // Text
    text:      '#F4F4F7',   // primary
    textDim:   '#A1A1AA',   // secondary
    textMute:  '#6B6B75',   // tertiary / metadata
    textGhost: '#3F3F47',   // disabled / placeholder

    // Accent (default = violet — overridable via Tweaks)
    accent:    '#A78BFA',
    accentSoft:'rgba(167,139,250,0.14)',
    accentInk: '#0F0F14',   // text on accent

    // Semantic
    success:   '#34D399',   // complete / income
    warning:   '#FBBF24',
    danger:    '#F87171',   // delete / overspend
    info:      '#60A5FA',

    // Priority pills
    pHigh:     '#F87171',
    pMed:      '#FBBF24',
    pLow:      '#60A5FA',
    pNone:     '#6B6B75',
  },

  // ── Typography ───────────────────────────────────────────────────────
  // SF Pro Display for headings (-apple-system fallback), Inter for body
  font: {
    display: '-apple-system, "SF Pro Display", "SF Pro", system-ui, sans-serif',
    body:    'Inter, -apple-system, system-ui, sans-serif',
    mono:    '"SF Mono", ui-monospace, monospace',
  },

  // Type scale (mobile, generous)
  type: {
    // [size, lineHeight, weight, tracking]
    hero:        ['56px', '60px', 700, '-0.03em'],   // big balance numbers
    title1:      ['34px', '40px', 700, '-0.02em'],   // page titles ("Today")
    title2:      ['28px', '34px', 700, '-0.02em'],   // hero task title
    title3:      ['22px', '28px', 600, '-0.01em'],   // section headers
    headline:    ['17px', '22px', 600, '-0.01em'],   // task names, list items
    body:        ['17px', '24px', 400, '-0.01em'],   // body text
    callout:     ['16px', '21px', 500, '-0.005em'],  // buttons
    sub:         ['15px', '20px', 400, '0'],         // sub copy
    footnote:    ['13px', '18px', 500, '0'],         // meta, time tags
    caption:     ['12px', '16px', 500, '0.01em'],    // tiny labels
    overline:    ['11px', '14px', 600, '0.08em'],    // SECTION / UPPERCASE
  },

  // ── Spacing (4px base, 16px primary unit) ────────────────────────────
  space: {
    px:   '1px',
    0.5:  '2px',
    1:    '4px',
    2:    '8px',
    3:    '12px',
    4:    '16px',  // base
    5:    '20px',
    6:    '24px',
    7:    '28px',
    8:    '32px',
    10:   '40px',
    12:   '48px',
    16:   '64px',
  },

  // ── Radius ───────────────────────────────────────────────────────────
  radius: {
    sm:   8,    // buttons
    md:   12,   // inputs
    lg:   16,   // cards
    xl:   20,   // hero card
    '2xl':24,   // sheet top
    full: 9999, // pills
  },

  // ── Shadow / Elevation (subtle, layered) ─────────────────────────────
  shadow: {
    none: 'none',
    sm:   '0 1px 2px rgba(0,0,0,0.4)',
    md:   '0 4px 14px rgba(0,0,0,0.35)',
    lg:   '0 12px 36px rgba(0,0,0,0.45)',
    sheet:'0 -8px 32px rgba(0,0,0,0.4)',
    glow: (c) => `0 8px 24px ${c}33, 0 2px 8px ${c}22`,
  },

  // ── Motion ───────────────────────────────────────────────────────────
  ease: {
    // Spring-ish cubic-beziers tuned for delight
    out:    'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut:  'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // overshoot
  },
  dur: {
    fast: 150,
    base: 240,
    slow: 360,
    sheet:420,
  },

  // ── Tab bar / safe area ──────────────────────────────────────────────
  tabBarH: 84,
  safeBottom: 34,
};

// Generate CSS custom properties on :root
function applyTokens(accent) {
  const c = TOKENS.color;
  if (accent) {
    c.accent = accent;
    // derive accent soft (14% alpha) from hex
    const hex = accent.replace('#', '');
    const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
    c.accentSoft = `rgba(${r},${g},${b},0.14)`;
  }
  const root = document.documentElement;
  Object.entries(c).forEach(([k,v]) => root.style.setProperty(`--c-${k}`, v));
}

window.TOKENS = TOKENS;
window.applyTokens = applyTokens;

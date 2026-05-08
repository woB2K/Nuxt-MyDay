/** @type {import('tailwindcss').Config} */
// MyDay — Tailwind v3+ config
// Copy this file into the root of a Tailwind project. All design tokens are
// exposed as utility classes (bg-bg, text-text, rounded-lg, shadow-md, etc.)

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: 'class', // app is dark-first; flip via .dark class on <html>
  theme: {
    // Override defaults so the scale stays small and on-system.
    extend: {
      colors: {
        // Surfaces
        bg:        '#0F0F14',
        'bg-elev-1': '#15151C',
        'bg-elev-2': '#1C1C25',
        'bg-elev-3': '#26262F',
        hairline:  'rgba(255,255,255,0.06)',
        'hairline-2': 'rgba(255,255,255,0.10)',

        // Text
        text:       '#F4F4F7',
        'text-dim': '#A1A1AA',
        'text-mute':'#6B6B75',
        'text-ghost':'#3F3F47',

        // Accent (default violet — runtime swappable via CSS var)
        accent:     'var(--c-accent, #A78BFA)',
        'accent-soft': 'var(--c-accentSoft, rgba(167,139,250,0.14))',
        'accent-ink': '#0F0F14',

        // Semantic
        success: '#34D399',
        warning: '#FBBF24',
        danger:  '#F87171',
        info:    '#60A5FA',

        // Priority
        'p-high': '#F87171',
        'p-med':  '#FBBF24',
        'p-low':  '#60A5FA',
        'p-none': '#6B6B75',
      },

      fontFamily: {
        display: ['"SF Pro Display"', '"SF Pro"', '-apple-system', 'system-ui', 'sans-serif'],
        sans:    ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        mono:    ['"SF Mono"', 'ui-monospace', 'monospace'],
      },

      // Type scale: [size, { lineHeight, letterSpacing, fontWeight }]
      fontSize: {
        hero:     ['56px', { lineHeight: '60px', letterSpacing: '-0.03em', fontWeight: '700' }],
        title1:   ['34px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        title2:   ['28px', { lineHeight: '34px', letterSpacing: '-0.02em', fontWeight: '700' }],
        title3:   ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
        headline: ['17px', { lineHeight: '22px', letterSpacing: '-0.01em', fontWeight: '600' }],
        body:     ['17px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '400' }],
        callout:  ['16px', { lineHeight: '21px', letterSpacing: '-0.005em', fontWeight: '500' }],
        sub:      ['15px', { lineHeight: '20px', letterSpacing: '0',        fontWeight: '400' }],
        footnote: ['13px', { lineHeight: '18px', letterSpacing: '0',        fontWeight: '500' }],
        caption:  ['12px', { lineHeight: '16px', letterSpacing: '0.01em',   fontWeight: '500' }],
        overline: ['11px', { lineHeight: '14px', letterSpacing: '0.08em',   fontWeight: '600' }],
      },

      // 4-px base, with semantic aliases
      spacing: {
        px:    '1px',
        0.5:   '2px',
        1:     '4px',
        2:     '8px',
        3:     '12px',
        4:     '16px',  // base unit
        5:     '20px',  // page horizontal padding
        6:     '24px',
        7:     '28px',
        8:     '32px',
        10:    '40px',
        12:    '48px',
        16:    '64px',
        'safe-bottom': '34px',
        'tab-bar':     '84px',
      },

      borderRadius: {
        none: '0',
        sm:   '8px',    // buttons
        md:   '12px',   // inputs
        lg:   '16px',   // cards (default)
        xl:   '20px',   // hero card
        '2xl':'24px',   // bottom sheet
        full: '9999px', // pills, FAB, avatars
      },

      boxShadow: {
        none:  'none',
        sm:    '0 1px 2px rgba(0,0,0,0.4)',
        md:    '0 4px 14px rgba(0,0,0,0.35)',
        lg:    '0 12px 36px rgba(0,0,0,0.45)',
        sheet: '0 -8px 32px rgba(0,0,0,0.4)',
        // FAB / accent glow — set --c-accent on parent for dynamic tint
        glow:  '0 8px 24px rgb(from var(--c-accent, #A78BFA) r g b / 0.32), 0 2px 8px rgb(from var(--c-accent, #A78BFA) r g b / 0.20)',
      },

      transitionTimingFunction: {
        out:    'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        fast:  '150ms',
        base:  '240ms',
        slow:  '360ms',
        sheet: '420ms',
      },

      backdropBlur: {
        tab: '24px',
        sheet: '8px',
      },

      keyframes: {
        'spring-in': {
          '0%':   { transform: 'scale(0.6)',  opacity: '0' },
          '60%':  { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'sheet-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'spring-in': 'spring-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'sheet-up':  'sheet-up 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in':   'fade-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

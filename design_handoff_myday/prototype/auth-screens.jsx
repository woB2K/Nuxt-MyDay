// MyDay — Auth screens (Welcome, Sign In, Create Account)
// Self-contained: assumes TOKENS, IconArrowLeft, IconChevronRight from siblings,
// but defines all auth-specific components inline so it's portable.

const At = window.TOKENS;

// ─── Brand glyphs / icons specific to auth ───────────────────────────────
const IconGoogle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IconApple = ({ size = 18, color = '#F4F4F7' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const IconMail = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="m3 7 9 6 9-6"/>
  </svg>
);

const IconLock = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
);

const IconUser = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
  </svg>
);

const IconEye = ({ size = 18, color = 'currentColor', off = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
    <circle cx="12" cy="12" r="3"/>
    {off && <line x1="3" y1="3" x2="21" y2="21"/>}
  </svg>
);

const IconBack = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const IconLogoMark = ({ size = 36 }) => (
  // Stylized "M" mark in accent gradient — "sun rising over a checkmark" feel
  <svg width={size} height={size} viewBox="0 0 40 40">
    <defs>
      <linearGradient id="ml1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A78BFA"/>
        <stop offset="100%" stopColor="#5EEAD4"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#ml1)"/>
    <path d="M10 28V14l5 8 5-8v14M22 22l3 3 6-7" stroke="#0F0F14" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Reusable auth primitives ────────────────────────────────────────────
function AuthInput({ icon, type = 'text', value, onChange, placeholder, trailing, error }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, height: 52, padding: '0 14px',
        background: 'var(--c-bgElev2)', borderRadius: 12,
        border: `1px solid ${error ? 'var(--c-danger)' : (focused ? 'var(--c-accent)' : 'var(--c-hairline)')}`,
        boxShadow: focused && !error ? '0 0 0 4px var(--c-accentSoft)' : 'none',
        transition: `all ${At.dur.fast}ms ${At.ease.out}`,
      }}>
        <span style={{ color: focused ? 'var(--c-accent)' : 'var(--c-textMute)', display: 'flex', transition: `color ${At.dur.fast}ms` }}>{icon}</span>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--c-text)', fontFamily: At.font.body, fontSize: 16, fontWeight: 400,
            minWidth: 0,
          }}
        />
        {trailing}
      </div>
      {error && (
        <div style={{
          marginTop: 6, paddingLeft: 4,
          fontFamily: At.font.body, fontSize: 12, fontWeight: 500, color: 'var(--c-danger)',
        }}>{error}</div>
      )}
    </div>
  );
}

function AuthButton({ children, variant = 'primary', icon, full, onClick }) {
  const [pressed, setPressed] = React.useState(false);
  const base = {
    height: 56, padding: '0 20px', borderRadius: 8, border: 'none',
    fontFamily: At.font.body, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    cursor: 'pointer', width: full ? '100%' : 'auto',
    transform: pressed ? 'scale(0.97)' : 'scale(1)',
    transition: `transform ${At.dur.fast}ms ${At.ease.spring}, background ${At.dur.fast}ms ${At.ease.out}`,
  };
  const variants = {
    primary:   { background: 'var(--c-accent)', color: 'var(--c-accentInk)', boxShadow: '0 4px 14px rgba(167,139,250,0.25)' },
    secondary: { background: 'var(--c-bgElev2)', color: 'var(--c-text)', border: '1px solid var(--c-hairline2)' },
    ghost:     { background: 'transparent', color: 'var(--c-accent)' },
  };
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Phone shell (replicates the iOS chrome we use elsewhere) ─────────────
function PhoneShell({ children, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 390, height: 844, position: 'relative',
        background: '#0F0F14', borderRadius: 48,
        border: '8px solid #2A2A33',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        overflow: 'hidden',
      }}>
        {/* Notch / dynamic island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 112, height: 32, background: '#000', borderRadius: 9999, zIndex: 20,
        }} />
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 50, padding: '14px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 19,
          fontFamily: At.font.display, fontSize: 16, fontWeight: 600, color: '#F4F4F7',
        }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.92 }}>
            {/* signal */}
            <svg width="18" height="11" viewBox="0 0 18 11"><g fill="#F4F4F7">
              <rect x="0" y="7" width="3" height="4" rx="0.5"/>
              <rect x="5" y="5" width="3" height="6" rx="0.5"/>
              <rect x="10" y="2" width="3" height="9" rx="0.5"/>
              <rect x="15" y="0" width="3" height="11" rx="0.5"/>
            </g></svg>
            {/* battery */}
            <svg width="26" height="12" viewBox="0 0 26 12">
              <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" fill="none" stroke="#F4F4F7" strokeOpacity="0.5"/>
              <rect x="2" y="2" width="19" height="8" rx="1.5" fill="#F4F4F7"/>
              <rect x="23" y="3.5" width="2" height="5" rx="1" fill="#F4F4F7" fillOpacity="0.5"/>
            </svg>
          </span>
        </div>
        {/* Screen content */}
        <div style={{ position: 'absolute', inset: 0, paddingTop: 50 }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, borderRadius: 9999, background: '#F4F4F7', opacity: 0.85, zIndex: 20,
        }} />
      </div>
      {label && (
        <div style={{
          fontFamily: At.font.body, fontSize: 13, fontWeight: 600, color: 'var(--c-textDim)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{label}</div>
      )}
    </div>
  );
}

// ─── SCREEN 1: Welcome ────────────────────────────────────────────────────
function WelcomeScreen() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--c-bg)', overflow: 'hidden' }}>
      {/* Ambient glow blob */}
      <div style={{
        position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: 9999,
        background: 'radial-gradient(circle, rgba(167,139,250,0.22) 0%, rgba(167,139,250,0) 60%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 240, left: -80, width: 280, height: 280, borderRadius: 9999,
        background: 'radial-gradient(circle, rgba(94,234,212,0.10) 0%, rgba(94,234,212,0) 60%)',
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      {/* Logo + tagline */}
      <div style={{
        position: 'absolute', top: 110, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 2,
      }}>
        <IconLogoMark size={64} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: At.font.display, fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em',
            color: 'var(--c-text)', lineHeight: 1,
          }}>MyDay</div>
          <div style={{
            marginTop: 12, fontFamily: At.font.body, fontSize: 17, fontWeight: 400,
            color: 'var(--c-textDim)', letterSpacing: '-0.005em',
          }}>Tasks &amp; finances, one place</div>
        </div>
      </div>

      {/* Bottom sheet — pinned at ~55% height */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '52%', background: 'var(--c-bgElev1)',
        borderRadius: '24px 24px 0 0',
        border: '1px solid var(--c-hairline)', borderBottom: 'none',
        padding: '32px 24px 40px',
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Grabber */}
        <div style={{ alignSelf: 'center', width: 36, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.18)', position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)' }} />

        <div style={{
          fontFamily: At.font.display, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em',
          color: 'var(--c-text)', textAlign: 'center', marginBottom: 4,
        }}>Get started</div>
        <div style={{
          fontFamily: At.font.body, fontSize: 14, fontWeight: 400, color: 'var(--c-textDim)',
          textAlign: 'center', marginBottom: 12,
        }}>One quick step. Free forever for personal use.</div>

        <AuthButton full variant="secondary" icon={<IconGoogle size={18} />}>Continue with Google</AuthButton>
        <AuthButton full variant="secondary" icon={<IconApple size={18} />}>Continue with Apple</AuthButton>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--c-hairline2)' }} />
          <span style={{ fontFamily: At.font.body, fontSize: 12, fontWeight: 500, color: 'var(--c-textMute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-hairline2)' }} />
        </div>

        <AuthButton full variant="ghost" icon={<IconMail size={18} />}>Sign in with email</AuthButton>

        {/* Footer */}
        <div style={{
          marginTop: 'auto', textAlign: 'center',
          fontFamily: At.font.body, fontSize: 13, fontWeight: 500, color: 'var(--c-textDim)',
        }}>
          Don&rsquo;t have an account? <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: Sign In ────────────────────────────────────────────────────
function SignInScreen() {
  const [email, setEmail] = React.useState('alex@myday.app');
  const [password, setPassword] = React.useState('••••••••••••');
  const [show, setShow] = React.useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--c-bg)', overflow: 'hidden' }}>
      {/* Back button */}
      <div style={{ padding: '8px 12px' }}>
        <button style={{
          width: 44, height: 44, borderRadius: 9999, border: 'none',
          background: 'transparent', color: 'var(--c-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><IconBack size={22} /></button>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        {/* Title */}
        <h1 style={{
          margin: 0, fontFamily: At.font.display, fontSize: 34, fontWeight: 700,
          letterSpacing: '-0.03em', color: 'var(--c-text)', lineHeight: 1.1,
        }}>Welcome back</h1>
        <p style={{
          margin: '8px 0 32px', fontFamily: At.font.body, fontSize: 16, fontWeight: 400,
          color: 'var(--c-textDim)', lineHeight: 1.4,
        }}>Sign in to your MyDay account</p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthInput
            icon={<IconMail size={18} />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
          />
          <AuthInput
            icon={<IconLock size={18} />}
            type={show ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="Password"
            trailing={
              <button onClick={() => setShow(!show)} style={{
                background: 'transparent', border: 'none', color: 'var(--c-textMute)',
                display: 'flex', cursor: 'pointer', padding: 4,
              }}><IconEye size={18} off={show} /></button>
            }
          />
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginTop: 12, marginBottom: 32 }}>
          <a style={{
            fontFamily: At.font.body, fontSize: 13, fontWeight: 600, color: 'var(--c-accent)',
            textDecoration: 'none', cursor: 'pointer',
          }}>Forgot password?</a>
        </div>

        {/* Primary CTA */}
        <AuthButton full variant="primary">Sign in</AuthButton>
      </div>

      {/* Bottom footer */}
      <div style={{
        position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center',
        fontFamily: At.font.body, fontSize: 13, fontWeight: 500, color: 'var(--c-textDim)',
      }}>
        Don&rsquo;t have an account? <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>Sign up</span>
      </div>
    </div>
  );
}

// ─── SCREEN 3: Create Account ────────────────────────────────────────────
function CreateAccountScreen() {
  const [name, setName] = React.useState('Alex Petrov');
  const [email, setEmail] = React.useState('alex@myday.app');
  const [password, setPassword] = React.useState('Sunset42!');
  const [show, setShow] = React.useState(false);

  // Strength scoring: length + variety
  const score = React.useMemo(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);
  const strengthLabel = ['Too short','Weak','Fair','Good','Strong'][score];
  const strengthColor = ['var(--c-textMute)','var(--c-danger)','#F59E0B','#FBBF24','var(--c-success)'][score];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--c-bg)', overflow: 'hidden' }}>
      {/* Back button */}
      <div style={{ padding: '8px 12px' }}>
        <button style={{
          width: 44, height: 44, borderRadius: 9999, border: 'none',
          background: 'transparent', color: 'var(--c-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><IconBack size={22} /></button>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        {/* Title */}
        <h1 style={{
          margin: 0, fontFamily: At.font.display, fontSize: 34, fontWeight: 700,
          letterSpacing: '-0.03em', color: 'var(--c-text)', lineHeight: 1.1,
        }}>Create account</h1>
        <p style={{
          margin: '8px 0 28px', fontFamily: At.font.body, fontSize: 16, fontWeight: 400,
          color: 'var(--c-textDim)', lineHeight: 1.4,
        }}>Join MyDay &mdash; it&rsquo;s free</p>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthInput icon={<IconUser size={18} />} value={name} onChange={setName} placeholder="Full name" />
          <AuthInput icon={<IconMail size={18} />} type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
          <div>
            <AuthInput
              icon={<IconLock size={18} />}
              type={show ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Password"
              trailing={
                <button onClick={() => setShow(!show)} style={{
                  background: 'transparent', border: 'none', color: 'var(--c-textMute)',
                  display: 'flex', cursor: 'pointer', padding: 4,
                }}><IconEye size={18} off={show} /></button>
              }
            />
            {/* Strength bar */}
            <div style={{
              marginTop: 10, paddingLeft: 4,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 4, borderRadius: 9999,
                    background: i < score ? strengthColor : 'rgba(255,255,255,0.06)',
                    transition: `background ${At.dur.base}ms ${At.ease.out}`,
                  }} />
                ))}
              </div>
              <span style={{
                fontFamily: At.font.body, fontSize: 12, fontWeight: 600, color: strengthColor,
                minWidth: 50, textAlign: 'right',
              }}>{strengthLabel}</span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ marginTop: 28 }}>
          <AuthButton full variant="primary">Create account</AuthButton>
        </div>

        {/* Legal */}
        <p style={{
          margin: '16px 0 0', textAlign: 'center',
          fontFamily: At.font.body, fontSize: 12, fontWeight: 400, color: 'var(--c-textMute)',
          lineHeight: 1.5, padding: '0 12px',
        }}>
          By continuing you agree to our{' '}
          <span style={{ color: 'var(--c-accent)', fontWeight: 500 }}>Terms</span>{' '}and{' '}
          <span style={{ color: 'var(--c-accent)', fontWeight: 500 }}>Privacy Policy</span>
        </p>
      </div>

      {/* Bottom footer */}
      <div style={{
        position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center',
        fontFamily: At.font.body, fontSize: 13, fontWeight: 500, color: 'var(--c-textDim)',
      }}>
        Already have an account? <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>Sign in</span>
      </div>
    </div>
  );
}

window.WelcomeScreen = WelcomeScreen;
window.SignInScreen = SignInScreen;
window.CreateAccountScreen = CreateAccountScreen;
window.PhoneShell = PhoneShell;

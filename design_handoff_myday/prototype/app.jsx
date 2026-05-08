// MyDay — Main App
const Tm = window.TOKENS;

// Default tweaks (only accent color is tweakable per user request)
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#A78BFA"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#A78BFA',  // violet (default)
  '#2DD4BF',  // teal
  '#F59E0B',  // amber
  '#F472B6',  // pink
  '#60A5FA',  // blue
];

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = React.useState('en');
  const [tab, setTab] = React.useState('today');
  const [tasks, setTasks] = React.useState(window.SEED_TASKS);
  const [transactions, setTransactions] = React.useState(window.SEED_TX);
  const [taskSheet, setTaskSheet] = React.useState({ open: false, task: null });
  const [txSheet, setTxSheet] = React.useState(false);

  // Apply accent token
  React.useEffect(() => {
    window.applyTokens(tweaks.accent);
  }, [tweaks.accent]);

  // Swap seed tasks language
  React.useEffect(() => {
    setTasks((curr) => {
      // Only auto-swap if current titles still match the seeds for the OTHER lang
      const enTitles = window.SEED_TASKS.map(t => t.title);
      const ruTitles = window.SEED_TASKS_RU.map(t => t.title);
      const allEN = curr.every(t => enTitles.includes(t.title));
      const allRU = curr.every(t => ruTitles.includes(t.title));
      if (lang === 'ru' && allEN) return window.SEED_TASKS_RU.map((t,i) => ({ ...t, done: curr[i]?.done ?? t.done }));
      if (lang === 'en' && allRU) return window.SEED_TASKS.map((t,i) => ({ ...t, done: curr[i]?.done ?? t.done }));
      return curr;
    });
  }, [lang]);

  const toggleTask = (id) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    haptic('light');
  };
  const deleteTask = (id) => {
    setTasks(ts => ts.filter(t => t.id !== id));
    haptic('medium');
  };
  const openTask = (id) => {
    const t = tasks.find(x => x.id === id);
    setTaskSheet({ open: true, task: t });
  };
  const saveTask = (task) => {
    setTasks(ts => {
      const exists = ts.find(t => t.id === task.id);
      return exists ? ts.map(t => t.id === task.id ? task : t) : [task, ...ts];
    });
  };
  const saveTx = (tx) => {
    setTransactions(arr => [tx, ...arr]);
    haptic('success');
  };
  const onFAB = () => {
    if (tab === 'finance') setTxSheet(true);
    else setTaskSheet({ open: true, task: null });
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: 'var(--c-bg)', color: 'var(--c-text)',
      fontFamily: Tm.font.body, overflow: 'hidden',
    }}>
      {/* Scrollable content — leaves room for status bar (top) and tab bar (bottom) */}
      <div style={{
        position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 60, // status bar safe area
      }}>
        {tab === 'today' && (
          <window.ScreenToday
            tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onOpen={openTask}
            onAdd={() => setTaskSheet({ open: true, task: null })}
            lang={lang}
          />
        )}
        {tab === 'tasks' && (
          <window.ScreenTasks
            tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onOpen={openTask}
            lang={lang}
          />
        )}
        {tab === 'finance' && (
          <window.ScreenFinance transactions={transactions} lang={lang} />
        )}
        {tab === 'settings' && (
          <window.ScreenSettings lang={lang} onLangChange={setLang} />
        )}
      </div>

      {/* FAB */}
      {tab !== 'settings' && (
        <window.FAB
          icon={<window.IconPlus size={26} />}
          onClick={onFAB}
        />
      )}

      {/* Tab bar */}
      <window.TabBar active={tab} onChange={setTab} lang={lang} />

      {/* Sheets */}
      <window.TaskSheet
        open={taskSheet.open}
        task={taskSheet.task}
        onClose={() => setTaskSheet({ open: false, task: null })}
        onSave={saveTask}
        onDelete={deleteTask}
        lang={lang}
      />
      <window.AddTransactionSheet
        open={txSheet}
        onClose={() => setTxSheet(false)}
        onSave={saveTx}
        lang={lang}
      />

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Accent color" />
        <window.TweakColor
          label="Accent"
          value={tweaks.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak('accent', v)}
        />
        <window.TweakSection label="Language" />
        <window.TweakRadio
          label="UI language"
          value={lang}
          options={[{ value: 'en', label: 'English' }, { value: 'ru', label: 'Русский' }]}
          onChange={setLang}
        />
      </window.TweaksPanel>
    </div>
  );
}

// Mock haptic feedback hook (would call native API on device)
function haptic(type) {
  // light | medium | heavy | success | warning | error
  // No-op in browser; spec'd for native: UIImpactFeedbackGenerator(type) on iOS,
  // HapticFeedback API on Android.
  if (window.navigator.vibrate) {
    const map = { light: 8, medium: 14, heavy: 22, success: [10,40,10], warning: 30, error: [20,40,20] };
    try { window.navigator.vibrate(map[type] || 10); } catch(e) {}
  }
}
window.haptic = haptic;
window.App = App;

// Render once #root exists. The device frame mounts async via React.
window.applyTokens(TWEAK_DEFAULTS.accent);
let __mounted = false;
function mountApp() {
  if (__mounted) return;
  const rootEl = document.getElementById('root');
  if (rootEl) {
    __mounted = true;
    ReactDOM.createRoot(rootEl).render(<App />);
  }
}
// Try immediately, on each frame for a few frames, and via MutationObserver
mountApp();
const __mo = new MutationObserver(() => mountApp());
__mo.observe(document.body, { childList: true, subtree: true });
setTimeout(() => __mo.disconnect(), 5000);

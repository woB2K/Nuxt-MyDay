// MyDay — Tasks list screen + main App shell

const Ta = window.TOKENS;

// ─── All Tasks screen ─────────────────────────────────────────────────────
function ScreenTasks({ tasks, onToggle, onDelete, onOpen, lang }) {
  const s = window.STR[lang];
  const [filter, setFilter] = React.useState('all');

  const filtered = tasks.filter(t => {
    if (filter === 'open') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  return (
    <div style={{ padding: '12px 20px 120px' }}>
      <h1 style={{
        margin: '8px 0 16px', fontFamily: Ta.font.display, fontSize: 34, fontWeight: 700,
        letterSpacing: '-0.02em', color: 'var(--c-text)',
      }}>{s.tasks}</h1>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'var(--c-bgElev2)', borderRadius: 12, border: '1px solid var(--c-hairline)',
        marginBottom: 16,
      }}>
        <window.IconSearch size={18} color="var(--c-textMute)" />
        <input
          placeholder={lang === 'ru' ? 'Поиск задач' : 'Search tasks'}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--c-text)', fontFamily: Ta.font.body, fontSize: 15,
          }}
        />
      </div>

      {/* Filter pills */}
      <div style={{ marginBottom: 16 }}>
        <window.PillSelect
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all',  label: lang === 'ru' ? 'Все'        : 'All' },
            { value: 'open', label: lang === 'ru' ? 'Активные'   : 'Open' },
            { value: 'done', label: lang === 'ru' ? 'Готовые'    : 'Done' },
          ]}
        />
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(task => (
          <window.SwipeRow
            key={task.id}
            completed={task.done}
            onComplete={() => onToggle(task.id)}
            onDelete={() => onDelete(task.id)}
          >
            <window.TaskRow task={task} onToggle={onToggle} onOpen={onOpen} />
          </window.SwipeRow>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 9999, margin: '0 auto 16px',
            background: 'var(--c-bgElev2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><window.IconCheck size={28} color="var(--c-textMute)" /></div>
          <div style={{ fontFamily: Ta.font.display, fontSize: 18, fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>
            {filter === 'done' ? (lang === 'ru' ? 'Пока ничего не выполнено' : 'Nothing completed yet') : s.noTasks}
          </div>
        </div>
      )}
    </div>
  );
}

window.ScreenTasks = ScreenTasks;

// ─── Seed data ────────────────────────────────────────────────────────────
const SEED_TASKS = [
  { id: 't1', title: 'Ship MyDay v1.0 to TestFlight', focus: true, slot: 'morning', priority: 'high', time: '9:00 AM', tags: ['work','launch'], done: false },
  { id: 't2', title: 'Morning run · 5km',              slot: 'morning',   priority: 'low',  time: '7:00 AM', tags: ['health'], done: true },
  { id: 't3', title: 'Stand-up with design team',      slot: 'morning',   priority: 'med',  time: '10:30 AM', tags: ['work'], done: false },
  { id: 't4', title: 'Review Q2 budget spreadsheet',   slot: 'afternoon', priority: 'med',  time: '2:00 PM', tags: ['finance','work'], done: false },
  { id: 't5', title: 'Call mom',                       slot: 'afternoon', priority: 'low',  time: '4:00 PM', tags: ['personal'], done: false },
  { id: 't6', title: 'Read · "Shape Up" ch. 4',        slot: 'evening',   priority: 'none', time: '8:00 PM', tags: ['learning'], done: false },
  { id: 't7', title: 'Plan tomorrow',                  slot: 'evening',   priority: 'low',  time: '9:30 PM', tags: ['routine'], done: false },
];

const SEED_TX = [
  { id: 'x1', type: 'income',  amount: 4800, category: 'salary',    note: 'May payroll',     date: 'May 1' },
  { id: 'x2', type: 'expense', amount: 1450, category: 'rent',      note: 'Apartment',       date: 'May 1' },
  { id: 'x3', type: 'expense', amount: 38,   category: 'food',      note: 'Coffee & lunch',  date: 'May 6' },
  { id: 'x4', type: 'expense', amount: 220,  category: 'shop',      note: 'New running shoes', date: 'May 5' },
  { id: 'x5', type: 'expense', amount: 64,   category: 'transport', note: 'Uber',            date: 'May 4' },
  { id: 'x6', type: 'expense', amount: 95,   category: 'fun',       note: 'Concert tickets', date: 'May 4' },
  { id: 'x7', type: 'income',  amount: 600,  category: 'freelance', note: 'Logo project',    date: 'May 3' },
  { id: 'x8', type: 'expense', amount: 142,  category: 'food',      note: 'Groceries',       date: 'May 3' },
  { id: 'x9', type: 'expense', amount: 28,   category: 'health',    note: 'Pharmacy',        date: 'May 2' },
];

const SEED_TASKS_RU = [
  { id: 't1', title: 'Запустить MyDay v1.0 в TestFlight', focus: true, slot: 'morning', priority: 'high', time: '9:00', tags: ['работа','запуск'], done: false },
  { id: 't2', title: 'Утренняя пробежка · 5км',           slot: 'morning',   priority: 'low',  time: '7:00', tags: ['здоровье'], done: true },
  { id: 't3', title: 'Стендап с командой дизайна',        slot: 'morning',   priority: 'med',  time: '10:30', tags: ['работа'], done: false },
  { id: 't4', title: 'Проверить бюджет на Q2',            slot: 'afternoon', priority: 'med',  time: '14:00', tags: ['финансы','работа'], done: false },
  { id: 't5', title: 'Позвонить маме',                    slot: 'afternoon', priority: 'low',  time: '16:00', tags: ['личное'], done: false },
  { id: 't6', title: 'Прочитать "Shape Up", глава 4',     slot: 'evening',   priority: 'none', time: '20:00', tags: ['обучение'], done: false },
  { id: 't7', title: 'Спланировать завтрашний день',      slot: 'evening',   priority: 'low',  time: '21:30', tags: ['рутина'], done: false },
];

window.SEED_TASKS = SEED_TASKS;
window.SEED_TASKS_RU = SEED_TASKS_RU;
window.SEED_TX = SEED_TX;

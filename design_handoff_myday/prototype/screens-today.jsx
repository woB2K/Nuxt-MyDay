// MyDay — Screens

const Ts = window.TOKENS;

// i18n
const STR = {
  en: {
    greetingMorning: 'Good morning', greetingAfternoon: 'Good afternoon', greetingEvening: 'Good evening',
    focusToday: 'Your focus today', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening',
    tasks: 'Tasks', finance: 'Finance', settings: 'Settings', today: 'Today',
    monthBalance: 'This month', income: 'Income', expense: 'Expense', spendByCategory: 'By category',
    recent: 'Recent transactions', amount: 'Amount', note: 'Note', category: 'Category', save: 'Save',
    newTask: 'New task', taskName: 'Task name', notes: 'Notes', deadline: 'Deadline',
    priority: 'Priority', repeat: 'Repeat', tags: 'Tags', high: 'High', med: 'Medium', low: 'Low', none: 'None',
    never: 'Never', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
    addTransaction: 'Add transaction', incomeLbl: 'Income', expenseLbl: 'Expense',
    noTasks: 'Nothing for now', noTasksSub: 'Tap + to add your first task',
    streak: 'day streak', completedToday: 'completed today',
    account: 'Account', preferences: 'Preferences', notifications: 'Notifications', appearance: 'Appearance', language: 'Language', privacy: 'Privacy', help: 'Help & feedback',
    of: 'of', left: 'left', spent: 'spent', netWorth: 'Net this month',
    addNote: 'Add a note (optional)',
    cancel: 'Cancel', delete: 'Delete', complete: 'Complete',
    overline_focus: 'TODAY · FOCUS',
  },
  ru: {
    greetingMorning: 'Доброе утро', greetingAfternoon: 'Добрый день', greetingEvening: 'Добрый вечер',
    focusToday: 'Главная задача', morning: 'Утро', afternoon: 'День', evening: 'Вечер',
    tasks: 'Задачи', finance: 'Финансы', settings: 'Настройки', today: 'Сегодня',
    monthBalance: 'В этом месяце', income: 'Доходы', expense: 'Расходы', spendByCategory: 'По категориям',
    recent: 'Последние операции', amount: 'Сумма', note: 'Заметка', category: 'Категория', save: 'Сохранить',
    newTask: 'Новая задача', taskName: 'Название задачи', notes: 'Заметки', deadline: 'Дедлайн',
    priority: 'Приоритет', repeat: 'Повтор', tags: 'Теги', high: 'Высокий', med: 'Средний', low: 'Низкий', none: 'Нет',
    never: 'Никогда', daily: 'Каждый день', weekly: 'Каждую неделю', monthly: 'Каждый месяц',
    addTransaction: 'Добавить операцию', incomeLbl: 'Доход', expenseLbl: 'Расход',
    noTasks: 'Пока пусто', noTasksSub: 'Нажмите +, чтобы добавить задачу',
    streak: 'дней подряд', completedToday: 'выполнено сегодня',
    account: 'Аккаунт', preferences: 'Настройки', notifications: 'Уведомления', appearance: 'Внешний вид', language: 'Язык', privacy: 'Конфиденциальность', help: 'Помощь',
    of: 'из', left: 'осталось', spent: 'потрачено', netWorth: 'Чистыми за месяц',
    addNote: 'Добавьте заметку (необязательно)',
    cancel: 'Отмена', delete: 'Удалить', complete: 'Готово',
    overline_focus: 'СЕГОДНЯ · ГЛАВНОЕ',
  },
};

// ─── Today screen ────────────────────────────────────────────────────────
function ScreenToday({ tasks, onToggle, onDelete, onOpen, onAdd, lang }) {
  const s = STR[lang];
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? s.greetingMorning : hour < 18 ? s.greetingAfternoon : s.greetingEvening;
  const dateStr = now.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const focus = tasks.find(t => t.focus && !t.done) || tasks.find(t => !t.done);
  const grouped = {
    morning:   tasks.filter(t => t.slot === 'morning' && t !== focus),
    afternoon: tasks.filter(t => t.slot === 'afternoon' && t !== focus),
    evening:   tasks.filter(t => t.slot === 'evening' && t !== focus),
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  return (
    <div style={{ padding: '12px 20px 120px' }}>
      {/* Greeting */}
      <div style={{ marginTop: 8, marginBottom: 24 }}>
        <div style={{
          fontFamily: Ts.font.body, fontSize: 13, fontWeight: 500, color: 'var(--c-textMute)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
        }}>{dateStr}</div>
        <h1 style={{
          margin: 0, fontFamily: Ts.font.display, fontSize: 34, fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--c-text)', lineHeight: '40px',
        }}>{greet}</h1>
      </div>

      {/* Streak / progress strip */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
      }}>
        <div style={{
          flex: 1, padding: '12px 14px', borderRadius: 12,
          background: 'var(--c-bgElev1)', border: '1px solid var(--c-hairline)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <window.IconFlame size={20} color="#FBBF24" />
          <div>
            <div style={{ fontFamily: Ts.font.display, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>12</div>
            <div style={{ fontFamily: Ts.font.body, fontSize: 11, color: 'var(--c-textMute)', fontWeight: 500 }}>{s.streak}</div>
          </div>
        </div>
        <div style={{
          flex: 1.5, padding: '12px 14px', borderRadius: 12,
          background: 'var(--c-bgElev1)', border: '1px solid var(--c-hairline)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontFamily: Ts.font.display, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>{completedCount}</span>
            <span style={{ fontFamily: Ts.font.body, fontSize: 12, color: 'var(--c-textMute)' }}>/ {totalCount} {s.completedToday}</span>
          </div>
          <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${totalCount ? (completedCount/totalCount*100) : 0}%`,
              background: 'var(--c-accent)', borderRadius: 9999,
              transition: `width ${Ts.dur.slow}ms ${Ts.ease.out}`,
            }} />
          </div>
        </div>
      </div>

      {/* Hero focus card */}
      {focus && <FocusCard task={focus} onToggle={onToggle} onOpen={onOpen} lang={lang} />}

      {/* Sections */}
      {[
        ['morning',   s.morning,   <window.IconSun size={16} />],
        ['afternoon', s.afternoon, <window.IconAfternoon size={16} />],
        ['evening',   s.evening,   <window.IconMoon size={16} />],
      ].map(([slot, label, icon]) => grouped[slot].length > 0 && (
        <div key={slot}>
          <window.SectionHeader title={label} icon={icon} caption={`${grouped[slot].filter(t=>!t.done).length} open`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {grouped[slot].map(task => (
              <window.SwipeRow
                key={task.id}
                completed={task.done}
                onComplete={() => onToggle(task.id)}
                onDelete={() => onDelete(task.id)}
              >
                <TaskRow task={task} onToggle={onToggle} onOpen={onOpen} />
              </window.SwipeRow>
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div style={{
          marginTop: 60, textAlign: 'center', padding: 40,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 9999, margin: '0 auto 16px',
            background: 'var(--c-bgElev2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><window.IconChecklist size={28} color="var(--c-textMute)" /></div>
          <div style={{ fontFamily: Ts.font.display, fontSize: 18, fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>{s.noTasks}</div>
          <div style={{ fontFamily: Ts.font.body, fontSize: 14, color: 'var(--c-textDim)' }}>{s.noTasksSub}</div>
        </div>
      )}
    </div>
  );
}

// ─── Focus / Hero card ───────────────────────────────────────────────────
function FocusCard({ task, onToggle, onOpen, lang }) {
  const s = STR[lang];
  return (
    <div
      onClick={() => onOpen(task.id)}
      style={{
        position: 'relative', padding: 22, borderRadius: 20, marginBottom: 8,
        background: `linear-gradient(135deg, var(--c-accentSoft) 0%, var(--c-bgElev1) 60%)`,
        border: '1px solid var(--c-accentSoft)',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 9999,
        background: 'var(--c-accent)', opacity: 0.08, filter: 'blur(20px)',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
          padding: '4px 10px', borderRadius: 9999, background: 'var(--c-accentSoft)',
        }}>
          <window.IconFlag size={12} color="var(--c-accent)" />
          <span style={{
            fontFamily: Ts.font.body, fontSize: 11, fontWeight: 600, color: 'var(--c-accent)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>{s.overline_focus}</span>
        </div>
        <h2 style={{
          margin: 0, fontFamily: Ts.font.display, fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--c-text)', lineHeight: '34px',
          marginBottom: 14,
        }}>{task.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {task.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-textDim)' }}>
              <window.IconCalendar size={14} />
              <span style={{ fontFamily: Ts.font.body, fontSize: 14, fontWeight: 500 }}>{task.time}</span>
            </div>
          )}
          {task.tags?.map(tag => (
            <window.Badge key={tag} color="neutral" icon={<window.IconTag size={10} />}>{tag}</window.Badge>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <window.CheckCircle size={32} checked={task.done} onChange={() => onToggle(task.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task row ────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onOpen }) {
  const priorityColor = { high: 'var(--c-pHigh)', med: 'var(--c-pMed)', low: 'var(--c-pLow)', none: 'transparent' }[task.priority || 'none'];
  return (
    <div
      onClick={() => onOpen(task.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 16,
        background: 'var(--c-bgElev1)', border: '1px solid var(--c-hairline)',
        cursor: 'pointer',
        opacity: task.done ? 0.5 : 1,
      }}
    >
      <window.CheckCircle checked={task.done} onChange={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: Ts.font.body, fontSize: 16, fontWeight: 600, letterSpacing: '-0.005em',
          color: 'var(--c-text)', textDecoration: task.done ? 'line-through' : 'none',
          textDecorationColor: 'var(--c-textMute)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{task.title}</div>
        {(task.time || task.tags?.length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {task.time && (
              <span style={{ fontFamily: Ts.font.body, fontSize: 12, fontWeight: 500, color: 'var(--c-textMute)', whiteSpace: 'nowrap' }}>{task.time}</span>
            )}
            {task.tags?.slice(0,2).map(tag => (
              <span key={tag} style={{
                fontFamily: Ts.font.body, fontSize: 11, fontWeight: 500, color: 'var(--c-textDim)',
                padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)',
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      {task.priority && task.priority !== 'none' && (
        <div style={{ width: 4, height: 32, borderRadius: 2, background: priorityColor, flexShrink: 0 }} />
      )}
    </div>
  );
}

window.STR = STR;
window.ScreenToday = ScreenToday;
window.FocusCard = FocusCard;
window.TaskRow = TaskRow;

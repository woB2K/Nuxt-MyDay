// MyDay — Finance dashboard, Add Transaction, Task Sheet, Settings, Library

const Tf = window.TOKENS;

// Categories (id, label en/ru, icon, tint hex)
const CATEGORIES = [
  { id: 'food',     en: 'Food',     ru: 'Еда',          Icon: window.IconFork,      color: '#F87171', kind: 'expense' },
  { id: 'shop',     en: 'Shopping', ru: 'Покупки',      Icon: window.IconCart,      color: '#FBBF24', kind: 'expense' },
  { id: 'rent',     en: 'Rent',     ru: 'Жильё',        Icon: window.IconHome,      color: '#A78BFA', kind: 'expense' },
  { id: 'transport',en: 'Transport',ru: 'Транспорт',    Icon: window.IconCar,       color: '#60A5FA', kind: 'expense' },
  { id: 'fun',      en: 'Fun',      ru: 'Развлечения',  Icon: window.IconFilm,      color: '#F472B6', kind: 'expense' },
  { id: 'health',   en: 'Health',   ru: 'Здоровье',     Icon: window.IconHeart,     color: '#34D399', kind: 'expense' },
  { id: 'edu',      en: 'Learning', ru: 'Обучение',     Icon: window.IconBook,      color: '#5EEAD4', kind: 'expense' },
  { id: 'gifts',    en: 'Gifts',    ru: 'Подарки',      Icon: window.IconGift,      color: '#FB923C', kind: 'expense' },
  { id: 'salary',   en: 'Salary',   ru: 'Зарплата',     Icon: window.IconBriefcase, color: '#34D399', kind: 'income' },
  { id: 'freelance',en: 'Freelance',ru: 'Фриланс',      Icon: window.IconSparkle,   color: '#A78BFA', kind: 'income' },
];
window.CATEGORIES = CATEGORIES;

const fmtMoney = (n, lang = 'en') => {
  const sign = n < 0 ? '−' : '';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return lang === 'ru' ? `${sign}${formatted} ₽` : `${sign}$${formatted}`;
};
window.fmtMoney = fmtMoney;

// ─── Finance dashboard ───────────────────────────────────────────────────
function ScreenFinance({ transactions, lang }) {
  const s = window.STR[lang];
  const income = transactions.filter(t => t.type === 'income').reduce((a,b) => a + b.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a,b) => a + b.amount, 0);
  const net = income - expense;
  const total = income + expense || 1;

  // Category breakdown for expenses
  const byCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  const catBars = Object.entries(byCategory)
    .map(([id, amt]) => ({ ...CATEGORIES.find(c => c.id === id), amount: amt }))
    .sort((a,b) => b.amount - a.amount);
  const maxCat = catBars[0]?.amount || 1;

  const monthName = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' });

  return (
    <div style={{ padding: '12px 20px 120px' }}>
      {/* Header */}
      <div style={{ marginTop: 8, marginBottom: 24 }}>
        <h1 style={{
          margin: 0, fontFamily: Tf.font.display, fontSize: 34, fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--c-text)',
        }}>{s.finance}</h1>
        <div style={{
          fontFamily: Tf.font.body, fontSize: 14, color: 'var(--c-textDim)',
          marginTop: 2, textTransform: 'capitalize',
        }}>{monthName}</div>
      </div>

      {/* Hero balance */}
      <window.Card padding={24} radius={20} style={{
        background: `linear-gradient(160deg, var(--c-accentSoft) 0%, var(--c-bgElev1) 70%)`,
        border: '1px solid var(--c-accentSoft)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -30, width: 180, height: 180,
          borderRadius: 9999, background: 'var(--c-accent)', opacity: 0.06, filter: 'blur(30px)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            fontFamily: Tf.font.body, fontSize: 13, fontWeight: 500, color: 'var(--c-textDim)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>{s.netWorth}</div>
          <div style={{
            fontFamily: Tf.font.display, fontSize: 48, fontWeight: 700,
            letterSpacing: '-0.03em', color: net >= 0 ? 'var(--c-text)' : 'var(--c-danger)',
            lineHeight: '52px', marginBottom: 18,
          }}>{fmtMoney(net, lang)}</div>

          {/* Income vs expense bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              height: 10, borderRadius: 9999, background: 'rgba(255,255,255,0.06)',
              display: 'flex', overflow: 'hidden',
            }}>
              <div style={{
                width: `${(income / total) * 100}%`, background: 'var(--c-success)',
              }} />
              <div style={{
                width: `${(expense / total) * 100}%`, background: 'var(--c-danger)',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: Tf.font.body }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--c-success)' }} />
              <span style={{ fontSize: 12, color: 'var(--c-textDim)', fontWeight: 500 }}>{s.income}</span>
              <span style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 600 }}>{fmtMoney(income, lang)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--c-danger)' }} />
              <span style={{ fontSize: 12, color: 'var(--c-textDim)', fontWeight: 500 }}>{s.expense}</span>
              <span style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 600 }}>{fmtMoney(expense, lang)}</span>
            </div>
          </div>
        </div>
      </window.Card>

      {/* Category breakdown */}
      <window.SectionHeader title={s.spendByCategory} />
      <window.Card padding={6} radius={16}>
        {catBars.map((cat, idx) => {
          const pct = (cat.amount / maxCat) * 100;
          const overallPct = (cat.amount / expense) * 100;
          return (
            <div key={cat.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
              borderBottom: idx < catBars.length - 1 ? '1px solid var(--c-hairline)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: cat.color + '22', color: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <cat.Icon size={18} color={cat.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: Tf.font.body, fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{cat[lang]}</span>
                  <span style={{ fontFamily: Tf.font.display, fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{fmtMoney(cat.amount, lang)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 9999,
                      transition: `width ${Tf.dur.slow}ms ${Tf.ease.out}`,
                    }} />
                  </div>
                  <span style={{ fontFamily: Tf.font.body, fontSize: 11, fontWeight: 500, color: 'var(--c-textMute)', minWidth: 32, textAlign: 'right' }}>{overallPct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
        {catBars.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--c-textDim)', fontFamily: Tf.font.body, fontSize: 14 }}>
            No expenses yet this month
          </div>
        )}
      </window.Card>

      {/* Recent transactions */}
      <window.SectionHeader title={s.recent} />
      <window.Card padding={0} radius={16}>
        {transactions.slice(0, 8).map((tx, idx) => {
          const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[0];
          return (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              borderBottom: idx < Math.min(transactions.length, 8) - 1 ? '1px solid var(--c-hairline)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: cat.color + '22', color: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <cat.Icon size={20} color={cat.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: Tf.font.body, fontSize: 15, fontWeight: 600, color: 'var(--c-text)' }}>{tx.note || cat[lang]}</div>
                <div style={{ fontFamily: Tf.font.body, fontSize: 12, fontWeight: 500, color: 'var(--c-textMute)', marginTop: 2 }}>
                  {cat[lang]} · {tx.date}
                </div>
              </div>
              <div style={{
                fontFamily: Tf.font.display, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
                color: tx.type === 'income' ? 'var(--c-success)' : 'var(--c-text)',
              }}>
                {tx.type === 'income' ? '+' : '−'}{fmtMoney(tx.amount, lang).replace('−','').replace('-','')}
              </div>
            </div>
          );
        })}
      </window.Card>
    </div>
  );
}

// ─── Add Transaction (full sheet) ────────────────────────────────────────
function AddTransactionSheet({ open, onClose, onSave, lang }) {
  const s = window.STR[lang];
  const [type, setType] = React.useState('expense');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState(null);
  const [note, setNote] = React.useState('');

  React.useEffect(() => { if (open) { setType('expense'); setAmount(''); setCategory(null); setNote(''); } }, [open]);

  const filtered = CATEGORIES.filter(c => c.kind === type);

  const save = () => {
    const n = parseFloat(amount.replace(',', '.'));
    if (!n || !category) return;
    onSave({
      id: 'tx_' + Date.now(),
      type, amount: n, category, note,
      date: lang === 'ru' ? 'Сегодня' : 'Today',
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={s.addTransaction}>
      {/* Type toggle */}
      <div style={{ marginBottom: 24 }}>
        <window.PillSelect
          full
          options={[
            { value: 'expense', label: s.expenseLbl, icon: <window.IconArrowDown size={14} />, color: 'var(--c-danger)', inkColor: '#fff' },
            { value: 'income',  label: s.incomeLbl,  icon: <window.IconArrowUp size={14} />,   color: 'var(--c-success)', inkColor: '#0F0F14' },
          ]}
          value={type}
          onChange={(v) => { setType(v); setCategory(null); }}
        />
      </div>

      {/* Big amount input */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: Tf.font.body, fontSize: 12, fontWeight: 600, color: 'var(--c-textDim)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
        }}>{s.amount}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
          <span style={{
            fontFamily: Tf.font.display, fontSize: 28, fontWeight: 600,
            color: amount ? 'var(--c-textDim)' : 'var(--c-textGhost)',
          }}>{lang === 'ru' ? '₽' : '$'}</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="0"
            inputMode="decimal"
            style={{
              background: 'transparent', border: 'none', outline: 'none', width: 200, textAlign: 'center',
              fontFamily: Tf.font.display, fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em',
              color: amount ? (type === 'income' ? 'var(--c-success)' : 'var(--c-text)') : 'var(--c-textGhost)',
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* Category grid */}
      <div style={{
        fontFamily: Tf.font.body, fontSize: 12, fontWeight: 600, color: 'var(--c-textDim)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
      }}>{s.category}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24,
      }}>
        {filtered.map(cat => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                aspectRatio: '1 / 1', borderRadius: 14, padding: 8,
                background: active ? cat.color + '22' : 'var(--c-bgElev2)',
                border: `1px solid ${active ? cat.color : 'var(--c-hairline)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer',
                transition: `all ${Tf.dur.fast}ms ${Tf.ease.out}`,
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              <cat.Icon size={22} color={active ? cat.color : 'var(--c-textDim)'} />
              <span style={{
                fontFamily: Tf.font.body, fontSize: 11, fontWeight: 600,
                color: active ? cat.color : 'var(--c-textDim)',
                textAlign: 'center', lineHeight: '13px',
              }}>{cat[lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Note */}
      <window.Input
        label={s.note}
        value={note}
        onChange={setNote}
        placeholder={s.addNote}
        icon={<window.IconNote size={18} />}
      />

      <div style={{ height: 16 }} />
      <window.Button full size="lg" onClick={save} disabled={!amount || !category}>{s.save}</window.Button>
      <div style={{ height: 24 }} />
    </Sheet>
  );
}

// ─── Task sheet ──────────────────────────────────────────────────────────
function TaskSheet({ open, onClose, onSave, onDelete, task, lang }) {
  const s = window.STR[lang];
  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [priority, setPriority] = React.useState('none');
  const [repeat, setRepeat] = React.useState('never');
  const [tags, setTags] = React.useState('');
  const isNew = !task;

  React.useEffect(() => {
    if (open) {
      setTitle(task?.title || '');
      setNotes(task?.notes || '');
      setDeadline(task?.deadline || '');
      setPriority(task?.priority || 'none');
      setRepeat(task?.repeat || 'never');
      setTags(task?.tags?.join(', ') || '');
    }
  }, [open, task]);

  const save = () => {
    if (!title.trim()) return;
    onSave({
      ...(task || {}),
      id: task?.id || 't_' + Date.now(),
      title: title.trim(), notes, deadline, priority, repeat,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      slot: task?.slot || 'morning',
      done: task?.done || false,
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={isNew ? s.newTask : s.tasks}>
      <window.Input
        value={title}
        onChange={setTitle}
        placeholder={s.taskName}
        autoFocus
      />
      <div style={{ height: 12 }} />
      <window.Input
        value={notes}
        onChange={setNotes}
        placeholder={s.notes}
        multiline
        icon={<window.IconNote size={18} />}
      />

      {/* Deadline (mock date picker) */}
      <Row label={s.deadline} icon={<window.IconCalendar size={18} />}>
        <DatePickerMock value={deadline} onChange={setDeadline} lang={lang} />
      </Row>

      {/* Priority pill selector */}
      <Row label={s.priority} icon={<window.IconFlag size={18} />}>
        <window.PillSelect
          value={priority}
          onChange={setPriority}
          options={[
            { value: 'none', label: s.none },
            { value: 'low',  label: s.low,  color: 'var(--c-pLow)',  inkColor: '#0F0F14' },
            { value: 'med',  label: s.med,  color: 'var(--c-pMed)',  inkColor: '#0F0F14' },
            { value: 'high', label: s.high, color: 'var(--c-pHigh)', inkColor: '#fff' },
          ]}
        />
      </Row>

      {/* Repeat */}
      <Row label={s.repeat} icon={<window.IconRepeat size={18} />}>
        <window.PillSelect
          value={repeat}
          onChange={setRepeat}
          options={[
            { value: 'never',   label: s.never },
            { value: 'daily',   label: s.daily },
            { value: 'weekly',  label: s.weekly },
            { value: 'monthly', label: s.monthly },
          ]}
        />
      </Row>

      {/* Tags */}
      <Row label={s.tags} icon={<window.IconTag size={18} />} stack>
        <window.Input
          value={tags}
          onChange={setTags}
          placeholder="work, focus, personal"
        />
      </Row>

      <div style={{ height: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {!isNew && (
          <window.Button variant="secondary" size="lg" onClick={() => { onDelete?.(task.id); onClose(); }} icon={<window.IconTrash size={18} />}>
            {s.delete}
          </window.Button>
        )}
        <window.Button full size="lg" onClick={save} disabled={!title.trim()}>{s.save}</window.Button>
      </div>
      <div style={{ height: 24 }} />
    </Sheet>
  );
}

// Mini row helper for sheet form
function Row({ label, icon, children, stack }) {
  return (
    <div style={{
      marginTop: 16, padding: '14px 16px', borderRadius: 12,
      background: 'var(--c-bgElev2)', border: '1px solid var(--c-hairline)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: stack ? 10 : 10 }}>
        <span style={{ color: 'var(--c-textDim)', display: 'flex' }}>{icon}</span>
        <span style={{ fontFamily: Tf.font.body, fontSize: 13, fontWeight: 600, color: 'var(--c-textDim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

// Tiny date picker mock — 7 day strip
function DatePickerMock({ value, onChange, lang }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayLabel = ['S','M','T','W','T','F','S'];
  const dayLabelRu = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
      {days.map((d, i) => {
        const key = d.toISOString().slice(0,10);
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(active ? '' : key)}
            style={{
              flex: 1, minWidth: 44, padding: '8px 4px', borderRadius: 10, border: 'none',
              background: active ? 'var(--c-accent)' : 'transparent',
              color: active ? 'var(--c-accentInk)' : 'var(--c-text)',
              cursor: 'pointer',
              transition: `all ${Tf.dur.fast}ms ${Tf.ease.out}`,
            }}
          >
            <div style={{ fontFamily: Tf.font.body, fontSize: 11, fontWeight: 500, opacity: 0.7 }}>
              {(lang === 'ru' ? dayLabelRu : dayLabel)[d.getDay()]}
            </div>
            <div style={{ fontFamily: Tf.font.display, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{d.getDate()}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────
function ScreenSettings({ lang, onLangChange }) {
  const s = window.STR[lang];
  const [notifs, setNotifs] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [dark, setDark] = React.useState(true);

  return (
    <div style={{ padding: '12px 20px 120px' }}>
      <h1 style={{
        margin: '8px 0 24px', fontFamily: Tf.font.display, fontSize: 34, fontWeight: 700,
        letterSpacing: '-0.02em', color: 'var(--c-text)',
      }}>{s.settings}</h1>

      {/* Profile */}
      <window.Card padding={20} radius={16} style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 9999,
            background: `linear-gradient(135deg, var(--c-accent) 0%, #5EEAD4 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: Tf.font.display, fontSize: 22, fontWeight: 700, color: '#0F0F14',
          }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: Tf.font.display, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>Alex Petrov</div>
            <div style={{ fontFamily: Tf.font.body, fontSize: 13, color: 'var(--c-textDim)', marginTop: 2 }}>alex@myday.app</div>
          </div>
          <window.IconChevronRight size={20} color="var(--c-textMute)" />
        </div>
      </window.Card>

      <window.SectionHeader title={s.preferences} />
      <window.Card padding={0} radius={16}>
        <SettingRow icon={<window.IconBell size={18} />} label={s.notifications} trailing={<window.Switch checked={notifs} onChange={setNotifs} />} />
        <SettingRow icon={<window.IconMoon size={18} />} label={s.appearance} trailing={<span style={{ fontFamily: Tf.font.body, fontSize: 14, color: 'var(--c-textDim)' }}>Dark</span>} />
        <SettingRow icon={<window.IconGlobe size={18} />} label={s.language} trailing={
          <div style={{ display: 'flex', gap: 4, padding: 2, background: 'var(--c-bgElev3)', borderRadius: 8 }}>
            {['en','ru'].map(l => (
              <button key={l} onClick={() => onLangChange(l)} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: lang === l ? 'var(--c-accent)' : 'transparent',
                color: lang === l ? 'var(--c-accentInk)' : 'var(--c-textDim)',
                fontFamily: Tf.font.body, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{l}</button>
            ))}
          </div>
        } last />
      </window.Card>

      <window.SectionHeader title={s.account} />
      <window.Card padding={0} radius={16}>
        <SettingRow icon={<window.IconLock size={18} />} label={s.privacy} trailing={<window.IconChevronRight size={18} color="var(--c-textMute)" />} />
        <SettingRow icon={<window.IconHelp size={18} />} label={s.help} trailing={<window.IconChevronRight size={18} color="var(--c-textMute)" />} last />
      </window.Card>

      <div style={{
        textAlign: 'center', marginTop: 32,
        fontFamily: Tf.font.body, fontSize: 12, color: 'var(--c-textMute)',
      }}>MyDay v1.0 · Made with care</div>
    </div>
  );
}

function SettingRow({ icon, label, trailing, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--c-hairline)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: 'var(--c-bgElev3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--c-textDim)',
      }}>{icon}</div>
      <span style={{ flex: 1, fontFamily: Tf.font.body, fontSize: 15, fontWeight: 500, color: 'var(--c-text)' }}>{label}</span>
      {trailing}
    </div>
  );
}

// ─── Sheet (bottom sheet modal) ──────────────────────────────────────────
function Sheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = React.useState(open);
  const [show, setShow] = React.useState(false);
  // Step 1: when opening, mount first (show stays false)
  React.useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), Tf.dur.sheet);
      return () => clearTimeout(t);
    }
  }, [open]);
  // Step 2: once mounted is committed AND open is true, flip show on next frame
  React.useEffect(() => {
    if (mounted && open) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShow(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [mounted, open]);
  if (!mounted) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column',
      pointerEvents: open ? 'auto' : 'none',
    }}>
      {/* scrim */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
        opacity: show ? 1 : 0,
        transition: `opacity ${Tf.dur.sheet}ms ${Tf.ease.out}`,
        backdropFilter: 'blur(2px)',
      }} />
      {/* sheet */}
      <div style={{
        marginTop: 'auto', background: 'var(--c-bgElev1)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: `transform ${Tf.dur.sheet}ms ${Tf.ease.spring}`,
        maxHeight: '88%', overflowY: 'auto', position: 'relative',
        border: '1px solid var(--c-hairline)',
      }}>
        {/* grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.18)' }} />
        </div>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 8px',
        }}>
          <h2 style={{
            margin: 0, fontFamily: Tf.font.display, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--c-text)',
          }}>{title}</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 9999, border: 'none',
            background: 'var(--c-bgElev3)', color: 'var(--c-textDim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><window.IconClose size={18} /></button>
        </div>
        {/* body */}
        <div style={{ padding: '12px 20px 0' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

window.ScreenFinance = ScreenFinance;
window.AddTransactionSheet = AddTransactionSheet;
window.TaskSheet = TaskSheet;
window.ScreenSettings = ScreenSettings;
window.Sheet = Sheet;

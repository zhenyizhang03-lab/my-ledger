import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type CategoryKey =
  | 'food'
  | 'daily'
  | 'clothing'
  | 'beauty'
  | 'sport'
  | 'toy'
  | 'fun'
  | 'travel'
  | 'transport'
  | 'favor'
  | 'other';

type ExpenseRecord = {
  id: string;
  category: CategoryKey;
  amount: number;
  note: string;
  occurredAt: string;
};

type Screen = 'home' | 'categories' | 'entry';
type HomeTab = 'details' | 'charts';
type ChartRange = 'month' | 'year';

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

const STORAGE_KEY = 'orange-ledger.expenses.v1';

const CATEGORY_META: Record<
  CategoryKey,
  { label: string; color: string; background: string; icon: (props: IconProps) => ReactNode }
> = {
  food: { label: '餐饮', color: '#f5d454', background: '#3a3627', icon: FoodIcon },
  daily: { label: '日用', color: '#83d6a2', background: '#293a31', icon: DailyIcon },
  clothing: { label: '服饰', color: '#ff806d', background: '#3e2d2a', icon: ClothingIcon },
  beauty: { label: '美容', color: '#ef7ec4', background: '#3c2936', icon: BeautyIcon },
  sport: { label: '运动', color: '#70b9f5', background: '#293846', icon: SportIcon },
  toy: { label: '玩具', color: '#ffae58', background: '#3f3125', icon: ToyIcon },
  fun: { label: '玩乐', color: '#b597f3', background: '#352f41', icon: FunIcon },
  travel: { label: '旅行', color: '#4fd0c0', background: '#253b38', icon: TravelIcon },
  transport: { label: '交通', color: '#7c8fff', background: '#2c3044', icon: TransportIcon },
  favor: { label: '人情', color: '#ff5f72', background: '#3f292e', icon: FavorIcon },
  other: { label: '其他', color: '#b8bcc3', background: '#313335', icon: MoreIcon },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_META) as CategoryKey[];

function IconBase({
  children,
  size = 24,
  strokeWidth = 1.9,
  className,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {children}
    </svg>
  );
}

function ChevronLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="m15 18-6-6 6-6" /></IconBase>;
}

function ChevronRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 18 6-6-6-6" /></IconBase>;
}

function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m7 10 5 5 5-5" /></IconBase>;
}

function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18" /></IconBase>;
}

function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </IconBase>
  );
}

function FoodIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3v7M3.5 3v5.1A1.9 1.9 0 0 0 5.4 10H7a1.9 1.9 0 0 0 1.9-1.9V3M6.2 10v11" />
      <path d="M16.7 3c-2 0-3.6 2.3-3.6 5.2v3.1h3.6V21M16.7 3v8.3" />
    </IconBase>
  );
}

function DailyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 3h6M10 3v3l-2 2v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V8l-2-2V3" />
      <path d="M8 10h8" />
    </IconBase>
  );
}

function ClothingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4 3 7l2 4 3-1v10h8V10l3 1 2-4-5-3c-.7 1.3-2 2-4 2S8.7 5.3 8 4Z" />
    </IconBase>
  );
}

function BeautyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 21h6V9H9v12ZM10 9V5h4v4M10 5l4-2" />
      <path d="M8 21h8" />
    </IconBase>
  );
}

function SportIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 8v8M3 9v6M18 8v8M21 9v6M6 12h12" />
    </IconBase>
  );
}

function ToyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="6" width="12" height="9" rx="1.5" />
      <path d="M12 6V4h3v2M17 6V4h3v2" />
      <rect x="3" y="12" width="13" height="8" rx="1.5" />
      <path d="M6 12v-2h3v2M11 12v-2h3v2M9 15h7" />
    </IconBase>
  );
}

function FunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9h16v11H4V9Z" />
      <path d="m4 9 2-5h15l-2 5H4ZM9 4 7 9M14 4l-2 5M19 4l-2 5" />
      <path d="m10 12 5 2.5-5 2.5v-5Z" />
    </IconBase>
  );
}

function TravelIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-7 5v2l7-2v4l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-4l8 2Z" />
    </IconBase>
  );
}

function FavorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M12 9v12M3 13h18M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </IconBase>
  );
}

function PlusIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 5v14M5 12h14" /></IconBase>;
}

function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M9 3h6l1 4H8l1-4ZM6.5 7l.8 14h9.4l.8-14M10 11v6M14 11v6" />
    </IconBase>
  );
}

function TransportIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 16V8.5C5 5.5 7.8 4 12 4s7 1.5 7 4.5V16" />
      <path d="M5 12h14M7 16h10M7 19v2M17 19v2" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7" />
    </IconBase>
  );
}

function GameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.4 7h7.2c2.6 0 4.8 2.2 5 5l.3 3.6c.3 3.3-3.2 4.9-5.2 2.3l-1.2-1.5h-5l-1.2 1.5c-2 2.6-5.5 1-5.2-2.3l.3-3.6c.2-2.8 2.4-5 5-5Z" />
      <path d="M7 11v4M5 13h4M15.5 11.5h.01M18 14h.01" />
    </IconBase>
  );
}

function MedicalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="6" width="16" height="15" rx="3" />
      <path d="M9 6V4h6v2M12 10v7M8.5 13.5h7" />
    </IconBase>
  );
}

function EducationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12v4c3.3 2.2 6.7 2.2 10 0v-4M21 9v6" />
    </IconBase>
  );
}

function MoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

function ReceiptIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </IconBase>
  );
}

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalMonth(date = new Date()) {
  return getLocalDate(date).slice(0, 7);
}

function getDaysInMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(year, month - 1 + offset, 1);
  return `${shifted.getFullYear()}-${`${shifted.getMonth() + 1}`.padStart(2, '0')}`;
}

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year}年${month}月`;
}

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const LEGACY_CATEGORY_MAP: Record<string, CategoryKey> = {
  food: 'food',
  shopping: 'daily',
  housing: 'daily',
  entertainment: 'fun',
  medical: 'other',
  education: 'other',
  transport: 'transport',
  other: 'other',
};

function normalizeExpenseRecord(value: unknown): ExpenseRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<ExpenseRecord> & { category?: string };
  const category = typeof record.category === 'string'
    ? (CATEGORY_KEYS.includes(record.category as CategoryKey)
        ? record.category as CategoryKey
        : LEGACY_CATEGORY_MAP[record.category])
    : undefined;

  if (
    typeof record.id !== 'string' ||
    !category ||
    typeof record.amount !== 'number' ||
    !Number.isFinite(record.amount) ||
    record.amount <= 0 ||
    typeof record.note !== 'string' ||
    typeof record.occurredAt !== 'string'
  ) {
    return null;
  }

  return { ...record, category } as ExpenseRecord;
}

function loadExpenses() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeExpenseRecord)
          .filter((record): record is ExpenseRecord => record !== null)
      : [];
  } catch {
    return [];
  }
}

function formatRecordDay(dateKey: string) {
  const today = getLocalDate();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDate(yesterdayDate);
  if (dateKey === today) return '今天';
  if (dateKey === yesterday) return '昨天';
  const [, month, day] = dateKey.split('-').map(Number);
  return `${month}月${day}日`;
}

function CategoryBadge({ category, size = 'medium' }: { category: CategoryKey; size?: 'small' | 'medium' | 'large' }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={`category-badge category-badge--${size}`}
      style={{ backgroundColor: meta.background, color: meta.color }}
    >
      <Icon
        size={size === 'large' ? 30 : size === 'medium' ? 21 : 17}
        strokeWidth={size === 'large' ? 1.4 : 1.5}
      />
    </span>
  );
}

function MonthHeader({
  month,
  value,
  onTabChange,
  onMonthChange,
}: {
  month: string;
  value: HomeTab;
  onTabChange: (value: HomeTab) => void;
  onMonthChange: (month: string) => void;
}) {
  return (
    <header className="month-header">
      <SegmentedControl value={value} onChange={onTabChange} />
      <label className="month-picker">
        <span>{formatMonth(month)}</span>
        <ChevronDownIcon size={17} />
        <input
          aria-label="选择月份"
          type="month"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </label>
    </header>
  );
}

function SegmentedControl({ value, onChange }: { value: HomeTab; onChange: (value: HomeTab) => void }) {
  return (
    <div className="segmented-control" role="tablist" aria-label="首页内容切换">
      <button
        aria-selected={value === 'details'}
        className={value === 'details' ? 'is-active' : ''}
        onClick={() => onChange('details')}
        role="tab"
        type="button"
      >
        明细
      </button>
      <button
        aria-selected={value === 'charts'}
        className={value === 'charts' ? 'is-active' : ''}
        onClick={() => onChange('charts')}
        role="tab"
        type="button"
      >
        图表统计
      </button>
    </div>
  );
}

function EditableExpenseRow({
  record,
  onUpdate,
  onEditCategory,
  onDelete,
}: {
  record: ExpenseRecord;
  onUpdate: (id: string, changes: Partial<Pick<ExpenseRecord, 'amount' | 'note'>>) => void;
  onEditCategory: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const deleteRevealWidth = 52;
  const category = CATEGORY_META[record.category];
  const [editingField, setEditingField] = useState<'amount' | 'note' | null>(null);
  const [amountDraft, setAmountDraft] = useState(formatMoney(record.amount));
  const [noteDraft, setNoteDraft] = useState(record.note || category.label);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeOffsetRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number; offset: number } | null>(null);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  function applySwipeOffset(offset: number) {
    swipeOffsetRef.current = offset;
    setSwipeOffset(offset);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (editingField) return;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offset: swipeOffsetRef.current,
    };
    isDraggingRef.current = false;
    setIsDragging(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (!isDraggingRef.current && Math.abs(deltaX) < 6) return;
    if (!isDraggingRef.current && Math.abs(deltaY) > Math.abs(deltaX)) {
      pointerStartRef.current = null;
      return;
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    const nextOffset = Math.min(deleteRevealWidth, Math.max(0, start.offset - deltaX));
    applySwipeOffset(nextOffset);
  }

  function finishSwipe() {
    if (!pointerStartRef.current) return;
    const shouldOpen = swipeOffsetRef.current > deleteRevealWidth * 0.42;
    applySwipeOffset(shouldOpen ? deleteRevealWidth : 0);
    pointerStartRef.current = null;
    if (isDraggingRef.current) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
  }

  function beginAmountEdit() {
    setAmountDraft(record.amount.toFixed(2));
    setEditingField('amount');
  }

  function saveAmount() {
    const nextAmount = Number(amountDraft);
    setEditingField(null);
    if (Number.isFinite(nextAmount) && nextAmount > 0 && nextAmount !== record.amount) {
      onUpdate(record.id, { amount: nextAmount });
    }
  }

  function beginNoteEdit() {
    setNoteDraft(record.note || category.label);
    setEditingField('note');
  }

  function saveNote() {
    const trimmed = noteDraft.trim();
    const nextNote = trimmed === category.label ? '' : trimmed;
    setEditingField(null);
    if (nextNote !== record.note) {
      onUpdate(record.id, { note: nextNote });
    }
  }

  return (
    <article className="swipe-row">
      <button
        className="swipe-row__delete"
        onClick={() => onDelete(record.id)}
        aria-label={`删除${record.note || category.label}`}
        type="button"
      >
        <TrashIcon size={21} strokeWidth={1.5} />
      </button>
      <div
        className={`expense-row ${isDragging ? 'is-dragging' : ''}`}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (swipeOffsetRef.current > 0) {
            event.preventDefault();
            event.stopPropagation();
            applySwipeOffset(0);
          }
        }}
        onPointerCancel={finishSwipe}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishSwipe}
      >
        <button
          className="expense-row__category"
          onClick={() => onEditCategory(record.id)}
          aria-label={`修改${category.label}分类`}
          type="button"
        >
          <CategoryBadge category={record.category} />
        </button>

      {editingField === 'note' ? (
        <input
          autoFocus
          aria-label="修改记录文字"
          className="expense-row__text-input"
          maxLength={80}
          value={noteDraft}
          onBlur={saveNote}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setNoteDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') setEditingField(null);
          }}
        />
      ) : (
        <button className="expense-row__content" onClick={beginNoteEdit} type="button">
          <strong>{record.note || category.label}</strong>
        </button>
      )}

      {editingField === 'amount' ? (
        <label className="expense-row__amount-input-wrap">
          <span>− ¥</span>
          <input
            autoFocus
            aria-label="修改金额"
            inputMode="decimal"
            maxLength={10}
            value={amountDraft}
            onBlur={saveAmount}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d.]/g, '');
              if (/^\d{0,7}(\.\d{0,2})?$/.test(next)) setAmountDraft(next);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
              if (event.key === 'Escape') setEditingField(null);
            }}
          />
        </label>
      ) : (
        <button className="expense-row__amount" onClick={beginAmountEdit} type="button">
          <strong>− ¥ {formatMoney(record.amount)}</strong>
        </button>
      )}

      </div>
    </article>
  );
}

function ExpenseList({
  records,
  onUpdate,
  onEditCategory,
  onDelete,
}: {
  records: ExpenseRecord[];
  onUpdate: (id: string, changes: Partial<Pick<ExpenseRecord, 'amount' | 'note'>>) => void;
  onEditCategory: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const byDate = new Map<string, ExpenseRecord[]>();
    [...records]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .forEach((record) => {
        const key = record.occurredAt.slice(0, 10);
        byDate.set(key, [...(byDate.get(key) ?? []), record]);
      });
    return [...byDate.entries()];
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon"><ReceiptIcon size={29} /></span>
        <h2>这个月还没有支出</h2>
        <p>记下第一笔，月度开支会自动汇总。</p>
      </div>
    );
  }

  return (
    <div className="expense-groups">
      {groups.map(([date, dateRecords]) => (
        <section className="expense-group" key={date}>
          <h2>{formatRecordDay(date)}</h2>
          {dateRecords.map((record) => (
            <EditableExpenseRow
              key={record.id}
              record={record}
              onUpdate={onUpdate}
              onEditCategory={onEditCategory}
              onDelete={onDelete}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function buildTrend(records: ExpenseRecord[], month: string, range: ChartRange) {
  if (range === 'month') {
    const count = getDaysInMonth(month);
    const values = Array.from({ length: count }, () => 0);
    records.forEach((record) => {
      if (record.occurredAt.slice(0, 7) === month) {
        values[Number(record.occurredAt.slice(8, 10)) - 1] += record.amount;
      }
    });
    return {
      values,
      labels: ['1日', `${Math.ceil(count / 2)}日`, `${count}日`],
    };
  }

  const year = month.slice(0, 4);
  const values = Array.from({ length: 12 }, () => 0);
  records.forEach((record) => {
    if (record.occurredAt.startsWith(year)) {
      values[Number(record.occurredAt.slice(5, 7)) - 1] += record.amount;
    }
  });
  return { values, labels: ['1月', '6月', '12月'] };
}

function ExpenseTrend({ values, labels }: { values: number[]; labels: string[] }) {
  const width = 340;
  const height = 164;
  const left = 8;
  const right = 8;
  const top = 13;
  const bottom = 24;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = left + (index / Math.max(values.length - 1, 1)) * (width - left - right);
    const y = top + (1 - value / max) * (height - top - bottom);
    return { x, y, value };
  });
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const area = `${left},${height - bottom} ${polyline} ${width - right},${height - bottom}`;
  const nonZero = points.filter((point) => point.value > 0);

  return (
    <div className="trend-chart" aria-label={`最高单期支出 ¥${formatMoney(max)}`} role="img">
      <svg viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.5, 1].map((position) => (
          <line
            key={position}
            x1={left}
            x2={width - right}
            y1={top + position * (height - top - bottom)}
            y2={top + position * (height - top - bottom)}
            className="chart-grid-line"
          />
        ))}
        <polygon points={area} className="chart-area" />
        <polyline points={polyline} className="chart-line" />
        {nonZero.map((point, index) => (
          <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="3.5" className="chart-dot" />
        ))}
      </svg>
      <div className="chart-labels">
        {labels.map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
}

function ChartStatistics({ records, month }: { records: ExpenseRecord[]; month: string }) {
  const [range, setRange] = useState<ChartRange>('month');
  const relevantRecords = useMemo(() => {
    const prefix = range === 'month' ? month : month.slice(0, 4);
    return records.filter((record) => record.occurredAt.startsWith(prefix));
  }, [month, range, records]);
  const trend = useMemo(() => buildTrend(records, month, range), [month, range, records]);
  const total = relevantRecords.reduce((sum, record) => sum + record.amount, 0);
  const categories = CATEGORY_KEYS
    .map((key) => ({
      key,
      amount: relevantRecords
        .filter((record) => record.category === key)
        .reduce((sum, record) => sum + record.amount, 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  let cursor = 0;
  const conicSegments = categories.map((item) => {
    const start = cursor;
    cursor += (item.amount / Math.max(total, 1)) * 100;
    return `${CATEGORY_META[item.key].background} ${start}% ${cursor}%`;
  });

  return (
    <div className="statistics-panel">
      <div className="range-control" aria-label="统计周期" role="tablist">
        <button className={range === 'month' ? 'is-active' : ''} onClick={() => setRange('month')} type="button">月</button>
        <button className={range === 'year' ? 'is-active' : ''} onClick={() => setRange('year')} type="button">年</button>
      </div>

      {total === 0 ? (
        <div className="empty-state empty-state--charts">
          <span className="empty-chart-bars"><i /><i /><i /></span>
          <h2>暂无可统计的支出</h2>
          <p>添加支出后，这里会显示趋势和分类占比。</p>
        </div>
      ) : (
        <>
          <section className="chart-section">
            <div className="section-heading">
              <h2>支出趋势</h2>
              <span>共 ¥ {formatMoney(total)}</span>
            </div>
            <ExpenseTrend values={trend.values} labels={trend.labels} />
          </section>
          <section className="chart-section category-section">
            <div className="section-heading"><h2>分类占比</h2></div>
            <div className="category-chart-layout">
              <div
                className="donut-chart"
                style={{ background: `conic-gradient(${conicSegments.join(', ')})` }}
                aria-label="支出分类占比图"
                role="img"
              >
                <div><strong>¥ {formatMoney(total)}</strong><span>总支出</span></div>
              </div>
              <div className="chart-legend">
                {categories.map((item) => (
                  <div className="legend-row" key={item.key}>
                    <i style={{ backgroundColor: CATEGORY_META[item.key].background }} />
                    <span>{CATEGORY_META[item.key].label}</span>
                    <strong>{((item.amount / total) * 100).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function HomeScreen({
  month,
  records,
  homeTab,
  onTabChange,
  onMonthChange,
  onAdd,
  onUpdateRecord,
  onEditCategory,
  onDeleteRecord,
}: {
  month: string;
  records: ExpenseRecord[];
  homeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  onMonthChange: (month: string) => void;
  onAdd: () => void;
  onUpdateRecord: (id: string, changes: Partial<Pick<ExpenseRecord, 'amount' | 'note'>>) => void;
  onEditCategory: (id: string) => void;
  onDeleteRecord: (id: string) => void;
}) {
  const monthRecords = records.filter((record) => record.occurredAt.slice(0, 7) === month);
  const total = monthRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <main className="screen home-screen">
      <MonthHeader month={month} value={homeTab} onTabChange={onTabChange} onMonthChange={onMonthChange} />
      {homeTab === 'details' ? (
        <>
          <section className="detail-panel">
            <div className="total-block" aria-live="polite">
              <p>本月总开支</p>
              <strong><span>¥</span>{formatMoney(total)}</strong>
            </div>
          </section>
          <ExpenseList
            records={monthRecords}
            onUpdate={onUpdateRecord}
            onEditCategory={onEditCategory}
            onDelete={onDeleteRecord}
          />
        </>
      ) : (
        <ChartStatistics records={records} month={month} />
      )}
      <button className="floating-add" onClick={onAdd} aria-label="记一笔" type="button">
        <PlusIcon size={29} strokeWidth={1.8} />
      </button>
    </main>
  );
}

function CategoryScreen({
  title = '选择支出大类',
  onBack,
  onSelect,
}: {
  title?: string;
  onBack: () => void;
  onSelect: (key: CategoryKey) => void;
}) {
  return (
    <main className="screen sub-screen category-screen">
      <header className="sub-header">
        <button className="icon-button" onClick={onBack} aria-label="返回" type="button"><ChevronLeftIcon /></button>
        <h1>{title}</h1>
        <span className="header-spacer" />
      </header>
      <div className="category-grid">
        {CATEGORY_KEYS.map((key) => (
          <button className="category-tile" key={key} onClick={() => onSelect(key)} type="button">
            <CategoryBadge category={key} size="large" />
            <span>{CATEGORY_META[key].label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

function EntryScreen({
  category,
  onBack,
  onChangeCategory,
  onComplete,
}: {
  category: CategoryKey;
  onBack: () => void;
  onChangeCategory: () => void;
  onComplete: (amount: number, note: string, date: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getLocalDate());
  const amountRef = useRef<HTMLInputElement>(null);
  const numericAmount = Number(amount);
  const meta = CATEGORY_META[category];

  useEffect(() => {
    const timer = window.setTimeout(() => amountRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="screen sub-screen entry-screen">
      <header className="sub-header">
        <button className="icon-button" onClick={onBack} aria-label="返回" type="button"><ChevronLeftIcon /></button>
        <h1>记一笔</h1>
        <span className="header-spacer" />
      </header>

      <button className="selected-category" onClick={onChangeCategory} type="button">
        <CategoryBadge category={category} size="large" />
        <strong>{meta.label}</strong>
        <ChevronRightIcon size={21} />
      </button>

      <label className="amount-field">
        <span>¥</span>
        <input
          ref={amountRef}
          aria-label="支出金额"
          inputMode="decimal"
          maxLength={10}
          placeholder="0.00"
          value={amount}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d.]/g, '');
            if (/^\d{0,7}(\.\d{0,2})?$/.test(next)) setAmount(next);
          }}
        />
      </label>

      <label className="note-field">
        <span>备注</span>
        <textarea
          maxLength={80}
          placeholder="记录这笔支出…"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <small>{note.length}/80</small>
      </label>

      <label className="date-field">
        <span>
          <CalendarIcon size={21} />
          {date === getLocalDate()
            ? '今天'
            : new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}
        </span>
        <ChevronRightIcon size={21} />
        <input aria-label="支出日期" type="date" value={date} max={getLocalDate()} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="bottom-action">
        <button
          className="primary-button"
          disabled={!Number.isFinite(numericAmount) || numericAmount <= 0 || !date}
          onClick={() => onComplete(numericAmount, note.trim(), date)}
          type="button"
        >
          完成
        </button>
      </div>
    </main>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [homeTab, setHomeTab] = useState<HomeTab>('details');
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonth());
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('food');
  const [records, setRecords] = useState<ExpenseRecord[]>(loadExpenses);
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 1700);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function updateRecord(
    id: string,
    changes: Partial<Pick<ExpenseRecord, 'amount' | 'note'>>,
  ) {
    setRecords((current) => current.map((record) => (
      record.id === id ? { ...record, ...changes } : record
    )));
    setToastMessage('已保存修改');
  }

  function beginCategoryEdit(id: string) {
    setCategoryEditId(id);
    setScreen('categories');
  }

  function selectCategory(category: CategoryKey) {
    if (categoryEditId) {
      setRecords((current) => current.map((record) => (
        record.id === categoryEditId ? { ...record, category } : record
      )));
      setCategoryEditId(null);
      setScreen('home');
      setToastMessage('已保存修改');
      return;
    }

    setSelectedCategory(category);
    setScreen('entry');
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setToastMessage('已删除记录');
  }

  function completeEntry(amount: number, note: string, date: string) {
    const now = new Date();
    const time = `${`${now.getHours()}`.padStart(2, '0')}:${`${now.getMinutes()}`.padStart(2, '0')}:${`${now.getSeconds()}`.padStart(2, '0')}`;
    const record: ExpenseRecord = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}`,
      category: selectedCategory,
      amount,
      note,
      occurredAt: `${date}T${time}`,
    };
    setRecords((current) => [record, ...current]);
    setSelectedMonth(date.slice(0, 7));
    setHomeTab('details');
    setScreen('home');
    setToastMessage('已记录这笔支出');
  }

  return (
    <div className="app-stage">
      <div className="phone-shell">
        {screen === 'home' && (
          <HomeScreen
            homeTab={homeTab}
            month={selectedMonth}
            onAdd={() => {
              setCategoryEditId(null);
              setScreen('categories');
            }}
            onDeleteRecord={deleteRecord}
            onEditCategory={beginCategoryEdit}
            onMonthChange={(month) => month && setSelectedMonth(month)}
            onTabChange={setHomeTab}
            onUpdateRecord={updateRecord}
            records={records}
          />
        )}
        {screen === 'categories' && (
          <CategoryScreen
            title={categoryEditId ? '修改支出大类' : '选择支出大类'}
            onBack={() => {
              setCategoryEditId(null);
              setScreen('home');
            }}
            onSelect={selectCategory}
          />
        )}
        {screen === 'entry' && (
          <EntryScreen
            category={selectedCategory}
            onBack={() => setScreen('categories')}
            onChangeCategory={() => setScreen('categories')}
            onComplete={completeEntry}
          />
        )}
        <div className={`toast ${toastMessage ? 'is-visible' : ''}`} role="status">
          {toastMessage}
        </div>
      </div>
    </div>
  );
}

export default App;

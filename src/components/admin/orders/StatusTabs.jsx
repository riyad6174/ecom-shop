// Compact status tabs that double as the order-status filter.
// Each tab: [today's count] Label  total — a single 36px-high line.
// tabs: [{ key, label, total, today, tone }]

const TONES = {
  blue: {
    tab: 'border-blue-500 bg-blue-50 ring-1 ring-blue-500',
    boxActive: 'bg-blue-600 text-white',
    box: 'bg-blue-50 text-blue-700',
    label: 'text-blue-700',
  },
  yellow: {
    tab: 'border-amber-500 bg-amber-50 ring-1 ring-amber-500',
    boxActive: 'bg-amber-500 text-white',
    box: 'bg-amber-50 text-amber-700',
    label: 'text-amber-700',
  },
  green: {
    tab: 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500',
    boxActive: 'bg-emerald-600 text-white',
    box: 'bg-emerald-50 text-emerald-700',
    label: 'text-emerald-700',
  },
  red: {
    tab: 'border-red-500 bg-red-50 ring-1 ring-red-500',
    boxActive: 'bg-red-500 text-white',
    box: 'bg-red-50 text-red-600',
    label: 'text-red-600',
  },
  orange: {
    tab: 'border-orange-500 bg-orange-50 ring-1 ring-orange-500',
    boxActive: 'bg-orange-500 text-white',
    box: 'bg-orange-50 text-orange-700',
    label: 'text-orange-700',
  },
  purple: {
    tab: 'border-violet-500 bg-violet-50 ring-1 ring-violet-500',
    boxActive: 'bg-violet-600 text-white',
    box: 'bg-violet-50 text-violet-700',
    label: 'text-violet-700',
  },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-US');

export default function StatusTabs({ tabs, value, onChange }) {
  return (
    <div className='flex items-center gap-2 overflow-x-auto pb-1 mb-2'>
      <span className='shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5'>Today</span>
      {tabs.map((t) => {
        const active = value === t.key;
        const tone = TONES[t.tone] || TONES.blue;
        return (
          <button
            key={t.key || 'all'}
            type='button'
            onClick={() => onChange(t.key)}
            aria-pressed={active}
            title={`${fmt(t.today)} today · ${fmt(t.total)} total (all orders, ignores other filters)`}
            className={`shrink-0 flex items-center gap-2 h-9 pl-1 pr-3 rounded-lg border transition-all ${
              active ? tone.tab : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {/* Today's count */}
            <span
              className={`min-w-[1.75rem] h-7 px-1.5 rounded-md flex items-center justify-center text-sm font-black tabular-nums transition-colors ${
                active ? tone.boxActive : tone.box
              }`}
            >
              {fmt(t.today)}
            </span>
            <span className={`text-sm font-semibold whitespace-nowrap ${active ? tone.label : 'text-slate-700'}`}>
              {t.label}
            </span>
            <span className='text-[11px] text-slate-400 font-medium tabular-nums whitespace-nowrap'>
              {fmt(t.total)} total
            </span>
          </button>
        );
      })}
    </div>
  );
}

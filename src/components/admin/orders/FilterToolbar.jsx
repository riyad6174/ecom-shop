import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { FiSearch, FiX, FiSliders, FiCalendar } from 'react-icons/fi';

// ─── Date presets (Bangladesh calendar days, YYYY-MM-DD) ────────────────────
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function dhakaDay(daysAgo = 0) {
  return new Date(Date.now() + DHAKA_OFFSET_MS - daysAgo * DAY_MS).toISOString().slice(0, 10);
}

export const DATE_PRESETS = [
  { key: 'today', label: 'Today', range: () => [dhakaDay(0), dhakaDay(0)] },
  { key: 'yesterday', label: 'Yesterday', range: () => [dhakaDay(1), dhakaDay(1)] },
  { key: '7d', label: '7 days', range: () => [dhakaDay(6), dhakaDay(0)] },
  { key: '30d', label: '30 days', range: () => [dhakaDay(29), dhakaDay(0)] },
  { key: 'all', label: 'All', range: () => ['', ''] },
];

function detectPreset(from, to) {
  if (!from && !to) return 'all';
  const match = DATE_PRESETS.find((p) => {
    const [f, t] = p.range();
    return f === from && t === to;
  });
  return match ? match.key : 'custom';
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/**
 * Search-first toolbar: search box, date presets and a "Filters" popover for
 * the rarely used filters, plus removable chips for active filters.
 *
 * fields: [{ key, label, options: [{ value, label }] }]  ('' = no filter)
 */
export default function FilterToolbar({
  search = '',
  onSearch,
  searchPlaceholder = 'Search…',
  from = '',
  to = '',
  onDateChange,
  fields = [],
  values = {},
  onFieldChange,
  onClearAll,
  resultText,
}) {
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const [text, setText] = useState(search);

  // Keep the box in sync when search changes from outside (URL, clear all)
  useEffect(() => {
    setText(search);
  }, [search]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // "/" focuses search (unless already typing somewhere)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isTypingTarget(document.activeElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleText = (val) => {
    setText(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(val.trim()), 400);
  };

  const clearSearch = () => {
    clearTimeout(debounceRef.current);
    setText('');
    onSearch('');
    inputRef.current?.focus();
  };

  const preset = detectPreset(from, to);
  const activeFields = fields.filter((f) => values[f.key]);
  const activeCount = activeFields.length + (preset === 'custom' ? 1 : 0);
  const hasChips = activeCount > 0;

  return (
    <div className='mb-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {/* Search */}
        <div className='relative flex-1 min-w-[220px]'>
          <FiSearch className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none' />
          <input
            ref={inputRef}
            type='text'
            value={text}
            onChange={(e) => handleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
            placeholder={searchPlaceholder}
            className='w-full h-10 text-sm bg-white border border-slate-200 rounded-xl pl-10 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
          />
          {text ? (
            <button
              type='button'
              onClick={clearSearch}
              className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              title='Clear search (Esc)'
            >
              <FiX className='w-4 h-4' />
            </button>
          ) : (
            <kbd className='hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50'>
              /
            </kbd>
          )}
        </div>

        {/* Date presets */}
        <div className='flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto max-w-full'>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              type='button'
              onClick={() => onDateChange(...p.range())}
              className={`h-8 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                preset === p.key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
          {preset === 'custom' && (
            <span className='h-8 px-3 text-xs font-semibold rounded-lg bg-slate-900 text-white flex items-center gap-1 whitespace-nowrap'>
              <FiCalendar className='w-3 h-3' /> Custom
            </span>
          )}
        </div>

        {/* Filters popover */}
        <Popover className='relative'>
          <PopoverButton
            className={`h-10 px-3.5 inline-flex items-center gap-2 text-sm font-semibold rounded-xl border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              activeCount
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FiSliders className='w-4 h-4' />
            Filters
            {activeCount > 0 && (
              <span className='min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center'>
                {activeCount}
              </span>
            )}
          </PopoverButton>
          <PopoverPanel
            transition
            className='absolute right-0 z-30 mt-2 w-[min(26rem,calc(100vw-2rem))] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 transition duration-150 ease-out data-[closed]:opacity-0 data-[closed]:-translate-y-1'
          >
            <div className='grid grid-cols-2 gap-3'>
              {fields.map((f) => (
                <label key={f.key} className='block'>
                  <span className='text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block'>{f.label}</span>
                  <select
                    value={values[f.key] || ''}
                    onChange={(e) => onFieldChange(f.key, e.target.value)}
                    className='w-full h-9 text-sm border border-slate-200 bg-slate-50 rounded-lg px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-slate-700'
                  >
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              ))}
              <div className='col-span-2'>
                <span className='text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block'>Custom date range</span>
                <div className='flex items-center gap-2'>
                  <input
                    type='date'
                    value={from}
                    max={to || undefined}
                    onChange={(e) => onDateChange(e.target.value, to)}
                    className='flex-1 min-w-0 h-9 text-xs border border-slate-200 bg-slate-50 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  />
                  <span className='text-slate-300'>—</span>
                  <input
                    type='date'
                    value={to}
                    min={from || undefined}
                    onChange={(e) => onDateChange(from, e.target.value)}
                    className='flex-1 min-w-0 h-9 text-xs border border-slate-200 bg-slate-50 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  />
                </div>
              </div>
            </div>
            {hasChips && (
              <div className='mt-4 pt-3 border-t border-slate-100 flex justify-end'>
                <button type='button' onClick={onClearAll} className='text-xs font-semibold text-slate-500 hover:text-red-600'>
                  Clear all filters
                </button>
              </div>
            )}
          </PopoverPanel>
        </Popover>
      </div>

      {/* Active filter chips + result count */}
      {(hasChips || resultText) && (
        <div className='flex flex-wrap items-center gap-2 mt-2.5 min-h-[24px]'>
          {activeFields.map((f) => {
            const opt = f.options.find((o) => o.value === values[f.key]);
            return (
              <span
                key={f.key}
                className='inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100'
              >
                <span className='text-blue-400'>{f.label}:</span> {opt?.label || values[f.key]}
                <button
                  type='button'
                  onClick={() => onFieldChange(f.key, '')}
                  className='p-0.5 rounded-full hover:bg-blue-100'
                  title={`Remove ${f.label} filter`}
                >
                  <FiX className='w-3 h-3' />
                </button>
              </span>
            );
          })}
          {preset === 'custom' && (
            <span className='inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100'>
              <span className='text-blue-400'>Date:</span> {from || '…'} – {to || '…'}
              <button type='button' onClick={() => onDateChange('', '')} className='p-0.5 rounded-full hover:bg-blue-100' title='Remove date filter'>
                <FiX className='w-3 h-3' />
              </button>
            </span>
          )}
          {hasChips && (
            <button type='button' onClick={onClearAll} className='text-xs font-semibold text-slate-400 hover:text-red-600 px-1'>
              Clear all
            </button>
          )}
          {resultText && <span className='ml-auto text-xs text-slate-400 font-medium'>{resultText}</span>}
        </div>
      )}
    </div>
  );
}

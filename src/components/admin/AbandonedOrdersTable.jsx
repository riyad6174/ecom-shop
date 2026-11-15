import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiRefreshCw, FiArrowLeft, FiArrowRight,
  FiPhone, FiCopy, FiCheck, FiShoppingCart, FiMessageCircle,
  FiEdit3, FiMessageSquare, FiBell, FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, FiInfo,
} from 'react-icons/fi';
import { ABANDONED_SEEN_EVENT } from '@/hooks/useAbandonedCount';
import FilterToolbar from '@/components/admin/orders/FilterToolbar';
import StatusTabs from '@/components/admin/orders/StatusTabs';
import AbandonedFollowUpModal from '@/components/admin/abandoned/AbandonedFollowUpModal';
import {
  FOLLOW_UP_CONFIG, FOLLOW_UP_ORDER, CALL_RESPONSE_CONFIG,
  formatDhakaDateTime, relativeTo, isDue, SCHEDULED_STATUSES,
} from '@/components/admin/abandoned/followUpConfig';

const PAGE_SIZE = 30;

// Toolbar "Filters" popover fields ('' = no filter)
const FILTER_FIELDS = [
  {
    key: 'response',
    label: 'Call result',
    options: [
      { value: '', label: 'All' },
      { value: 'none', label: 'Not called yet' },
      { value: 'called', label: 'Called' },
      { value: 'did_not_pick', label: 'Did not pick' },
      { value: 'number_off', label: 'Number off' },
      { value: 'fake_order', label: 'Fake / spam' },
    ],
  },
  {
    key: 'schedule',
    label: 'Follow-up time',
    options: [
      { value: '', label: 'Any' },
      { value: 'due', label: 'Due now (overdue)' },
      { value: 'upcoming', label: 'Upcoming' },
    ],
  },
];

const EMPTY_FOLLOW_UP = Object.fromEntries(FOLLOW_UP_ORDER.map((k) => [k, { total: 0, today: 0 }]));
const EMPTY_STATS = { today: 0, total: 0, new: 0, due: 0, followUp: EMPTY_FOLLOW_UP };

// Left row border = follow-up status (one colour, no row backgrounds)
const ROW_BORDER = {
  pending: 'border-l-transparent',
  call_later: 'border-l-orange-400',
  order_later: 'border-l-violet-400',
  confirmed: 'border-l-green-500',
  cancelled: 'border-l-red-400',
};

const TH = 'px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap';
const TD = 'px-4 py-3.5 align-top';

function localPhone(s) {
  return s.phoneLocal || String(s.phone || '').replace(/^\+?88/, '');
}

function timeAgo(date) {
  if (!date) return '';
  const mins = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Same Bangladesh calendar day (UTC+6) as now
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const dhakaDay = (d) => new Date(new Date(d).getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 10);
const isToday = (d) => !!d && dhakaDay(d) === dhakaDay(Date.now());

const taka = (n) => `৳${Number(n || 0).toLocaleString('en-BD')}`;

function SummaryStat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className='flex items-baseline gap-1.5'>
      <span className={`text-lg font-black tabular-nums leading-none ${tone}`}>{value}</span>
      <span className='text-xs font-medium text-slate-500'>{label}</span>
    </div>
  );
}

/**
 * Abandoned orders list. Used by /admin/abandoned-orders (markSeen = true,
 * which resets the "new" counter) and by the Abandoned tab on /admin/orders.
 */
export default function AbandonedOrdersTable({ markSeen = false }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [copied, setCopied] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [followUp, setFollowUp] = useState(''); // status tab ('' = all)
  const [filters, setFilters] = useState({ response: '', schedule: '' });
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const requestIdRef = useRef(0);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const fetchRows = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: PAGE_SIZE, search, from: fromDate, to: toDate,
        followUp, response: filters.response, schedule: filters.schedule,
      });
      const res = await fetch(`/api/admin/abandoned-orders?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (requestId !== requestIdRef.current) return; // a newer request wins
      setRows(data.abandonedOrders || []);
      setHasLoaded(true);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setStats({ ...EMPTY_STATS, ...(data.stats || {}), followUp: { ...EMPTY_FOLLOW_UP, ...(data.stats?.followUp || {}) } });

      // Admin is looking at this list → everything in it is no longer "new".
      // Rows keep their NEW highlight for this view (seenByAdmin came back false).
      if (markSeen && data.stats?.new > 0) {
        fetch('/api/admin/abandoned-orders/mark-seen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upTo: data.serverTime }),
        })
          .then(() => window.dispatchEvent(new Event(ABANDONED_SEEN_EVENT)))
          .catch(() => {});
      }
    } catch {
      // keep previous state
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search, fromDate, toDate, followUp, filters, markSeen]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, followUp, filters]);

  const clearDates = () => {
    setFromDate('');
    setToDate('');
    setFilters({ response: '', schedule: '' });
  };

  const openModal = (s) => {
    setSelected(s);
    setModalOpen(true);
  };
  // Saved in the modal → update the row in place. The list (and tab counts)
  // is refetched when the modal closes, so rows don't jump while working.
  const handleUpdated = (updated) => {
    setRows((prev) => prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)));
  };
  const closeModal = () => {
    setModalOpen(false);
    fetchRows();
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const toggleDue = () => setFilters((f) => ({ ...f, schedule: f.schedule === 'due' ? '' : 'due' }));

  return (
    <div>
      {/* ── Summary bar ── */}
      <div className='flex flex-wrap items-center gap-x-6 gap-y-3 mb-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm'>
        <SummaryStat label='today' value={stats.today} tone='text-orange-600' />
        <SummaryStat label='total' value={stats.total} />
        <SummaryStat label='unseen' value={stats.new} tone={stats.new > 0 ? 'text-red-600' : 'text-slate-400'} />
        <button
          type='button'
          onClick={toggleDue}
          disabled={stats.due === 0 && filters.schedule !== 'due'}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 disabled:cursor-default ${
            filters.schedule === 'due'
              ? 'bg-red-600 text-white border-red-600'
              : stats.due > 0
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}
          title='Call later / order later customers whose follow-up time has passed'
        >
          <FiBell className='w-3.5 h-3.5' />
          {stats.due} follow-up{stats.due === 1 ? '' : 's'} due
        </button>
        <div className='ml-auto flex items-center gap-3'>
          <span
            className='hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-400'
            title='A checkout is marked abandoned after 3–4 minutes without activity. Placed orders never appear here.'
          >
            <FiInfo className='w-3.5 h-3.5' /> After 3–4 min inactivity
          </span>
          <button
            onClick={fetchRows}
            className='flex items-center gap-2 h-8 px-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50'
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload
          </button>
        </div>
      </div>

      {/* ── Follow-up status tabs (counts + filter) ── */}
      <StatusTabs
        value={followUp}
        onChange={setFollowUp}
        tabs={[
          { key: '', label: 'All', total: stats.total, today: stats.today, tone: 'blue' },
          ...FOLLOW_UP_ORDER.map((k) => ({
            key: k,
            label: FOLLOW_UP_CONFIG[k].label,
            total: stats.followUp[k].total,
            today: stats.followUp[k].today,
            tone: k === 'pending' ? 'yellow' : FOLLOW_UP_CONFIG[k].tone,
          })),
        ]}
      />

      <FilterToolbar
        search={search}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder='Search name, phone, address, product or note…'
        from={fromDate}
        to={toDate}
        onDateChange={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
        fields={FILTER_FIELDS}
        values={filters}
        onFieldChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
        onClearAll={clearDates}
        resultText={
          hasLoaded
            ? total === 0
              ? 'No abandoned orders'
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`
            : ''
        }
      />

      {/* ── Table ── */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]'>
        <div className='overflow-x-auto flex-grow'>
          <table className='w-full min-w-[1080px] text-sm text-left border-collapse table-fixed'>
            <colgroup>
              <col className='w-[110px]' />
              <col className='w-[210px]' />
              <col className='w-[260px]' />
              <col className='w-[220px]' />
              <col className='w-[220px]' />
              <col className='w-[130px]' />
            </colgroup>
            <thead>
              <tr className='bg-slate-50 border-b border-slate-200'>
                <th className={TH}>Action</th>
                <th className={TH}>Customer</th>
                <th className={TH}>Cart</th>
                <th className={TH}>Delivery address</th>
                <th className={TH}>Follow-up</th>
                <th className={TH}>Abandoned</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 transition-opacity ${loading && hasLoaded ? 'opacity-50' : ''}`}>
              {loading && !hasLoaded ? (
                <tr>
                  <td colSpan='6' className='py-24 text-center'>
                    <div className='animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto' />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan='6' className='py-24 text-center'>
                    <FiShoppingCart className='w-10 h-10 text-slate-200 mx-auto mb-3' />
                    <p className='text-slate-500 font-bold'>No abandoned orders found</p>
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const phone = localPhone(s);
                  const items = s.items || [];
                  const today = isToday(s.abandonedAt);
                  const status = s.followUpStatus || 'pending';
                  const fu = FOLLOW_UP_CONFIG[status] || FOLLOW_UP_CONFIG.pending;
                  const FuIcon = fu.icon;
                  const resp = CALL_RESPONSE_CONFIG[s.callResponse || 'none'] || CALL_RESPONSE_CONFIG.none;
                  const RespIcon = resp.icon;
                  const due = isDue(s);
                  const scheduled = SCHEDULED_STATUSES.includes(status) && s.followUpAt;
                  return (
                    <tr
                      key={s._id}
                      className={`border-l-4 ${ROW_BORDER[status] || ROW_BORDER.pending} ${
                        today ? 'bg-amber-50/50' : ''
                      } hover:bg-slate-50 transition-colors`}
                    >
                      {/* Action */}
                      <td className={TD}>
                        <button
                          onClick={() => openModal(s)}
                          className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors'
                          title='Update status, call result, callback time and note'
                        >
                          <FiEdit3 className='w-3.5 h-3.5' /> Manage
                        </button>
                      </td>

                      {/* Customer */}
                      <td className={TD}>
                        <div className='flex items-center gap-1.5 min-w-0'>
                          <span className='font-bold text-slate-800 truncate' title={s.name}>
                            {s.name || <span className='italic text-slate-400 font-medium'>No name</span>}
                          </span>
                          {today && (
                            <span
                              className='shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500 text-white'
                              title='Abandoned today (Bangladesh time)'
                            >
                              Today
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-0.5 mt-1 -ml-1'>
                          <a href={`tel:${phone}`} className='px-1 text-[13px] font-mono font-semibold text-blue-700 hover:underline' title='Call'>
                            {phone}
                          </a>
                          <a href={`tel:${phone}`} className='p-1 rounded-md text-emerald-600 hover:bg-emerald-50' title='Call'>
                            <FiPhone className='w-3.5 h-3.5' />
                          </a>
                          <a
                            href={`https://wa.me/88${phone}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-1 rounded-md text-green-600 hover:bg-green-50'
                            title='WhatsApp'
                          >
                            <FiMessageCircle className='w-3.5 h-3.5' />
                          </a>
                          <button onClick={() => copy(phone, `p-${s._id}`)} className='p-1 rounded-md text-slate-400 hover:bg-slate-100' title='Copy phone'>
                            {copied === `p-${s._id}` ? <FiCheck className='w-3.5 h-3.5 text-emerald-600' /> : <FiCopy className='w-3.5 h-3.5' />}
                          </button>
                        </div>
                        {s.laterOrderId && (
                          <span
                            className='inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200'
                            title='This customer placed an order later from another checkout'
                          >
                            Ordered later #{s.laterOrderId}
                          </span>
                        )}
                      </td>

                      {/* Cart: items + total */}
                      <td className={TD}>
                        {items.length === 0 ? (
                          <span className='text-xs italic text-slate-400'>No items</span>
                        ) : (
                          <ul className='space-y-1'>
                            {items.map((it, i) => (
                              <li key={i} className='flex items-start gap-1.5 text-xs leading-snug'>
                                <span className='shrink-0 font-bold text-blue-600 tabular-nums'>{it.quantity || 1}×</span>
                                <span className='min-w-0 text-slate-700'>
                                  <span className='line-clamp-2' title={it.title}>{it.title}</span>
                                  {it.variant && it.variant !== 'Standard' && (
                                    <span className='block text-[10px] text-slate-400 uppercase tracking-tight'>{it.variant}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className='flex items-center gap-2 mt-2 pt-2 border-t border-dashed border-slate-200'>
                          <span className='font-black text-slate-900'>{taka(s.grandTotal)}</span>
                          <span className='text-[10px] text-slate-400' title={`${taka(s.totalPrice)} + ${taka(s.shippingCharge)} shipping`}>
                            incl. {taka(s.shippingCharge)} delivery
                          </span>
                          {s.couponCode && (
                            <span className='ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200'>
                              {s.couponCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Address */}
                      <td className={TD}>
                        {s.deliveryZone && (
                          <span className='inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mb-1'>
                            <FiMapPin className='w-3 h-3' /> {s.deliveryZone}
                          </span>
                        )}
                        <p className='text-xs text-slate-600 leading-relaxed line-clamp-3' title={s.address}>
                          {s.address || <span className='italic text-slate-400'>Not entered</span>}
                        </p>
                      </td>

                      {/* Follow-up */}
                      <td className={TD}>
                        <div className='flex flex-wrap items-center gap-1.5'>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold whitespace-nowrap ${fu.badge}`}>
                            <FuIcon className='w-3 h-3' /> {fu.label}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${resp.badge}`}>
                            <RespIcon className='w-3 h-3' /> {resp.label}
                          </span>
                        </div>
                        {scheduled && (
                          <div
                            className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold ${due ? 'text-red-600' : 'text-slate-600'}`}
                            title={due ? 'Follow-up time has passed' : 'Scheduled follow-up'}
                          >
                            {due ? <FiBell className='w-3 h-3 shrink-0' /> : <FiCalendar className='w-3 h-3 shrink-0' />}
                            <span className='truncate'>
                              {formatDhakaDateTime(s.followUpAt)} · <span className={due ? 'font-black' : 'text-slate-400 font-medium'}>{relativeTo(s.followUpAt)}</span>
                            </span>
                          </div>
                        )}
                        {s.note && (
                          <div className='flex items-start gap-1 mt-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-1' title={s.note}>
                            <FiMessageSquare className='w-3 h-3 mt-0.5 shrink-0' />
                            <span className='line-clamp-2 break-words'>{s.note}</span>
                          </div>
                        )}
                        {s.followUpUpdatedBy && (
                          <div className='mt-1 text-[10px] text-slate-400 truncate' title={formatDhakaDateTime(s.followUpUpdatedAt)}>
                            Updated by {s.followUpUpdatedBy.split('@')[0]}
                          </div>
                        )}
                      </td>

                      {/* Abandoned time + source */}
                      <td className={TD}>
                        <div className='text-xs font-semibold text-slate-700 whitespace-nowrap'>{formatDhakaDateTime(s.abandonedAt)}</div>
                        <div className='text-[11px] text-slate-400 whitespace-nowrap'>{timeAgo(s.abandonedAt)}</div>
                        {(s.trafficSource || s.deviceType) && (
                          <div className='mt-1.5 text-[10px] text-slate-500 capitalize truncate' title={s.pageUrl || ''}>
                            {[s.trafficSource, s.deviceType].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className='px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4'>
            <div className='text-xs font-semibold text-slate-500'>
              Page <span className='text-slate-900'>{page}</span> of {totalPages}
              <span className='ml-1 text-slate-400'>· {total} total</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none'
              >
                <FiArrowLeft className='w-4 h-4' />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none'
              >
                <FiArrowRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      <AbandonedFollowUpModal
        session={selected}
        open={modalOpen}
        onClose={closeModal}
        onUpdated={handleUpdated}
        onToast={showToast}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-white ${
            toast.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-slate-900 border-slate-800'
          }`}
        >
          {toast.type === 'error' ? <FiXCircle className='w-5 h-5' /> : <FiCheckCircle className='text-green-400 w-5 h-5' />}
          <span className='text-sm font-bold'>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

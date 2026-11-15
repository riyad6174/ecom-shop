import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  FiXCircle, FiCheckCircle, FiCopy, FiPhone, FiMessageCircle, FiSave, FiCalendar, FiX, FiActivity,
} from 'react-icons/fi';
import {
  FOLLOW_UP_CONFIG, FOLLOW_UP_ORDER, CALL_RESPONSE_CONFIG, CALL_RESPONSE_ORDER, SCHEDULED_STATUSES,
  FOLLOW_UP_PRESETS, toDhakaInput, fromDhakaInput, formatDhakaDateTime, relativeTo, isDue,
} from './followUpConfig';

function localPhone(s) {
  return s?.phoneLocal || String(s?.phone || '').replace(/^\+?88/, '');
}

function SectionTitle({ color, children }) {
  return (
    <h4 className='text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2'>
      <div className={`w-1.5 h-4 rounded-full ${color}`} />
      {children}
    </h4>
  );
}

function activityText(a) {
  switch (a.field) {
    case 'followUpStatus':
      return <>Status → <b>{FOLLOW_UP_CONFIG[a.value]?.label || a.value}</b></>;
    case 'callResponse':
      return <>Call result → <b>{CALL_RESPONSE_CONFIG[a.value]?.label || a.value}</b></>;
    case 'followUpAt':
      return a.value ? <>Follow-up set for <b>{formatDhakaDateTime(a.value)}</b></> : <>Follow-up time cleared</>;
    case 'note':
      return a.value ? <>Note: <span className='italic'>“{a.value}”</span></> : <>Note cleared</>;
    default:
      return a.field;
  }
}

/**
 * Follow-up manager for one abandoned checkout. Every change is saved
 * immediately (like the order update modal); onUpdated receives the saved row.
 */
export default function AbandonedFollowUpModal({ session, open, onClose, onUpdated, onToast }) {
  const [current, setCurrent] = useState(session);
  const [activity, setActivity] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [saving, setSaving] = useState('');
  const [copied, setCopied] = useState('');

  // Load the full record (incl. activity log) whenever a row is opened
  useEffect(() => {
    if (!open || !session?._id) return;
    setCurrent(session);
    setNoteText(session.note || '');
    setDateInput(toDhakaInput(session.followUpAt));
    setActivity([]);
    let cancelled = false;
    fetch(`/api/admin/abandoned-orders/${session._id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.abandonedOrder) setActivity(data.abandonedOrder.activity || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, session?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (changes, key, message) => {
    if (!current) return false;
    setSaving(key);
    try {
      const res = await fetch(`/api/admin/abandoned-orders/${current._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onToast?.(data.message || 'Failed to save', 'error');
        return false;
      }
      const saved = data.abandonedOrder;
      const merged = {
        ...current,
        followUpStatus: saved.followUpStatus || 'pending',
        callResponse: saved.callResponse || null,
        followUpAt: saved.followUpAt,
        note: saved.note || '',
        followUpUpdatedAt: saved.followUpUpdatedAt,
        followUpUpdatedBy: saved.followUpUpdatedBy,
      };
      setCurrent(merged);
      setActivity(saved.activity || []);
      setDateInput(toDhakaInput(saved.followUpAt));
      onUpdated?.(merged);
      if (message) onToast?.(message);
      return true;
    } catch {
      onToast?.('Failed to save', 'error');
      return false;
    } finally {
      setSaving('');
    }
  };

  const setStatus = (st) => {
    if (current.followUpStatus === st) return;
    const changes = { followUpStatus: st };
    // Call later / order later without a time yet → default to tomorrow 10 AM
    if (SCHEDULED_STATUSES.includes(st) && !current.followUpAt) {
      changes.followUpAt = FOLLOW_UP_PRESETS[3].at();
    }
    save(changes, `st-${st}`, `Marked as ${FOLLOW_UP_CONFIG[st].label}`);
  };

  const setResponse = (val) => {
    const next = val === 'none' ? null : val;
    if ((current.callResponse || null) === next) return;
    save({ callResponse: next }, `cr-${val}`, `Call result: ${CALL_RESPONSE_CONFIG[val].label}`);
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  if (!current) return null;
  const phone = localPhone(current);
  const scheduled = SCHEDULED_STATUSES.includes(current.followUpStatus);
  const due = isDue(current);
  const noteDirty = noteText !== (current.note || '');

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-200' enterFrom='opacity-0' enterTo='opacity-100'
          leave='ease-in duration-150' leaveFrom='opacity-100' leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-200' enterFrom='opacity-0 scale-95' enterTo='opacity-100 scale-100'
              leave='ease-in duration-150' leaveFrom='opacity-100 scale-100' leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-4xl rounded-3xl bg-white text-left shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto'>
                <div className='p-6 sm:p-8'>
                  {/* Header */}
                  <div className='flex items-start justify-between gap-4 mb-6'>
                    <div className='min-w-0'>
                      <Dialog.Title as='h3' className='text-xl font-black text-slate-900'>
                        Abandoned Order Follow-up
                      </Dialog.Title>
                      <div className='flex flex-wrap items-center gap-2 mt-2'>
                        <span className='font-bold text-slate-800'>{current.name || 'No name'}</span>
                        <a href={`tel:${phone}`} className='font-mono font-semibold text-blue-700 hover:underline'>{phone}</a>
                        <a href={`tel:${phone}`} className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700'>
                          <FiPhone className='w-3.5 h-3.5' /> Call
                        </a>
                        <a
                          href={`https://wa.me/88${phone}`} target='_blank' rel='noopener noreferrer'
                          className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-bold hover:bg-green-100'
                        >
                          <FiMessageCircle className='w-3.5 h-3.5' /> WhatsApp
                        </a>
                        <button
                          onClick={() => copy(phone, 'phone')}
                          className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold hover:bg-slate-100'
                        >
                          {copied === 'phone' ? <FiCheckCircle className='w-3.5 h-3.5 text-emerald-600' /> : <FiCopy className='w-3.5 h-3.5' />} Copy
                        </button>
                      </div>
                      {current.laterOrderId && (
                        <p className='mt-2 text-xs font-bold text-emerald-700'>
                          This customer placed order #{current.laterOrderId} later from another checkout.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className='shrink-0 w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500'
                    >
                      <FiXCircle className='w-6 h-6' />
                    </button>
                  </div>

                  <div className='grid gap-6 lg:grid-cols-2 items-start'>
                    {/* ── Left: what they wanted ── */}
                    <div className='flex flex-col gap-5 min-w-0'>
                      <div className='bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden'>
                        <div className='px-5 py-3 border-b border-slate-100 flex items-center justify-between'>
                          <h4 className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>Cart</h4>
                          <span className='font-black text-slate-900'>৳{Number(current.grandTotal || 0).toLocaleString('en-BD')}</span>
                        </div>
                        {(current.items || []).length === 0 ? (
                          <div className='px-5 py-3 text-sm text-slate-400 italic'>No items</div>
                        ) : (
                          current.items.map((it, i) => (
                            <div key={i} className='flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0'>
                              <div className='min-w-0'>
                                <div className='font-semibold text-sm text-slate-800'>{it.title || 'Item'}</div>
                                {it.variant && it.variant !== 'Standard' && (
                                  <div className='text-[11px] text-slate-500 uppercase tracking-tight mt-0.5'>{it.variant}</div>
                                )}
                              </div>
                              <div className='text-sm whitespace-nowrap'>
                                <span className='text-slate-400'>×</span> <b className='text-blue-600'>{it.quantity || 1}</b>
                              </div>
                            </div>
                          ))
                        )}
                        <div className='px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-500'>
                          ৳{Number(current.totalPrice || 0).toLocaleString('en-BD')} + ৳{Number(current.shippingCharge || 0)} shipping
                          {current.couponCode && <> · coupon <b className='text-purple-700'>{current.couponCode}</b></>}
                        </div>
                      </div>

                      <div className='bg-slate-50 rounded-2xl border border-slate-100 px-5 py-4'>
                        <div className='flex items-center justify-between gap-2 mb-1'>
                          <h4 className='text-[11px] font-black text-slate-400 uppercase tracking-widest'>Delivery</h4>
                          {current.address && (
                            <button
                              onClick={() => copy(`${current.name}\n${phone}\n${current.address}\n৳${current.grandTotal}`, 'all')}
                              className='text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 inline-flex items-center gap-1'
                            >
                              {copied === 'all' ? <FiCheckCircle className='text-emerald-600' /> : <FiCopy />} Copy all
                            </button>
                          )}
                        </div>
                        {current.deliveryZone && (
                          <span className='text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block border border-blue-100 mb-1'>
                            {current.deliveryZone}
                          </span>
                        )}
                        <p className='text-sm text-slate-700 font-medium'>
                          {current.address || <span className='italic text-slate-400'>Not entered</span>}
                        </p>
                      </div>

                      {/* Note */}
                      <div>
                        <SectionTitle color='bg-amber-500'>Note</SectionTitle>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder='What did the customer say? e.g. “Will order after salary on the 5th”'
                          rows={3}
                          maxLength={2000}
                          className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 resize-none font-medium text-slate-700 placeholder:text-slate-300'
                        />
                        <button
                          onClick={() => save({ note: noteText }, 'note', 'Note saved')}
                          disabled={!noteDirty || saving === 'note'}
                          className='mt-2 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-600 disabled:opacity-50'
                        >
                          <FiSave className='w-3.5 h-3.5' />
                          {saving === 'note' ? 'Saving…' : 'Save Note'}
                        </button>
                      </div>
                    </div>

                    {/* ── Right: follow-up management ── */}
                    <div className='flex flex-col gap-5 min-w-0'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                          <SectionTitle color='bg-blue-600'>Follow-up Status</SectionTitle>
                          <div className='flex flex-col gap-2'>
                            {FOLLOW_UP_ORDER.map((st) => {
                              const c = FOLLOW_UP_CONFIG[st];
                              const active = current.followUpStatus === st;
                              return (
                                <button
                                  key={st}
                                  onClick={() => setStatus(st)}
                                  disabled={!!saving}
                                  title={c.long}
                                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all disabled:cursor-wait ${
                                    active ? `${c.btn} border-transparent text-white shadow-lg` : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-700'
                                  }`}
                                >
                                  <span className='flex items-center gap-2'><c.icon className='w-4 h-4' /> {c.label}</span>
                                  {saving === `st-${st}` ? <span className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' /> : active && <FiCheckCircle />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <SectionTitle color='bg-green-600'>Call Result</SectionTitle>
                          <div className='flex flex-col gap-2'>
                            {CALL_RESPONSE_ORDER.map((val) => {
                              const c = CALL_RESPONSE_CONFIG[val];
                              const active = (current.callResponse || 'none') === val;
                              return (
                                <button
                                  key={val}
                                  onClick={() => setResponse(val)}
                                  disabled={!!saving}
                                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all disabled:cursor-wait ${
                                    active ? `${c.btn} border-transparent text-white shadow-lg` : 'bg-white border-slate-100 text-slate-500 hover:border-green-200 hover:text-green-600'
                                  }`}
                                >
                                  <span className='flex items-center gap-2'><c.icon className='w-4 h-4' /> {c.label}</span>
                                  {saving === `cr-${val}` ? <span className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' /> : active && <FiCheckCircle />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Follow-up time (call later / order later) */}
                      {scheduled && (
                        <div className={`rounded-2xl border p-4 ${due ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                          <SectionTitle color={due ? 'bg-red-500' : 'bg-orange-500'}>
                            {current.followUpStatus === 'call_later' ? 'Call back at' : 'Expected order / check-in'}
                          </SectionTitle>
                          {current.followUpAt ? (
                            <p className={`text-sm font-bold mb-3 ${due ? 'text-red-700' : 'text-slate-800'}`}>
                              <FiCalendar className='inline w-4 h-4 mr-1 -mt-0.5' />
                              {formatDhakaDateTime(current.followUpAt)}
                              <span className='ml-2 text-xs font-semibold'>({relativeTo(current.followUpAt)})</span>
                            </p>
                          ) : (
                            <p className='text-sm text-slate-500 mb-3'>No time set</p>
                          )}
                          <div className='flex flex-wrap gap-1.5 mb-3'>
                            {FOLLOW_UP_PRESETS.map((p) => (
                              <button
                                key={p.label}
                                onClick={() => save({ followUpAt: p.at() }, 'date', 'Follow-up time set')}
                                disabled={!!saving}
                                className='px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-700 disabled:opacity-50'
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <div className='flex items-center gap-2'>
                            <input
                              type='datetime-local'
                              value={dateInput}
                              onChange={(e) => setDateInput(e.target.value)}
                              className='flex-1 min-w-0 h-9 text-sm border border-slate-200 bg-white rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20'
                            />
                            <button
                              onClick={() => save({ followUpAt: fromDhakaInput(dateInput) }, 'date', 'Follow-up time set')}
                              disabled={!dateInput || dateInput === toDhakaInput(current.followUpAt) || !!saving}
                              className='h-9 px-3 rounded-lg bg-orange-500 text-white text-xs font-black uppercase hover:bg-orange-600 disabled:opacity-50'
                            >
                              Set
                            </button>
                            {current.followUpAt && (
                              <button
                                onClick={() => save({ followUpAt: null }, 'date', 'Follow-up time cleared')}
                                disabled={!!saving}
                                className='h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600'
                                title='Clear time'
                              >
                                <FiX />
                              </button>
                            )}
                          </div>
                          <p className='text-[10px] text-slate-400 mt-1.5'>Bangladesh time</p>
                        </div>
                      )}

                      {/* Activity */}
                      <div>
                        <SectionTitle color='bg-slate-400'>
                          <span className='flex items-center gap-1.5'><FiActivity className='w-3 h-3' /> Activity</span>
                        </SectionTitle>
                        {activity.length === 0 ? (
                          <p className='text-xs text-slate-400'>No follow-up activity yet.</p>
                        ) : (
                          <ul className='max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50'>
                            {[...activity].reverse().map((a, i) => (
                              <li key={i} className='px-3 py-2 text-xs text-slate-600'>
                                <div className='break-words'>{activityText(a)}</div>
                                <div className='text-[10px] text-slate-400 mt-0.5'>
                                  {formatDhakaDateTime(a.at)}{a.by && ` · ${a.by}`}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-center mt-8'>
                    <button
                      onClick={onClose}
                      className='px-8 py-3 bg-blue-50 rounded-xl text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 border border-blue-100'
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

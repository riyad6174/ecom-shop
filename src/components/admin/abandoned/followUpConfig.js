import {
  FiClock, FiCheckCircle, FiXCircle, FiPhone, FiPhoneMissed, FiAlertTriangle,
  FiInbox, FiShoppingBag,
} from 'react-icons/fi';

// Admin follow-up status of an abandoned checkout (CheckoutSession.followUpStatus)
export const FOLLOW_UP_CONFIG = {
  pending: {
    label: 'New', long: 'Not handled yet', icon: FiInbox, tone: 'blue',
    badge: 'bg-blue-50 text-blue-700 border-blue-200', btn: 'bg-blue-600', row: 'border-blue-300',
  },
  call_later: {
    label: 'Call Later', long: 'Customer asked to call back', icon: FiClock, tone: 'orange',
    badge: 'bg-orange-100 text-orange-700 border-orange-200', btn: 'bg-orange-500', row: 'border-orange-400 bg-orange-50/30',
  },
  order_later: {
    label: 'Order Later', long: 'Customer will order later', icon: FiShoppingBag, tone: 'purple',
    badge: 'bg-violet-100 text-violet-700 border-violet-200', btn: 'bg-violet-600', row: 'border-violet-400 bg-violet-50/30',
  },
  confirmed: {
    label: 'Confirmed', long: 'Customer confirmed the order', icon: FiCheckCircle, tone: 'green',
    badge: 'bg-green-100 text-green-800 border-green-200', btn: 'bg-green-600', row: 'border-green-500 bg-green-50/50',
  },
  cancelled: {
    label: 'Cancelled', long: 'Customer does not want it', icon: FiXCircle, tone: 'red',
    badge: 'bg-red-100 text-red-800 border-red-200', btn: 'bg-red-600', row: 'border-red-400 bg-red-50/40',
  },
};
export const FOLLOW_UP_ORDER = ['pending', 'call_later', 'order_later', 'confirmed', 'cancelled'];
export const SCHEDULED_STATUSES = ['call_later', 'order_later'];

// Outcome of the last call (CheckoutSession.callResponse) — like the orders page
export const CALL_RESPONSE_CONFIG = {
  none: { label: 'Not Called', icon: FiPhone, badge: 'bg-slate-100 text-slate-500', btn: 'bg-slate-600' },
  called: { label: 'Called', icon: FiPhone, badge: 'bg-green-100 text-green-700', btn: 'bg-green-600' },
  did_not_pick: { label: 'Did Not Pick', icon: FiPhoneMissed, badge: 'bg-red-100 text-red-700', btn: 'bg-red-600' },
  number_off: { label: 'Number Off', icon: FiPhoneMissed, badge: 'bg-slate-200 text-slate-700', btn: 'bg-slate-700' },
  fake_order: { label: 'Fake / Spam', icon: FiAlertTriangle, badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600' },
};
export const CALL_RESPONSE_ORDER = ['none', 'called', 'did_not_pick', 'number_off', 'fake_order'];

// ─── Bangladesh time helpers (admins work in Asia/Dhaka) ────────────────────
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Date → "YYYY-MM-DDTHH:mm" in Dhaka time, for <input type="datetime-local"> */
export function toDhakaInput(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" (Dhaka time) → ISO string */
export function fromDhakaInput(value) {
  if (!value) return null;
  const d = new Date(`${value}:00+06:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function dhakaDayAt(daysAhead, hour) {
  const day = new Date(Date.now() + DHAKA_OFFSET_MS + daysAhead * 86400000).toISOString().slice(0, 10);
  return new Date(`${day}T${String(hour).padStart(2, '0')}:00:00+06:00`).toISOString();
}

export const FOLLOW_UP_PRESETS = [
  { label: '+1 hour', at: () => new Date(Date.now() + 3600000).toISOString() },
  { label: '+3 hours', at: () => new Date(Date.now() + 3 * 3600000).toISOString() },
  { label: 'Tonight 8 PM', at: () => dhakaDayAt(0, 20) },
  { label: 'Tomorrow 10 AM', at: () => dhakaDayAt(1, 10) },
  { label: 'In 3 days', at: () => dhakaDayAt(3, 10) },
  { label: 'Next week', at: () => dhakaDayAt(7, 10) },
];

export function formatDhakaDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/** "in 2h" / "3h overdue" relative to now */
export function relativeTo(date) {
  if (!date) return '';
  const diff = new Date(date).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const text = mins < 60 ? `${mins} min` : mins < 1440 ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 1440)}d`;
  return diff >= 0 ? `in ${text}` : `${text} overdue`;
}

export function isDue(s) {
  return SCHEDULED_STATUSES.includes(s.followUpStatus) && s.followUpAt && new Date(s.followUpAt).getTime() <= Date.now();
}

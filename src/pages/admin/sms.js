import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  FiSearch, FiRefreshCw, FiFilter, FiTrash2, FiCheckCircle,
  FiXCircle, FiAlertTriangle, FiSkipForward, FiMessageSquare,
  FiCalendar, FiArrowLeft, FiArrowRight, FiCreditCard, FiDownload,
} from 'react-icons/fi';

const STATUS_CONFIG = {
  sent: { label: 'Sent', badge: 'bg-green-100 text-green-800 border-green-200', icon: FiCheckCircle },
  failed: { label: 'Failed', badge: 'bg-red-100 text-red-800 border-red-200', icon: FiXCircle },
  suspicious_skipped: { label: 'Suspicious Skip', badge: 'bg-orange-100 text-orange-800 border-orange-200', icon: FiAlertTriangle },
  dedup_skipped: { label: 'Dedup Skip', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: FiSkipForward },
};

function formatPhone(phone) {
  if (!phone) return '';
  if (phone.startsWith('+88')) return phone.slice(3);
  if (phone.startsWith('88') && phone.length > 11) return phone.slice(2);
  return phone;
}

function formatTimestamp(createdAt) {
  if (!createdAt) return { date: '—', time: '—' };
  const d = new Date(createdAt);
  return {
    date: d.toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' }),
    time: d.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }),
  };
}

export default function AdminSms() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [stats, setStats] = useState({ totalSent: 0, totalFailed: 0, totalSuspicious: 0, totalDeduped: 0 });
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const debounceRef = useRef(null);
  const productDebounceRef = useRef(null);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await fetch('/api/admin/sms/balance');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch {
      // keep previous balance
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 30,
        search,
        status: statusFilter,
        product: productFilter,
        from: fromDate,
        to: toDate,
      });
      const res = await fetch(`/api/admin/sms?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (data.stats) setStats(data.stats);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, productFilter, fromDate, toDate]);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (r) => {
        if (!r.ok) {
          router.replace('/admin/login');
        } else {
          const data = await r.json();
          setAdmin(data);
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      fetchLogs();
      fetchBalance();
    }
  }, [authChecked, fetchLogs, fetchBalance]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, productFilter, fromDate, toDate]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const handleProductChange = (e) => {
    const val = e.target.value;
    clearTimeout(productDebounceRef.current);
    productDebounceRef.current = setTimeout(() => setProductFilter(val), 400);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setProductFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const buildParams = (overrides = {}) => {
    const params = new URLSearchParams({
      page: 1,
      limit: 100,
      search,
      status: statusFilter,
      product: productFilter,
      from: fromDate,
      to: toDate,
      ...overrides,
    });
    return params;
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      // Fetch ALL rows matching the current filters (paginate through every page).
      const rows = [];
      let currentPage = 1;
      let totalPages = 1;
      do {
        const res = await fetch(`/api/admin/sms?${buildParams({ page: currentPage })}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        rows.push(...data.logs);
        totalPages = data.totalPages;
        currentPage += 1;
      } while (currentPage <= totalPages);

      if (rows.length === 0) {
        window.alert('No SMS logs match the current filters.');
        return;
      }

      const esc = (val) => {
        const s = String(val ?? '');
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const header = [
        'Status', 'Customer Name', 'Phone', 'Order ID', 'Products',
        'Order Value (Tk)', 'API Code', 'Reason', 'Sent Date', 'Timestamp',
      ];
      const lines = [
        header.join(','),
        ...rows.map((log) => [
          esc(log.status),
          esc(log.name),
          esc(formatPhone(log.phone)),
          esc(log.orderId),
          esc(log.productNames),
          esc(log.orderValue),
          esc(log.apiCode),
          esc(log.reason),
          esc(log.sentDate),
          esc(log.createdAt ? new Date(log.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) : ''),
        ].join(',')),
      ];

      const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sms-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert('Failed to export SMS log.');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  if (!authChecked) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className="flex flex-col items-center gap-3">
          <div className='animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full' />
          <p className='text-slate-500 font-medium'>Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>SMS Management | Sheii Shop Admin</title>
        <meta name='robots' content='noindex,nofollow' />
      </Head>

      <div className='min-h-screen bg-slate-50 flex flex-col'>
        <header className='bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm'>
          <div className='flex items-center gap-6'>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">S</div>
              <span className='font-bold text-slate-900 tracking-tight hidden sm:block'>Dashboard</span>
            </div>
            <nav className='flex items-center gap-1 bg-slate-100 p-1 rounded-lg flex-wrap'>
              <Link href='/admin/orders' className='text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium'>
                Orders
              </Link>
              <Link href='/admin/products' className='text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium'>
                Manage Product
              </Link>
              <Link href='/admin/sms' className='text-sm px-4 py-1.5 rounded-md bg-white shadow-sm font-semibold text-blue-700'>
                SMS
              </Link>
              <Link href='/admin/admins' className='text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium'>
                Admins
              </Link>
            </nav>
          </div>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => { fetchBalance(); fetchLogs(); }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-95"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              Reload
            </button>
            <div className="flex flex-col items-end leading-none">
              <span className='text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1'>Administrator</span>
              <span className='text-[10px] text-slate-500 font-mono'>{admin?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className='hidden md:flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-all border border-red-100'
            >
              Logout
            </button>
          </div>
        </header>

        <main className='p-4 sm:p-6 max-w-[1800px] mx-auto w-full flex-grow'>
          <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
            <div>
              <h1 className='text-3xl font-black text-slate-900 flex items-center gap-3'>
                SMS Management
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium tracking-tight">Order confirmation messages & delivery log.</p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-blue-200 shadow-lg hover:bg-blue-700 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              <FiDownload className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-green-200 transition-colors">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">SMS Balance</p>
                <p className="text-3xl font-black text-green-600 leading-none mb-1 flex items-center gap-2">
                  {balance === null ? '—' : `৳${balance}`}
                </p>
                <button
                  onClick={fetchBalance}
                  className="mt-2 flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                >
                  <FiRefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="bg-green-50 text-green-600 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <FiCreditCard className="w-6 h-6" />
              </div>
            </div>
            {[
              { label: 'Sent', value: stats.totalSent, color: 'text-green-600', bg: 'bg-green-50', border: 'hover:border-green-200', icon: FiCheckCircle },
              { label: 'Failed', value: stats.totalFailed, color: 'text-red-600', bg: 'bg-red-50', border: 'hover:border-red-200', icon: FiXCircle },
              { label: 'Suspicious Skipped', value: stats.totalSuspicious, color: 'text-orange-600', bg: 'bg-orange-50', border: 'hover:border-orange-200', icon: FiAlertTriangle },
              { label: 'Dedup Skipped', value: stats.totalDeduped, color: 'text-slate-600', bg: 'bg-slate-50', border: 'hover:border-slate-200', icon: FiSkipForward },
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group ${stat.border} transition-colors`}>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color} leading-none`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6'>
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <FiFilter className="w-4 h-4 text-blue-600" />
              Filters
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
              <div className='relative xl:col-span-2'>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block'>Quick Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type='text'
                    defaultValue={search}
                    onChange={handleSearchChange}
                    placeholder='Customer name, phone, or order number...'
                    className='w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                  />
                </div>
              </div>
              <div className='relative xl:col-span-2'>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block'>Filter by Product</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type='text'
                    defaultValue={productFilter}
                    onChange={handleProductChange}
                    placeholder='Search a product name in orders...'
                    className='w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                  />
                </div>
              </div>
              <div>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block'>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium text-slate-700'
                >
                  <option value=''>All Statuses</option>
                  <option value='sent'>Sent</option>
                  <option value='failed'>Failed</option>
                  <option value='suspicious_skipped'>Suspicious Skip</option>
                  <option value='dedup_skipped'>Dedup Skip</option>
                </select>
              </div>
              <div>
                <label className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block'>Date Selection</label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                    <input
                      type='date'
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className='w-full text-[10px] border border-slate-200 bg-slate-50/50 rounded-lg pl-7 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase'
                    />
                  </div>
                  <div className="text-slate-300">—</div>
                  <div className="relative flex-1">
                    <FiCalendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                    <input
                      type='date'
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className='w-full text-[10px] border border-slate-200 bg-slate-50/50 rounded-lg pl-7 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase'
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <FiTrash2 className="w-3 h-3" />
                Reset All Filters
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]'>
            <div className='overflow-x-auto flex-grow'>
              <table className='w-full text-sm text-left border-collapse'>
                <thead>
                  <tr className='bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest'>
                    <th className='px-6 py-4'>Status</th>
                    <th className='px-6 py-4'>Status Code</th>
                    <th className='px-6 py-4'>Status Message</th>
                    <th className='px-6 py-4'>Customer</th>
                    <th className='px-6 py-4'>Order Number</th>
                    <th className='px-6 py-4'>Product(s)</th>
                    <th className='px-6 py-4 text-right'>Order Value</th>
                    <th className='px-6 py-4'>Timestamp</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className='animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg' />
                          <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-[0.2em]">Loading SMS log...</p>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-32 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-2">
                            <FiMessageSquare className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className='text-slate-500 font-bold text-lg'>No SMS logs found</p>
                          <p className='text-slate-400 text-sm max-w-xs'>Place a new order to trigger a confirmation SMS, or adjust your filters.</p>
                          <button onClick={handleResetFilters} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-blue-200 shadow-lg transition-transform hover:scale-105">View All Logs</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const config = STATUS_CONFIG[log.status] || STATUS_CONFIG.failed;
                      const Icon = config.icon;
                      const t = formatTimestamp(log.createdAt);
                      return (
                        <tr key={log._id} className='group transition-all hover:bg-slate-50/50'>
                          <td className='px-6 py-4'>
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.badge} border-white shadow-sm`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{config.label}</span>
                            </div>
                            {log.reason && (
                              <div className="mt-1 text-[10px] text-slate-400 font-medium">
                                {log.reason}
                              </div>
                            )}
                          </td>
                          <td className='px-6 py-4'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black font-mono'>
                              {log.apiCode ?? '—'}
                            </span>
                          </td>
                          <td className='px-6 py-4 max-w-[220px]'>
                            <span className='text-xs text-slate-600 font-medium block truncate' title={log.apiMessage}>
                              {log.apiMessage || '—'}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <div className="flex flex-col">
                              <span className='font-bold text-slate-800 text-sm mb-0.5'>{log.name || '—'}</span>
                              <span className='text-xs text-slate-500 font-medium'>{formatPhone(log.phone)}</span>
                            </div>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-xs font-mono font-semibold text-slate-700'>{log.orderId || '—'}</span>
                          </td>
                          <td className='px-6 py-4 max-w-[200px]'>
                            <span className='text-xs text-slate-600 font-medium block truncate' title={log.productNames}>
                              {log.productNames || '—'}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <span className='font-black text-slate-900 text-sm'>
                              ৳{Number(log.orderValue || 0).toLocaleString('en-BD')}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 whitespace-nowrap mb-0.5">{t.date}</span>
                              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{t.time}</span>
                            </div>
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
              <div className='px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                    Page <span className="text-blue-600">{page}</span> of {totalPages}
                  </div>
                  <div className="hidden lg:block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Displaying log range {(page - 1) * 30 + 1} - {Math.min(page * 30, total)}
                  </div>
                </div>
                <div className='flex items-center gap-1.5'>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm'
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1 mx-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`h-10 w-10 text-xs font-bold rounded-xl transition-all ${
                            page === pNum
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 translate-y-[-2px]'
                              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm'
                  >
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

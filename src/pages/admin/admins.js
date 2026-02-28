import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  FiUsers, FiUserPlus, FiTrash2, FiLogOut, FiShoppingBag, 
  FiCheckCircle, FiAlertCircle, FiShield, FiMail, FiLock,
  FiClock, FiChevronRight
} from 'react-icons/fi';
import { Transition } from '@headlessui/react';

export default function AdminsManagement() {
  const router = useRouter();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // Add admin form state
  const [form, setForm] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingEmail, setDeletingEmail] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Auth guard ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/me')
      .then(async (r) => {
        if (!r.ok) {
          router.replace('/admin/login');
        } else {
          const data = await r.json();
          setCurrentAdmin(data);
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  // ── Fetch admin list ──────────────────────────────────────────────────
  const fetchAdmins = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (authChecked) fetchAdmins();
  }, [authChecked]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  // ── Add admin ─────────────────────────────────────────────────────────
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // Fallback for non-JSON responses
      }

      if (res.ok) {
        showToast(`Admin "${form.email}" created successfully`);
        setForm({ email: '', password: '' });
        fetchAdmins();
      } else {
        showToast(data.message || `Server error (${res.status})`, 'error');
      }
    } catch (err) {
      console.error('Add Admin Error:', err);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete admin ──────────────────────────────────────────────────────
  const handleDelete = async (email) => {
    if (!confirm(`Remove access for "${email}"?`)) return;
    setDeletingEmail(email);

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.email !== email));
        showToast('Admin access revoked');
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to remove admin', 'error');
      }
    } finally {
      setDeletingEmail(null);
    }
  };

  if (!authChecked) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 font-sans'>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className='text-slate-500 text-sm font-bold tracking-tight'>Authenticating Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Head>
        <title>Identity & Access | Sheii Shop Admin</title>
        <meta name='robots' content='noindex,nofollow' />
      </Head>

      {/* ── Navigation ── */}
      <header className='bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm'>
        <div className='flex items-center gap-8'>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
              <FiShield className="text-white w-4 h-4" />
            </div>
            <span className='font-black text-xl tracking-tighter text-slate-900'>SHEII <span className="text-blue-600">ADMIN</span></span>
          </div>
          <nav className='hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl'>
            <Link
              href='/admin/orders'
              className='flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 transition-all'
            >
              <FiShoppingBag className="w-3.5 h-3.5" />
              Orders
            </Link>
            <Link
              href='/admin/admins'
              className='flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-white text-blue-600 shadow-sm'
            >
              <FiUsers className="w-3.5 h-3.5" />
              Team
            </Link>
          </nav>
        </div>
        
        <div className='flex items-center gap-4'>
           <div className="hidden sm:flex flex-col items-end">
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1'>Active Identity</span>
              <span className='text-xs font-bold text-slate-700 leading-none'>{currentAdmin?.email}</span>
           </div>
           <button
             onClick={handleLogout}
             className='p-2.5 bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100 active:scale-95'
             title="Logout"
           >
             <FiLogOut className="w-5 h-5" />
           </button>
        </div>
      </header>

      <main className='p-6 max-w-5xl mx-auto'>
        <div className="mb-10">
          <h1 className='text-3xl font-black text-slate-900 flex items-center gap-3'>
            Team Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium tracking-tight">Manage administrative access and roles for your store.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Add Admin Form ── */}
          <div className="lg:col-span-4">
            <div className='bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sticky top-28'>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <FiUserPlus className="w-5 h-5" />
                </div>
                <h2 className='text-lg font-black text-slate-900'>Add Member</h2>
              </div>

              <form onSubmit={handleAddAdmin} className='space-y-6'>
                <div>
                  <label className='block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1'>
                    Email Address
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type='email'
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder='admin@sheii.com'
                      className='w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 px-1'>
                    Secure Password
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type='password'
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder='••••••••'
                      className='w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300'
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={submitting}
                  className='w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  {submitting ? 'Processing...' : 'Provision Access'}
                  {!submitting && <FiChevronRight className="w-4 h-4" />}
                </button>
              </form>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <p className="text-[10px] text-yellow-800 font-bold leading-relaxed flex gap-2">
                  <FiAlertCircle className="shrink-0 w-3.5 h-3.5" />
                  New admins will have full access to orders, statistics, and team management. Use caution.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Admin List ── */}
          <div className="lg:col-span-8">
            <div className='bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden'>
              <div className='px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50'>
                <h2 className='text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2'>
                  Access Directory
                  <span className='bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-400 text-[10px]'>
                    {admins.length} Total
                  </span>
                </h2>
              </div>

              {loadingList ? (
                <div className='flex flex-col items-center justify-center py-20 gap-4'>
                  <div className='animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full' />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Records...</p>
                </div>
              ) : admins.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-slate-300 gap-4'>
                  <FiUsers className="w-12 h-12 opacity-20" />
                  <p className='text-sm font-bold'>No administrative accounts found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {admins.map((admin) => {
                    const isCurrentUser = admin.email === currentAdmin?.email;
                    return (
                      <div
                        key={admin.email}
                        className='group flex items-center justify-between px-8 py-6 hover:bg-slate-50/80 transition-all'
                      >
                        <div className='flex items-center gap-5'>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all group-hover:scale-110 ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <span className='font-black text-lg uppercase'>
                              {admin.email.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className='text-base font-black text-slate-900 tracking-tight'>
                                {admin.email}
                              </p>
                              {isCurrentUser && (
                                <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-blue-200'>
                                  Session Owner
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                               <div className="flex items-center gap-1">
                                 <FiClock className="w-3 h-3" />
                                 Created {new Date(admin.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                               </div>
                               <span className="w-1 h-1 bg-slate-300 rounded-full" />
                               <span className="text-slate-500">Root Access</span>
                            </div>
                          </div>
                        </div>

                        {!isCurrentUser && (
                          <button
                            onClick={() => handleDelete(admin.email)}
                            disabled={deletingEmail === admin.email}
                            className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-slate-100 hover:border-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed group/btn'
                          >
                            <FiTrash2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                            {deletingEmail === admin.email ? 'Revoking...' : 'Revoke Access'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Toast Notification ── */}
      <Transition
        show={!!toast}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 text-white px-6 py-4 rounded-2xl shadow-2xl border ${toast?.type === 'error' ? 'bg-red-600 border-red-500' : 'bg-slate-900 border-slate-800'}`}>
          {toast?.type === 'error' ? <FiAlertCircle className="w-5 h-5" /> : <FiCheckCircle className="text-green-400 w-5 h-5" />}
          <span className="text-sm font-bold tracking-tight">{toast?.message}</span>
        </div>
      </Transition>
    </div>
  );
}

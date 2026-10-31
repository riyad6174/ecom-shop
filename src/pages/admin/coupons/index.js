import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
  FiSearch, FiRefreshCw, FiTrash2, FiEdit3, FiPlus, FiTag, FiShield,
  FiClock, FiXCircle, FiSave, FiCheckCircle
} from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const DISCOUNT_TYPE_CONFIG = {
  percentage: { label: 'Percent Discount', hint: 'off on product price' },
  fixed: { label: 'Fixed Discount', hint: 'Taka off on product price' },
  free_shipping: { label: 'Free Delivery', hint: 'shipping charge waived' },
};

export default function AdminCoupons() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    usageLimit: '',
    isActive: true,
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({
      code: '', discountType: 'percentage', discountValue: '', minPurchase: '',
      usageLimit: '', isActive: true, expiresAt: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue != null ? String(coupon.discountValue) : '',
      minPurchase: coupon.minPurchase != null ? String(coupon.minPurchase) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      isActive: coupon.isActive !== false,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue: form.discountType === 'free_shipping' ? 0 : Number(form.discountValue) || 0,
        minPurchase: form.minPurchase ? Number(form.minPurchase) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
      };
      const method = editingCoupon ? 'PATCH' : 'POST';
      const url = editingCoupon
        ? `/api/admin/coupons/${encodeURIComponent(editingCoupon.code)}`
        : '/api/admin/coupons';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save coupon');
      showToast(editingCoupon ? 'Coupon updated' : 'Coupon created');
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast(err.message || 'Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Coupon deleted');
      fetchCoupons();
    } catch {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(coupon.code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch {
      showToast('Failed to update coupon', 'error');
    }
  };

  const formatDiscount = (c) => {
    const cfg = DISCOUNT_TYPE_CONFIG[c.discountType] || DISCOUNT_TYPE_CONFIG.percentage;
    if (c.discountType === 'free_shipping') return 'Free Delivery';
    if (c.discountType === 'fixed') return `৳${c.discountValue} off`;
    return `${c.discountValue}% off`;
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Coupon Management | Sheii Shop Admin</title>
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
              <Link href='/admin/coupons' className='text-sm px-4 py-1.5 rounded-md bg-white shadow-sm font-semibold text-blue-700'>
                Coupons
              </Link>
              <Link href='/admin/sms' className='text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium'>
                SMS
              </Link>
              <Link href='/admin/admins' className='text-sm px-4 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors font-medium'>
                Admins
              </Link>
            </nav>
          </div>
          <div className='flex items-center gap-4'>
            <button
              onClick={fetchCoupons}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Reload
            </button>
          </div>
        </header>

        <main className='p-4 sm:p-6 max-w-[1400px] mx-auto w-full flex-grow'>
          <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
            <div>
              <h1 className='text-3xl font-black text-slate-900 flex items-center gap-3'>
                <FiTag className='w-6 h-6 text-blue-600' />
                Coupon Management
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium tracking-tight">
                Create promo codes for campaigns (discount or free delivery).
              </p>
            </div>
            <button
              onClick={openCreate}
              className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-blue-200 hover:shadow-blue-400 active:scale-95'
            >
              <FiPlus className='w-4 h-4' />
              Add Coupon
            </button>
          </div>

          {/* Search + Filter Bar */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6'>
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <FiSearch className="w-4 h-4 text-blue-600" />
              Search Coupons
            </div>
            <div className='flex items-center gap-4'>
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type='text'
                  value={search}
                  onChange={handleSearchChange}
                  placeholder='Search coupon code...'
                  className='w-full text-sm border border-slate-200 bg-slate-50/50 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                />
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-left border-collapse'>
                <thead>
                  <tr className='bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest'>
                    <th className='px-6 py-4'>Code</th>
                    <th className='px-6 py-4'>Discount</th>
                    <th className='px-6 py-4'>Min Purchase</th>
                    <th className='px-6 py-4'>Usage</th>
                    <th className='px-6 py-4'>Status</th>
                    <th className='px-6 py-4'>Expires</th>
                    <th className='px-6 py-4 text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-2">
                            <FiTag className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className='text-slate-500 font-bold text-lg'>No coupons found</p>
                          <p className='text-slate-400 text-sm max-w-xs'>
                            {search ? 'Try adjusting your search terms.' : 'Create your first promo coupon.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((c) => {
                      const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                      const limitReached = c.usageLimit != null && c.usedCount >= c.usageLimit;
                      const disabled = !c.isActive || expired || limitReached;
                      return (
                        <tr key={c._id} className='group transition-all hover:z-10 relative border-l-2 border-transparent hover:border-blue-300'>
                          <td className='px-6 py-4'>
                            <span className='font-bold text-slate-800'>{c.code}</span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-blue-600 font-semibold'>{formatDiscount(c)}</span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-slate-500 text-sm'>
                              {c.minPurchase > 0 ? `৳${c.minPurchase}` : '—'}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <span className='text-sm font-medium'>
                              {c.usedCount} / {c.usageLimit === null ? '∞' : c.usageLimit}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <button
                              onClick={() => toggleActive(c)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                                c.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {c.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className='px-6 py-4'>
                            <span className={`text-sm ${
                              disabled ? 'text-slate-400' : 'text-slate-600'
                            } font-medium`}>
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-BD') : '—'}
                              {disabled && !c.isActive && <span className='ml-1 text-xs text-red-500'>(off)</span>}
                            </span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(c)}
                                className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-all"
                                title="Edit Coupon"
                              >
                                <FiEdit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.code)}
                                className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-red-600 shadow-sm hover:bg-red-50 hover:text-red-700 transition-all"
                                title="Delete Coupon"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Add/Edit Coupon Modal */}
        <Transition show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 max-h-[90vh] overflow-y-auto">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title as="h3" className="text-xl font-black text-slate-900">
                          {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
                        </Dialog.Title>
                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <FiXCircle className="w-6 h-6" />
                        </button>
                      </div>

                      <form onSubmit={handleSave} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Coupon Code</label>
                          <input
                            type='text'
                            name='code'
                            value={form.code}
                            disabled={!!editingCoupon}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            placeholder='e.g. NAME20'
                            className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase disabled:opacity-60 disabled:cursor-not-allowed'
                          />
                          <p className='text-[10px] text-slate-400 mt-1'>Stored in uppercase. Visitors use ?coupon=CODE</p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Discount Type</label>
                          <select
                            value={form.discountType}
                            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                            className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                          >
                            {Object.entries(DISCOUNT_TYPE_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>
                                {cfg.label} — {cfg.hint}
                              </option>
                            ))}
                          </select>
                        </div>

                        {form.discountType !== 'free_shipping' && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Discount Value</label>
                            <div className='flex items-center gap-2'>
                              <input
                                type='number'
                                name='discountValue'
                                value={form.discountValue}
                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                placeholder='0'
                                className='flex-1 text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                              />
                              <span className='text-slate-500 text-xs font-medium'>
                                {form.discountType === 'percentage' ? '%' : '৳'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Min Purchase (৳)</label>
                          <input
                            type='number'
                            name='minPurchase'
                            value={form.minPurchase}
                            onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                            placeholder='0'
                            className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Usage Limit</label>
                          <input
                            type='number'
                            name='usageLimit'
                            value={form.usageLimit}
                            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                            placeholder='unlimited'
                            className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                          />
                          <p className='text-[10px] text-slate-400 mt-1'>Leave empty for unlimited uses</p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Expires At</label>
                          <input
                            type='datetime-local'
                            name='expiresAt'
                            value={form.expiresAt}
                            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                            className='w-full text-sm border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                          />
                          <p className='text-[10px] text-slate-400 mt-1'>Leave empty for no expiry</p>
                        </div>

                        <div className='flex items-center gap-3 pt-2'>
                          <input
                            id='isActive'
                            type='checkbox'
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className='w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500'
                          />
                          <label htmlFor='isActive' className='text-sm font-medium text-slate-700 cursor-pointer'>
                            Active coupon
                          </label>
                        </div>

                        <div className='mt-6 flex justify-end gap-3'>
                          <button
                            type='button'
                            onClick={() => setIsModalOpen(false)}
                            className='px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all'
                          >
                            Cancel
                          </button>
                          <button
                            type='submit'
                            disabled={saving}
                            className='px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-blue-200'
                          >
                            {saving ? 'Saving...' : 'Save Coupon'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Toast */}
        <Transition show={!!toast} as={Fragment} enter="transform ease-out duration-300 transition" enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" enterTo="translate-y-0 opacity-100 sm:translate-x-0" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className={`fixed bottom-5 right-5 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast?.type === 'error' ? 'bg-red-600 border-red-700' : 'bg-slate-900 border-slate-800'} text-white`}>
            {toast?.type === 'error' ? <FiXCircle className="text-white w-5 h-5" /> : <FiCheckCircle className="text-green-400 w-5 h-5" />}
            <span className="text-sm font-bold tracking-tight">{toast?.message}</span>
          </div>
        </Transition>
      </div>
    </>
  );
}

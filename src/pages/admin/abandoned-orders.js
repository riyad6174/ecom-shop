import Head from 'next/head';
import AdminProductLayout from '@/components/admin/AdminProductLayout';
import AbandonedOrdersTable from '@/components/admin/AbandonedOrdersTable';

export default function AbandonedOrdersPage() {
  return (
    <>
      <Head>
        <title>Abandoned Orders | Sheii Shop Admin</title>
        <meta name='robots' content='noindex,nofollow' />
      </Head>
      <AdminProductLayout title='Abandoned Orders'>
        {/* Visiting this page resets the "new abandoned orders" counter */}
        <AbandonedOrdersTable markSeen />
      </AdminProductLayout>
    </>
  );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/orders');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

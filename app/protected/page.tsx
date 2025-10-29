'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/protected/airlines');
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      Redirecting ...
    </div>
  );
}

export default Page;
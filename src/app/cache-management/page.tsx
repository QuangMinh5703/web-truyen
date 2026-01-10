'use client';

import CacheManager from '@/components/CacheManager';

export default function CacheManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý Cache</h1>
      <CacheManager />
    </div>
  );
}

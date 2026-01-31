'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Story, getImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedStories, setCachedStories] = useState<Story[]>([]);

  const loadCachedStories = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Send message to service worker to get cached stories
          registration.active?.postMessage({
            type: 'GET_CACHED_STORIES'
          });
        }
      }
    } catch (error) {
      console.error('Error loading cached stories:', error);
    }
  };

  useEffect(() => {
    // Check online status
    const checkOnline = () => setIsOnline(navigator.onLine);
    checkOnline();

    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);

    // Load cached stories from service worker
    loadCachedStories();

    // Message listener for service worker communication
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CACHED_STORIES') {
        setCachedStories(event.data.stories || []);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const downloadForOffline = async () => {
    try {
      if ('serviceWorker' in navigator) {
        alert('Da them vao danh sach tai xuong. Cac truyen se duoc tai khi co ket noi internet.');
      } else {
        alert('Tinh nang tai xuong khong duoc ho tro tren trinh duyet nay.');
      }
    } catch (error) {
      console.error('Failed to register sync:', error);
      alert('Co loi xay ra khi tai xuong. Vui long thu lai.');
    }
  };

  if (isOnline) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mb-8">
              <Image
                src="/logo.svg"
                alt="Comic Reader"
                width={120}
                height={120}
                className="mx-auto mb-4"
              />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Comic Reader
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Ban dang online! Truy cap trang chu de kham pha truyen moi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Ve trang chu
              </Link>
              <Link
                href="/dang-phat-hanh"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Truyen dang phat hanh
              </Link>
            </div>
          </div>
        </main>
        <FooterComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Offline Header */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="text-6xl mb-4">?</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ban dang offline
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Khong co ket noi internet. Nhung ban van co the doc truyen da luu!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={downloadForOffline}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              ? Tai truyen de doc offline
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ? Thu lai
            </button>
          </div>
        </div>

        {/* Cached Stories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Truyen da luu ({cachedStories.length})
          </h2>

          {cachedStories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">?</div>
              <p className="text-gray-500 mb-4">
                Ban chua co truyen nao duoc luu de doc offline.
              </p>
              <p className="text-sm text-gray-400">
                Hay doc mot so truyen khi online de chung duoc tu dong luu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cachedStories.map((story, index) => (
                <Link key={index} href={`/truyen/${story.slug}`} className="group">
                  <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={getImageUrl(story.thumb_url || '')}
                      alt={story.name || 'Truyen tranh'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ✓ Da luu
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {story.name || 'Truyen tranh'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {story.status || 'Dang cap nhat'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Offline Features */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tinh nang offline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Doc truyen da luu
                </h4>
                <p className="text-xs text-gray-500">
                  Tat ca truyen ban da doc se duoc tu dong luu
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Tai xuong chon loc
                </h4>
                <p className="text-xs text-gray-500">
                  Tai truyen yeu thich de doc bat cu luc nao
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Tiep tuc doc
                </h4>
                <p className="text-xs text-gray-500">
                  Luu vi tri doc va tiep tuc khi quay lai online
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Dong bo du lieu
                </h4>
                <p className="text-xs text-gray-500">
                  Tu dong dong bo khi co ket noi internet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Dang kiem tra ket noi...
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export default function CacheManager() {
  const [cacheSize, setCacheSize] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingAnalytics, setIsClearingAnalytics] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const getCacheSize = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.cacheSize !== undefined) {
          setCacheSize(event.data.cacheSize);
        }
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    }
  }, []);

  const clearCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setIsClearing(true);
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      setTimeout(() => {
        getCacheSize();
        setIsClearing(false);
      }, 1000);
    }
  };

  const exportAnalyticsData = () => {
    setIsExporting(true);
    try {
      const data = analytics.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `m-truyen-analytics-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      alert('Không thể xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const clearAnalyticsData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu analytics không? Hành động này không thể hoàn tác.')) {
        setIsClearingAnalytics(true);
        try {
            analytics.clearAllData();
            alert('Đã xóa thành công dữ liệu analytics.');
        } catch (error) {
            console.error('Failed to clear analytics data:', error);
            alert('Không thể xóa dữ liệu. Vui lòng thử lại.');
        } finally {
            setIsClearingAnalytics(false);
        }
    }
  };

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }
    
    navigator.serviceWorker.ready.then(() => {
      getCacheSize();
    });

    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
            getCacheSize();
        }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
    };

  }, [getCacheSize]);

  if (!isSupported) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Không được hỗ trợ!</strong>
            <span className="block sm:inline"> Trình duyệt của bạn không hỗ trợ Service Worker.</span>
        </div>
    );
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thống kê Cache</h2>
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600 dark:text-gray-300">Dung lượng cache hiện tại:</span>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {cacheSize === null ? 'Đang tính...' : formatBytes(cacheSize)}
          </span>
        </div>
        <div className="flex justify-end">
          <button
            onClick={clearCache}
            disabled={isClearing || cacheSize === 0}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isClearing ? 'Đang xóa...' : 'Xóa Cache'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-right">
          Xóa cache sẽ loại bỏ tất cả các chương đã tải xuống và dữ liệu offline.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quản lý Dữ liệu</h2>
        <div className="flex flex-col space-y-6">
            {/* Export Section */}
            <div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                        Xuất dữ liệu phân tích đọc của bạn (reading analytics) ra file JSON.
                    </span>
                    <button
                        onClick={exportAnalyticsData}
                        disabled={isExporting}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isExporting ? 'Đang xuất...' : 'Xuất Dữ liệu'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                Dữ liệu này được lưu trữ trên trình duyệt của bạn và có thể bị mất.
                </p>
            </div>

            {/* Clear Analytics Data Section */}
            <div>
                <div className="flex items-center justify-between">
                     <span className="text-gray-600 dark:text-gray-300">
                        Xóa tất cả dữ liệu phân tích đã được thu thập trên trình duyệt này.
                    </span>
                    <button
                        onClick={clearAnalyticsData}
                        disabled={isClearingAnalytics}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isClearingAnalytics ? 'Đang xóa...' : 'Xóa Dữ liệu Analytics'}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    Hành động này không thể hoàn tác và sẽ reset lại toàn bộ lịch sử đọc của bạn.
                </p>
            </div>
        </div>
      </div>
    </>
  );
}

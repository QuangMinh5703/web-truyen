'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorDisplayProps {
    message?: string;
    onRetry?: () => void;
    showHome?: boolean;
    className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    message = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.',
    onRetry,
    showHome = true,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 px-4 text-center ${className}`}>
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="title-main mb-4 text-gradient">Oops!</h2>

            <p className="text-gray-400 max-w-md mb-8 font-lexend-exa text-sm leading-relaxed">
                {message}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-black rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-lime-400/20"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>THỬ LẠI</span>
                    </button>
                )}

                {showHome && (
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-xl font-bold transition-all hover:bg-white/10 hover:scale-105 active:scale-95 border border-white/10"
                    >
                        <Home className="w-4 h-4" />
                        <span>TRANG CHỦ</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ErrorDisplay;

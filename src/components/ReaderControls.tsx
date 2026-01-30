import React, { useState } from 'react';
import Link from 'next/link';
import { PageWidth, useReaderSettings } from '@/lib/hooks/useReaderSettings';
import BookmarkButton from './BookmarkButton';
import { Settings, X, ChevronLeft, ChevronRight, List, Palette, Monitor, BookOpen, Maximize2, Minimize2 } from 'lucide-react';

interface DesktopControlsProps {
    onPrevChapter: () => void;
    isFirstChapter: boolean;
    isNavigating: boolean;
    onChapterNavOpen: () => void;
    readerMode: 'single' | 'continuous';
    setReaderMode: (mode: 'single' | 'continuous') => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    pageWidth: PageWidth;
    setPageWidth: (width: PageWidth) => void;
    chapterId: string;
    storySlug: string;
    onNextChapter: () => void;
    isLastChapter: boolean;
    toggleFullscreen: () => void;
    isFullscreen: boolean;
}

const DesktopControls = ({
    onPrevChapter,
    isFirstChapter,
    isNavigating,
    onChapterNavOpen,
    readerMode,
    setReaderMode,
    backgroundColor,
    setBackgroundColor,
    pageWidth,
    setPageWidth,
    chapterId,
    storySlug,
    onNextChapter,
    isLastChapter,
    toggleFullscreen,
    isFullscreen
}: DesktopControlsProps) => (
    <div className="hidden lg:flex items-center justify-between mb-10 p-4 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
            <Link
                href={`/truyen/${storySlug}`}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 group"
                title="Quay lại chi tiết truyện"
            >
                <BookOpen size={20} />
            </Link>
            <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
            <button
                onClick={onPrevChapter}
                disabled={isFirstChapter || isNavigating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 uppercase tracking-widest"
            >
                <ChevronLeft size={18} />
                <span>TRƯỚC</span>
            </button>
        </div>

        <div className="flex items-center gap-4">
            <button
                onClick={onChapterNavOpen}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-lime-400 hover:text-black rounded-xl text-sm font-bold transition-all border border-white/5"
            >
                <List size={18} />
                <span>MỤC LỤC</span>
            </button>

            <div className="flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                    onClick={() => setReaderMode('single')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${readerMode === 'single' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    TỪNG TRANG
                </button>
                <button
                    onClick={() => setReaderMode('continuous')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${readerMode === 'continuous' ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    CUỘN DÀI
                </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                <button title="Nền trắng" onClick={() => setBackgroundColor('white')} className={`w-5 h-5 rounded-full bg-white border border-transparent transition-transform hover:scale-110 ${backgroundColor === 'white' ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-black' : ''}`}></button>
                <button title="Nền đen" onClick={() => setBackgroundColor('black')} className={`w-5 h-5 rounded-full bg-gray-900 border border-gray-700 transition-transform hover:scale-110 ${backgroundColor === 'black' ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-black' : ''}`}></button>
                <button title="Nền sepia" onClick={() => setBackgroundColor('sepia')} className={`w-5 h-5 rounded-full bg-[#fbf0d9] border border-transparent transition-transform hover:scale-110 ${backgroundColor === 'sepia' ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-black' : ''}`}></button>
            </div>

            <select
                onChange={(e) => setPageWidth(e.target.value as PageWidth)}
                value={pageWidth}
                className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all border border-white/5 cursor-pointer outline-none focus:ring-1 focus:ring-lime-400/50"
            >
                <option value="fit-width">VỪA RỘNG</option>
                <option value="fit-height">VỪA CAO</option>
                <option value="original">GỐC</option>
            </select>

            <div className="flex items-center gap-2">
                <BookmarkButton chapterId={chapterId} storySlug={storySlug} />
                <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-lime-400 transition-all border border-white/5"
                    title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
            </div>
        </div>

        <button
            onClick={onNextChapter}
            disabled={isLastChapter || isNavigating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all bg-lime-500 text-black hover:bg-lime-400 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-lime-500/20 uppercase tracking-widest"
        >
            <span>TIẾP THEO</span>
            <ChevronRight size={18} />
        </button>
    </div>
);

interface MobileControlsProps {
    onPrevChapter: () => void;
    isFirstChapter: boolean;
    isNavigating: boolean;
    onNextChapter: () => void;
    isLastChapter: boolean;
    onChapterNavOpen: () => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    readerMode: 'single' | 'continuous';
    setReaderMode: (mode: 'single' | 'continuous') => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    pageWidth: PageWidth;
    setPageWidth: (width: PageWidth) => void;
    chapterId: string;
    storySlug: string;
    toggleFullscreen: () => void;
    isFullscreen: boolean;
}

const MobileControls = ({
    onPrevChapter,
    isFirstChapter,
    isNavigating,
    onNextChapter,
    isLastChapter,
    onChapterNavOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    readerMode,
    setReaderMode,
    backgroundColor,
    setBackgroundColor,
    pageWidth,
    setPageWidth,
    chapterId,
    storySlug,
    toggleFullscreen,
    isFullscreen
}: MobileControlsProps) => (
    <>
        <div className="lg:hidden flex items-center justify-between mb-6 p-2 bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl">
            <button
                onClick={onPrevChapter}
                disabled={isFirstChapter || isNavigating}
                className="p-3 rounded-xl bg-white/5 text-gray-300 hover:text-white disabled:opacity-20"
            >
                <ChevronLeft size={24} />
            </button>

            <div className="flex items-center gap-4">
                <button
                    onClick={onChapterNavOpen}
                    className="p-3.5 rounded-xl bg-white/5 text-gray-300 active:scale-95 transition-transform border border-white/5"
                >
                    <List size={22} />
                </button>
                <button
                    aria-label="Cài đặt"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-3.5 rounded-xl bg-lime-500 text-black shadow-lg shadow-lime-500/20 active:scale-95 transition-transform"
                >
                    <Settings size={22} />
                </button>
            </div>

            <button
                onClick={onNextChapter}
                disabled={isLastChapter || isNavigating}
                className="p-3 rounded-xl bg-white/5 text-gray-300 hover:text-white disabled:opacity-20"
            >
                <ChevronRight size={24} />
            </button>
        </div>

        {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end" onClick={() => setIsMobileMenuOpen(false)}>
                <div
                    className="w-full bg-gray-900 p-6 rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transition-transform animate-in slide-in-from-bottom duration-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-lime-400/20 flex items-center justify-center text-lime-400 border border-lime-400/10">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-lg leading-none mb-1">CÀI ĐẶT ĐỌC</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tùy chỉnh trải nghiệm</p>
                            </div>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 pb-8">
                        {/* Reading Mode */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Chế độ hiển thị</span>
                            <div className="flex p-1 bg-black/40 rounded-xl">
                                <button
                                    onClick={() => setReaderMode('single')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-tighter uppercase transition-all ${readerMode === 'single' ? 'bg-lime-400 text-black' : 'text-gray-500'}`}
                                >
                                    TỪNG TRANG
                                </button>
                                <button
                                    onClick={() => setReaderMode('continuous')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-tighter uppercase transition-all ${readerMode === 'continuous' ? 'bg-lime-400 text-black' : 'text-gray-500'}`}
                                >
                                    CUỘN DÀI
                                </button>
                            </div>
                        </div>

                        {/* Background Themes */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Màu nền</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setBackgroundColor('white')} className={`w-8 h-8 rounded-full bg-white transition-transform ${backgroundColor === 'white' ? 'ring-2 ring-lime-400 ring-offset-4 ring-offset-gray-900 scale-110' : ''}`}></button>
                                <button onClick={() => setBackgroundColor('black')} className={`w-8 h-8 rounded-full bg-black border border-white/10 transition-transform ${backgroundColor === 'black' ? 'ring-2 ring-lime-400 ring-offset-4 ring-offset-gray-900 scale-110' : ''}`}></button>
                                <button onClick={() => setBackgroundColor('sepia')} className={`w-8 h-8 rounded-full bg-[#fbf0d9] transition-transform ${backgroundColor === 'sepia' ? 'ring-2 ring-lime-400 ring-offset-4 ring-offset-gray-900 scale-110' : ''}`}></button>
                            </div>
                        </div>

                        {/* Page Width */}
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Chiều rộng</span>
                            <select
                                onChange={(e) => setPageWidth(e.target.value as PageWidth)}
                                value={pageWidth}
                                className="bg-transparent text-white font-bold text-sm outline-none text-right cursor-pointer"
                            >
                                <option value="fit-width" className="bg-gray-900">Vừa rộng</option>
                                <option value="fit-height" className="bg-gray-900">Vừa cao</option>
                                <option value="original" className="bg-gray-900">Gốc</option>
                            </select>
                        </div>

                        {/* Actions Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-2 items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <BookmarkButton chapterId={chapterId} storySlug={storySlug} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Lưu</span>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="flex flex-col gap-2 items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5"
                            >
                                {isFullscreen ? <Minimize2 size={24} className="text-lime-400" /> : <Maximize2 size={24} className="text-gray-400" />}
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Full</span>
                            </button>
                            <Link
                                href={`/truyen/${storySlug}`}
                                className="flex flex-col gap-2 items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5"
                            >
                                <BookOpen size={24} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Truyện</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
);

export const ReaderControls = ({
    storySlug,
    chapterId,
    onPrevChapter,
    onNextChapter,
    onChapterNavOpen,
    isFirstChapter,
    isLastChapter,
    isNavigating,
}: ReaderControlsProps) => {
    const {
        readerMode,
        backgroundColor,
        pageWidth,
        isFullscreen,
        setReaderMode,
        setBackgroundColor,
        setPageWidth,
        toggleFullscreen
    } = useReaderSettings();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <DesktopControls
                onPrevChapter={onPrevChapter}
                isFirstChapter={isFirstChapter}
                isNavigating={isNavigating}
                onChapterNavOpen={onChapterNavOpen}
                readerMode={readerMode}
                setReaderMode={setReaderMode}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                pageWidth={pageWidth}
                setPageWidth={setPageWidth}
                chapterId={chapterId}
                storySlug={storySlug}
                onNextChapter={onNextChapter}
                isLastChapter={isLastChapter}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
            />
            <MobileControls
                onPrevChapter={onPrevChapter}
                isFirstChapter={isFirstChapter}
                isNavigating={isNavigating}
                onNextChapter={onNextChapter}
                isLastChapter={isLastChapter}
                onChapterNavOpen={onChapterNavOpen}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                readerMode={readerMode}
                setReaderMode={setReaderMode}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                pageWidth={pageWidth}
                setPageWidth={setPageWidth}
                chapterId={chapterId}
                storySlug={storySlug}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
            />
        </>
    );
};

interface ReaderControlsProps {
    storySlug: string;
    chapterId: string;
    onPrevChapter: () => void;
    onNextChapter: () => void;
    onChapterNavOpen: () => void;
    isFirstChapter: boolean;
    isLastChapter: boolean;
    isNavigating: boolean;
}
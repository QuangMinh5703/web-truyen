'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { Bookmark as BookmarkIcon, Tag, Trash2, FolderPlus, Pencil, X, Check, Share2, Copy } from 'lucide-react';

const DEFAULT_FOLDER = 'Chưa phân loại';

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default function BookmarksPage() {
  const {
    bookmarks, folders, loading, error,
    toggleBookmark, moveBookmarkToFolder,
    addFolder, renameFolder, deleteFolder, shareFolder,
  } = useBookmarks();

  const [selectedFolder, setSelectedFolder] = useState('All');
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<{ oldName: string; newName: string } | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const [movingBookmark, setMovingBookmark] = useState<any | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (editingFolder && editInputRef.current) editInputRef.current.focus();
  }, [editingFolder]);

  const filteredBookmarks = selectedFolder === 'All'
    ? bookmarks
    : bookmarks.filter(bm => bm.folder === selectedFolder);

  const handleAddFolder = async () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      await addFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  const handleRenameFolder = async () => {
    if (editingFolder && editingFolder.newName.trim() && editingFolder.oldName !== editingFolder.newName.trim()) {
      await renameFolder(editingFolder.oldName, editingFolder.newName.trim());
    }
    setEditingFolder(null);
  };

  const handleDeleteFolder = async () => {
    if (deletingFolder) {
      await deleteFolder(deletingFolder);
      if (selectedFolder === deletingFolder) setSelectedFolder('All');
    }
    setDeletingFolder(null);
  };

  const handleMoveBookmark = async (targetFolder: string) => {
    if (movingBookmark) await moveBookmarkToFolder(movingBookmark.id, targetFolder);
    setMovingBookmark(null);
  };

  const handleShareFolder = async (folderName: string) => {
    const url = await shareFolder(folderName);
    if (url) setShareLink(url);
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="title-main mb-8">Đánh dấu</h1>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <X className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Lỗi tải đánh dấu</h3>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Folders sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Thư mục</h2>
              <ul className="space-y-1">
                {['All', ...folders].map(folder => (
                  <li key={folder} className="group flex items-center">
                    {editingFolder?.oldName === folder ? (
                      <div className="flex-grow flex gap-1">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingFolder.newName}
                          onChange={(e) => setEditingFolder({ ...editingFolder, newName: e.target.value })}
                          onBlur={handleRenameFolder}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
                          className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-lime-400/50"
                        />
                        <button onClick={handleRenameFolder} className="p-2 hover:bg-lime-400/10 rounded-xl text-lime-400"><Check size={16} /></button>
                        <button onClick={() => setEditingFolder(null)} className="p-2 hover:bg-red-400/10 rounded-xl text-red-400"><X size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedFolder(folder)}
                          className={`flex-1 text-left px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                            selectedFolder === folder
                              ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {folder === 'All' ? 'Tất cả' : folder}
                        </button>
                        {folder !== 'All' && (
                          <div className="hidden group-hover:flex items-center ml-1">
                            <button onClick={() => handleShareFolder(folder)} className="p-2 text-gray-600 hover:text-lime-400 rounded-lg" title="Chia sẻ"><Share2 size={14} /></button>
                            {folder !== DEFAULT_FOLDER && (
                              <>
                                <button onClick={() => setEditingFolder({ oldName: folder, newName: folder })} className="p-2 text-gray-600 hover:text-white rounded-lg" title="Đổi tên"><Pencil size={14} /></button>
                                <button onClick={() => setDeletingFolder(folder)} className="p-2 text-gray-600 hover:text-red-400 rounded-lg" title="Xóa"><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tạo thư mục mới</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                    placeholder="Tên thư mục..."
                    className="flex-grow px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                               placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                  />
                  <button
                    onClick={handleAddFolder}
                    className="p-2.5 bg-lime-500 text-black rounded-xl hover:bg-lime-400 transition-all active:scale-95"
                  >
                    <FolderPlus size={20} />
                  </button>
                </div>
              </div>
            </aside>

            {/* Bookmarks list */}
            <div className="flex-grow">
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <BookmarkIcon className="mx-auto h-16 w-16 text-gray-600 mb-6" />
                  <h3 className="text-lg font-bold mb-3">Chưa có đánh dấu</h3>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'var(--font-lexend-exa)' }}>
                    {selectedFolder === 'All'
                      ? 'Bạn chưa đánh dấu chương truyện nào.'
                      : `Không có đánh dấu nào trong thư mục "${selectedFolder}".`}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredBookmarks.map(bookmark => (
                    <li key={bookmark.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex justify-between items-center
                                                     hover:border-lime-400/20 transition-all duration-300 group">
                      <div className="min-w-0">
                        <Link
                          href={`/truyen/${bookmark.storySlug}/chuong/${bookmark.chapterId}`}
                          className="font-bold text-sm md:text-base text-white group-hover:text-lime-400 transition-colors line-clamp-1"
                          style={{ fontFamily: 'var(--font-lexend-exa)' }}
                        >
                          {bookmark.storySlug.replace(/-/g, ' ')} — Chương {bookmark.chapterId.split('-').pop()}
                        </Link>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {new Date(bookmark.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          {bookmark.folder && (
                            <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              <Tag size={10} /> {bookmark.folder}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        <button
                          onClick={() => setMovingBookmark(bookmark)}
                          className="p-2.5 text-gray-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                          title="Di chuyển"
                        >
                          <FolderPlus size={18} />
                        </button>
                        <button
                          onClick={() => toggleBookmark(bookmark)}
                          className="p-2.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                          title="Xóa đánh dấu"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

      <FooterComponent />

      {/* Delete folder modal */}
      {deletingFolder && (
        <Modal onClose={() => setDeletingFolder(null)}>
          <h3 className="text-lg font-bold mb-4">Xóa thư mục</h3>
          <p className="text-gray-400 text-sm mb-6">
            Bạn có chắc chắn muốn xóa thư mục &quot;{deletingFolder}&quot;? Các đánh dấu bên trong sẽ được chuyển vào &quot;{DEFAULT_FOLDER}&quot;.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeletingFolder(null)} className="px-5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 font-bold text-sm transition-all">
              Hủy
            </button>
            <button onClick={handleDeleteFolder} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-all active:scale-95">
              Xóa
            </button>
          </div>
        </Modal>
      )}

      {/* Move bookmark modal */}
      {movingBookmark && (
        <Modal onClose={() => setMovingBookmark(null)}>
          <h3 className="text-lg font-bold mb-4">Di chuyển đánh dấu</h3>
          <p className="text-gray-400 text-sm mb-4">Chọn thư mục đích:</p>
          <select
            onChange={(e) => handleMoveBookmark(e.target.value)}
            defaultValue={movingBookmark.folder || DEFAULT_FOLDER}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm
                       focus:outline-none focus:border-lime-400/50"
          >
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Modal>
      )}

      {/* Share link modal */}
      {shareLink && (
        <Modal onClose={() => setShareLink(null)}>
          <h3 className="text-lg font-bold mb-2">Chia sẻ thư mục</h3>
          <p className="text-gray-500 text-xs mb-4">Bất kỳ ai có liên kết này đều có thể xem đánh dấu.</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-grow px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-lime-500 text-black rounded-xl font-bold text-sm hover:bg-lime-400 transition-all active:scale-95 flex items-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

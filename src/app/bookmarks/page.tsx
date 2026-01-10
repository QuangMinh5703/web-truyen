// src/app/bookmarks/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { Bookmark as BookmarkIcon, Tag, Trash2, FolderPlus, Pencil, X, Check, Share2, Copy } from 'lucide-react';

const DEFAULT_FOLDER = 'Uncategorized';

// A simple modal component defined within the page for reusability
const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const BookmarksPage = () => {
    const { 
        bookmarks, 
        folders,
        loading, 
        error, 
        toggleBookmark, 
        moveBookmarkToFolder,
        addFolder,
        renameFolder,
        deleteFolder,
        shareFolder
    } = useBookmarks();

    const [selectedFolder, setSelectedFolder] = useState(DEFAULT_FOLDER);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolder, setEditingFolder] = useState<{ oldName: string; newName: string } | null>(null);
    const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
    const [movingBookmark, setMovingBookmark] = useState<any | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingFolder && editInputRef.current) {
            editInputRef.current.focus();
        }
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
            if (selectedFolder === deletingFolder) {
                setSelectedFolder(DEFAULT_FOLDER);
            }
        }
        setDeletingFolder(null);
    };

    const handleMoveBookmark = async (targetFolder: string) => {
        if (movingBookmark) {
            await moveBookmarkToFolder(movingBookmark.id, targetFolder);
        }
        setMovingBookmark(null);
    };

    const handleShareFolder = async (folderName: string) => {
        const url = await shareFolder(folderName);
        if (url) {
            setShareLink(url);
        }
    };

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    if (loading) {
        return <div className="text-center py-12">Loading bookmarks...</div>;
    }

    if (error) {
        // Simple error display, could be a toast notification
        return <div className="text-center py-12 text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Folders Sidebar */}
                <aside className="lg:w-1/4">
                    <h2 className="text-xl font-semibold mb-4">Folders</h2>
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
                                            className="w-full text-left px-2 py-1 rounded-md border dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <button onClick={handleRenameFolder} className="p-2 hover:bg-green-100 dark:hover:bg-green-800 rounded-md text-green-500"><Check size={16} /></button>
                                        <button onClick={() => setEditingFolder(null)} className="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-md text-red-500"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedFolder(folder)}
                                            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                                selectedFolder === folder
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {folder}
                                        </button>
                                        {folder !== 'All' && (
                                            <div className="hidden group-hover:flex items-center ml-1">
                                                <button onClick={() => handleShareFolder(folder)} className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400" title="Share Folder"><Share2 size={14} /></button>
                                                {folder !== DEFAULT_FOLDER && (
                                                    <>
                                                        <button onClick={() => setEditingFolder({ oldName: folder, newName: folder })} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" title="Rename Folder"><Pencil size={14} /></button>
                                                        <button onClick={() => setDeletingFolder(folder)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400" title="Delete Folder"><Trash2 size={14} /></button>
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
                        <h3 className="font-semibold mb-2">Create New Folder</h3>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                                placeholder="New folder name..."
                                className="flex-grow px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                            <button onClick={handleAddFolder} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <FolderPlus size={20} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Bookmarks List */}
                <main className="flex-grow">
                    {filteredBookmarks.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium">No bookmarks</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {selectedFolder === 'All'
                                    ? "You haven't bookmarked any chapters yet."
                                    : `No bookmarks found in the "${selectedFolder}" folder.`}
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {filteredBookmarks.map(bookmark => (
                                <li key={bookmark.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                    <div>
                                        <Link href={`/truyen/${bookmark.storySlug}/chuong/${bookmark.chapterId}`} className="font-semibold hover:text-blue-600">
                                            {bookmark.storySlug} - Chapter {bookmark.chapterId}
                                        </Link>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Bookmarked on: {new Date(bookmark.createdAt).toLocaleDateString()}
                                        </div>
                                        {bookmark.folder && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                                                <Tag size={12} /> {bookmark.folder}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setMovingBookmark(bookmark)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            title="Move to folder"
                                        >
                                            <FolderPlus size={18} />
                                        </button>
                                        <button 
                                            onClick={() => toggleBookmark(bookmark)} 
                                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full" 
                                            title="Remove bookmark"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </main>
            </div>
            
            {/* Modals for actions */}
            {deletingFolder && (
                <Modal onClose={() => setDeletingFolder(null)}>
                    <h3 className="text-lg font-bold">Delete Folder</h3>
                    <p className="my-4">Are you sure you want to delete the folder "{deletingFolder}"? Bookmarks inside will be moved to "{DEFAULT_FOLDER}".</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setDeletingFolder(null)} className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                        <button onClick={handleDeleteFolder} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}

            {movingBookmark && (
                <Modal onClose={() => setMovingBookmark(null)}>
                    <h3 className="text-lg font-bold">Move Bookmark</h3>
                    <p className="my-2">Move bookmark for "{movingBookmark.storySlug}" to:</p>
                    <select
                        onChange={(e) => handleMoveBookmark(e.target.value)}
                        defaultValue={movingBookmark.folder || DEFAULT_FOLDER}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        {folders.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </Modal>
            )}

            {shareLink && (
                <Modal onClose={() => setShareLink(null)}>
                    <h3 className="text-lg font-bold">Share Folder</h3>
                    <p className="my-2 text-sm text-gray-500">Anyone with this link can view this folder's bookmarks.</p>
                    <div className="flex items-center gap-2 mt-4">
                        <input type="text" readOnly value={shareLink} className="flex-grow px-3 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600" />
                        <button onClick={handleCopy} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                           {copied ? <Check size={16} /> : <Copy size={16} />}
                           {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default BookmarksPage;

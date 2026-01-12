'use client';

import {useState, useRef, useEffect} from 'react'; // <-- IMPORT THÊM useRef VÀ useEffect
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {ChevronDown} from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const pathname = usePathname();

    const genreDropdownRef = useRef<HTMLDivElement>(null);

    const genres = [
        "BL", "GL", "Action", "Mature", "Adventure", "Chuyển sinh", "Comedy", "Drama", "Harem", "Historical", "Ngôn Tình", "Psychological", "Romance", "Sci-fi", "Trinh Thám", "Slice of Life"
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            if (isGenreOpen && genreDropdownRef.current && !genreDropdownRef.current.contains(targetNode)) {
                setIsGenreOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGenreOpen]);

    return (
        <nav
            style={{background: 'var(--color-background-navbar)'}}
            className={`shadow-lg sticky top-0 z-40 ${className || ''}`}
        >
            <div className="grid items-center navbar-size items-center px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <div className="flex items-center space-x-6">

                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
                            <div className="text-3xl " style={{
                                width: 'var(--width-logo)',
                                height: 'var(--height-logo)',
                                backgroundImage: 'url(/logo.svg)',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat'
                            }}></div>
                        </Link>

                        {/* Menu Items */}
                        <div className="hidden md:flex items-center space-x-1">

                            <Link
                                href="/"
                                className="relative px-4 py-2 --text-while rounded-lg transition-all duration-200 navbar-text group overflow-hidden"
                            >
                                Trang chủ
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                    style={{background: 'var(--main-color-gradient)'}}
                                ></span>
                            </Link>
                            <Link
                                href="/dang-phat-hanh"
                                className={"relative px-4 py-2 rounded-lg transition-all duration-200 navbar-text group overflow-hidden"}
                            >
                                Đang Phát Hành
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                                        pathname === '/dang-phat-hanh'
                                            ? 'w-full'
                                            : 'w-0 group-hover:w-full'
                                    }`}
                                    style={{background: 'var(--main-color-gradient)'}}
                                ></span>
                            </Link>
                            <Link
                                href="/xep-hang"
                                className="relative px-4 py-2 --text-while rounded-lg transition-all duration-200 navbar-text group overflow-hidden "
                            >
                                Xếp Hạng
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                    style={{background: 'var(--main-color-gradient)'}}
                                ></span>
                            </Link>
                            <Link
                                href="/hoan-thanh"
                                className="relative px-4 py-2 --text-while rounded-lg transition-all duration-200 navbar-text group overflow-hidden "
                            >
                                Hoàn Thành
                                <span
                                    className={"absolute bottom-0 left-0 h-0.5 transition-all duration-300"}
                                    style={{background: 'var(--main-color-gradient)'}}
                                ></span>
                            </Link>

                            {/* Thể loại dropdown */}
                            <div className="relative" ref={genreDropdownRef}>
                                {/* Button giữ nguyên */}
                                <button
                                    onClick={() => setIsGenreOpen(!isGenreOpen)}
                                    className={`relative px-4 py-2 rounded-lg transition-all duration-200 navbar-text group overflow-hidden flex items-center space-x-1 cursor-pointer text-left ${
                                        pathname.startsWith('/the-loai')
                                            ? 'text-lime-400'
                                            : '--text-while'
                                    }`}
                                >
                                    <span>Thể Loại</span>
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                                            pathname.startsWith('/the-loai')
                                                ? 'w-full'
                                                : 'w-0 group-hover:w-full'
                                        }`}
                                        style={{background: 'var(--main-color-gradient)'}}
                                    ></span>
                                    <ChevronDown
                                        className={`w-6 h-6 transition-transform  duration-200 ${
                                            isGenreOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* Dropdown menu  */}
                                {isGenreOpen && (
                                    <div
                                        className="absolute top-15 right-1/2 translate-x-1/2 w-[var(--dropdown-width-navbar)]
                                              rounded-lg shadow-2xl py-4 px-6 z-50 navbar-dropdown
                                              max-h-[80vh] overflow-y-auto border border-gray-700"
                                    >
                                        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
                                            {genres.map((genre, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/the-loai/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="px-4 py-1.5 navbar-dropdown-text text-center
                                                         rounded-full transition-colors duration-150
                                                        overflow-hidden text-ellipsis"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        wordBreak: 'break-word'
                                                    }}
                                                    onClick={() => setIsGenreOpen(false)}
                                                >
                                                    {genre}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nhóm bên phải: Search Bar + Mobile Menu Button */}
                    <div className="flex items-center space-x-4">

                        {/* Thanh Search */}
                        <div className="relative hidden lg:block">
                            <div
                                className="flex items-center bg-gray-700 rounded-full">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-95 h-10 p-2 pl-4 rounded-l-full bg-transparent --text-while placeholder-gray-400 focus:outline-none focus:ring-0 navbar-search-input"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchTerm.trim()) {
                                            // Xử lý tìm kiếm ở đây
                                            console.log("Searching for:", searchTerm);
                                        }
                                    }}
                                />
                                <button
                                    className="flex items-center justify-center w-16 h-10 bg-gray-800  flex-shrink-0 rounded-r-full navbar-search"
                                    onClick={() => {
                                        if (searchTerm.trim()) {
                                            console.log("Searching for:", searchTerm);
                                        }
                                    }}
                                >
                                    <Image
                                        src="/ri_search_ai_2_line.svg"
                                        alt="AI Search Icon"
                                        width={35}
                                        height={35}
                                        className="text-lime-400 cursor-pointer"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button className="--text-while p-2 rounded-lg hover:bg-white/20">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

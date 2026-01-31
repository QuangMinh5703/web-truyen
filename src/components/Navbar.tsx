'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import Image from 'next/image';
import { useResponsive } from '@/lib/hooks/useMediaQuery';

interface NavbarProps {
    className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const pathname = usePathname();
    const router = useRouter();
    const { isMobile, isDesktop } = useResponsive();

    const genreDropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const genres = [
        { name: "BL", slug: "bl" },
        { name: "GL", slug: "gl" },
        { name: "Action", slug: "action" },
        { name: "Mature", slug: "mature" },
        { name: "Adventure", slug: "adventure" },
        { name: "Chuyển sinh", slug: "chuyen-sinh" },
        { name: "Comedy", slug: "comedy" },
        { name: "Drama", slug: "drama" },
        { name: "Harem", slug: "harem" },
        { name: "Historical", slug: "historical" },
        { name: "Ngôn Tình", slug: "ngon-tinh" },
        { name: "Psychological", slug: "psychological" },
        { name: "Romance", slug: "romance" },
        { name: "Sci-fi", slug: "sci-fi" },
        { name: "Trinh Thám", slug: "trinh-tham" },
        { name: "Slice of Life", slug: "slice-of-life" }
    ];

    const menuItems = [
        { name: 'Trang chủ', href: '/' },
        { name: 'Đang Phát Hành', href: '/dang-phat-hanh' },
        { name: 'Xếp Hạng', href: '/xep-hang' },
        { name: 'Hoàn Thành', href: '/hoan-thanh' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            if (isGenreOpen && genreDropdownRef.current && !genreDropdownRef.current.contains(targetNode)) {
                setIsGenreOpen(false);
            }
            if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(targetNode)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isGenreOpen, isMobileMenuOpen]);

    // Lock scroll when mobile menu or search modal is open
    useEffect(() => {
        if (isMobileMenuOpen || isSearchModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen, isSearchModalOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        // We only reset if they were truthy to avoid unnecessary re-renders
        setIsMobileMenuOpen(prev => prev ? false : prev);
        setIsGenreOpen(prev => prev ? false : prev);
        setIsSearchModalOpen(prev => prev ? false : prev);
    }, [pathname]);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setIsSearchModalOpen(false);
        }
    };

    return (
        <nav
            style={{ background: 'var(--color-background-navbar)' }}
            className={`shadow-lg sticky top-0 z-40 w-full ${className || ''}`}
        >
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between navbar-size">

                    {/* Left: Hamburger (Mobile) + Logo */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        {!isDesktop && (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/10 rounded-xl transition-colors"
                                aria-label="Open menu"
                            >
                                <Menu className="w-7 h-7" />
                            </button>
                        )}

                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
                            <div
                                className="transition-all duration-300"
                                style={{
                                    width: 'var(--width-logo)',
                                    height: 'var(--height-logo)',
                                    backgroundImage: 'url(/logo.svg)',
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                }}
                            ></div>
                        </Link>

                        {/* Desktop Menu Items */}
                        <div className="hidden lg:flex items-center space-x-1 ml-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative px-3 py-2 text-white/90 rounded-lg transition-all duration-200 navbar-text group overflow-hidden"
                                >
                                    {item.name}
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'
                                            }`}
                                        style={{ background: 'var(--main-color-gradient)' }}
                                    ></span>
                                </Link>
                            ))}

                            {/* Thể loại dropdown (Desktop) */}
                            <div className="relative" ref={genreDropdownRef}>
                                <button
                                    onClick={() => setIsGenreOpen(!isGenreOpen)}
                                    className={`relative px-3 py-2 rounded-lg transition-all duration-200 navbar-text group overflow-hidden flex items-center space-x-1 cursor-pointer ${pathname.startsWith('/the-loai') ? 'text-lime-400' : 'text-white/90'
                                        }`}
                                >
                                    <span>Thể Loại</span>
                                    <span
                                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${pathname.startsWith('/the-loai') ? 'w-full' : 'w-0 group-hover:w-full'
                                            }`}
                                        style={{ background: 'var(--main-color-gradient)' }}
                                    ></span>
                                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isGenreOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isGenreOpen && (
                                    <div className="absolute top-full right-1/2 translate-x-1/2 mt-2 w-[var(--dropdown-width-navbar)] rounded-xl shadow-2xl py-6 px-8 z-50 navbar-dropdown border border-white/10 backdrop-blur-md">
                                        <div className="grid grid-cols-4 gap-4">
                                            {genres.map((genre, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/the-loai/${genre.slug}`}
                                                    className="px-4 py-2 navbar-dropdown-text text-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis shadow-sm"
                                                    onClick={() => setIsGenreOpen(false)}
                                                >
                                                    {genre.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Search Bar */}
                    <div className="flex items-center space-x-4">
                        {/* Search (Desktop) */}
                        {isDesktop && pathname !== '/tim-kiem' && (
                            <div className="relative group">
                                <div className="flex items-center bg-white/10 hover:bg-white/15 transition-colors border border-white/5 rounded-full overflow-hidden">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm truyện..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-80 xl:w-96 h-10 p-2 pl-5 bg-transparent text-white placeholder-gray-400 focus:outline-none navbar-search-input"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        className="flex items-center justify-center w-14 h-10 bg-white/10 hover:bg-lime-400 transition-all group/btn"
                                        onClick={handleSearch}
                                    >
                                        <Image
                                            src="/ri_search_ai_2_line.svg"
                                            alt="Search"
                                            width={24}
                                            height={24}
                                            className="group-hover/btn:brightness-0 transition-all"
                                        />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Search Icon (Mobile) */}
                        {!isDesktop && (
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Search"
                            >
                                <Search className="w-6 h-6 hover:text-lime-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MOBILE DRAWER --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer Content */}
                    <div
                        ref={mobileMenuRef}
                        className="absolute top-0 left-0 bottom-0 w-[280px] sm:w-[320px] bg-[#121212] flex flex-col shadow-2xl animate-slide-in-left"
                    >
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                                <div
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        backgroundImage: 'url(/logo.svg)',
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                ></div>
                                <span className="ml-3 font-lexend-exa font-bold text-lg text-gradient">M-TRUYEN</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-11 h-11 text-gray-400 hover:text-white rounded-full hover:bg-white/5"
                                aria-label="Close menu"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-5 py-4 rounded-xl font-lexend-exa text-[15px] transition-all ${pathname === item.href
                                        ? 'bg-lime-400/10 text-lime-400 font-semibold'
                                        : 'text-white/80 hover:bg-white/5'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-white/5">
                                <h3 className="px-5 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest font-lexend-exa">Thể Loại</h3>
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    {genres.map((genre, index) => (
                                        <Link
                                            key={index}
                                            href={`/the-loai/${genre.slug}`}
                                            className="flex items-center px-4 py-4 min-h-[44px] text-[14px] text-white/70 hover:text-white hover:bg-white/5 rounded-lg font-lexend-exa transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {genre.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MOBILE SEARCH MODAL --- */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col lg:hidden animate-fade-in">
                    <div className="flex items-center p-4 border-b border-white/5">
                        <button onClick={() => setIsSearchModalOpen(false)} className="p-2 text-white">
                            <X className="w-7 h-7" />
                        </button>
                        <div className="flex-1 ml-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Tìm truyện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500 font-lexend-exa"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button onClick={handleSearch} className="p-3 text-lime-400">
                            <Search className="w-7 h-7" />
                        </button>
                    </div>

                    <div className="flex-1 p-8 text-center text-gray-500 mt-10">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="font-lexend-exa">Nhập tên truyện hoặc tác giả bạn muốn tìm kiếm</p>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

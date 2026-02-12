'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

export default function SearchBar({ initialQuery = '', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder="Tìm kiếm truyện..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="w-full px-6 py-4 pr-14 bg-white/5 border border-white/10 rounded-full text-white
                   placeholder-gray-500 focus:outline-none focus:border-lime-400/50 transition-colors"
        style={{ fontFamily: 'var(--font-lexend-exa)' }}
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-lime-400/10 hover:bg-lime-400 rounded-full transition-all group"
        aria-label="Tìm kiếm"
      >
        <Image
          src="/ri_search_ai_2_line.svg"
          alt="Tìm kiếm"
          width={24}
          height={24}
          className="group-hover:brightness-0 transition-all"
        />
      </button>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useResponsive } from '@/lib/hooks/useMediaQuery';

interface GenreItem {
    id: string;
    name: string;
    slug: string;
    image: string;
    color: string;
}

const genres: GenreItem[] = [
    { id: '1', name: 'Lãng Mạn', slug: 'lang-man', image: '/ig_themes/themes1.png', color: '#F5DBE9' },
    { id: '2', name: 'High School', slug: 'high-school', image: '/ig_themes/themes2.png', color: '#FFF3DE' },
    { id: '3', name: 'Gangster', slug: 'gangster', image: '/ig_themes/themes3.png', color: '#175446' },
    { id: '4', name: 'Obsessive', slug: 'obsessive', image: '/ig_themes/themes4.png', color: '#3E2942' },
    { id: '5', name: 'Historical', slug: 'historical', image: '/ig_themes/themes5.png', color: '#8D98A2' },
    { id: '6', name: 'One-side Love', slug: 'one-side-love', image: '/ig_themes/themes6.png', color: '#232430' },
    { id: '7', name: 'Bully', slug: 'bully', image: '/ig_themes/themes7.png', color: '#D7C6BE' },
    { id: '8', name: 'Non-human', slug: 'non-human', image: '/ig_themes/themes8.png', color: '#393737' },
    { id: '9', name: 'Fantasy', slug: 'fantasy', image: '/ig_themes/themes9.png', color: '#3D4B64' },
    { id: '10', name: 'Supernatural', slug: 'supernatural', image: '/ig_themes/themes4.png', color: '#E8C4D8' },
    { id: '11', name: 'Comedy', slug: 'comedy', image: '/ig_themes/themes5.png', color: '#FFE5B4' },
    { id: '12', name: 'Action', slug: 'action', image: '/ig_themes/themes6.png', color: '#2A5F4F' },
];

const PopularGenres = () => {
    const { isMobile } = useResponsive();

    // clip-path geometry scales with screen size
    const cornerSize = isMobile ? '10px' : '20px';
    const bottomCut = isMobile ? '30px' : '40px';
    const clipPathValue = `polygon(${cornerSize} 0, 100% 0, 100% calc(100% - ${bottomCut}), calc(100% - ${bottomCut}) 100%, 0 100%, 0 ${cornerSize})`;

    return (
        <section className="mb-8 md:mb-12 bg-black py-6 md:py-8 px-4 rounded-2xl">
            <div className="mb-6 md:mb-8">
                <h2 className="title-main">Thể loại</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {genres.map((genre) => (
                    <Link
                        key={genre.id}
                        href={`/the-loai/${genre.slug}`}
                        className="group block"
                    >
                        <div className="relative h-[150px] md:h-[175px] lg:h-[200px] w-full transform transition-transform duration-300 group-hover:-translate-y-1">
                            {/* Outer Border with dynamic clipPath */}
                            <div
                                className="absolute inset-0 transition-all duration-300 shadow-lg"
                                style={{
                                    clipPath: clipPathValue,
                                    backgroundColor: genre.color
                                }}
                            ></div>

                            {/* Inner Content Container */}
                            <div
                                className="absolute inset-[2px] md:inset-[3px] bg-black overflow-hidden flex flex-col justify-center"
                                style={{
                                    clipPath: clipPathValue
                                }}
                            >
                                <div className="flex h-[110px] md:h-[120px] lg:h-[136px] w-[calc(100%-20px)] md:w-[calc(100%-30px)] mx-auto rounded-lg overflow-hidden relative">
                                    <div
                                        className="w-1/2"
                                        style={{ backgroundColor: genre.color }}
                                    >
                                    </div>
                                    <div className="relative w-1/2 h-full">
                                        <div
                                            className="absolute top-0 left-0 h-full w-[8px] z-10"
                                            style={{
                                                background: `linear-gradient(to right, ${genre.color}, transparent)`
                                            }}
                                        ></div>
                                        <Image
                                            src={genre.image}
                                            alt={genre.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 15vw"
                                        />
                                    </div>

                                    {/* Overlay Text for centered alignment across the colored/image split */}
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                        <h3 className="genres-text text-center px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                            {genre.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default PopularGenres;
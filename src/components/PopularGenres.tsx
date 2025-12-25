'use client';

import Link from 'next/link';

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
    { id: '13', name: 'Mystery', slug: 'mystery', image: '/ig_themes/themes1.png', color: '#5C4B6B' },
    { id: '14', name: 'Tragedy', slug: 'tragedy', image: '/ig_themes/themes2.png', color: '#A8B5B8' },
    { id: '15', name: 'Drama', slug: 'drama', image: '/ig_themes/themes3.png', color: '#3D3D3D' },
];

const PopularGenres = () => {
    return (
        <section className="mb-12 bg-black py-8 px-4 rounded-lg">
            <div className="mb-8">
                <h2 className="title-main">Thể loại</h2>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {genres.slice(0, 12).map((genre) => (
                    <Link
                        key={genre.id}
                        href={`/the-loai/${genre.slug}`}
                        className="group block"
                    >
                        <div className="relative h-[200px] w-full">
                            <div
                                className="absolute inset-0 color-main transition-all duration-300"
                                style={{
                                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 20px)',
                                    backgroundColor: genre.color
                                }}
                            ></div>

                            {/* Content với viền đen bên trong */}
                            <div
                                className="absolute inset-[3px] bg-black overflow-hidden pl-[15px]"
                                style={{
                                    clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 20px)'
                                }}
                            >
                                <div className="flex h-[136px] w-[calc(100%-30px)] mt-[45px] rounded-lg overflow-hidden">
                                    <div
                                        className="w-1/2"
                                        style={{background: genre.color}}
                                    >
                                    </div>
                                    <div className="relative w-1/2 h-full">
                                        <div
                                            className="absolute top-0 left-0 h-full w-[8px] z-10"
                                            style={{
                                                background: `linear-gradient(to right, ${genre.color}, transparent)`
                                            }}
                                        ></div>
                                        <img
                                            src={genre.image}
                                            alt={genre.name}
                                            className="w-full h-full object-cover transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                                {/* Genre name */}
                                <div className="absolute top-[100px] left-[50%] -translate-x-1/2 z-20">
                                    <h3 className="genres-text text-center whitespace-nowrap">
                                        {genre.name}
                                    </h3>
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
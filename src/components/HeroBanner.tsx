'use client';

import {useState, useEffect, useRef} from 'react';
import { otruyenApi, Story } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

const localBanners = [
    '/ig_banner/banner1.jpg',
    '/ig_banner/banner2.jpg',
    '/ig_banner/banner3.jpg',
    '/ig_banner/banner4.jpg',
    '/ig_banner/banner5.jpg',
    '/ig_banner/banner6.jpg',
    '/ig_banner/banner7.jpg',
    '/ig_banner/banner8.jpg',
    '/ig_banner/banner9.png',
    '/ig_banner/banner10.jpg',
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const HeroBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [bannerImages, setBannerImages] = useState<string[]>([]);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const shuffledBanners = shuffleArray(localBanners);
        setBannerImages(shuffledBanners);
        console.log('[HeroBanner] Banners shuffled:', shuffledBanners);
    }, []);

    useEffect(() => {
        const fetchPopularStories = async () => {
            try {
                setLoading(true);
                console.log('[HeroBanner] Fetching home stories...');
                const listResponse = await otruyenApi.getHomeStories({
                    page: 1,
                    limit: 5,
                });

                console.log('[HeroBanner] Response received:', listResponse);

                if (listResponse && listResponse.items) {
                    setStories(listResponse.items);
                } else {
                    console.warn('[HeroBanner] No stories found in response');
                }
            } catch (error) {
                console.error('[HeroBanner] Error fetching popular stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularStories();
    }, []);

    useEffect(() => {
        if (stories.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % stories.length);
            }, 5000);

            return () => clearInterval(timer);
        }
    }, [stories.length]);

    useEffect(() => {
        if (scrollContainerRef.current && buttonRefs.current[currentSlide]) {
            const container = scrollContainerRef.current;
            const activeButton = buttonRefs.current[currentSlide];

            if (activeButton) {
                const containerWidth = container.offsetWidth;
                const buttonLeft = activeButton.offsetLeft;
                const buttonWidth = activeButton.offsetWidth;

                const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

                container.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentSlide]);

    if (loading) {
        return (
            <div
                className="relative w-full max-w-[var(--herobanner-width)] mx-auto h-[var(--herobanner-height)] rounded-2xl overflow-hidden mb-12 shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        );
    }

    if (stories.length === 0) {
        return (
            <div
                className="relative w-full max-w-[var(--herobanner-width)] mx-auto h-[var(--herobanner-height)] rounded-2xl overflow-hidden mb-12 shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <div className="text-white text-xl">Không có dữ liệu</div>
            </div>
        );
    }
    const currentStory = stories[currentSlide];
    const storyId = currentStory._id || currentStory.id || '';
    const storySlug = currentStory.slug || storyId;
    const storyTitle = currentStory.name || currentStory.title || 'Truyện tranh';
    const imageUrl = bannerImages[currentSlide % bannerImages.length] || bannerImages[0];

    return (
        <div className="mb-12">
            <div
                className="relative w-full max-w-[var(--herobanner-width)] mx-auto h-[var(--herobanner-height)] overflow-hidden shadow-2xl">

                {/* Background slide */}
                <div
                    key={storyId}
                    className="absolute inset-0 transition-opacity duration-1000 opacity-100"
                >
                    {/* Background image */}
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={imageUrl}
                                alt={storyTitle}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, var(--herobanner-width)"
                                quality={95}
                                priority={true}
                                unoptimized={false}
                            />
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                        </div>

                    {/* Content */}
                    <div className="absolute bottom-20 left-0 right-0 p-8 md:p-12 lg:p-16 pl-12 md:pl-16 lg:pl-20">
                        <div className="text-white max-w-4xl">
                            <p className="herobanner-description-text">
                                {currentStory.category && Array.isArray(currentStory.category) && currentStory.category.length > 0
                                    ? currentStory.category.map(category => category.name).join(' | ')
                                    : 'Thể loại đang được cập nhật.'
                                }
                            </p>
                            <h1 className="black-ops-one-text mb-6 animate-fade-in drop-shadow-lg">
                                {storyTitle}
                            </h1>
                            {storySlug && (
                                <div className=" mt-[10px]">
                                    <Link href={`/truyen/${storySlug}`}>
                                        <Image
                                            src="/read_now.svg"
                                            alt="Đọc ngay"
                                            width={157}
                                            height={59}
                                            className="cursor-pointer hover:scale-105 transition-transform duration-200"
                                        />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-[var(--herobanner-width)] mx-auto h-8">
                {/* Indicators */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[300px] px-4 z-20">
                    <div className="relative">
                        {/* Fade overlay left */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-6  from-black/50 to-transparent z-10 pointer-events-none rounded-l"/>

                        {/* Fade overlay right */}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-6  from-black/50 to-transparent z-10 pointer-events-none rounded-r"/>

                        {/* Scrollable indicators */}
                        <div
                            ref={scrollContainerRef}
                            className="flex space-x-1.5 overflow-x-auto scrollbar-hide px-6"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch'
                            }}
                        >
                            {stories.map((_, index) => (
                                <button
                                    key={index}
                                    ref={(el) => {
                                        buttonRefs.current[index] = el;
                                    }}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`parallelogram-indicator transition-all duration-300 flex-shrink-0 ${
                                        index === currentSlide
                                            ? 'bg-white w-8 h-3'
                                            : 'bg-gray-400/50 hover:bg-gray-400/75 w-6 h-2'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
'use client';

import { useState, useEffect, useRef } from 'react';
import { otruyenApi, Story } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

import { useResponsive } from '@/lib/hooks/useMediaQuery';

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
    const { isMobile, isDesktop } = useResponsive();

    useEffect(() => {
        const shuffledBanners = shuffleArray(localBanners);
        setBannerImages(shuffledBanners);
    }, []);

    useEffect(() => {
        const fetchPopularStories = async () => {
            try {
                setLoading(true);
                const listResponse = await otruyenApi.getHomeStories({
                    page: 1,
                    limit: 6,
                });

                if (listResponse && listResponse.items) {
                    setStories(listResponse.items);
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
                className="relative w-full max-w-[var(--herobanner-max-width)] mx-auto h-[var(--herobanner-height)] rounded-2xl overflow-hidden mb-8 md:mb-12 shadow-2xl bg-gray-900 animate-pulse flex items-center justify-center">
            </div>
        );
    }

    if (stories.length === 0) return null;

    const currentStory = stories[currentSlide];
    const storyId = currentStory._id || currentStory.id || '';
    const storySlug = currentStory.slug || storyId;
    const storyTitle = currentStory.name || currentStory.title || 'Truyện tranh';
    const imageUrl = bannerImages[currentSlide % bannerImages.length] || bannerImages[0];

    return (
        <div className="mb-8 md:mb-12">
            <div
                className="relative w-full max-w-[var(--herobanner-max-width)] mx-auto h-[var(--herobanner-height)] md:rounded-2xl overflow-hidden shadow-2xl">

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
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1300px"
                            quality={90}
                            priority={true}
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
                        <div className="text-white max-w-4xl animate-fade-in">
                            <p className="herobanner-description-text mb-2 opacity-90 drop-shadow-md">
                                {currentStory.category && Array.isArray(currentStory.category) && currentStory.category.length > 0
                                    ? currentStory.category.map(category => category.name).slice(0, 3).join(' | ')
                                    : 'Thể loại đang được cập nhật.'
                                }
                            </p>
                            <h1 className="black-ops-one-text mb-4 md:mb-6 line-clamp-2 drop-shadow-lg">
                                {storyTitle}
                            </h1>
                            {storySlug && (
                                <div className="mt-2 md:mt-4">
                                    <Link href={`/truyen/${storySlug}`} className="inline-block group">
                                        <div className="relative overflow-hidden rounded-lg">
                                            <Image
                                                src="/read_now.svg"
                                                alt="Đọc ngay"
                                                width={isMobile ? 120 : 157}
                                                height={isMobile ? 45 : 59}
                                                className="cursor-pointer group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-[var(--herobanner-max-width)] mx-auto h-8">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[300px] px-4 z-20">
                    <div className="relative">
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
                                    className={`parallelogram-indicator transition-all duration-300 flex-shrink-0 ${index === currentSlide
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
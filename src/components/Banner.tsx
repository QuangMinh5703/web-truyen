'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: 'One Piece - Arc Egghead',
    description: 'Cuộc phiêu lưu mới nhất của băng Mũ Rơm',
    image: '/banner1.jpg',
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 2,
    title: 'Solo Leveling Season 2',
    description: 'Sung Jin-Woo trở lại mạnh mẽ hơn bao giờ hết',
    image: '/banner2.jpg',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 3,
    title: 'Jujutsu Kaisen - Culling Game',
    description: 'Trận chiến sinh tử giữa các phù thủy',
    image: '/banner3.jpg',
    color: 'from-red-500 to-orange-600',
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="relative h-[400px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`flex h-full items-center bg-gradient-to-r ${banner.color} p-12 text-white`}
            >
              <div className="max-w-2xl">
                <h2 className="mb-4 text-4xl font-bold">{banner.title}</h2>
                <p className="mb-6 text-xl">{banner.description}</p>
                <button className="rounded-full bg-white px-8 py-3 font-semibold text-gray-900 transition-transform hover:scale-105">
                  Đọc ngay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

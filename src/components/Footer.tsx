import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Về chúng tôi */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Về MTruyen</h3>
            <p className="text-sm">
              Trang web đọc truyện tranh online miễn phí, cập nhật liên tục các bộ truyện mới nhất và hay nhất.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gioi-thieu" className="hover:text-blue-400">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-blue-400">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan" className="hover:text-blue-400">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach" className="hover:text-blue-400">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/cache-management" className="hover:text-blue-400">
                  Quản lý Cache
                </Link>
              </li>
            </ul>
          </div>

          {/* Thể loại phổ biến */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Thể loại phổ biến</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/the-loai/hanh-dong" className="hover:text-blue-400">
                  Hành động
                </Link>
              </li>
              <li>
                <Link href="/the-loai/lang-man" className="hover:text-blue-400">
                  Lãng mạn
                </Link>
              </li>
              <li>
                <Link href="/the-loai/fantasy" className="hover:text-blue-400">
                  Fantasy
                </Link>
              </li>
              <li>
                <Link href="/the-loai/shounen" className="hover:text-blue-400">
                  Shounen
                </Link>
              </li>
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Kết nối với chúng tôi</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="rounded-full bg-gray-800 p-2 transition-colors hover:bg-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-gray-800 p-2 transition-colors hover:bg-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-gray-800 p-2 transition-colors hover:bg-pink-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-gray-800 p-2 transition-colors hover:bg-red-600"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 MTruyen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

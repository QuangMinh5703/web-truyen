import Link from 'next/link';
import Image from "next/image";

interface FooterComponentProps {
    className?: string;
}

const FooterComponent = ({ className }: FooterComponentProps) => {
    return (
        <footer className={`footer mt-12 md:mt-20 border-t border-white/5 ${className || ''}`}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
                {/* Navigation Links */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-4 text-sm mb-8">
                    <Link href="/gioi-thieu" className="footer-text hover:text-white transition-colors">
                        Giới thiệu
                    </Link>
                    <Link href="/dieu-khoan" className="footer-text hover:text-white transition-colors">
                        Điều khoản sử dụng
                    </Link>
                    <Link href="/chinh-sach" className="footer-text hover:text-white transition-colors">
                        Chính sách bảo mật
                    </Link>
                    <Link href="/ho-tro" className="footer-text hover:text-white transition-colors">
                        Hỗ trợ
                    </Link>
                    <Link href="/yeu-cau" className="footer-text hover:text-white transition-colors">
                        Yêu cầu đăng truyện
                    </Link>
                </div>

                {/* Contact Info */}
                <div className="mb-8 text-center sm:text-left">
                    <p className="footer-text">
                        Liên hệ: <a href="mailto:contact@sketcha.com" className="hover:text-lime-400 transition-colors">contact@sketcha.com</a>
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t footer-line mb-8 opacity-50"></div>

                {/* Social Icons & Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <a
                            href="mailto:contact@sketcha.com"
                            className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                            aria-label="Email"
                        >
                            <Image
                                src="/ig_logo/ig_logo-mail.png"
                                alt="Email"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                            aria-label="Facebook"
                        >
                            <Image
                                src="/ig_logo/ig_logo-fb.png"
                                alt="Facebook"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </a>
                        <a
                            href="#"
                            className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
                            aria-label="Discord"
                        >
                            <Image
                                src="/ig_logo/ig_logo-dis.png"
                                alt="Discord"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </a>
                    </div>

                    <div className="footer-text text-sm opacity-60">
                        © 2026 M-Truyện. Tất cả quyền được bảo lưu.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterComponent;

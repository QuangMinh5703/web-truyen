import Link from 'next/link';
import Image from "next/image";

interface FooterComponentProps {
  className?: string;
}

const FooterComponent = ({ className }: FooterComponentProps) => {
    return (
        <footer className={`footer mt-20 ${className || ''}`}>
            <div className="max-w-7xl ml-[120px] px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm mb-6">
                    <Link href="/gioi-thieu" className="footer-text transition-colors">
                        About Sketcha
                    </Link>
                    <Link href="/dieu-khoan" className="footer-text transition-colors">
                        Terms of Use
                    </Link>
                    <Link href="/chinh-sach" className="footer-text transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/ho-tro" className="footer-text transition-colors">
                        Customer Support
                    </Link>
                    <Link href="/yeu-cau" className="footer-text transition-colors">
                        Submission
                    </Link>
                </div>

                <div className="mb-6">
                    <p className="footer-text">
                        Contact Us: <a href="mailto:contact@sketcha.com">contact@sketcha.com</a>
                    </p>
                </div>

                <div className="border-t footer-line mb-6"></div>

                <div className="flex items-center space-x-4">
                    <a
                        href="mailto:contact@sketcha.com"
                        className="w-10 h-10 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
                        aria-label="Email"
                    >
                        <Image
                            src="/ig_logo/ig_logo-mail.png"
                            alt="Email"
                            width={40}
                            height={40}
                            className="object-contain "
                        />
                    </a>
                    <a
                        href="#"
                        className="w-10 h-10 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
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
                        className="w-10 h-10 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
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
            </div>
        </footer>
    );
};

export default FooterComponent;
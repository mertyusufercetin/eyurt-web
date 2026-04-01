
'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-lg text-white">Eyurt</span>
            </div>
            <p className="text-sm text-gray-400">
              Öğrenciler için modern ve güvenli yurt yönetim sistemi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-red-500 transition-colors">
                  Anasayfa
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-500 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-red-500 transition-colors">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-500 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-white mb-4">Destek</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-red-500 transition-colors">
                  SSS
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-500 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-500 transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-500 transition-colors">
                  Bize Ulaşın
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-bold text-white mb-4">Bizi Takip Edin</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="hover:text-red-500 transition-colors text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-red-500 transition-colors text-xl">
                <FaLinkedin />
              </a>
            </div>
            <p className="text-sm">
              <a href="mailto:info@eyurt.com" className="hover:text-red-500 transition-colors">
                info@eyurt.com
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {currentYear} Eyurt. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm">
              <Link href="/privacy" className="hover:text-red-500 transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-red-500 transition-colors">
                Şartlar
              </Link>
              <Link href="/cookies" className="hover:text-red-500 transition-colors">
                Çerezler
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

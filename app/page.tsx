
'use client';

import Link from 'next/link';
import { FaShieldAlt, FaUsers, FaClock, FaCheck } from 'react-icons/fa';

export default function Home() {
  const features = [
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: 'Güvenli Sistem',
      description: 'Son teknoloji güvenlik protokolleri ile verileriniz tamamen korunmaktadır.',
    },
    {
      icon: <FaUsers className="text-3xl" />,
      title: 'Kolay Yönetim',
      description: 'Öğrenci ve yurt yöneticileri için kullanıcı dostu arayüz.',
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: '24/7 Erişim',
      description: 'İstediğiniz zaman, istediğiniz yerden sisteme erişebilirsiniz.',
    },
    {
      icon: <FaCheck className="text-3xl" />,
      title: 'Hızlı Destek',
      description: 'Sorun yaşadığınızda hemen yardımcı olmaya hazır ekibin var.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Modern Yurt Yönetim Sistemi
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Öğrencilerin barınma ihtiyaçlarını karşılamak için tasarlanmış, güvenli ve verimli bir platform.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="bg-linear-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Giriş Yap
              </Link>
              <Link
                href="/about"
                className="border-2 border-red-500 text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-300"
              >
                Daha Fazla Bilgi
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-red-500 to-red-600 rounded-2xl opacity-10 blur-3xl"></div>
            <div className="relative bg-linear-to-br from-red-50 to-white rounded-2xl p-12 border border-red-100 shadow-xl">
              <div className="space-y-4">
                <div className="h-3 bg-red-200 rounded-full w-3/4"></div>
                <div className="h-3 bg-red-100 rounded-full"></div>
                <div className="h-3 bg-red-100 rounded-full w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
            <p className="text-xl text-gray-600">
              Eyurt, yurt yönetimini basit ve etkili hale getirmek için geliştirilmiştir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="text-red-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-red-500 to-red-600 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Eyurt ile yurt yönetimimizi hemen başlatabilirsiniz. Günümüz öğrencileri için ideal bir çözüm.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Giriş Yap ve Başla
          </Link>
        </div>
      </section>
    </div>
  );
}

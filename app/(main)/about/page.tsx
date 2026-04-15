'use client';

import Link from 'next/link';
import { FaBullseye, FaLightbulb, FaHandshake } from 'react-icons/fa';

export default function About() {
  const team = [
    {
      name: 'Fatma Topuz Eryürük',
      role: 'Genel Müdür',
      description: 'Öğretmen',
    },
    {
      name: 'Yusuf Mert Erçetin',
      role: 'Web Tasarımcı',
      description: 'Öğrenci',
    },
    {
      name: 'Ahmet',
      role: 'Mobile Geliştirici',
      description: 'Öğrenci',
    },
    {
      name: 'Baran Arı',
      role: 'Mobile Geliştirici',
      description: 'Öğrenci',
    },
  ];

  const values = [
    {
      icon: <FaBullseye className="text-3xl" />,
      title: 'Hedefimiz',
      description: 'Öğrencilerin güvenli ve rahat bir ortamda eğitim görmesini sağlamak.',
    },
    {
      icon: <FaLightbulb className="text-3xl" />,
      title: 'İnovasyon',
      description: 'Teknoloji ile yurt yönetimini daha kolay ve verimli hale getirmek.',
    },
    {
      icon: <FaHandshake className="text-3xl" />,
      title: 'İşbirliği',
      description: 'Öğrenci, yönetici ve öğretmenlerin iş birliğini sağlamak.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-red-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">Hakkımızda</h1>
          <p className="text-xl text-red-100">
            Eyurt, 2025&rsquo;ten beri öğrencilerin yaşam kalitesini artırmak için çalışmaktadır.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Kim Biz?
            </h2>
            <p className="text-gray-600 mb-4 text-lg">
              Eyurt, modern yurt yönetim sistemini öğrenciler, yöneticiler ve öğretmenler düşünerek tasarlamıştır. 
              Bizim amacımız, yurt yaşamını daha kolay, güvenli ve verimli hale getirmektir.
            </p>
            <p className="text-gray-600 mb-6 text-lg">
              Teknolojinin gücünü kullanarak, her öğrencinin ihtiyaçlarını karşılamak ve onların eğitim hayatını 
              daha iyi hale getirmek istiyoruz.
            </p>
            <Link
              href="/login"
              className="inline-block bg-linear-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Giriş Yap
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-red-500 to-red-600 rounded-2xl opacity-10 blur-3xl"></div>
            <div className="relative bg-linear-to-br from-red-50 to-white rounded-2xl p-12 border border-red-100 shadow-xl">
              <div className="space-y-4">
                <div className="h-4 bg-red-300 rounded-full w-32"></div>
                <div className="h-4 bg-red-200 rounded-full"></div>
                <div className="h-4 bg-red-200 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Değerlerimiz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-red-500 mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Ekibimiz
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-linear-to-br from-red-50 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center border border-red-100"
            >
              <div className="w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-red-600 font-semibold mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-linear-to-r from-red-500 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <p className="text-red-100">Mutlu Öğrenci</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-red-100">Yurt Merkezi</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99%</div>
              <p className="text-red-100">Memnuniyet Oranı</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-red-100">Destek Hizmeti</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

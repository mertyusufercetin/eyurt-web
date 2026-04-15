'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Phone, GraduationCap, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Kullanici } from '@/lib/types';

export default function ProfilePage() {
  const [kullanici, setKullanici] = useState<Kullanici | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const tc = user.email?.replace('@eyurt.com', '');
      const { data } = await supabase.from('kullanicilar').select('*').eq('tc_kimlik', tc).single();
      setKullanici(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  if (!kullanici) return <p className="text-gray-400 text-center py-12">Kullanıcı bilgisi bulunamadı</p>;

  const fields = [
    { label: 'Ad Soyad', value: `${kullanici.ad} ${kullanici.soyad}`, icon: User },
    { label: 'E-posta', value: kullanici.email, icon: Mail },
    { label: 'Telefon', value: kullanici.telefon ?? '—', icon: Phone },
    { label: 'Öğrenci No', value: kullanici.ogrenci_no ?? '—', icon: GraduationCap },
    { label: 'TC Kimlik', value: `${kullanici.tc_kimlik.slice(0, 3)}*****${kullanici.tc_kimlik.slice(-2)}`, icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profilim</h1>
        <p className="text-gray-500 text-sm mt-1">Kişisel bilgileriniz</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {kullanici.ad[0]}{kullanici.soyad[0]}
            </div>
            <div className="text-white">
              <h2 className="text-lg font-bold">{kullanici.ad} {kullanici.soyad}</h2>
              <p className="text-red-100 text-sm capitalize">{kullanici.rol}</p>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-gray-50">
          {fields.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

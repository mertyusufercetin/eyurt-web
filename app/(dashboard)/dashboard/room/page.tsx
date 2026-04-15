'use client';

import { useEffect, useState } from 'react';
import { BedDouble, Users, Layers, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Oda, OdaAtamasi } from '@/lib/types';

export default function RoomPage() {
  const [oda, setOda] = useState<Oda | null>(null);
  const [odaArkadaslari, setOdaArkadaslari] = useState<{ ad: string; soyad: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const tc = user.email?.replace('@eyurt.com', '');
      const { data: k } = await supabase.from('kullanicilar').select('id').eq('tc_kimlik', tc).single();
      if (!k) { setLoading(false); return; }

      const { data: atama } = await supabase
        .from('oda_atamalari')
        .select('oda_id')
        .eq('kullanici_id', k.id)
        .eq('aktif', true)
        .single();

      if (atama?.oda_id) {
        const { data: odaData } = await supabase.from('odalar').select('*').eq('id', atama.oda_id).single();
        setOda(odaData);

        const { data: arkadaslar } = await supabase
          .from('oda_atamalari')
          .select('kullanici_id')
          .eq('oda_id', atama.oda_id)
          .eq('aktif', true)
          .neq('kullanici_id', k.id);

        if (arkadaslar && arkadaslar.length > 0) {
          const ids = arkadaslar.map(a => a.kullanici_id);
          const { data: users } = await supabase.from('kullanicilar').select('ad, soyad').in('id', ids);
          setOdaArkadaslari(users ?? []);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  if (!oda) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">Oda Bilgisi</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BedDouble size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Henüz bir oda atamanız yapılmamış</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Oda Bilgisi</h1>
        <p className="text-gray-500 text-sm mt-1">Odanız hakkında detaylı bilgi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BedDouble size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Oda No</p>
              <p className="text-lg font-bold text-gray-900">{oda.oda_no}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Kat</p>
              <p className="text-lg font-bold text-gray-900">{oda.kat}. Kat</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Doluluk</p>
              <p className="text-lg font-bold text-gray-900">{oda.dolu_kisi_sayisi}/{oda.kapasite}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Oda Arkadaşları */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Oda Arkadaşları</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {odaArkadaslari.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-gray-400">Oda arkadaşı bulunamadı</p>
          ) : odaArkadaslari.map((a, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                {a.ad[0]}{a.soyad[0]}
              </div>
              <span className="text-sm text-gray-800 font-medium">{a.ad} {a.soyad}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

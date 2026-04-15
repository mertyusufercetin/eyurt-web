'use client';

import { useEffect, useState } from 'react';
import { BedDouble } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Oda } from '@/lib/types';

export default function RoomsPage() {
  const { user: currentUser } = useAuth();
  const [odalar, setOdalar] = useState<Oda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('odalar').select('*').order('oda_no', { ascending: true });
      setOdalar(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (currentUser?.rol !== 'mudur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const filtered = filter === 'all' ? odalar : odalar.filter(o => o.durum === filter);
  const aktifOdalar = odalar.filter(o => o.durum === 'aktif');
  const toplamKapasite = aktifOdalar.reduce((s, o) => s + o.kapasite, 0);
  const toplamDolu = aktifOdalar.reduce((s, o) => s + o.dolu_kisi_sayisi, 0);
  const doluluk = toplamKapasite > 0 ? Math.round((toplamDolu / toplamKapasite) * 100) : 0;

  const durumConfig = (d: string) => {
    switch (d) {
      case 'aktif': return { color: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700' };
      case 'pasif': return { color: 'border-gray-300', badge: 'bg-gray-100 text-gray-600' };
      case 'tadilatta': return { color: 'border-amber-200', badge: 'bg-amber-50 text-amber-700' };
      default: return { color: 'border-gray-200', badge: 'bg-gray-50 text-gray-600' };
    }
  };

  const dolulukRenk = (oda: Oda) => {
    const oran = oda.kapasite > 0 ? oda.dolu_kisi_sayisi / oda.kapasite : 0;
    if (oran >= 1) return 'bg-red-500';
    if (oran >= 0.5) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Oda Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">Toplam {odalar.length} oda · %{doluluk} doluluk</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Toplam Oda</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{odalar.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs font-medium text-emerald-600">Aktif</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{odalar.filter(o => o.durum === 'aktif').length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <p className="text-xs font-medium text-amber-600">Tadilatta</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{odalar.filter(o => o.durum === 'tadilatta').length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-medium text-blue-600">Doluluk</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">%{doluluk}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Tümü' },
          { value: 'aktif', label: 'Aktif' },
          { value: 'pasif', label: 'Pasif' },
          { value: 'tadilatta', label: 'Tadilatta' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === f.value ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((oda) => {
          const config = durumConfig(oda.durum);
          return (
            <div key={oda.id} className={`bg-white rounded-xl border-2 p-4 ${config.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">{oda.oda_no}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                  {oda.durum === 'aktif' ? 'Aktif' : oda.durum === 'tadilatta' ? 'Tadilatta' : 'Pasif'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">Kat {oda.kat}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{oda.dolu_kisi_sayisi}/{oda.kapasite} kişi</span>
              </div>
              {oda.durum === 'aktif' && (
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${dolulukRenk(oda)}`}
                    style={{ width: `${oda.kapasite > 0 ? (oda.dolu_kisi_sayisi / oda.kapasite) * 100 : 0}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BedDouble size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Oda bulunamadı</p>
        </div>
      )}
    </div>
  );
}

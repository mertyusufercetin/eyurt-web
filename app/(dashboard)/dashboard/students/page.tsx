'use client';

import { useEffect, useState } from 'react';
import { Users, Search, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Kullanici } from '@/lib/types';

export default function StudentsPage() {
  const { user: currentUser } = useAuth();
  const [ogrenciler, setOgrenciler] = useState<Kullanici[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('kullanicilar').select('*').eq('rol', 'ogrenci').order('ad', { ascending: true });
      setOgrenciler(data ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (currentUser?.rol !== 'mudur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const filtered = ogrenciler.filter(o =>
    `${o.ad} ${o.soyad} ${o.ogrenci_no ?? ''} ${o.tc_kimlik}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Öğrenciler</h1>
          <p className="text-gray-500 text-sm mt-1">Toplam {ogrenciler.length} öğrenci</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="İsim, öğrenci no veya TC ile ara..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Öğrenci</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Öğrenci No</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">E-posta</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Telefon</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Sonuç bulunamadı</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                        {o.ad[0]}{o.soyad[0]}
                      </div>
                      <span className="font-medium text-gray-800">{o.ad} {o.soyad}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{o.ogrenci_no ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{o.email}</td>
                  <td className="px-5 py-3 text-gray-600">{o.telefon ?? '—'}</td>
                  <td className="px-5 py-3">
                    {o.aktif ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        <UserCheck size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700">
                        <UserX size={12} /> Pasif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Basvuru } from '@/lib/types';

export default function ApplicationsPage() {
  const { user: currentUser } = useAuth();
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Basvuru | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from('basvurular').select('*').order('created_at', { ascending: false });
    setBasvurular(data ?? []);
    setLoading(false);
  }

  async function handleAction(id: string, durum: 'onaylandi' | 'reddedildi') {
    setProcessing(true);
    await supabase.from('basvurular').update({ durum, guncellendi_at: new Date().toISOString() }).eq('id', id);
    setSelected(null);
    setProcessing(false);
    loadData();
  }

  if (currentUser?.rol !== 'mudur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const filtered = filter === 'all' ? basvurular : basvurular.filter(b => b.durum === filter);

  const durumConfig = (d: string) => {
    switch (d) {
      case 'onaylandi': return { label: 'Onaylandı', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 };
      case 'reddedildi': return { label: 'Reddedildi', color: 'bg-red-50 text-red-700', icon: XCircle };
      case 'iptal': return { label: 'İptal', color: 'bg-gray-100 text-gray-600', icon: XCircle };
      default: return { label: 'Beklemede', color: 'bg-amber-50 text-amber-700', icon: Clock };
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Başvurular</h1>
        <p className="text-gray-500 text-sm mt-1">Yurt başvurularını inceleyin ve yönetin</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-sm" onClick={() => setFilter('all')}>
          <p className="text-xs font-medium text-gray-500">Toplam</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{basvurular.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 cursor-pointer hover:shadow-sm" onClick={() => setFilter('beklemede')}>
          <p className="text-xs font-medium text-amber-600">Beklemede</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{basvurular.filter(b => b.durum === 'beklemede').length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 cursor-pointer hover:shadow-sm" onClick={() => setFilter('onaylandi')}>
          <p className="text-xs font-medium text-emerald-600">Onaylanan</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{basvurular.filter(b => b.durum === 'onaylandi').length}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 cursor-pointer hover:shadow-sm" onClick={() => setFilter('reddedildi')}>
          <p className="text-xs font-medium text-red-600">Reddedilen</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{basvurular.filter(b => b.durum === 'reddedildi').length}</p>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Başvuru Detayı</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Ad Soyad:</span><p className="font-medium text-gray-800">{selected.ad} {selected.soyad}</p></div>
                <div><span className="text-gray-500">TC Kimlik:</span><p className="font-medium text-gray-800">{selected.tc_kimlik}</p></div>
                <div><span className="text-gray-500">Okul:</span><p className="font-medium text-gray-800">{selected.okul}</p></div>
                <div><span className="text-gray-500">Bölüm:</span><p className="font-medium text-gray-800">{selected.bolum}</p></div>
                <div><span className="text-gray-500">Sınıf:</span><p className="font-medium text-gray-800">{selected.sinif}</p></div>
                <div><span className="text-gray-500">Dönem:</span><p className="font-medium text-gray-800">{selected.donem}</p></div>
                <div><span className="text-gray-500">Oda Tercihi:</span><p className="font-medium text-gray-800">{selected.oda_tercihi === '2_kisilik' ? '2 Kişilik' : selected.oda_tercihi === '4_kisilik' ? '4 Kişilik' : 'Farketmez'}</p></div>
                <div><span className="text-gray-500">Gelir Durumu:</span><p className="font-medium text-gray-800 capitalize">{selected.gelir_durumu}</p></div>
              </div>
            </div>
            {selected.durum === 'beklemede' && (
              <div className="flex gap-3 mt-6">
                <button onClick={() => handleAction(selected.id, 'onaylandi')} disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                  Onayla
                </button>
                <button onClick={() => handleAction(selected.id, 'reddedildi')} disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                  Reddet
                </button>
              </div>
            )}
            <button onClick={() => setSelected(null)} className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer">
              Kapat
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Başvuran</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Okul / Bölüm</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Dönem</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Başvuru bulunamadı</td></tr>
              ) : filtered.map((b) => {
                const config = durumConfig(b.durum);
                const StatusIcon = config.icon;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{b.ad} {b.soyad}</p>
                      <p className="text-xs text-gray-400">{b.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{b.okul} / {b.bolum}</td>
                    <td className="px-5 py-3 text-gray-600">{b.donem}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                        <StatusIcon size={12} /> {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(b.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(b)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

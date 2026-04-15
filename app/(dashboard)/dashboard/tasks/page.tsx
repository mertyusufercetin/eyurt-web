'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, Wrench, WashingMachine, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Ariza {
  id: string;
  tur: 'oda' | 'camasirhane';
  konum: string;
  aciklama: string;
  durum: string;
  created_at: string;
  bildirim_yapan?: { ad: string; soyad: string } | null;
}

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const [arizalar, setArizalar] = useState<Ariza[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beklemede' | 'isleme_alindi' | 'cozuldu'>('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [{ data: odaArizalari }, { data: cmArizalari }] = await Promise.all([
      supabase.from('oda_arizalari').select('id, ariza_tipi, aciklama, durum, created_at, oda:odalar!oda_id(oda_numarasi), bildirim_yapan:kullanicilar!bildirim_yapan_id(ad, soyad)').order('created_at', { ascending: false }),
      supabase.from('camasirhane_arizalari').select('id, makine_no, aciklama, durum, created_at, bildirim_yapan:kullanicilar!bildirim_yapan_id(ad, soyad)').order('created_at', { ascending: false }),
    ]);

    const mapped: Ariza[] = [
      ...(odaArizalari ?? []).map((a: Record<string, unknown>) => ({
        id: a.id as string,
        tur: 'oda' as const,
        konum: `Oda ${(a.oda as Record<string, unknown>)?.oda_numarasi ?? '?'} - ${a.ariza_tipi}`,
        aciklama: a.aciklama as string,
        durum: a.durum as string,
        created_at: a.created_at as string,
        bildirim_yapan: a.bildirim_yapan as Ariza['bildirim_yapan'],
      })),
      ...(cmArizalari ?? []).map((a: Record<string, unknown>) => ({
        id: a.id as string,
        tur: 'camasirhane' as const,
        konum: `Çamaşırhane Makine #${a.makine_no}`,
        aciklama: a.aciklama as string,
        durum: a.durum as string,
        created_at: a.created_at as string,
        bildirim_yapan: a.bildirim_yapan as Ariza['bildirim_yapan'],
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setArizalar(mapped);
    setLoading(false);
  }

  async function updateDurum(ariza: Ariza, yeniDurum: string) {
    const table = ariza.tur === 'oda' ? 'oda_arizalari' : 'camasirhane_arizalari';
    await supabase.from(table).update({ durum: yeniDurum }).eq('id', ariza.id);
    loadData();
  }

  if (currentUser?.rol !== 'memur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const durumConfig = (d: string) => {
    switch (d) {
      case 'isleme_alindi': return { label: 'İşleme Alındı', icon: Clock, color: 'text-amber-600 bg-amber-50', dot: 'bg-amber-500' };
      case 'cozuldu': return { label: 'Çözüldü', icon: CheckCircle2, color: 'text-green-600 bg-green-50', dot: 'bg-green-500' };
      default: return { label: 'Beklemede', icon: AlertCircle, color: 'text-red-600 bg-red-50', dot: 'bg-red-500' };
    }
  };

  const filtered = arizalar.filter(a => filter === 'all' || a.durum === filter);
  const beklemede = arizalar.filter(a => a.durum === 'beklemede').length;
  const islemeAlindi = arizalar.filter(a => a.durum === 'isleme_alindi').length;
  const cozuldu = arizalar.filter(a => a.durum === 'cozuldu').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Görevlerim</h1>
        <p className="text-gray-500 text-sm mt-1">Arıza ve bakım talepleri</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Beklemede', count: beklemede, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', filter: 'beklemede' as const },
          { label: 'İşleme Alındı', count: islemeAlindi, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', filter: 'isleme_alindi' as const },
          { label: 'Çözüldü', count: cozuldu, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', filter: 'cozuldu' as const },
        ].map(c => (
          <button key={c.label} onClick={() => setFilter(f => f === c.filter ? 'all' : c.filter)}
            className={`bg-white rounded-xl border p-4 text-left transition-all cursor-pointer ${filter === c.filter ? 'border-gray-400 ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center`}>
                <c.icon size={18} className={c.color} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{c.count}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{c.label}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Görev bulunamadı</p>
          </div>
        ) : filtered.map(a => {
          const dc = durumConfig(a.durum);
          const DurumIcon = dc.icon;
          return (
            <div key={`${a.tur}-${a.id}`} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.tur === 'oda' ? <Wrench size={14} className="text-gray-400" /> : <WashingMachine size={14} className="text-gray-400" />}
                    <span className="text-sm font-semibold text-gray-800">{a.konum}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${dc.color}`}>
                      <DurumIcon size={12} /> {dc.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{a.aciklama}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('tr-TR')}</span>
                    {a.bildirim_yapan && <span className="text-xs text-gray-400">Bildiren: {a.bildirim_yapan.ad} {a.bildirim_yapan.soyad}</span>}
                  </div>
                </div>
                {a.durum !== 'cozuldu' && (
                  <div className="flex gap-2 shrink-0">
                    {a.durum === 'beklemede' && (
                      <button onClick={() => updateDurum(a, 'isleme_alindi')}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">
                        İşleme Al
                      </button>
                    )}
                    <button onClick={() => updateDurum(a, 'cozuldu')}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">
                      Çözüldü
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

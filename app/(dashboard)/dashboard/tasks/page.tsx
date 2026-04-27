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
  bildiren?: { ad: string; soyad: string } | null;
}

export default function TasksPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [arizalar, setArizalar] = useState<Ariza[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'beklemede' | 'isleme_alindi' | 'cozuldu'>('all');

  useEffect(() => { 
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [{ data: odaData }, { data: cmData }] = await Promise.all([
      supabase.from('oda_arizalari').select('id, baslik, aciklama, durum, created_at, oda_id, bildiren_id').order('created_at', { ascending: false }),
      supabase.from('camasirhane_arizalari').select('id, aciklama, durum, created_at, makine_id, bildiren_id').order('created_at', { ascending: false }),
    ]);

    // Collect unique IDs for separate lookups
    const bildirenIds = [...new Set([
      ...(odaData ?? []).map((a) => (a as Record<string, unknown>).bildiren_id as string),
      ...(cmData ?? []).map((a) => (a as Record<string, unknown>).bildiren_id as string),
    ].filter(Boolean))];

    const makineIds = [...new Set((cmData ?? []).map((a) => (a as Record<string, unknown>).makine_id as string).filter(Boolean))];

    const [{ data: kullanicilar }, { data: makineler }] = await Promise.all([
      bildirenIds.length > 0 ? supabase.from('kullanicilar').select('id, ad, soyad').in('id', bildirenIds) : Promise.resolve({ data: [] }),
      makineIds.length > 0 ? supabase.from('camasirhaneler').select('id, makine_no').in('id', makineIds) : Promise.resolve({ data: [] }),
    ]);

    const userMap = Object.fromEntries((kullanicilar ?? []).map((u) => { const k = u as Record<string, unknown>; return [k.id as string, k]; }));
    const makineMap = Object.fromEntries((makineler ?? []).map((m) => { const k = m as Record<string, unknown>; return [k.id as string, k]; }));

    const mapped: Ariza[] = [
      ...(odaData ?? []).map((a: Record<string, unknown>) => {
        const bildiren = a.bildiren_id ? userMap[a.bildiren_id as string] as { ad: string; soyad: string } | undefined : undefined;
        return {
          id: a.id as string,
          tur: 'oda' as const,
          konum: `Oda ${(a.oda_id as string) ?? '?'} - ${a.baslik}`,
          aciklama: a.aciklama as string,
          durum: a.durum as string,
          created_at: a.created_at as string,
          bildiren: bildiren ?? null,
        };
      }),
      ...(cmData ?? []).map((a: Record<string, unknown>) => {
        const makine = a.makine_id ? makineMap[a.makine_id as string] as { makine_no: number } | undefined : undefined;
        const bildiren = a.bildiren_id ? userMap[a.bildiren_id as string] as { ad: string; soyad: string } | undefined : undefined;
        return {
          id: a.id as string,
          tur: 'camasirhane' as const,
          konum: `Çamaşırhane Makine #${makine?.makine_no ?? '?'}`,
          aciklama: a.aciklama as string,
          durum: a.durum as string,
          created_at: a.created_at as string,
          bildiren: bildiren ?? null,
        };
      }),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setArizalar(mapped);
    setLoading(false);
  }

  async function updateDurum(ariza: Ariza, yeniDurum: string) {
    const table = ariza.tur === 'oda' ? 'oda_arizalari' : 'camasirhane_arizalari';
    await supabase.from(table).update({ durum: yeniDurum }).eq('id', ariza.id);
    loadData();
  }

  if (authLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

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
                    {a.bildiren && <span className="text-xs text-gray-400">Bildiren: {a.bildiren.ad} {a.bildiren.soyad}</span>}
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

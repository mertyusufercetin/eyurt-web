'use client';

import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Odeme } from '@/lib/types';

interface OdemeWithUser extends Odeme {
  kullanici?: { ad: string; soyad: string; ogrenci_no: string } | null;
}

const ayAdi = (ay: number) => {
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return aylar[ay - 1] ?? '';
};

const durumConfig = (d: string) => {
  switch (d) {
    case 'odendi': return { label: 'Ödendi', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' };
    case 'gecikti': return { label: 'Gecikti', icon: AlertTriangle, color: 'bg-red-50 text-red-700' };
    default: return { label: 'Ödenmedi', icon: Clock, color: 'bg-amber-50 text-amber-700' };
  }
};

export default function PaymentsPage() {
  const { user: currentUser } = useAuth();
  if (currentUser?.rol === 'mudur') return <AdminPayments />;
  return <StudentPayments userId={currentUser?.id ?? null} />;
}

function AdminPayments() {
  const [odemeler, setOdemeler] = useState<OdemeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase
        .from('odemeler')
        .select('*')
        .order('yil', { ascending: false })
        .order('ay', { ascending: false });
      
      if (!rows || rows.length === 0) { setOdemeler([]); setLoading(false); return; }

      const ids = [...new Set((rows as Record<string, unknown>[]).map((r) => (r as Record<string, unknown>).kullanici_id as string).filter(Boolean))];
      const { data: users } = ids.length > 0
        ? await supabase.from('kullanicilar').select('id, ad, soyad, ogrenci_no').in('id', ids)
        : { data: [] };
      
      const userMap = Object.fromEntries((users ?? []).map((u) => { const k = u as Record<string, unknown>; return [k.id as string, k]; }));
      
      setOdemeler((rows as Record<string, unknown>[]).map((r) => {
        const row = r as Record<string, unknown>;
        const user = row.kullanici_id ? userMap[row.kullanici_id as string] as OdemeWithUser['kullanici'] : null;
        return { ...row, kullanici: user } as OdemeWithUser;
      }));
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = odemeler.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.kullanici?.ad?.toLowerCase().includes(q) || o.kullanici?.soyad?.toLowerCase().includes(q) || o.kullanici?.ogrenci_no?.includes(q);
  });

  const toplam = odemeler.reduce((s, o) => s + Number(o.tutar), 0);
  const odenen = odemeler.filter(o => o.durum === 'odendi').reduce((s, o) => s + Number(o.tutar), 0);
  const geciken = odemeler.filter(o => o.durum === 'gecikti').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ödemeler</h1>
        <p className="text-gray-500 text-sm mt-1">Tüm öğrenci ödemeleri</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Toplam</p>
          <p className="text-xl font-bold text-gray-900">{toplam.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
          <p className="text-xs font-medium text-emerald-600 mb-1">Tahsil Edilen</p>
          <p className="text-xl font-bold text-emerald-700">{odenen.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-5">
          <p className="text-xs font-medium text-red-600 mb-1">Geciken Ödeme</p>
          <p className="text-xl font-bold text-red-700">{geciken}</p>
        </div>
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="Öğrenci adı veya numarası ile ara..." />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Öğrenci</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Dönem</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tutar</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Ödeme Tarihi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Ödeme kaydı bulunamadı</td></tr>
            ) : filtered.map(o => {
              const c = durumConfig(o.durum);
              const Icon = c.icon;
              return (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{o.kullanici?.ad} {o.kullanici?.soyad}</p>
                    <p className="text-xs text-gray-400">{o.kullanici?.ogrenci_no}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{ayAdi(o.ay)} {o.yil}</td>
                  <td className="px-5 py-3 text-gray-700">{Number(o.tutar).toLocaleString('tr-TR')} ₺</td>
                  <td className="px-5 py-3"><span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.color}`}><Icon size={14} /> {c.label}</span></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{o.odeme_tarihi ? new Date(o.odeme_tarihi).toLocaleDateString('tr-TR') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentPayments({ userId }: { userId: string | null }) {
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const { data } = await supabase.from('odemeler').select('*').eq('kullanici_id', userId).order('yil', { ascending: false }).order('ay', { ascending: false });
      setOdemeler(data ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const toplam = odemeler.reduce((s, o) => s + Number(o.tutar), 0);
  const odenen = odemeler.filter(o => o.durum === 'odendi').reduce((s, o) => s + Number(o.tutar), 0);
  const bekleyen = toplam - odenen;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ödemelerim</h1>
        <p className="text-gray-500 text-sm mt-1">Ödeme durumlarınızı takip edin</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Toplam Tutar</p>
          <p className="text-xl font-bold text-gray-900">{toplam.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
          <p className="text-xs font-medium text-emerald-600 mb-1">Ödenen</p>
          <p className="text-xl font-bold text-emerald-700">{odenen.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
          <p className="text-xs font-medium text-amber-600 mb-1">Bekleyen</p>
          <p className="text-xl font-bold text-amber-700">{bekleyen.toLocaleString('tr-TR')} ₺</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Dönem</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tutar</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Ödeme Tarihi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {odemeler.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Ödeme kaydı bulunamadı</td></tr>
            ) : odemeler.map(o => {
              const c = durumConfig(o.durum);
              const Icon = c.icon;
              return (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{ayAdi(o.ay)} {o.yil}</td>
                  <td className="px-5 py-3 text-gray-700">{Number(o.tutar).toLocaleString('tr-TR')} ₺</td>
                  <td className="px-5 py-3"><span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.color}`}><Icon size={14} /> {c.label}</span></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{o.odeme_tarihi ? new Date(o.odeme_tarihi).toLocaleDateString('tr-TR') : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

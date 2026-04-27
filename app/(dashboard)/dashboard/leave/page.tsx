'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Plus, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Izin } from '@/lib/types';

interface IzinWithUser extends Izin {
  kullanici?: { ad: string; soyad: string; ogrenci_no: string } | null;
}

const durumLabel = (d: string) => ({ beklemede: 'Beklemede', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi' }[d] ?? d);
const durumRenk = (d: string) => {
  switch (d) {
    case 'onaylandi': return 'bg-emerald-50 text-emerald-700';
    case 'reddedildi': return 'bg-red-50 text-red-700';
    default: return 'bg-amber-50 text-amber-700';
  }
};
const durumIcon = (d: string) => {
  switch (d) {
    case 'onaylandi': return <CheckCircle2 size={14} className="text-emerald-500" />;
    case 'reddedildi': return <XCircle size={14} className="text-red-500" />;
    default: return <Clock size={14} className="text-amber-500" />;
  }
};

export default function LeavePage() {
  const { user: currentUser } = useAuth();
  if (currentUser?.rol === 'mudur') return <AdminLeave />;
  return <StudentLeave userId={currentUser?.id ?? null} />;
}

function AdminLeave() {
  const [izinler, setIzinler] = useState<IzinWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      const { data: rows } = await supabase.from('izinler')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!rows || rows.length === 0) { setIzinler([]); setLoading(false); return; }

      const ids = [...new Set((rows as Record<string, unknown>[]).map((r) => (r as Record<string, unknown>).kullanici_id as string).filter(Boolean))];
      const { data: users } = ids.length > 0
        ? await supabase.from('kullanicilar').select('id, ad, soyad, ogrenci_no').in('id', ids)
        : { data: [] };
      
      const userMap = Object.fromEntries((users ?? []).map((u) => { const k = u as Record<string, unknown>; return [k.id as string, k]; }));
      
      setIzinler((rows as Record<string, unknown>[]).map((r) => {
        const row = r as Record<string, unknown>;
        const user = row.kullanici_id ? userMap[row.kullanici_id as string] as IzinWithUser['kullanici'] : null;
        return { ...row, kullanici: user } as IzinWithUser;
      }));
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function updateDurum(id: string, durum: Izin['durum']) {
    await supabase.from('izinler').update({ durum }).eq('id', id);
    setIzinler(prev => prev.map(i => i.id === id ? { ...i, durum } : i));
  }

  const filtered = izinler.filter(i => {
    if (filter !== 'all' && (i.durum ?? 'beklemede') !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return i.kullanici?.ad?.toLowerCase().includes(q) || i.kullanici?.soyad?.toLowerCase().includes(q) || i.kullanici?.ogrenci_no?.includes(q);
  });

  const beklemede = izinler.filter(i => (i.durum ?? 'beklemede') === 'beklemede').length;
  const onaylandi = izinler.filter(i => i.durum === 'onaylandi').length;
  const reddedildi = izinler.filter(i => i.durum === 'reddedildi').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İzin Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">{beklemede} beklemede, {onaylandi} onaylı, {reddedildi} reddedildi</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="Öğrenci ara..." />
        </div>
        <div className="flex gap-2">
          {['all', 'beklemede', 'onaylandi', 'reddedildi'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === f ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? 'Tümü' : durumLabel(f)}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Öğrenci</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tarih Aralığı</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Sebep</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">İşlem</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">İzin talebi bulunamadı</td></tr>
            ) : filtered.map(i => (
              <tr key={i.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{i.kullanici?.ad} {i.kullanici?.soyad}</p>
                  <p className="text-xs text-gray-400">{i.kullanici?.ogrenci_no}</p>
                </td>
                <td className="px-5 py-3 text-gray-700 text-xs">{new Date(i.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(i.bitis_tarihi).toLocaleDateString('tr-TR')}</td>
                <td className="px-5 py-3 text-gray-600 text-sm max-w-xs truncate">{i.sebep ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${durumRenk(i.durum ?? 'beklemede')}`}>
                    {durumIcon(i.durum ?? 'beklemede')} {durumLabel(i.durum ?? 'beklemede')}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {(i.durum === 'beklemede' || i.durum == null) && (
                    <div className="flex gap-2">
                      <button onClick={() => updateDurum(i.id, 'onaylandi')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">Onayla</button>
                      <button onClick={() => updateDurum(i.id, 'reddedildi')}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">Reddet</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentLeave({ userId }: { userId: string | null }) {
  const [izinler, setIzinler] = useState<Izin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ baslangic_tarihi: '', bitis_tarihi: '', sebep: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  async function loadData() {
    const { data } = await supabase.from('izinler').select('*').eq('kullanici_id', userId).order('created_at', { ascending: false });
    setIzinler(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || submitting) return;
    setSubmitting(true);
    await supabase.from('izinler').insert({
      kullanici_id: userId,
      baslangic_tarihi: form.baslangic_tarihi,
      bitis_tarihi: form.bitis_tarihi,
      sebep: form.sebep,
    });
    setForm({ baslangic_tarihi: '', bitis_tarihi: '', sebep: '' });
    setShowForm(false);
    setSubmitting(false);
    loadData();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İzin Taleplerim</h1>
          <p className="text-gray-500 text-sm mt-1">İzin talebi oluşturun ve durumlarını takip edin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          <Plus size={16} /> Yeni Talep
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Yeni İzin Talebi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input type="date" required value={form.baslangic_tarihi} onChange={e => setForm({ ...form, baslangic_tarihi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input type="date" required value={form.bitis_tarihi} onChange={e => setForm({ ...form, bitis_tarihi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sebep</label>
            <textarea required rows={3} value={form.sebep} onChange={e => setForm({ ...form, sebep: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
              {submitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer">
              İptal
            </button>
          </div>
        </form>
      )}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Tarih Aralığı</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Sebep</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Durum</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Talep Tarihi</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {izinler.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Henüz izin talebi yok</td></tr>
            ) : izinler.map(izin => (
              <tr key={izin.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3 text-gray-800">{new Date(izin.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(izin.bitis_tarihi).toLocaleDateString('tr-TR')}</td>
                <td className="px-5 py-3 text-gray-6000 max-w-xs truncate">{izin.sebep ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${durumRenk(izin.durum ?? 'beklemede')}`}>
                    {durumIcon(izin.durum ?? 'beklemede')} {durumLabel(izin.durum ?? 'beklemede')}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(izin.created_at).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

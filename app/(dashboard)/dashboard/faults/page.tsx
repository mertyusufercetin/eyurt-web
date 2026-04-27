'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Clock, CheckCircle2, Settings, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { OdaArizasi } from '@/lib/types';

interface ArizaWithUser extends OdaArizasi {
  bildiren?: { ad: string; soyad: string; ogrenci_no: string } | null;
}

const durumConfig = (d: string) => {
  switch (d) {
    case 'cozuldu': return { label: 'Çözüldü', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' };
    case 'isleme_alindi': return { label: 'İşleme Alındı', icon: Settings, color: 'bg-blue-50 text-blue-700' };
    default: return { label: 'Beklemede', icon: Clock, color: 'bg-amber-50 text-amber-700' };
  }
};

export default function FaultsPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  if (authLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  if (currentUser?.rol === 'ogrenci') return <StudentFaults userId={currentUser?.id ?? null} />;
  return <ManageFaults isMudur={currentUser?.rol === 'mudur'} />;
}

/* Admin & Staff view - both can update status, admin sees title "Arıza Yönetimi", staff sees "Arıza Talepleri" */
function ManageFaults({ isMudur }: { isMudur: boolean }) {
  const [arizalar, setArizalar] = useState<ArizaWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { 
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    const { data: rows } = await supabase
      .from('oda_arizalari')
      .select('*')
      .order('created_at', { ascending: false });

    if (!rows || rows.length === 0) { setArizalar([]); setLoading(false); return; }

    const ids = [...new Set(rows.map((r) => (r as Record<string,unknown>).bildiren_id as string).filter(Boolean))];
    const { data: users } = ids.length > 0
      ? await supabase.from('kullanicilar').select('id, ad, soyad, ogrenci_no').in('id', ids)
      : { data: [] };
    const userMap = Object.fromEntries((users ?? []).map((u) => { const k = u as Record<string,unknown>; return [k.id as string, k]; }));

    setArizalar(rows.map((r) => {
      const row = r as Record<string,unknown>;
      const bildiren = row.bildiren_id ? userMap[row.bildiren_id as string] as ArizaWithUser['bildiren'] : null;
      return { ...row, bildiren } as ArizaWithUser;
    }));
    setLoading(false);
  }

  async function updateDurum(id: string, durum: OdaArizasi['durum']) {
    await supabase.from('oda_arizalari').update({ durum }).eq('id', id);
    setArizalar(prev => prev.map(a => a.id === id ? { ...a, durum } : a));
  }

  const filtered = arizalar.filter(a => {
    if (filter !== 'all' && (a.durum ?? 'beklemede') !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.baslik ?? '').toLowerCase().includes(q) || a.bildiren?.ad?.toLowerCase().includes(q) || a.bildiren?.soyad?.toLowerCase().includes(q);
  });

  const beklemede = arizalar.filter(a => (a.durum ?? 'beklemede') === 'beklemede').length;
  const isleme = arizalar.filter(a => a.durum === 'isleme_alindi').length;
  const cozuldu = arizalar.filter(a => a.durum === 'cozuldu').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isMudur ? 'Arıza Yönetimi' : 'Arıza Talepleri'}</h1>
        <p className="text-gray-500 text-sm mt-1">{beklemede} beklemede, {isleme} işlemde, {cozuldu} çözüldü</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="Arıza veya öğrenci ara..." />
        </div>
        <div className="flex gap-2">
          {['all', 'beklemede', 'isleme_alindi', 'cozuldu'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === f ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? 'Tümü' : durumConfig(f).label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Wrench size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Arıza bulunamadı</p>
          </div>
        ) : filtered.map(a => {
          const c = durumConfig(a.durum ?? 'beklemede');
          const StatusIcon = c.icon;
          return (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{a.baslik ?? 'Arıza Bildirimi'}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.color}`}><StatusIcon size={12} /> {c.label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{a.aciklama ?? ''}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {a.oda_id && <span>Oda {a.oda_id}</span>}
                    {a.bildiren && <span>Bildiren: {a.bildiren.ad} {a.bildiren.soyad}</span>}
                    <span>{new Date(a.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                {(a.durum ?? 'beklemede') !== 'cozuldu' && (
                  <div className="flex gap-2 shrink-0">
                    {(a.durum ?? 'beklemede') === 'beklemede' && (
                      <button onClick={() => updateDurum(a.id, 'isleme_alindi')}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">İşleme Al</button>
                    )}
                    <button onClick={() => updateDurum(a.id, 'cozuldu')}
                      className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-medium rounded-lg transition-colors cursor-pointer">Çözüldü</button>
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

/* Student view - sees own faults and can create new ones */
function StudentFaults({ userId }: { userId: string | null }) {
  const [arizalar, setArizalar] = useState<OdaArizasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ baslik: '', aciklama: '', oda_no: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  async function loadData() {
    setHata(null);
    const { data, error } = await supabase
      .from('oda_arizalari')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('oda_arizalari error:', error); setHata(error.message); }
    setArizalar((data ?? []) as OdaArizasi[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from('oda_arizalari').insert({
      bildiren_id: userId,
      baslik: form.baslik,
      aciklama: form.aciklama,
      oda_id: form.oda_no.trim() || null,
    });
    if (error) { console.error('insert error:', error); setHata(error.message); setSubmitting(false); return; }
    setForm({ baslik: '', aciklama: '', oda_no: '' });
    setShowForm(false);
    setSubmitting(false);
    loadData();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arıza Bildirimi</h1>
          <p className="text-gray-500 text-sm mt-1">Oda arızalarını bildirin ve takip edin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          <Plus size={16} /> Arıza Bildir
        </button>
      </div>
      {hata && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">Hata: {hata}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Yeni Arıza Bildirimi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input type="text" required value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })}
                placeholder="Örn: Musluk arızası" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oda Numarası</label>
              <input type="text" value={form.oda_no} onChange={e => setForm({ ...form, oda_no: e.target.value })}
                placeholder="Örn: 204" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea required rows={3} value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
              placeholder="Arızayı detaylı açıklayın..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" />
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
      <div className="space-y-3">
        {arizalar.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Wrench size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Henüz arıza bildirimi yok</p>
          </div>
        ) : arizalar.map(a => {
          const c = durumConfig(a.durum);
          const StatusIcon = c.icon;
          return (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{a.baslik}</h3>
                    {a.oda_id && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Oda {a.oda_id}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{a.aciklama}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(a.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${c.color}`}>
                  <StatusIcon size={14} /> {c.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

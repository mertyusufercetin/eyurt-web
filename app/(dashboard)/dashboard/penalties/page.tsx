'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Ceza } from '@/lib/types';

interface CezaWithUser extends Ceza {
  kullanici?: { ad: string; soyad: string; ogrenci_no: string } | null;
}

export default function PenaltiesPage() {
  const { user: currentUser } = useAuth();
  const [cezalar, setCezalar] = useState<CezaWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ kullanici_tc: '', ceza_turu: 'tutanak' as string, aciklama: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { 
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const { data: rows } = await supabase
      .from('cezalar')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!rows || rows.length === 0) { setCezalar([]); setLoading(false); return; }

    const ids = [...new Set((rows as Record<string, unknown>[]).map((r) => (r as Record<string, unknown>).kullanici_id as string).filter(Boolean))];
    const { data: users } = ids.length > 0
      ? await supabase.from('kullanicilar').select('id, ad, soyad, ogrenci_no').in('id', ids)
      : { data: [] };
    
    const userMap = Object.fromEntries((users ?? []).map((u) => { const k = u as Record<string, unknown>; return [k.id as string, k]; }));
    
    setCezalar((rows as Record<string, unknown>[]).map((r) => {
      const row = r as Record<string, unknown>;
      const user = row.kullanici_id ? userMap[row.kullanici_id as string] as CezaWithUser['kullanici'] : null;
      return { ...row, kullanici: user } as CezaWithUser;
    }));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    setSaving(true);
    try {
      if (!form.kullanici_tc.trim()) {
        setError('TC Kimlik No zorunludur');
        setSaving(false);
        return;
      }
      if (!form.aciklama.trim()) {
        setError('Açıklama zorunludur');
        setSaving(false);
        return;
      }
      const { data: hedef } = await supabase.from('kullanicilar').select('id').eq('tc_kimlik', form.kullanici_tc).single();
      if (!hedef) {
        setError('Bu TC Kimlik No ile kayıtlı öğrenci bulunamadı');
        setSaving(false);
        return;
      }
      await supabase.from('cezalar').insert({
        kullanici_id: hedef.id,
        memur_id: currentUser.id,
        ceza_turu: form.ceza_turu,
        aciklama: form.aciklama,
        tarih: new Date().toISOString().split('T')[0],
      });
      setForm({ kullanici_tc: '', ceza_turu: 'tutanak', aciklama: '' });
      setShowForm(false);
      setSaving(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ceza kaydı eklenirken hata oluştu');
      setSaving(false);
    }
  }

  if (currentUser?.rol !== 'mudur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const turConfig = (t: string) => {
    switch (t) {
      case 'sigara': return { label: 'Sigara', color: 'text-orange-600 bg-orange-50' };
      case 'diger': return { label: 'Diğer', color: 'text-gray-600 bg-gray-50' };
      default: return { label: 'Tutanak', color: 'text-red-600 bg-red-50' };
    }
  };

  const filtered = cezalar.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.kullanici?.ad?.toLowerCase().includes(q) || c.kullanici?.soyad?.toLowerCase().includes(q) || c.kullanici?.ogrenci_no?.includes(q) || c.aciklama?.toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cezalar</h1>
          <p className="text-gray-500 text-sm mt-1">Toplam {cezalar.length} ceza kaydı</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'İptal' : 'Yeni Ceza'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Öğrenci TC Kimlik No</label>
              <input type="text" required value={form.kullanici_tc} onChange={e => setForm({ ...form, kullanici_tc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="TC Kimlik No" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ceza Türü</label>
              <select value={form.ceza_turu} onChange={e => setForm({ ...form, ceza_turu: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="tutanak">Tutanak</option>
                <option value="sigara">Sigara</option>
                <option value="diger">Diğer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
            <textarea required rows={3} value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="Ceza açıklaması" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" placeholder="İsim, öğrenci no veya açıklama ile ara..." />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Ceza kaydı bulunamadı</p>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Öğrenci</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Tür</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Açıklama</th>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Tarih</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => {
                  const tc = turConfig(c.ceza_turu ?? 'diger');
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{c.kullanici?.ad} {c.kullanici?.soyad}</p>
                        <p className="text-xs text-gray-400">{c.kullanici?.ogrenci_no}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tc.color}`}>{tc.label}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">{c.aciklama ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(c.tarih).toLocaleDateString('tr-TR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

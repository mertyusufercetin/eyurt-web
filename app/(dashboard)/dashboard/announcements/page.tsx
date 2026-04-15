'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Plus, X, AlertTriangle, Users, GraduationCap, Shield, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Duyuru } from '@/lib/types';

export default function AnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const [duyurular, setDuyurular] = useState<Duyuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ baslik: '', icerik: '', hedef_kitle: 'herkes', onemli: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from('duyurular').select('*').order('created_at', { ascending: false });
    setDuyurular(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    await supabase.from('duyurular').insert({
      baslik: form.baslik,
      icerik: form.icerik,
      hedef_kitle: form.hedef_kitle,
      onemli: form.onemli,
      yayinlayan_id: currentUser.id,
    });
    setForm({ baslik: '', icerik: '', hedef_kitle: 'herkes', onemli: false });
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function handleDelete(id: string) {
    await supabase.from('duyurular').delete().eq('id', id);
    loadData();
  }

  if (currentUser?.rol !== 'mudur') {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p></div>;
  }

  const hedefConfig = (h: string) => {
    switch (h) {
      case 'ogrenci': return { label: 'Öğrenciler', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' };
      case 'memur': return { label: 'Görevliler', icon: Shield, color: 'text-purple-600 bg-purple-50' };
      default: return { label: 'Tüm Kullanıcılar', icon: Users, color: 'text-gray-600 bg-gray-50' };
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyurular</h1>
          <p className="text-gray-500 text-sm mt-1">Duyuru oluşturun ve yönetin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'İptal' : 'Yeni Duyuru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Başlık</label>
            <input type="text" required value={form.baslik} onChange={e => setForm({ ...form, baslik: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Duyuru başlığı" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">İçerik</label>
            <textarea required rows={4} value={form.icerik} onChange={e => setForm({ ...form, icerik: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="Duyuru içeriği" />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hedef Kitle</label>
              <select value={form.hedef_kitle} onChange={e => setForm({ ...form, hedef_kitle: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="herkes">Tüm Kullanıcılar</option>
                <option value="ogrenci">Öğrenciler</option>
                <option value="memur">Görevliler</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-4 cursor-pointer">
              <input type="checkbox" checked={form.onemli} onChange={e => setForm({ ...form, onemli: e.target.checked })}
                className="w-4 h-4 text-red-500 rounded border-gray-200 focus:ring-red-500" />
              <span className="text-sm text-gray-600">Önemli duyuru</span>
            </label>
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
            {saving ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {duyurular.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Megaphone size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Henüz duyuru bulunmuyor</p>
          </div>
        ) : duyurular.map((d) => {
          const hc = hedefConfig(d.hedef_kitle);
          const HedefIcon = hc.icon;
          return (
            <div key={d.id} className={`bg-white rounded-xl border p-5 ${d.onemli ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {d.onemli && <AlertTriangle size={14} className="text-red-500" />}
                    <h3 className="font-semibold text-gray-800 text-sm">{d.baslik}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${hc.color}`}>
                      <HedefIcon size={12} /> {hc.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{d.icerik}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(d.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BedDouble, CalendarClock, CreditCard, Wrench, UtensilsCrossed,
  WashingMachine, Bell, TrendingUp, Users, FileText, ClipboardList,
  CheckCircle2, Clock, Settings, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Izin, Odeme, OdaArizasi, Duyuru } from '@/lib/types';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  }

  switch (user?.rol) {
    case 'mudur':
      return <AdminOverview />;
    case 'memur':
      return <StaffOverview userId={user.id} />;
    case 'ogrenci':
    default:
      return <StudentOverview userId={user?.id ?? ''} />;
  }
}

/* ===================== ADMIN (MÜDÜR) OVERVIEW ===================== */
function AdminOverview() {
  const [stats, setStats] = useState<{
    toplamOgrenci: number; toplamOda: number; dolulukOrani: number;
    bekleyenBasvuru: number; bekleyenAriza: number; aylikGelir: number; bekleyenBorc: number;
  } | null>(null);
    const [sonBasvurular, setSonBasvurular] = useState<{ id: string; ad: string | null; soyad: string | null; durum: string | null; created_at: string }[]>([]);
  const [sonArizalar, setSonArizalar] = useState<{ id: string; baslik: string; durum: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ogrencilerRes, odalarRes, basvurularRes, arizalarRes, odemelerRes] = await Promise.all([
        supabase.from('kullanicilar').select('id', { count: 'exact', head: true }).eq('rol', 'ogrenci').eq('aktif', true),
        supabase.from('odalar').select('id, kapasite, dolu_kisi_sayisi, durum'),
        supabase.from('basvurular').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('oda_arizalari').select('id, baslik, durum, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('odemeler').select('id, tutar, durum, ay, yil'),
      ]);
      const odalar = odalarRes.data ?? [];
      const aktifOdalar = odalar.filter((o: { durum: string }) => o.durum === 'aktif');
      const toplamKapasite = aktifOdalar.reduce((s: number, o: { kapasite: number }) => s + o.kapasite, 0);
      const toplamDolu = aktifOdalar.reduce((s: number, o: { dolu_kisi_sayisi: number }) => s + o.dolu_kisi_sayisi, 0);
      const odemeler = odemelerRes.data ?? [];
      const bugunAy = new Date().getMonth() + 1;
      const bugunYil = new Date().getFullYear();
      const buAyOdemeler = odemeler.filter((o: { ay: number; yil: number }) => o.ay === bugunAy && o.yil === bugunYil);

      setStats({
        toplamOgrenci: ogrencilerRes.count ?? 0,
        toplamOda: odalar.length,
        dolulukOrani: toplamKapasite > 0 ? Math.round((toplamDolu / toplamKapasite) * 100) : 0,
        bekleyenBasvuru: (basvurularRes.data ?? []).filter((b: { durum: string | null }) => b.durum === 'beklemede').length,
        bekleyenAriza: (arizalarRes.data ?? []).filter((a: { durum: string }) => a.durum === 'beklemede').length,
        aylikGelir: buAyOdemeler.filter((o: { durum: string }) => o.durum === 'odendi').reduce((s: number, o: { tutar: number }) => s + Number(o.tutar), 0),
        bekleyenBorc: odemeler.filter((o: { durum: string }) => o.durum === 'odenmedi' || o.durum === 'gecikti').reduce((s: number, o: { tutar: number }) => s + Number(o.tutar), 0),
      });
      setSonBasvurular(basvurularRes.data ?? []);
      setSonArizalar(arizalarRes.data ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const durumRenk = (d: string) => {
    switch (d) {
      case 'onaylandi': case 'cozuldu': return 'bg-emerald-50 text-emerald-700';
      case 'beklemede': return 'bg-amber-50 text-amber-700';
      case 'reddedildi': case 'iptal': return 'bg-red-50 text-red-700';
      case 'isleme_alindi': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };
  const durumLabel = (d: string) => ({ beklemede: 'Beklemede', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi', iptal: 'İptal', cozuldu: 'Çözüldü', isleme_alindi: 'İşleme Alındı' }[d] ?? d);

  if (loading || !stats) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  const statCards = [
    { label: 'Toplam Öğrenci', value: stats.toplamOgrenci, icon: Users, color: 'text-blue-600 bg-blue-50', href: '/dashboard/students' },
    { label: 'Toplam Oda', value: stats.toplamOda, icon: BedDouble, color: 'text-violet-600 bg-violet-50', href: '/dashboard/rooms' },
    { label: 'Doluluk Oranı', value: `%${stats.dolulukOrani}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', href: '/dashboard/rooms' },
    { label: 'Bekleyen Başvuru', value: stats.bekleyenBasvuru, icon: FileText, color: 'text-amber-600 bg-amber-50', href: '/dashboard/applications' },
    { label: 'Açık Arıza', value: stats.bekleyenAriza, icon: Wrench, color: 'text-rose-600 bg-rose-50', href: '/dashboard/faults' },
    { label: 'Bu Ay Tahsilat', value: `${stats.aylikGelir.toLocaleString('tr-TR')} ₺`, icon: CreditCard, color: 'text-teal-600 bg-teal-50', href: '/dashboard/payments' },
    { label: 'Bekleyen Borç', value: `${stats.bekleyenBorc.toLocaleString('tr-TR')} ₺`, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50', href: '/dashboard/payments' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
        <p className="text-gray-500 text-sm mt-1">Yurt yönetim sistemi genel bakış</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => { const Icon = s.icon; return (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium text-gray-500">{s.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p></div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><Icon size={20} /></div>
            </div>
          </Link>
        ); })}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">Oda Doluluk Oranı</h3>
          <span className="text-sm font-bold text-gray-700">%{stats.dolulukOrani}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-500 ${stats.dolulukOrani > 90 ? 'bg-red-500' : stats.dolulukOrani > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${stats.dolulukOrani}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Son Başvurular</h3>
            <Link href="/dashboard/applications" className="text-xs text-red-500 hover:text-red-600 font-medium">Tümünü Gör →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {sonBasvurular.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">Başvuru yok</p> : sonBasvurular.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-800">{b.ad ?? '—'} {b.soyad ?? ''}</p><p className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString('tr-TR')}</p></div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${durumRenk(b.durum ?? 'beklemede')}`}>{durumLabel(b.durum ?? 'beklemede')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Son Arızalar</h3>
            <Link href="/dashboard/faults" className="text-xs text-red-500 hover:text-red-600 font-medium">Tümünü Gör →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {sonArizalar.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">Arıza yok</p> : sonArizalar.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-800">{a.baslik}</p><p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('tr-TR')}</p></div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${durumRenk(a.durum)}`}>{durumLabel(a.durum)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== STAFF (MEMUR/GÖREVLİ) OVERVIEW ===================== */
function StaffOverview({ userId }: { userId: string }) {
  const [odaArizalari, setOdaArizalari] = useState<OdaArizasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('oda_arizalari').select('*').order('created_at', { ascending: false });
      setOdaArizalari(data ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const durumConfig = (d: string) => {
    switch (d) {
      case 'cozuldu': return { label: 'Çözüldü', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' };
      case 'isleme_alindi': return { label: 'İşleme Alındı', icon: Settings, color: 'bg-blue-50 text-blue-700' };
      default: return { label: 'Beklemede', icon: Clock, color: 'bg-amber-50 text-amber-700' };
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  const bekleyen = odaArizalari.filter(a => a.durum === 'beklemede');
  const islemde = odaArizalari.filter(a => a.durum === 'isleme_alindi');
  const cozulen = odaArizalari.filter(a => a.durum === 'cozuldu');

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Görevli Paneli</h1>
        <p className="text-gray-500 text-sm mt-1">Görev ve arıza takip ekranı</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <p className="text-xs font-medium text-amber-600">Bekleyen Görevler</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{bekleyen.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-medium text-blue-600">İşleme Alınan</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{islemde.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <p className="text-xs font-medium text-emerald-600">Tamamlanan</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{cozulen.length}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Bekleyen Görevler</h3>
          <Link href="/dashboard/tasks" className="text-xs text-red-500 hover:text-red-600 font-medium">Tümünü Gör →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {bekleyen.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">Bekleyen görev yok</p> : bekleyen.slice(0, 5).map((a) => {
            const cfg = durumConfig(a.durum || 'beklemede');
            return (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.baslik}</p>
                  <p className="text-xs text-gray-400">{a.oda_id ? `Oda: ${a.oda_id}` : ''} · {new Date(a.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===================== STUDENT (ÖĞRENCİ) OVERVIEW ===================== */
function StudentOverview({ userId }: { userId: string }) {
  const [izinler, setIzinler] = useState<Izin[]>([]);
  const [odemeler, setOdemeler] = useState<Odeme[]>([]);
  const [arizalar, setArizalar] = useState<OdaArizasi[]>([]);
  const [duyurular, setDuyurular] = useState<Duyuru[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [izinRes, odemeRes, arizaRes] = await Promise.all([
        supabase.from('izinler').select('*').eq('kullanici_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('odemeler').select('*').eq('kullanici_id', userId).order('yil', { ascending: false }).limit(5),
        supabase.from('oda_arizalari').select('*').eq('bildiren_id', userId).order('created_at', { ascending: false }).limit(5),
      ]);
      setIzinler(izinRes.data ?? []);
      setOdemeler(odemeRes.data ?? []);
      setArizalar(arizaRes.data ?? []);

      const { data: duyuruData } = await supabase
        .from('duyurular')
        .select('*')
        .in('hedef_kitle', ['herkes', 'ogrenci'])
        .order('created_at', { ascending: false })
        .limit(3);
      setDuyurular(duyuruData ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const durumRenk = (d: string) => {
    switch (d) {
      case 'onaylandi': case 'odendi': case 'cozuldu': return 'bg-emerald-50 text-emerald-700';
      case 'beklemede': case 'isleme_alindi': return 'bg-amber-50 text-amber-700';
      case 'reddedildi': case 'gecikti': case 'odenmedi': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const durumLabel = (d: string) => {
    const map: Record<string, string> = {
      beklemede: 'Beklemede', onaylandi: 'Onaylandı', reddedildi: 'Reddedildi',
      odendi: 'Ödendi', odenmedi: 'Ödenmedi', gecikti: 'Gecikti',
      cozuldu: 'Çözüldü', isleme_alindi: 'İşleme Alındı',
    };
    return map[d] ?? d;
  };

  const quickLinks = [
    { href: '/dashboard/leave', label: 'İzin Talebi', icon: CalendarClock, color: 'from-blue-500 to-blue-600' },
    { href: '/dashboard/menu', label: 'Yemek Menüsü', icon: UtensilsCrossed, color: 'from-orange-500 to-orange-600' },
    { href: '/dashboard/laundry', label: 'Çamaşırhane', icon: WashingMachine, color: 'from-violet-500 to-violet-600' },
    { href: '/dashboard/faults', label: 'Arıza Bildir', icon: Wrench, color: 'from-rose-500 to-rose-600' },
  ];

  const stats = [
    { label: 'Aktif İzinler', value: izinler.filter(i => i.durum === 'beklemede').length, icon: CalendarClock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Bekleyen Ödemeler', value: odemeler.filter(o => o.durum !== 'odendi').length, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    { label: 'Açık Arızalar', value: arizalar.filter(a => a.durum !== 'cozuldu').length, icon: Wrench, color: 'text-rose-600 bg-rose-50' },
    { label: 'Duyurular', value: duyurular.length, icon: Bell, color: 'text-violet-600 bg-violet-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz</h1>
        <p className="text-gray-500 text-sm mt-1">Öğrenci panelinize genel bakış</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`bg-linear-to-br ${link.color} rounded-xl p-4 text-white hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
            >
              <Icon size={24} className="mb-2 opacity-80" />
              <span className="text-sm font-semibold">{link.label}</span>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son İzin Talepleri */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">İzin Taleplerim</h3>
            <CalendarClock size={16} className="text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {izinler.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz izin talebi yok</p>
            ) : izinler.map((i) => (
              <div key={i.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{new Date(i.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(i.bitis_tarihi).toLocaleDateString('tr-TR')}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{i.sebep ?? ''}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${durumRenk(i.durum ?? 'beklemede')}`}>
                  {durumLabel(i.durum ?? 'beklemede')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Duyurular */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Duyurular</h3>
            <Bell size={16} className="text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {duyurular.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Henüz duyuru yok</p>
            ) : duyurular.map((d) => (
              <div key={d.id} className="px-5 py-3">
                <div className="flex items-start gap-2">
                  {d.onemli && <span className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.baslik}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(d.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Son Ödemeler */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Son Ödemeler</h3>
            <CreditCard size={16} className="text-gray-400" />
          </div>
          <div className="divide-y divide-gray-50">
            {odemeler.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Ödeme kaydı yok</p>
            ) : odemeler.map((o) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.ay}/{o.yil}</p>
                  <p className="text-xs text-gray-400">{Number(o.tutar).toLocaleString('tr-TR')} ₺</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${durumRenk(o.durum)}`}>
                  {durumLabel(o.durum)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

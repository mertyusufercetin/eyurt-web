'use client';

import { useEffect, useState } from 'react';
import { WashingMachine, Wind, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Camasirhane } from '@/lib/types';

export default function LaundryPage() {
  const [makineler, setMakineler] = useState<Camasirhane[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('camasirhaneler').select('*').order('makine_no', { ascending: true });
      setMakineler(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const camasirlar = makineler.filter(m => m.tur === 'camasir');
  const kurutucular = makineler.filter(m => m.tur === 'kurutucu');

  const durumConfig = (d: string) => {
    switch (d) {
      case 'bos': return { label: 'Boş', icon: CheckCircle2, color: 'border-emerald-200 bg-emerald-50', iconColor: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' };
      case 'dolu': return { label: 'Kullanımda', icon: Loader2, color: 'border-blue-200 bg-blue-50', iconColor: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
      case 'arizali': return { label: 'Arızalı', icon: AlertTriangle, color: 'border-red-200 bg-red-50', iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700' };
      default: return { label: d, icon: CheckCircle2, color: 'border-gray-200 bg-gray-50', iconColor: 'text-gray-500', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const MakineCard = ({ makine }: { makine: Camasirhane }) => {
    const config = durumConfig(makine.durum);
    const StatusIcon = config.icon;
    return (
      <div className={`rounded-xl border-2 p-4 transition-all ${config.color}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {makine.tur === 'camasir' ? <WashingMachine size={20} className="text-gray-600" /> : <Wind size={20} className="text-gray-600" />}
            <span className="font-semibold text-gray-800 text-sm">{makine.makine_no}</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>{config.label}</span>
        </div>
        {makine.kat && <p className="text-xs text-gray-500 mb-1">Kat: {makine.kat}</p>}
        {makine.durum === 'dolu' && makine.kalan_sure && (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Loader2 size={12} className="animate-spin" />
              <span>Kalan: {makine.kalan_sure} dk</span>
            </div>
            <div className="mt-1.5 w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.max(10, 100 - (makine.kalan_sure / 60) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const bosCount = makineler.filter(m => m.durum === 'bos').length;
  const doluCount = makineler.filter(m => m.durum === 'dolu').length;
  const arizaliCount = makineler.filter(m => m.durum === 'arizali').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Çamaşırhane</h1>
        <p className="text-gray-500 text-sm mt-1">Makine durumlarını canlı takip edin</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{bosCount}</p>
          <p className="text-xs text-emerald-600 font-medium">Boş Makine</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{doluCount}</p>
          <p className="text-xs text-blue-600 font-medium">Kullanımda</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{arizaliCount}</p>
          <p className="text-xs text-red-600 font-medium">Arızalı</p>
        </div>
      </div>

      {/* Çamaşır Makineleri */}
      {camasirlar.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <WashingMachine size={16} /> Çamaşır Makineleri
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {camasirlar.map(m => <MakineCard key={m.id} makine={m} />)}
          </div>
        </div>
      )}

      {/* Kurutucular */}
      {kurutucular.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Wind size={16} /> Kurutucular
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {kurutucular.map(m => <MakineCard key={m.id} makine={m} />)}
          </div>
        </div>
      )}

      {makineler.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <WashingMachine size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Çamaşırhane verisi bulunamadı</p>
        </div>
      )}
    </div>
  );
}

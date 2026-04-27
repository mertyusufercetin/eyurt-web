'use client';

import { useEffect, useState } from 'react';
import { UtensilsCrossed, Coffee, Sun, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { YemekMenusu } from '@/lib/types';

const ogunConfig = {
  sabah: { label: 'Kahvaltı', icon: Coffee, color: 'from-amber-400 to-orange-500' },
  ogle: { label: 'Öğle Yemeği', icon: Sun, color: 'from-yellow-400 to-amber-500' },
  aksam: { label: 'Akşam Yemeği', icon: Moon, color: 'from-indigo-400 to-purple-500' },
};

export default function MenuPage() {
  const [menuler, setMenuler] = useState<YemekMenusu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];
      const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('yemek_menusu')
        .select('*')
        .gte('tarih', today)
        .lte('tarih', weekLater)
        .order('tarih', { ascending: true })
        .order('ogun', { ascending: true });
      setMenuler(data ?? []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group by date
  const grouped = menuler.reduce<Record<string, YemekMenusu[]>>((acc, m) => {
    const key = m.tarih;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const gunAdi = (tarih: string) => {
    const d = new Date(tarih);
    return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yemek Menüsü</h1>
        <p className="text-gray-500 text-sm mt-1">Bu haftanın yemek menüsü</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UtensilsCrossed size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Bu hafta için henüz menü eklenmemiş</p>
        </div>
      ) : (
        Object.entries(grouped).map(([tarih, ogunler]) => (
          <div key={tarih} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm capitalize">{gunAdi(tarih)}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {(['sabah', 'ogle', 'aksam'] as const).map((ogun) => {
                const menu = ogunler.find(o => o.ogun === ogun);
                const config = ogunConfig[ogun];
                const Icon = config.icon;
                return (
                  <div key={ogun} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{config.label}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {menu ? menu.menu_detay : <span className="text-gray-300 italic">Henüz eklenmedi</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

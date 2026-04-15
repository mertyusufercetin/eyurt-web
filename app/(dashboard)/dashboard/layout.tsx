'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, User, Users, BedDouble, CalendarClock, UtensilsCrossed,
  WashingMachine, CreditCard, Wrench, LogOut, Menu, X, Bell, Shield,
  FileText, Megaphone, AlertTriangle, ClipboardList, Briefcase
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuthProvider, useAuth } from '@/lib/auth';

type SidebarLink = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> };

const menuByRole: Record<string, SidebarLink[]> = {
  mudur: [
    { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/dashboard/students', label: 'Öğrenciler', icon: Users },
    { href: '/dashboard/rooms', label: 'Oda Yönetimi', icon: BedDouble },
    { href: '/dashboard/applications', label: 'Başvurular', icon: FileText },
    { href: '/dashboard/payments', label: 'Ödemeler', icon: CreditCard },
    { href: '/dashboard/leave', label: 'İzin Yönetimi', icon: CalendarClock },
    { href: '/dashboard/faults', label: 'Arıza Yönetimi', icon: Wrench },
    { href: '/dashboard/penalties', label: 'Cezalar', icon: AlertTriangle },
    { href: '/dashboard/announcements', label: 'Duyurular', icon: Megaphone },
  ],
  memur: [
    { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Görevlerim', icon: ClipboardList },
    { href: '/dashboard/faults', label: 'Arıza Talepleri', icon: Wrench },
    { href: '/dashboard/menu', label: 'Yemek Menüsü', icon: UtensilsCrossed },
    { href: '/dashboard/profile', label: 'Profilim', icon: User },
  ],
  ogrenci: [
    { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/dashboard/leave', label: 'İzin Taleplerim', icon: CalendarClock },
    { href: '/dashboard/menu', label: 'Yemek Menüsü', icon: UtensilsCrossed },
    { href: '/dashboard/laundry', label: 'Çamaşırhane', icon: WashingMachine },
    { href: '/dashboard/room', label: 'Oda Bilgisi', icon: BedDouble },
    { href: '/dashboard/payments', label: 'Ödemelerim', icon: CreditCard },
    { href: '/dashboard/faults', label: 'Arıza Bildirimi', icon: Wrench },
    { href: '/dashboard/profile', label: 'Profilim', icon: User },
  ],
};

const roleConfig = {
  mudur: {
    label: 'Yönetici Paneli', badge: Shield,
    sidebarBg: 'bg-slate-900', sidebarBorder: 'border-slate-700/50',
    textPrimary: 'text-white', textSecondary: 'text-slate-400',
    activeLink: 'bg-white/10 text-white', inactiveLink: 'text-slate-400 hover:bg-white/5 hover:text-white',
    activeIcon: 'text-red-400', avatarGradient: 'from-slate-700 to-slate-900',
    closeBtnText: 'text-slate-400 hover:text-white', logoutHover: 'hover:bg-white/5 hover:text-white',
  },
  memur: {
    label: 'Görevli Paneli', badge: Briefcase,
    sidebarBg: 'bg-indigo-900', sidebarBorder: 'border-indigo-700/50',
    textPrimary: 'text-white', textSecondary: 'text-indigo-300',
    activeLink: 'bg-white/10 text-white', inactiveLink: 'text-indigo-300 hover:bg-white/5 hover:text-white',
    activeIcon: 'text-amber-400', avatarGradient: 'from-indigo-700 to-indigo-900',
    closeBtnText: 'text-indigo-300 hover:text-white', logoutHover: 'hover:bg-white/5 hover:text-white',
  },
  ogrenci: {
    label: 'Öğrenci Paneli', badge: User,
    sidebarBg: 'bg-white', sidebarBorder: 'border-gray-100',
    textPrimary: 'text-gray-800', textSecondary: 'text-gray-400',
    activeLink: 'bg-red-50 text-red-600 shadow-sm', inactiveLink: 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
    activeIcon: 'text-red-500', avatarGradient: 'from-red-400 to-red-600',
    closeBtnText: 'text-gray-400 hover:text-gray-600', logoutHover: 'hover:bg-red-50 hover:text-red-600',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500" />
      </div>
    );
  }

  const rol = user?.rol ?? 'ogrenci';
  const links = menuByRole[rol] ?? menuByRole.ogrenci;
  const config = roleConfig[rol as keyof typeof roleConfig] ?? roleConfig.ogrenci;
  const BadgeIcon = config.badge;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${config.sidebarBg} ${rol === 'ogrenci' ? 'border-r border-gray-200' : ''} transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between px-5 py-4 border-b ${config.sidebarBorder}`}>
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/logomuzoriginal.jpg" alt="Logo" width={36} height={36} className="rounded-lg object-cover" />
              <div>
                <span className={`font-extrabold text-base ${config.textPrimary} block`} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  E-YURT
                </span>
                <span className={`text-[10px] ${config.textSecondary} font-medium flex items-center gap-1`}>
                  <BadgeIcon size={8} /> {config.label}
                </span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${config.closeBtnText}`}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive ? config.activeLink : config.inactiveLink
                  }`}>
                  <Icon size={18} className={isActive ? config.activeIcon : ''} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={`p-3 border-t ${config.sidebarBorder}`}>
            <button onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium ${config.textSecondary} ${config.logoutHover} transition-colors duration-200 cursor-pointer`}>
              <LogOut size={18} />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 h-14">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${config.avatarGradient} rounded-full flex items-center justify-center`}>
                  <User size={14} className="text-white" />
                </div>
                {user && (
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.ad} {user.soyad}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

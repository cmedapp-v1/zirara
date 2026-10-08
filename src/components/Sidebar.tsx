import React, { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  UserX,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  GraduationCap,
  Printer,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { CMEDLogo } from './CMEDLogo';

export type NavView =
  | 'dashboard'
  | 'appel'
  | 'beneficiaires'
  | 'absences'
  | 'retards'
  | 'presences'
  | 'infractions'
  | 'convocations'
  | 'planning'
  | 'filieres_classes'
  | 'animateurs'
  | 'feuille_appel_print'
  | 'stats'
  | 'parametres';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts: {
    beneficiaires: number;
    absencesToday: number;
    retardsToday: number;
    infractionsCount: number;
    convocationsPending: number;
  };
  currentUserRole?: 'ADMIN' | 'ANIMATEUR' | 'BENEFICIAIRE';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  counts,
  currentUserRole = 'ADMIN'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Exact sections requested by user in Arabic
  const allSections = [
    {
      title: 'الرئيسية',
      items: [
        {
          id: 'dashboard' as NavView,
          label: 'لوحة القيادة',
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      title: 'الحضور',
      items: [
        {
          id: 'appel' as NavView,
          label: 'نداء الحضور',
          icon: ClipboardCheck,
          badge: 'اليومي',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
        },
        {
          id: 'absences' as NavView,
          label: 'الغيابات',
          icon: UserX,
          badge: counts.absencesToday > 0 ? `${counts.absencesToday}` : null,
          badgeClass: 'bg-rose-500 text-white font-black'
        },
        {
          id: 'retards' as NavView,
          label: 'التأخرات',
          icon: Clock,
          badge: counts.retardsToday > 0 ? `${counts.retardsToday}` : null,
          badgeClass: 'bg-amber-500 text-slate-950 font-black'
        }
      ]
    },
    {
      title: 'التسيير',
      items: [
        {
          id: 'beneficiaires' as NavView,
          label: 'المستفيدون',
          icon: Users,
          badge: counts.beneficiaires > 0 ? `${counts.beneficiaires}` : null,
          badgeClass: 'bg-slate-700 text-slate-200 font-bold'
        },
        {
          id: 'filieres_classes' as NavView,
          label: 'الشعب والأقسام',
          icon: Layers,
          badge: null
        },
        {
          id: 'animateurs' as NavView,
          label: 'المنشطون والمدربون',
          icon: GraduationCap,
          badge: null
        },
        {
          id: 'planning' as NavView,
          label: 'استعمال الزمن',
          icon: Calendar,
          badge: null
        }
      ]
    },
    {
      title: 'المتابعة والانضباط',
      items: [
        {
          id: 'infractions' as NavView,
          label: 'المخالفات',
          icon: AlertTriangle,
          badge: counts.infractionsCount > 0 ? `${counts.infractionsCount}` : null,
          badgeClass: 'bg-purple-500/30 text-purple-200 border border-purple-500/40 font-bold'
        },
        {
          id: 'convocations' as NavView,
          label: 'الاستدعاءات',
          icon: FileText,
          badge: counts.convocationsPending > 0 ? `${counts.convocationsPending}` : null,
          badgeClass: 'bg-rose-600 text-white font-black animate-pulse'
        }
      ]
    },
    {
      title: 'التقارير والإحصائيات',
      items: [
        {
          id: 'stats' as NavView,
          label: 'الإحصائيات والتقارير',
          icon: BarChart3,
          badge: null
        },
        {
          id: 'feuille_appel_print' as NavView,
          label: 'أوراق النداء للطباعة',
          icon: Printer,
          badge: null
        }
      ]
    },
    {
      title: 'الإعدادات والنظام',
      items: [
        {
          id: 'parametres' as NavView,
          label: 'الإعدادات',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  const menuSections = currentUserRole === 'ANIMATEUR'
    ? allSections.filter((s) => s.title !== 'الإعدادات والنظام')
    : allSections;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-2xs lg:hidden font-arabic"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        dir="rtl"
        className={`fixed inset-y-0 right-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-72'
        } bg-[#0A192F] text-slate-200 flex flex-col border-l border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } no-print shadow-xl font-arabic`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between bg-[#071324]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white p-1 rounded-xl shrink-0 shadow-sm flex items-center justify-center">
              <CMEDLogo variant="emblem" className="w-8 h-8" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 text-right">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-400 truncate">
                  الهيئة المغربية للتربية والتنمية
                </div>
                <div className="text-xs font-black text-white leading-tight truncate">
                  مركز الفرصة الثانية الجيل الجديد
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  زرارة
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {/* Desktop collapse toggle button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
              title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white lg:hidden"
              title="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  {section.title}
                </div>
              )}
              {isCollapsed && <div className="border-t border-slate-800 my-2" />}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 tabular-nums ${
                          isActive ? 'bg-white/20 text-white' : item.badgeClass
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#071324] text-[11px] text-slate-400 text-right">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-black text-slate-200 text-[10px]">
                  نظام إداري رسمي معتمد
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">2025-2026</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="النظام نشط" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

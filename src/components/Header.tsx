import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  Calendar,
  Menu,
  Bell,
  Search,
  Settings,
  Users,
  ChevronDown,
  UserCheck,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ParametresCentre, CompteAdministratif, Beneficiaire, Convocation, Infraction } from '../types';
import { CMEDLogo } from './CMEDLogo';

interface HeaderProps {
  parametres: ParametresCentre;
  currentAdmin?: CompteAdministratif;
  comptesAdmin: CompteAdministratif[];
  onSwitchAdmin: (admin: CompteAdministratif) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  activeViewTitle: string;
  convocations: Convocation[];
  infractions: Infraction[];
  beneficiaires: Beneficiaire[];
  onSelectBeneficiaire: (benId: string) => void;
  onNavigateToView: (view: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  parametres,
  currentAdmin,
  comptesAdmin,
  onSwitchAdmin,
  onLogout,
  onToggleMobileMenu,
  activeViewTitle,
  convocations,
  infractions,
  beneficiaires,
  onSelectBeneficiaire,
  onNavigateToView
}) => {
  // Popover state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Today formatted in Arabic
  const todayFormatted = new Intl.DateTimeFormat('ar-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Alerts
  const pendingConvocations = convocations.filter(
    (c) => c.statut === 'En attente' || c.statut === 'Convoqué'
  );
  const graveInfractions = infractions.filter(
    (i) => (i.gravite === 'Grave' || i.gravite === 'Très grave') && i.statut === 'En cours'
  );
  const totalAlertsCount = pendingConvocations.length + graveInfractions.length;

  // Search results
  const searchResults = searchQuery.trim()
    ? beneficiaires
        .filter((b) => {
          const q = searchQuery.toLowerCase().trim();
          return (
            b.nomFr.toLowerCase().includes(q) ||
            b.prenomFr.toLowerCase().includes(q) ||
            b.nomAr.includes(q) ||
            b.prenomAr.includes(q) ||
            b.numeroMassar.toLowerCase().includes(q) ||
            b.numeroInscription.toLowerCase().includes(q) ||
            b.telephone.includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const activeAdminAccounts = comptesAdmin.filter((c) => c.statut === 'Actif');

  return (
    <header dir="rtl" className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-2xs no-print select-none font-arabic">
      <div className="h-full px-3 md:px-5 flex items-center justify-between gap-3">
        {/* Right Zone (RTL): Mobile toggle, Institutional Logo & Center title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -m-1 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden transition-colors"
            aria-label="القائمة الرئيسية"
            title="القائمة الرئيسية"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Official Emblem & Institution titles */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden sm:block shrink-0">
              <CMEDLogo variant="emblem" className="h-9 w-9 drop-shadow-2xs" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight text-right">
              <span className="text-xs md:text-sm font-black text-slate-900 truncate">
                {parametres.nomCentre || 'مركز الفرصة الثانية الجيل الجديد'}
              </span>
              <span className="text-[11px] font-bold text-blue-700 truncate">
                {parametres.nomSousTitre || 'زرارة'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Zone: Global Quick Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2 relative" ref={searchRef}>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث شامل عن مستفيد، رقم مسار، غياب، استدعاء..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full py-1.5 pr-9 pl-8 text-xs bg-slate-100 hover:bg-slate-150 focus:bg-white text-slate-900 rounded-xl border border-transparent focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 font-medium text-right"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 left-2 text-slate-400 hover:text-slate-600 p-1"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 right-0 text-right">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>نتائج البحث ({searchResults.length})</span>
                <span className="text-[10px] text-blue-600 font-bold">
                  انقر لفتح البطاقة الفردية
                </span>
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-semibold">
                  لا توجد نتائج مطابقة
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map((ben) => (
                    <button
                      key={ben.id}
                      onClick={() => {
                        onSelectBeneficiaire(ben.id);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-2.5 hover:bg-blue-50/70 flex items-center justify-between gap-3 text-right transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={ben.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ben.id}`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {ben.prenomAr} {ben.nomAr} — <span className="font-latin text-[11px] text-slate-600 font-semibold">{ben.prenomFr} {ben.nomFr}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-medium">
                            مسار: <span className="font-mono font-bold text-slate-700">{ben.numeroMassar}</span> · الهاتف: <span className="font-mono">{ben.telephone}</span>
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Left Zone (RTL): Actions, Date, Notifications, Administrator Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Current Date in Arabic */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100/80 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{todayFormatted}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              title="التنبيهات الإدارية"
              className={`relative p-2 rounded-xl border transition-colors ${
                totalAlertsCount > 0
                  ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              {totalAlertsCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {isNotifOpen && (
              <div className="absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 left-0 text-right">
                <div className="p-3 bg-[#0B2545] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">التنبيهات الإدارية</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-200 font-bold">
                    {totalAlertsCount} حالات جديدة
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {pendingConvocations.length === 0 && graveInfractions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                      <p className="font-bold text-slate-800">لا توجد تنبيهات عاجلة</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        جميع الاستدعاءات والمخالفات قيد المتابعة
                      </p>
                    </div>
                  ) : (
                    <>
                      {pendingConvocations.map((conv) => {
                        const ben = beneficiaires.find((b) => b.id === conv.beneficiaireId);
                        return (
                          <div
                            key={conv.id}
                            onClick={() => {
                              onNavigateToView('convocations');
                              setIsNotifOpen(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                استدعاء ولي الأمر
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">{conv.date}</span>
                            </div>
                            <p className="font-bold text-slate-900 mt-1">
                              {ben ? `${ben.prenomAr} ${ben.nomAr} (${ben.prenomFr} ${ben.nomFr})` : 'المستفيد'}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{conv.motif}</p>
                          </div>
                        );
                      })}
                      {graveInfractions.map((infr) => {
                        const ben = beneficiaires.find((b) => b.id === infr.beneficiaireId);
                        return (
                          <div
                            key={infr.id}
                            onClick={() => {
                              onNavigateToView('infractions');
                              setIsNotifOpen(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                مخالفة: {infr.gravite}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">{infr.date}</span>
                            </div>
                            <p className="font-bold text-slate-900 mt-1">
                              {ben ? `${ben.prenomAr} ${ben.nomAr}` : 'المستفيد'} — {infr.typeInfraction}
                            </p>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Shortcut */}
          <button
            onClick={() => onNavigateToView('parametres')}
            title="الإعدادات"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Administrator Profile & Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pr-2 pl-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-800 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentAdmin ? currentAdmin.prenom.charAt(0) : 'م'}
              </div>
              <div className="hidden sm:flex flex-col text-right leading-tight min-w-0 max-w-[130px]">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentAdmin ? `${currentAdmin.prenom} ${currentAdmin.nom}` : 'المسؤول'}
                </span>
                <span className="text-[10px] font-semibold text-blue-700 truncate">
                  {currentAdmin?.roleTitre || 'الإدارة'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 left-0 text-right">
                <div className="p-3 bg-[#0B2545] text-white">
                  <div className="flex items-center justify-between text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">
                    <span>👑 حساب المسؤول</span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {currentAdmin?.statut === 'Actif' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <p className="text-sm font-black text-white">
                    {currentAdmin?.prenom} {currentAdmin?.nom}
                  </p>
                  <p className="text-xs text-blue-200 font-medium">{currentAdmin?.roleTitre}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">@{currentAdmin?.identifiant}</p>
                </div>

                {/* Account Switcher */}
                <div className="p-2 border-b border-slate-100">
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      تبديل الحساب الإداري
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({activeAdminAccounts.length})
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 max-h-44 overflow-y-auto">
                    {activeAdminAccounts.map((acc) => {
                      const isCurrent = acc.id === currentAdmin?.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            onSwitchAdmin(acc);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-right transition-colors text-xs ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                              {acc.prenom.charAt(0)}
                            </div>
                            <div className="truncate text-right">
                              <p className="truncate text-xs font-bold">{acc.prenom} {acc.nom}</p>
                              <p className="text-[10px] text-slate-400 truncate">{acc.roleTitre}</p>
                            </div>
                          </div>
                          {isCurrent && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 bg-slate-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onNavigateToView('parametres');
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex-1 py-1.5 px-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-xl border border-slate-200 transition-colors text-center"
                  >
                    إدارة الحسابات
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="py-1.5 px-3 text-xs font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

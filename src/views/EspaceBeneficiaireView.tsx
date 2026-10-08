import React, { useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  GraduationCap,
  Layers,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  EnregistrementPresence,
  Convocation,
  ParametresCentre,
  CompteAdministratif
} from '../types';
import { CMEDLogo } from '../components/CMEDLogo';
import { formatNiveauAr, formatSexeAr } from '../utils/arabicLabels';

interface EspaceBeneficiaireViewProps {
  beneficiaire: Beneficiaire;
  filiere?: Filiere;
  classe?: Classe;
  presences: EnregistrementPresence[];
  convocations: Convocation[];
  parametres: ParametresCentre;
  currentUser: CompteAdministratif;
  onLogout: () => void;
}

export const EspaceBeneficiaireView: React.FC<EspaceBeneficiaireViewProps> = ({
  beneficiaire,
  filiere,
  classe,
  presences,
  convocations,
  parametres,
  currentUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'absences' | 'retards' | 'convocations'>('absences');

  // Filter only records belonging to this beneficiary
  const myPresences = presences.filter((p) => p.beneficiaireId === beneficiaire.id);
  const myAbsences = myPresences.filter((p) => p.statut === 'Absent');
  const myRetards = myPresences.filter((p) => p.statut === 'Retard');
  const myConvocations = convocations.filter((c) => c.beneficiaireId === beneficiaire.id);

  const totalSessions = myPresences.length;
  const presentsCount = myPresences.filter((p) => p.statut === 'Présent').length;
  const tauxPresence = totalSessions > 0 ? Math.round((presentsCount / totalSessions) * 100) : 100;
  const totalRetardMinutes = myRetards.reduce((acc, r) => acc + (r.dureeRetardMinutes || 0), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-arabic text-slate-900 pb-12 select-none">
      {/* Top Navigation Bar dedicated to Beneficiary */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CMEDLogo variant="emblem" className="w-9 h-9 shrink-0 drop-shadow-2xs" />
            <div className="text-right">
              <h1 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                {parametres.nomCentre} {parametres.nomSousTitre}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>مساحتي الخاصة · Espace Bénéficiaire</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black text-slate-800">
                {beneficiaire.prenomAr} {beneficiaire.nomAr}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {beneficiaire.numeroMassar}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Profile Card Banner */}
        <div className="bg-gradient-to-l from-[#0B2545] via-[#103A68] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/60">
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Student Photo */}
            <div className="relative shrink-0">
              <img
                src={beneficiaire.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${beneficiaire.numeroMassar}`}
                alt={`${beneficiaire.prenomAr} ${beneficiaire.nomAr}`}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white/20 shadow-lg bg-white"
              />
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                مستمر
              </span>
            </div>

            {/* Student Identity Information */}
            <div className="flex-1 text-center sm:text-right space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-blue-200 text-xs font-bold">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>ملف المستفيد الشخصي</span>
                <span>·</span>
                <span className="font-mono">{beneficiaire.anneeScolaire}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {beneficiaire.prenomAr} {beneficiaire.nomAr}
              </h2>
              <p className="text-xs text-blue-200 font-latin font-semibold">
                {beneficiaire.prenomFr} {beneficiaire.nomFr}
              </p>

              {/* Badges Grid */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="px-3 py-1 bg-white/10 rounded-xl font-bold border border-white/15">
                  مسار: <strong className="font-mono text-amber-300">{beneficiaire.numeroMassar}</strong>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl font-bold border border-white/15">
                  رقم التسجيل: <strong className="font-mono text-blue-200">{beneficiaire.numeroInscription}</strong>
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-xl font-bold border border-white/15">
                  المستوى: <strong>{formatNiveauAr(beneficiaire.niveauScolaire)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold block text-[10px]">الشعبة / الحرفة:</span>
            <span className="font-black text-slate-900 mt-0.5 block">{filiere?.nom || 'غير محدد'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px]">القسم / الفوج:</span>
            <span className="font-black text-slate-900 mt-0.5 block">{classe?.nom || 'غير محدد'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px]">تاريخ ومكان الازدياد:</span>
            <span className="font-black text-slate-900 mt-0.5 block">
              <span className="font-mono">{beneficiaire.dateNaissance}</span> ({beneficiaire.lieuNaissance || 'زرارة'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block text-[10px]">الجنس:</span>
            <span className="font-black text-slate-900 mt-0.5 block">{formatSexeAr(beneficiaire.sexe)}</span>
          </div>
        </div>

        {/* Attendance & Discipline KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Absences Card */}
          <div
            onClick={() => setActiveTab('absences')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'absences'
                ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">مجموع الغيابات</span>
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
              {myAbsences.length}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              منها {myAbsences.filter((a) => a.justifie).length} مبررة و {myAbsences.filter((a) => !a.justifie).length} غير مبررة
            </p>
          </div>

          {/* Retards Card */}
          <div
            onClick={() => setActiveTab('retards')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'retards'
                ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">مجموع التأخرات</span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 mt-2 font-mono">
              {myRetards.length}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              مجموع دقائق التأخر: {totalRetardMinutes} دقيقة
            </p>
          </div>

          {/* Convocations Card */}
          <div
            onClick={() => setActiveTab('convocations')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'convocations'
                ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700">الاستدعاءات الرسمية</span>
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700 mt-2 font-mono">
              {myConvocations.length}
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              استدعاءات أولياء الأمور الموجهة إليك
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('absences')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'absences'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            سجل الغيابات ({myAbsences.length})
          </button>
          <button
            onClick={() => setActiveTab('retards')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'retards'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            سجل التأخرات ({myRetards.length})
          </button>
          <button
            onClick={() => setActiveTab('convocations')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'convocations'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            الاستدعاءات الرسمية ({myConvocations.length})
          </button>
        </div>

        {/* Tab 1: Absences List */}
        {activeTab === 'absences' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>تفاصيل الغيابات المسجلة في حقك</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                نسبة الحضور الإجمالية: <strong className="text-blue-700 font-mono">{tauxPresence}%</strong>
              </span>
            </div>

            {myAbsences.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-black text-slate-800 text-sm">ممتاز! ليس لديك أي غياب مسجل.</p>
                <p className="text-xs text-slate-400 mt-1">واصل مواظبتك وانضباطك بالتكوين.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 text-slate-700 text-[11px] font-black border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">الساعة</th>
                      <th className="py-2.5 px-3">الحصة / المادة</th>
                      <th className="py-2.5 px-3 text-center">التبرير</th>
                      <th className="py-2.5 px-3">السبب / الملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAbsences.map((abs) => (
                      <tr key={abs.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{abs.date}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{abs.heure}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{abs.seanceMatiere || 'حصة تكوينية'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {abs.justifie ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              مبرر
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              غير مبرر
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{abs.motif || abs.observation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Retards List */}
        {activeTab === 'retards' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>تفاصيل التأخرات المسجلة في حقك</span>
              </h3>
            </div>

            {myRetards.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-black text-slate-800 text-sm">ممتاز! ليس لديك أي تأخر مسجل.</p>
                <p className="text-xs text-slate-400 mt-1">حضورك في الوقت المحدد يعكس التزامك.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-50 text-slate-700 text-[11px] font-black border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">الساعة</th>
                      <th className="py-2.5 px-3">الحصة / المادة</th>
                      <th className="py-2.5 px-3 text-center">مدة التأخر</th>
                      <th className="py-2.5 px-3">السبب / الملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRetards.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ret.date}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{ret.heure}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{ret.seanceMatiere || 'حصة تكوينية'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 font-mono">
                            +{ret.dureeRetardMinutes || 15} دقيقة
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{ret.motif || ret.observation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Convocations List */}
        {activeTab === 'convocations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>الاستدعاءات الإدارية الموجهة لولي أمرك</span>
              </h3>
            </div>

            {myConvocations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="font-black text-slate-800 text-sm">لا توجد أي استدعاءات إدارية مسجلة.</p>
                <p className="text-xs text-slate-400 mt-1">سجلك الإداري سليم.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {myConvocations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 text-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-purple-100 pb-2">
                      <div className="font-black text-slate-900 text-sm">
                        الموضوع: {conv.motif}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900 w-fit">
                        الحالة: {conv.statut}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">تاريخ الموعد:</span>
                        <span className="font-mono font-bold text-slate-900">{conv.date} على الساعة {conv.heure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">المعني بالاستدعاء:</span>
                        <span className="font-bold text-slate-900">{conv.personneConcernee}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">ملاحظة الإدارة:</span>
                        <span>{conv.observation || 'يرجى الالتزام بالموعد المحدد.'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

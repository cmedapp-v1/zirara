import React from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Layers,
  Building,
  Calendar,
  Printer,
  ClipboardCheck,
  ChevronLeft,
  ArrowLeft
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  EnregistrementPresence,
  Infraction,
  Convocation,
  SeancePlanning,
  ParametresCentre
} from '../types';
import { NavView } from '../components/Sidebar';
import { CMEDLogo } from '../components/CMEDLogo';

interface DashboardViewProps {
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  presences: EnregistrementPresence[];
  infractions: Infraction[];
  convocations: Convocation[];
  planning: SeancePlanning[];
  parametres: ParametresCentre;
  onNavigate: (view: NavView) => void;
  onSelectBeneficiaire?: (benId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  beneficiaires,
  filieres,
  classes,
  presences,
  infractions,
  convocations,
  planning,
  parametres,
  onNavigate,
  onSelectBeneficiaire
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily attendance numbers
  const presencesToday = presences.filter((p) => p.date === todayStr);
  const presentsTodayCount = presencesToday.filter((p) => p.statut === 'Présent').length;
  const absentsTodayCount = presencesToday.filter((p) => p.statut === 'Absent').length;
  const retardsTodayCount = presencesToday.filter((p) => p.statut === 'Retard').length;

  const totalAppelToday = presentsTodayCount + absentsTodayCount + retardsTodayCount;
  const tauxPresence = totalAppelToday > 0 ? Math.round((presentsTodayCount / totalAppelToday) * 100) : 100;

  const infractionsGravesCount = infractions.filter(
    (i) => i.gravite === 'Grave' || i.gravite === 'Très grave'
  ).length;

  const convocationsEnAttente = convocations.filter(
    (c) => c.statut === 'En attente' || c.statut === 'Convoqué'
  ).length;

  // Absences by filière
  const absencesByFiliere = filieres.map((f) => {
    const absCount = presences.filter(
      (p) => p.filiereId === f.id && p.statut === 'Absent'
    ).length;
    const benCount = beneficiaires.filter((b) => b.filiereId === f.id).length;
    return {
      filiere: f,
      absCount,
      benCount
    };
  });

  // Absences by classe
  const absencesByClasse = classes.map((c) => {
    const absCount = presences.filter(
      (p) => p.classeId === c.id && p.statut === 'Absent'
    ).length;
    const benCount = beneficiaires.filter((b) => b.classeId === c.id).length;
    return {
      classe: c,
      absCount,
      benCount
    };
  });

  // Severity count
  const gravitesCount = {
    Faible: infractions.filter((i) => i.gravite === 'Faible').length,
    Moyenne: infractions.filter((i) => i.gravite === 'Moyenne').length,
    Grave: infractions.filter((i) => i.gravite === 'Grave').length,
    'Très grave': infractions.filter((i) => i.gravite === 'Très grave').length
  };

  // Last 7 days in Arabic
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('ar-MA', {
      weekday: 'short'
    }).format(d);
    const count = presences.filter((p) => p.date === ds && p.statut === 'Absent').length;
    const retCount = presences.filter((p) => p.date === ds && p.statut === 'Retard').length;
    return { date: ds, dayName, count, retCount };
  });

  const maxAbsDay = Math.max(...last7Days.map((d) => d.count), 4);

  return (
    <div dir="rtl" className="space-y-6 animate-in fade-in duration-300 font-arabic text-right">
      {/* 1. Official Header Banner */}
      <div className="bg-gradient-to-l from-[#0B2545] via-[#103A68] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-blue-900/60">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shrink-0 shadow-md">
              <CMEDLogo variant="emblem" className="h-12 w-12" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-widest">
                <span>المملكة المغربية</span>
                <span>·</span>
                <span>الهيئة المغربية للتربية والتنمية</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white">
                {parametres.nomCentre || 'مركز الفرصة الثانية الجيل الجديد'}
              </h1>
              <p className="text-sm text-blue-100 font-bold mt-0.5">
                {parametres.nomSousTitre || 'زرارة'} · <span className="text-blue-200 font-normal">لوحة القيادة الإدارية</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('appel')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>تسجيل الحضور</span>
            </button>
            <button
              onClick={() => onNavigate('feuille_appel_print')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-200" />
              <span>أوراق النداء للطباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistical KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              المؤشرات اليومية الرئيسية
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            السنة الدراسية: <strong className="text-slate-800 font-mono">{parametres.anneeScolaireActive}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* مجموع المستفيدين */}
          <div
            onClick={() => onNavigate('beneficiaires')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 group-hover:text-blue-700 transition-colors">
                مجموع المستفيدين
              </span>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900 tabular-nums">
              {beneficiaires.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 font-semibold truncate">
              {filieres.length} شعب · {classes.length} أقسام
            </p>
          </div>

          {/* الحاضرون اليوم */}
          <div
            onClick={() => onNavigate('appel')}
            className="p-4 bg-white rounded-2xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700">
                الحاضرون اليوم
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-emerald-600 tabular-nums">
              {presentsTodayCount}
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <span>نسبة الحضور: {tauxPresence}%</span>
            </p>
          </div>

          {/* الغائبون اليوم */}
          <div
            onClick={() => onNavigate('absences')}
            className="p-4 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-700">
                الغائبون اليوم
              </span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100 transition-colors">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-rose-600 tabular-nums">
              {absentsTodayCount}
            </div>
            <p className="mt-1 text-[11px] text-rose-700 font-semibold truncate">
              {absentsTodayCount > 0 ? 'يتطلب المتابعة والاتصال' : 'لا يوجد غياب مسجل'}
            </p>
          </div>

          {/* المتأخرون اليوم */}
          <div
            onClick={() => onNavigate('retards')}
            className="p-4 bg-white rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-700">
                المتأخرون اليوم
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-amber-600 tabular-nums">
              {retardsTodayCount}
            </div>
            <p className="mt-1 text-[11px] text-amber-700 font-semibold truncate">
              حالات التأخر بالحصص
            </p>
          </div>

          {/* المخالفات */}
          <div
            onClick={() => onNavigate('infractions')}
            className="p-4 bg-white rounded-2xl border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-700">
                المخالفات
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-purple-700 tabular-nums">
              {infractions.length}
            </div>
            <p className="mt-1 text-[11px] text-purple-700 font-bold truncate">
              {infractionsGravesCount} مخالفات خطيرة
            </p>
          </div>

          {/* الاستدعاءات */}
          <div
            onClick={() => onNavigate('convocations')}
            className="p-4 bg-white rounded-2xl border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-700">
                الاستدعاءات
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-3xl font-black text-blue-800 tabular-nums">
              {convocations.length}
            </div>
            <p className="mt-1 text-[11px] text-blue-700 font-bold truncate">
              {convocationsEnAttente} قيد الانتظار
            </p>
          </div>
        </div>
      </div>

      {/* 3. Charts and breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend: 7 Days */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                تطور الغياب والتأخر (آخر 7 أيام)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                تتبع يومي للمواظبة والانضباط داخل المركز
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                الغياب
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                التأخر
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 items-end h-44 pt-4 pb-2 px-2 border-b border-slate-100">
            {last7Days.map((d, i) => {
              const absHeight = Math.round((d.count / maxAbsDay) * 100);
              const retHeight = Math.round((d.retCount / maxAbsDay) * 100);
              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex justify-center items-end gap-1 h-32">
                    <div
                      style={{ height: `${Math.max(absHeight, 4)}%` }}
                      className="w-4 bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all relative group/bar flex items-center justify-center"
                    >
                      {d.count > 0 && (
                        <span className="absolute -top-6 text-[10px] font-black text-rose-700 bg-rose-50 px-1 rounded-sm opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {d.count}
                        </span>
                      )}
                    </div>
                    <div
                      style={{ height: `${Math.max(retHeight, 4)}%` }}
                      className="w-3 bg-amber-400 hover:bg-amber-500 rounded-t-md transition-all relative group/bar flex items-center justify-center"
                    >
                      {d.retCount > 0 && (
                        <span className="absolute -top-6 text-[10px] font-black text-amber-700 bg-amber-50 px-1 rounded-sm opacity-0 group-hover/bar:opacity-100 transition-opacity">
                          {d.retCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-slate-600 capitalize">
                    {d.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {d.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>
              إجمالي حالات الغياب المسجلة هذا الأسبوع :{' '}
              <strong className="text-slate-900 font-bold">
                {last7Days.reduce((acc, c) => acc + c.count, 0)} حالة
              </strong>
            </span>
            <button
              onClick={() => onNavigate('absences')}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>معاينة تفاصيل الغيابات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Severity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                الانضباط والمخالفات
              </h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {infractions.length} إجمالي
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">مخالفات طفيفة</span>
                  <span className="text-slate-800">{gravitesCount.Faible}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(gravitesCount.Faible / (infractions.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">مخالفات متوسطة</span>
                  <span className="text-amber-600">{gravitesCount.Moyenne}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(gravitesCount.Moyenne / (infractions.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">مخالفات خطيرة</span>
                  <span className="text-rose-600">{gravitesCount.Grave}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${(gravitesCount.Grave / (infractions.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-600">مخالفات خطيرة جداً</span>
                  <span className="text-rose-800">{gravitesCount['Très grave']}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-800 rounded-full"
                    style={{
                      width: `${(gravitesCount['Très grave'] / (infractions.length || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('infractions')}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl transition-colors text-center"
            >
              عرض سجل المخالفات
            </button>
          </div>
        </div>
      </div>

      {/* 4. Filières and Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filières */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                الغياب والمستفيدون حسب الشعب
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {filieres.length} شعب تكوينية معتمدة
              </p>
            </div>
            <button
              onClick={() => onNavigate('filieres_classes')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              إدارة الشعب
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {absencesByFiliere.map(({ filiere, absCount, benCount }) => (
              <div
                key={filiere.id}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <div className="text-slate-900 flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md">
                      {filiere.code}
                    </span>
                    <span className="truncate">{filiere.nom}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <span className="text-slate-600">
                      {benCount} مستفيد
                    </span>
                    <span className="font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                      {absCount} غياب
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.min((benCount / (beneficiaires.length || 1)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                الغياب والمستفيدون حسب الأقسام
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                {classes.length} أقسام دراسية
              </p>
            </div>
            <button
              onClick={() => onNavigate('filieres_classes')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              إدارة الأقسام
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {absencesByClasse.map(({ classe, absCount, benCount }) => (
              <div
                key={classe.id}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <div className="text-slate-900 flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-md">
                      {classe.code}
                    </span>
                    <span className="truncate">{classe.nom}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <span className="text-slate-600">
                      {benCount} مستفيد
                    </span>
                    <span className="font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                      {absCount} غياب
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${Math.min((benCount / (beneficiaires.length || 1)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

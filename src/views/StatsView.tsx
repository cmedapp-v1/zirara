import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  Users,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  EnregistrementPresence,
  Infraction,
  Convocation,
  ParametresCentre
} from '../types';
import { excelUtils } from '../utils/excel';

interface StatsViewProps {
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  presences: EnregistrementPresence[];
  infractions: Infraction[];
  convocations: Convocation[];
  parametres: ParametresCentre;
}

export const StatsView: React.FC<StatsViewProps> = ({
  beneficiaires,
  filieres,
  classes,
  presences,
  parametres
}) => {
  const [selectedFiliere, setSelectedFiliere] = useState<string>('all');
  const [dateDebut, setDateDebut] = useState<string>('2025-09-01');
  const [dateFin, setDateFin] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filtered presences
  const filteredPresences = presences.filter((p) => {
    if (selectedFiliere !== 'all' && p.filiereId !== selectedFiliere) return false;
    if (dateDebut && p.date < dateDebut) return false;
    if (dateFin && p.date > dateFin) return false;
    return true;
  });

  const totalPresences = filteredPresences.length;
  const presentsCount = filteredPresences.filter((p) => p.statut === 'Présent').length;
  const absentsCount = filteredPresences.filter((p) => p.statut === 'Absent').length;
  const retardsCount = filteredPresences.filter((p) => p.statut === 'Retard').length;

  const globalRate = totalPresences > 0 ? Math.round((presentsCount / totalPresences) * 100) : 100;

  // Breakdown by filière
  const filiereStats = filieres.map((f) => {
    const fPres = presences.filter((p) => p.filiereId === f.id);
    const fTotal = fPres.length;
    const fPresents = fPres.filter((p) => p.statut === 'Présent').length;
    const fAbsents = fPres.filter((p) => p.statut === 'Absent').length;
    const fRetards = fPres.filter((p) => p.statut === 'Retard').length;
    const fRate = fTotal > 0 ? Math.round((fPresents / fTotal) * 100) : 100;
    const countBens = beneficiaires.filter((b) => b.filiereId === f.id).length;

    return {
      filiere: f,
      total: fTotal,
      presents: fPresents,
      absents: fAbsents,
      retards: fRetards,
      rate: fRate,
      beneficiairesCount: countBens
    };
  });

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>التقارير والإحصائيات الرسمية</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            التقرير الشامل للمواظبة والانضباط
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · السنة الدراسية {parametres.anneeScolaireActive}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
          <button
            onClick={() => excelUtils.exportPresences(presences, beneficiaires, filieres, classes, [])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-bold">الشعبة:</span>
          <select
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:border-blue-500 font-bold"
          >
            <option value="all">جميع الشعب</option>
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 font-bold">من تاريخ:</span>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono font-bold"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold">إلى تاريخ:</span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono font-bold"
          />
        </div>
      </div>

      {/* 3. Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>مجموع الحصص المسجلة</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">{totalPresences}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
            <span>نسبة المواظبة العامة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">{globalRate}%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-700 font-bold mb-1">
            <span>مجموع الغيابات</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">{absentsCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold mb-1">
            <span>مجموع التأخرات</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">{retardsCount}</div>
        </div>
      </div>

      {/* 4. Comparison Table by Filière */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            جدول المقارنة ونسب الحضور حسب الشعب
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {filiereStats.length} شعب تكوينية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100/70 text-slate-700 font-black uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">الشعبة</th>
                <th className="py-3 px-4 text-center">المستفيدون</th>
                <th className="py-3 px-4 text-center">حضور</th>
                <th className="py-3 px-4 text-center">غياب</th>
                <th className="py-3 px-4 text-center">تأخر</th>
                <th className="py-3 px-4 text-center">نسبة المواظبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filiereStats.map((item) => (
                <tr key={item.filiere.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-sm ml-2 text-slate-700">
                      {item.filiere.code}
                    </span>
                    {item.filiere.nom}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {item.beneficiairesCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-black">
                    {item.presents}
                  </td>
                  <td className="py-3.5 px-4 text-center text-rose-600 font-black">
                    {item.absents}
                  </td>
                  <td className="py-3.5 px-4 text-center text-amber-600 font-black">
                    {item.retards}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                        item.rate >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.rate >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

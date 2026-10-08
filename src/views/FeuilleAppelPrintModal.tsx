import React, { useState } from 'react';
import { X, Printer, Calendar } from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  ParametresCentre
} from '../types';
import { CMEDLogo } from '../components/CMEDLogo';

interface FeuilleAppelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  filiere?: Filiere;
  classe?: Classe;
  seance: string;
  animateur?: Animateur;
  beneficiaires: Beneficiaire[];
  attendanceRows?: {
    beneficiaire: Beneficiaire;
    statut: 'Présent' | 'Absent' | 'Retard';
    observation: string;
  }[];
  parametres: ParametresCentre;
}

export const FeuilleAppelPrintModal: React.FC<FeuilleAppelPrintModalProps> = ({
  isOpen,
  onClose,
  date,
  filiere,
  classe,
  seance,
  animateur,
  beneficiaires,
  attendanceRows,
  parametres
}) => {
  const [sheetType, setSheetType] = useState<'journaliere' | 'hebdomadaire'>('journaliere');
  const [fillStatus, setFillStatus] = useState<boolean>(true);

  if (!isOpen) return null;

  const statusMap = new Map(
    (attendanceRows || []).map((r) => [r.beneficiaire.id, r])
  );

  const daysOfWeekAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 font-arabic text-right"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-800">
              نوع ورقة النداء :
            </span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSheetType('journaliere')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                  sheetType === 'journaliere'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ورقة يومية
              </button>
              <button
                type="button"
                onClick={() => setSheetType('hebdomadaire')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                  sheetType === 'hebdomadaire'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ورقة أسبوعية
              </button>
            </div>

            {sheetType === 'journaliere' && (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer mr-3">
                <input
                  type="checkbox"
                  checked={fillStatus}
                  onChange={(e) => setFillStatus(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
                <span>تضمين الحالات المسجلة مسبقاً</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة النداء</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 bg-white">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-black">المملكة المغربية</div>
              <div className="text-[11px] font-bold text-slate-700">وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
              <div className="text-[11px] font-bold text-slate-700">الهيئة المغربية للتربية والتنمية (CMED)</div>
              <div className="text-xs font-black text-blue-900 mt-1">
                {parametres.nomCentre} {parametres.nomSousTitre}
              </div>
            </div>

            <div className="p-1 bg-white border border-slate-300 rounded-xl shrink-0">
              <CMEDLogo variant="emblem" className="w-14 h-14" />
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-black underline underline-offset-8 text-slate-900">
              {sheetType === 'journaliere'
                ? 'ورقة مناداة الحضور اليومية'
                : 'ورقة تتبع الحضور والغياب الأسبوعية'}
            </h1>
            <p className="text-xs text-slate-600 font-bold mt-2">
              السنة الدراسية والتكوينية : <span className="font-mono">{parametres.anneeScolaireActive}</span>
            </p>
          </div>

          {/* Session Metadata Grid */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl mb-6 text-xs font-bold grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px]">التاريخ :</span>
              <span className="font-mono text-slate-900">{date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">الشعبة التكوينية :</span>
              <span className="text-slate-900">{filiere?.nom || 'جميع الشعب'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">القسم / الفوج :</span>
              <span className="text-slate-900">{classe?.nom || 'جميع الأقسام'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">المؤطر / المدرب :</span>
              <span className="text-slate-900">
                {animateur ? `${animateur.prenom} ${animateur.nom}` : 'مؤطر الحصة'}
              </span>
            </div>
          </div>

          {/* Mode 1: Daily Table */}
          {sheetType === 'journaliere' && (
            <table className="w-full text-xs border border-slate-400 border-collapse mb-8">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-black text-[11px]">
                  <th className="py-2.5 px-2 border-l border-slate-400 text-center w-10">الرقم</th>
                  <th className="py-2.5 px-3 border-l border-slate-400 w-28">رقم مسار</th>
                  <th className="py-2.5 px-3 border-l border-slate-400">الاسم والنسب (المستفيد)</th>
                  <th className="py-2.5 px-3 border-l border-slate-400 text-center w-28">حالة الحضور</th>
                  <th className="py-2.5 px-3 border-l border-slate-400 text-center w-28">توقيع المستفيد</th>
                  <th className="py-2.5 px-3">ملاحظات المؤطر</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaires.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      لا يوجد مستفيدون مسجلون في هذا القسم
                    </td>
                  </tr>
                ) : (
                  beneficiaires.map((ben, idx) => {
                    const rowState = statusMap.get(ben.id);
                    return (
                      <tr key={ben.id} className="border-b border-slate-300">
                        <td className="py-2.5 px-2 border-l border-slate-300 text-center font-mono font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-l border-slate-300 font-mono font-black text-slate-800">
                          {ben.numeroMassar}
                        </td>
                        <td className="py-2.5 px-3 border-l border-slate-300 font-black text-slate-900">
                          {ben.prenomAr} {ben.nomAr}
                        </td>
                        <td className="py-2.5 px-3 border-l border-slate-300 text-center font-bold">
                          {fillStatus && rowState ? (
                            rowState.statut === 'Présent' ? (
                              <span className="text-emerald-700">🟢 حاضر</span>
                            ) : rowState.statut === 'Absent' ? (
                              <span className="text-rose-700">🔴 غائب</span>
                            ) : (
                              <span className="text-amber-700">🟠 متأخر</span>
                            )
                          ) : (
                            <div className="h-5 border-b border-dotted border-slate-300 w-16 mx-auto" />
                          )}
                        </td>
                        <td className="py-2.5 px-3 border-l border-slate-300">
                          <div className="h-6" />
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {fillStatus && rowState?.observation ? rowState.observation : ''}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Mode 2: Weekly Table */}
          {sheetType === 'hebdomadaire' && (
            <table className="w-full text-[11px] border border-slate-400 border-collapse mb-8">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-black">
                  <th className="py-2 px-1 border-l border-slate-400 text-center w-8">ر.ت</th>
                  <th className="py-2 px-2 border-l border-slate-400 w-24">رقم مسار</th>
                  <th className="py-2 px-2 border-l border-slate-400">الاسم والنسب</th>
                  {daysOfWeekAr.map((d) => (
                    <th key={d} className="py-2 px-1 border-l border-slate-400 text-center w-14">
                      {d}
                    </th>
                  ))}
                  <th className="py-2 px-1 text-center w-14">مجموع الغياب</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaires.map((ben, idx) => (
                  <tr key={ben.id} className="border-b border-slate-300">
                    <td className="py-2 px-1 border-l border-slate-300 text-center font-mono font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 border-l border-slate-300 font-mono font-bold">
                      {ben.numeroMassar}
                    </td>
                    <td className="py-2 px-2 border-l border-slate-300 font-black">
                      {ben.prenomAr} {ben.nomAr}
                    </td>
                    {daysOfWeekAr.map((d) => (
                      <td key={d} className="py-2 px-1 border-l border-slate-300 text-center">
                        <div className="h-5" />
                      </td>
                    ))}
                    <td className="py-2 px-1 text-center font-mono font-bold" />
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Signatures & Stamps */}
          <div className="pt-6 flex justify-between items-end text-xs font-bold">
            <div className="text-center space-y-8">
              <p className="text-slate-700">توقيع المؤطر / المدرب</p>
              <div className="text-[10px] text-slate-400">.........................................</div>
            </div>

            <div className="text-center space-y-8">
              <p className="text-slate-700">تأشيرة الحراسة العامة</p>
              <div className="text-[10px] text-slate-400">.........................................</div>
            </div>

            <div className="text-center space-y-8">
              <p className="text-slate-900 font-black">إدارة المركز (الخاتم والتوقيع)</p>
              <div className="text-[10px] text-slate-400">.........................................</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  UserX,
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  FileText,
  Trash2,
  Check,
  Plus,
  XCircle,
  Clock
} from 'lucide-react';
import {
  EnregistrementPresence,
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  ParametresCentre
} from '../types';
import { excelUtils } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';

interface AbsencesViewProps {
  presences: EnregistrementPresence[];
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  animateurs: Animateur[];
  parametres: ParametresCentre;
  onUpdatePresence: (record: EnregistrementPresence) => void;
  onDeletePresence: (id: string) => void;
  onCreateConvocationFromAbsence: (absence: EnregistrementPresence) => void;
}

export const AbsencesView: React.FC<AbsencesViewProps> = ({
  presences,
  beneficiaires,
  filieres,
  classes,
  animateurs,
  parametres,
  onUpdatePresence,
  onDeletePresence,
  onCreateConvocationFromAbsence
}) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [justifieFilter, setJustifieFilter] = useState('');

  // Delete modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Maps for quick lookup
  const benMap = useMemo(() => new Map(beneficiaires.map((b) => [b.id, b])), [beneficiaires]);
  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const animMap = useMemo(() => new Map(animateurs.map((a) => [a.id, a])), [animateurs]);

  // All absences
  const allAbsences = useMemo(() => {
    return presences.filter((p) => p.statut === 'Absent');
  }, [presences]);

  // Filtered absences
  const filteredAbsences = useMemo(() => {
    return allAbsences.filter((p) => {
      const ben = benMap.get(p.beneficiaireId);
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          ben?.nomFr.toLowerCase().includes(q) ||
          ben?.prenomFr.toLowerCase().includes(q) ||
          ben?.nomAr.includes(q) ||
          ben?.prenomAr.includes(q) ||
          ben?.numeroMassar.toLowerCase().includes(q) ||
          p.motif?.toLowerCase().includes(q) ||
          p.seanceMatiere?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (dateFilter && p.date !== dateFilter) return false;
      if (filiereFilter && p.filiereId !== filiereFilter) return false;
      if (classeFilter && p.classeId !== classeFilter) return false;
      if (justifieFilter) {
        const isJustified = p.justifie === true;
        if (justifieFilter === 'oui' && !isJustified) return false;
        if (justifieFilter === 'non' && isJustified) return false;
      }
      return true;
    });
  }, [allAbsences, searchTerm, dateFilter, filiereFilter, classeFilter, justifieFilter, benMap]);

  // Toggle justification
  const handleToggleJustifie = (record: EnregistrementPresence) => {
    onUpdatePresence({
      ...record,
      justifie: !record.justifie
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const absencesToday = allAbsences.filter((p) => p.date === todayStr).length;
  const justifiedCount = allAbsences.filter((p) => p.justifie).length;
  const unjustifiedCount = allAbsences.length - justifiedCount;

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-rose-600 uppercase tracking-wider mb-1">
            <UserX className="w-4 h-4" />
            <span>سجل الغيابات الرسمي</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            تتبع ومراقبة غياب المستفيدين
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · تدبير التبريرات والاستدعاءات الرسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => excelUtils.exportPresences(filteredAbsences, beneficiaires, filieres, classes, animateurs, 'Absent')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة اللائحة</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 mb-1">مجموع الغيابات</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {allAbsences.length}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">منذ بداية السنة</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-700 mb-1">غيابات اليوم</div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {absencesToday}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold">حالات مسجلة اليوم</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 mb-1">غيابات مبررة</div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {justifiedCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">بشهادة أو إشعار مسبق</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 mb-1">غيابات غير مبررة</div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {unjustifiedCount}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">تستوجب الاستدعاء</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالمستفيد، رقم مسار، سبب الغياب، المادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-mono font-bold focus:outline-hidden focus:border-blue-500"
            />

            {/* Filière */}
            <select
              value={filiereFilter}
              onChange={(e) => setFiliereFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">جميع الشعب</option>
              {filieres.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>

            {/* Classe */}
            <select
              value={classeFilter}
              onChange={(e) => setClasseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">جميع الأقسام</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>

            {/* Justified filter */}
            <select
              value={justifieFilter}
              onChange={(e) => setJustifieFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">التبرير (الكل)</option>
              <option value="oui">مبرر</option>
              <option value="non">غير مبرر</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100">
          <span>
            عدد حالات الغياب المعروضة: <strong className="text-slate-900 font-black">{filteredAbsences.length}</strong>
          </span>
          {(searchTerm || dateFilter || filiereFilter || classeFilter || justifieFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setFiliereFilter('');
                setClasseFilter('');
                setJustifieFilter('');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* 4. Absences Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">تاريخ الغياب</th>
                <th className="py-3 px-3">المستفيد</th>
                <th className="py-3 px-3">الشعبة</th>
                <th className="py-3 px-3">القسم</th>
                <th className="py-3 px-3">الحصة / المادة</th>
                <th className="py-3 px-3">المؤطر</th>
                <th className="py-3 px-3 text-center">التبرير</th>
                <th className="py-3 px-3">سبب الغياب</th>
                <th className="py-3 px-3">ملاحظة</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAbsences.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد غيابات مطابقة للبحث المحدد
                  </td>
                </tr>
              ) : (
                filteredAbsences.map((p) => {
                  const ben = benMap.get(p.beneficiaireId);
                  const fil = filiereMap.get(p.filiereId);
                  const cls = classeMap.get(p.classeId);
                  const anim = animMap.get(p.animateurId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {p.date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">
                          {ben ? `${ben.prenomAr} ${ben.nomAr}` : 'مستفيد غير معروف'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {ben?.numeroMassar}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-bold truncate max-w-[140px]">
                        {fil?.nom || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold truncate max-w-[140px]">
                        {cls?.nom || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">
                        {p.seanceMatiere}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {anim ? `${anim.prenom} ${anim.nom}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleJustifie(p)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                            p.justifie
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="انقر لتبديل حالة التبرير"
                        >
                          {p.justifie ? '✓ مبرر' : '✗ غير مبرر'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[150px] truncate">
                        {p.motif || 'بدون عذر'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium max-w-[150px] truncate">
                        {p.observation || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onCreateConvocationFromAbsence(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg transition-colors border border-amber-200"
                            title="إنشاء استدعاء لولي الأمر"
                          >
                            <FileText className="w-3 h-3" />
                            <span>استدعاء</span>
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف تسجيل الغياب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف تسجيل الغياب"
        message="هل أنت متأكد من رغبتك في حذف هذا التسجيل؟ سيتم تحديث الإحصائيات مباشرة."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeletePresence(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

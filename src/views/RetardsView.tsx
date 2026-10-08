import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  FileSpreadsheet,
  Printer,
  Trash2,
  FileText,
  Edit2,
  X
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

interface RetardsViewProps {
  presences: EnregistrementPresence[];
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  animateurs: Animateur[];
  parametres: ParametresCentre;
  onUpdatePresence: (record: EnregistrementPresence) => void;
  onDeletePresence: (id: string) => void;
  onCreateConvocationFromRetard: (record: EnregistrementPresence) => void;
}

export const RetardsView: React.FC<RetardsViewProps> = ({
  presences,
  beneficiaires,
  filieres,
  classes,
  animateurs,
  parametres,
  onUpdatePresence,
  onDeletePresence,
  onCreateConvocationFromRetard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');
  const [classeFilter, setClasseFilter] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<EnregistrementPresence | null>(null);

  const benMap = useMemo(() => new Map(beneficiaires.map((b) => [b.id, b])), [beneficiaires]);
  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const animMap = useMemo(() => new Map(animateurs.map((a) => [a.id, a])), [animateurs]);

  const allRetards = useMemo(() => {
    return presences.filter((p) => p.statut === 'Retard');
  }, [presences]);

  const filteredRetards = useMemo(() => {
    return allRetards.filter((p) => {
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
      return true;
    });
  }, [allRetards, searchTerm, dateFilter, filiereFilter, classeFilter, benMap]);

  const todayStr = new Date().toISOString().split('T')[0];
  const retardsTodayCount = allRetards.filter((p) => p.date === todayStr).length;
  const totalMinutes = allRetards.reduce((acc, curr) => acc + (curr.dureeRetardMinutes || 0), 0);
  const avgMinutes = allRetards.length > 0 ? Math.round(totalMinutes / allRetards.length) : 0;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      onUpdatePresence(editingRecord);
      setEditingRecord(null);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-600 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>سجل التأخرات الرسمي</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            تتبع ومراقبة تأخرات المستفيدين
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · ضبط المواظبة والانضباط الزمني بالحصص
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => excelUtils.exportPresences(filteredRetards, beneficiaires, filieres, classes, animateurs, 'Retard')}
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
          <div className="text-xs font-bold text-slate-500 mb-1">مجموع حالات التأخر</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {allRetards.length}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">مسجلة بالسنة التكوينية</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 mb-1">تأخرات اليوم</div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {retardsTodayCount}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">حالات مسجلة اليوم</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs">
          <div className="text-xs font-bold text-blue-700 mb-1">إجمالي دقائق التأخر</div>
          <div className="text-2xl font-black text-blue-800 tabular-nums">
            {totalMinutes}
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">دقيقة ضائعة إجمالاً</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 mb-1">متوسط التأخر</div>
          <div className="text-2xl font-black text-slate-800 tabular-nums">
            {avgMinutes}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">دقيقة لكل حالة</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالمستفيد، رقم مسار، سبب التأخر، المادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-mono font-bold focus:outline-hidden focus:border-blue-500"
            />

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
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100">
          <span>
            عدد حالات التأخر المعروضة: <strong className="text-slate-900 font-black">{filteredRetards.length}</strong>
          </span>
          {(searchTerm || dateFilter || filiereFilter || classeFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setFiliereFilter('');
                setClasseFilter('');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* 4. Retards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">وقت الوصول</th>
                <th className="py-3 px-3">المستفيد</th>
                <th className="py-3 px-3">الشعبة والقسم</th>
                <th className="py-3 px-3 text-center">مدة التأخر</th>
                <th className="py-3 px-3">الحصة / المادة</th>
                <th className="py-3 px-3">سبب التأخر</th>
                <th className="py-3 px-3">الملاحظة</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRetards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد حالات تأخر مسجلة تطابق البحث
                  </td>
                </tr>
              ) : (
                filteredRetards.map((p) => {
                  const ben = benMap.get(p.beneficiaireId);
                  const fil = filiereMap.get(p.filiereId);
                  const cls = classeMap.get(p.classeId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {p.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {p.heure || '08:45'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">
                          {ben ? `${ben.prenomAr} ${ben.nomAr}` : 'مستفيد غير معروف'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {ben?.numeroMassar}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 truncate max-w-[140px]">
                          {fil?.nom || '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px]">
                          {cls?.nom || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                          {p.dureeRetardMinutes || 15} دقيقة
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-semibold">
                        {p.seanceMatiere}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[160px] truncate">
                        {p.motif || 'بدون عذر'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium max-w-[160px] truncate">
                        {p.observation || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onCreateConvocationFromRetard(p)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg transition-colors border border-amber-200"
                            title="إنشاء استدعاء"
                          >
                            <FileText className="w-3 h-3" />
                            <span>استدعاء</span>
                          </button>
                          <button
                            onClick={() => setEditingRecord({ ...p })}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل التأخر"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف التأخر"
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

      {/* 5. Edit Retard Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>تعديل تسجيل التأخر</span>
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  مدة التأخر (بالدقائق) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={editingRecord.dureeRetardMinutes || 15}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      dureeRetardMinutes: Number(e.target.value)
                    })
                  }
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  سبب التأخر
                </label>
                <input
                  type="text"
                  value={editingRecord.motif || ''}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, motif: e.target.value })
                  }
                  placeholder="سبب التأخر..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  ملاحظة إدارية
                </label>
                <textarea
                  rows={3}
                  value={editingRecord.observation || ''}
                  onChange={(e) =>
                    setEditingRecord({ ...editingRecord, observation: e.target.value })
                  }
                  placeholder="ملاحظات المتابعة..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-right"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف تسجيل التأخر"
        message="هل أنت متأكد من رغبتك في حذف هذا التسجيل؟"
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

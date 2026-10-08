import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Clock,
  Phone,
  Calendar,
  Building
} from 'lucide-react';
import {
  Convocation,
  Beneficiaire,
  Filiere,
  Classe,
  StatutConvocation,
  PersonneConcernee,
  ParametresCentre
} from '../types';
import { CMEDLogo } from '../components/CMEDLogo';
import { excelUtils } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  formatStatutConvocationAr,
  formatPersonneConcerneeAr
} from '../utils/arabicLabels';

interface ConvocationsViewProps {
  convocations: Convocation[];
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  parametres: ParametresCentre;
  onSaveConvocation: (conv: Convocation) => void;
  onDeleteConvocation: (id: string) => void;
  initialCreateForBeneficiaireId?: string;
}

export const ConvocationsView: React.FC<ConvocationsViewProps> = ({
  convocations,
  beneficiaires,
  filieres,
  classes,
  parametres,
  onSaveConvocation,
  onDeleteConvocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConv, setEditingConv] = useState<Convocation | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [printingConv, setPrintingConv] = useState<Convocation | null>(null);

  const benMap = useMemo(() => new Map(beneficiaires.map((b) => [b.id, b])), [beneficiaires]);
  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const initialFormState: Partial<Convocation> = {
    beneficiaireId: beneficiaires[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    heure: '10:00',
    motif: 'غياب متكرر بدون مبرر ومتابعة المواظبة',
    observation: 'مقابلة مع ولي الأمر لتوقيع التزام الانضباط.',
    personneConcernee: 'Parent/Tuteur',
    statut: 'En attente',
    sourceType: 'manuel',
    dateCreation: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Convocation>>(initialFormState);
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingConv(null);
    setFormData(initialFormState);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (conv: Convocation) => {
    setEditingConv(conv);
    setFormData({ ...conv });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaireId) {
      setFormError('يرجى اختيار المستفيد.');
      return;
    }
    if (!formData.motif?.trim()) {
      setFormError('يرجى تحديد سبب الاستدعاء.');
      return;
    }

    const saved: Convocation = {
      id: editingConv ? editingConv.id : `conv-${Date.now()}`,
      beneficiaireId: formData.beneficiaireId,
      date: formData.date || new Date().toISOString().split('T')[0],
      heure: formData.heure || '10:00',
      motif: formData.motif.trim(),
      observation: formData.observation || '',
      personneConcernee: (formData.personneConcernee || 'Parent/Tuteur') as PersonneConcernee,
      statut: (formData.statut || 'En attente') as StatutConvocation,
      sourceType: formData.sourceType || 'manuel',
      sourceId: formData.sourceId,
      dateCreation: editingConv?.dateCreation || new Date().toISOString().split('T')[0]
    };

    onSaveConvocation(saved);
    setIsFormOpen(false);
  };

  const filteredConvocations = useMemo(() => {
    return convocations.filter((c) => {
      const ben = benMap.get(c.beneficiaireId);
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          ben?.nomFr.toLowerCase().includes(q) ||
          ben?.prenomFr.toLowerCase().includes(q) ||
          ben?.nomAr.includes(q) ||
          ben?.prenomAr.includes(q) ||
          ben?.numeroMassar.toLowerCase().includes(q) ||
          c.motif.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statutFilter && c.statut !== statutFilter) return false;
      return true;
    });
  }, [convocations, searchTerm, statutFilter, benMap]);

  const pendingCount = convocations.filter((c) => c.statut === 'En attente').length;
  const treatedCount = convocations.filter((c) => c.statut === 'Traité').length;

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>سجل الاستدعاءات الرسمية</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            تدبير استدعاءات أولياء الأمور
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · طباعة الاستدعاءات الرسمية وتتبع التزام أولياء الأمور
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة استدعاء</span>
          </button>

          <button
            onClick={() => excelUtils.exportConvocations(filteredConvocations, beneficiaires, filieres, classes)}
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
          <div className="text-xs font-bold text-slate-500 mb-1">مجموع الاستدعاءات</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {convocations.length}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">منذ بداية السنة التكوينية</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 mb-1">قيد الانتظار</div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {pendingCount}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">بانتظار حضور الولي</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 mb-1">تمت المعالجة وحضر الولي</div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {treatedCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">تم توقيع الالتزام</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs">
          <div className="text-xs font-bold text-blue-700 mb-1">المعنيون بالاستدعاء</div>
          <div className="text-2xl font-black text-blue-800 tabular-nums">
            {new Set(convocations.map((c) => c.beneficiaireId)).size}
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">مستفيد مختلف</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالمستفيد، سبب الاستدعاء، رقم مسار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">حالة الاستدعاء (الكل)</option>
              <option value="En attente">قيد الانتظار</option>
              <option value="Convoqué">تم الاستدعاء</option>
              <option value="Présent">حضر</option>
              <option value="Traité">تمت المعالجة</option>
              <option value="Annulé">ملغى</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100">
          <span>
            عدد الاستدعاءات المعروضة: <strong className="text-slate-900 font-black">{filteredConvocations.length}</strong>
          </span>
          {(searchTerm || statutFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatutFilter('');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* 4. Convocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">تاريخ الاستدعاء</th>
                <th className="py-3 px-3">الساعة</th>
                <th className="py-3 px-3">المستفيد</th>
                <th className="py-3 px-3">الشعبة والقسم</th>
                <th className="py-3 px-3">المعني بالحضور</th>
                <th className="py-3 px-3">سبب الاستدعاء</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-3 text-center">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConvocations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد استدعاءات مسجلة تطابق البحث
                  </td>
                </tr>
              ) : (
                filteredConvocations.map((c) => {
                  const ben = benMap.get(c.beneficiaireId);
                  const fil = filiereMap.get(ben?.filiereId || '');
                  const cls = classeMap.get(ben?.classeId || '');
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {c.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {c.heure}
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
                      <td className="py-3 px-3 font-bold text-blue-900">
                        {formatPersonneConcerneeAr(c.personneConcernee)}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[200px] truncate">
                        {c.motif}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            c.statut === 'En attente'
                              ? 'bg-amber-100 text-amber-900'
                              : c.statut === 'Traité'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {formatStatutConvocationAr(c.statut)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPrintingConv(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg transition-colors shadow-2xs"
                            title="طباعة الاستدعاء الرسمي PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>طباعة الاستدعاء</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل الاستدعاء"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(c.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف الاستدعاء"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* 5. Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingConv ? 'تعديل بيانات الاستدعاء' : 'إضافة استدعاء جديد'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المستفيد المعني *
                </label>
                <select
                  value={formData.beneficiaireId || ''}
                  onChange={(e) => setFormData({ ...formData, beneficiaireId: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {beneficiaires.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.prenomAr} {b.nomAr} — ({b.numeroMassar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    تاريخ الاستدعاء *
                  </label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    ساعة الحضور *
                  </label>
                  <input
                    type="time"
                    value={formData.heure || '10:00'}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المعني بالحضور *
                </label>
                <select
                  value={formData.personneConcernee || 'Parent/Tuteur'}
                  onChange={(e) => setFormData({ ...formData, personneConcernee: e.target.value as PersonneConcernee })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Parent/Tuteur">ولي الأمر (الأب / الأم / الولي)</option>
                  <option value="Bénéficiaire">المستفيد فقط</option>
                  <option value="Bénéficiaire et Parent">المستفيد وولي الأمر معاً</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  سبب الاستدعاء *
                </label>
                <input
                  type="text"
                  value={formData.motif || ''}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  required
                  placeholder="سبب الاستدعاء..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  الملاحظة والتوجيه الإداري
                </label>
                <textarea
                  rows={2}
                  value={formData.observation || ''}
                  onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                  placeholder="ملاحظات وتفاصيل المقابلة..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  حالة الاستدعاء
                </label>
                <select
                  value={formData.statut || 'En attente'}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutConvocation })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="En attente">قيد الانتظار</option>
                  <option value="Convoqué">تم الاستدعاء</option>
                  <option value="Présent">حضر</option>
                  <option value="Traité">تمت المعالجة وتوقيع الالتزام</option>
                  <option value="Annulé">ملغى</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  حفظ الاستدعاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Official Printable Arabic Convocation Letter Modal */}
      {printingConv && (() => {
        const ben = benMap.get(printingConv.beneficiaireId);
        const fil = filiereMap.get(ben?.filiereId || '');
        const cls = classeMap.get(ben?.classeId || '');
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto font-arabic">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
              {/* Modal Top Bar */}
              <div className="p-4 bg-[#0B2545] text-white flex items-center justify-between no-print">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>معاينة وطباعة الاستدعاء الرسمي</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                  >
                    طباعة الآن
                  </button>
                  <button
                    onClick={() => setPrintingConv(null)}
                    className="p-1 text-slate-300 hover:text-white"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Official Moroccan Convocation Document */}
              <div className="p-8 sm:p-12 text-slate-900 space-y-6 text-right leading-relaxed bg-white">
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
                  <div className="space-y-0.5 text-right">
                    <div className="text-xs font-black text-slate-900">المملكة المغربية</div>
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

                <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                  <span>الرقم الترتيبي : <strong className="font-mono text-slate-900">{printingConv.id.replace('conv-', 'CDC/')}</strong></span>
                  <span>{parametres.ville || 'زرارة'} في : <strong className="font-mono text-slate-900">{new Date().toLocaleDateString('ar-MA')}</strong></span>
                </div>

                {/* Letter Title */}
                <div className="text-center py-2">
                  <h1 className="text-lg font-black underline underline-offset-8 text-slate-900">
                    استدعاء رسمي لولي الأمر
                  </h1>
                </div>

                {/* Salutations */}
                <div className="text-xs font-bold text-slate-800 space-y-1">
                  <p>إلى السيد(ة) ولي أمر المستفيد(ة) : <strong className="text-sm font-black">{ben?.nomTuteur || 'المحترم(ة)'}</strong></p>
                  <p>ولي أمر التلميذ(ة) : <strong className="text-sm font-black text-blue-900">{ben?.prenomAr} {ben?.nomAr}</strong> (رقم مسار: <span className="font-mono">{ben?.numeroMassar}</span>)</p>
                  <p>الشعبة : <strong>{fil?.nom}</strong> · القسم : <strong>{cls?.nom}</strong></p>
                </div>

                {/* Body Paragraph */}
                <div className="text-xs text-slate-800 leading-loose space-y-3 pt-2">
                  <p>سلام تام بوجود مولانا الإمام،</p>
                  <p>
                    وبعد، يشرف إدارة {parametres.nomCentre} {parametres.nomSousTitre}، أن تدعوكم للحضور إلى مقر إدارة المركز الكائن بـ {parametres.adresse || 'زرارة'}، وذلك يوم :
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-center text-sm space-y-1">
                    <div>التاريخ : <strong className="text-blue-900 font-mono">{printingConv.date}</strong></div>
                    <div>على الساعة : <strong className="text-blue-900 font-mono">{printingConv.heure}</strong></div>
                  </div>
                  <p>
                    الموضوع وسبب الاستدعاء : <strong className="text-slate-900">{printingConv.motif}</strong>.
                  </p>
                  <p className="font-semibold text-slate-700">
                    نظراً لما يكتسيه هذا الأمر من أهمية بالغة لمستقبل التلميذ(ة) وحسن مواظبته وانضباطه بالتكوين، فإن حضوركم الشخصي مؤكد وضروري.
                  </p>
                  <p className="text-left font-bold pt-2">
                    وتفضلوا بقبول فائق التقدير والاحترام، والسلام.
                  </p>
                </div>

                {/* Signature Box */}
                <div className="pt-6 flex justify-between items-end text-xs">
                  <div className="text-center font-bold">
                    <p className="text-slate-500 text-[10px]">تأشيرة الحراسة العامة</p>
                  </div>
                  <div className="text-center font-bold">
                    <p className="font-black text-slate-900">إدارة المركز</p>
                    <div className="mt-8 text-[10px] text-slate-400">الخاتم والتوقيع</div>
                  </div>
                </div>

                {/* Tear-off Parent Coupon */}
                <div className="pt-8 border-t-2 border-dashed border-slate-400 space-y-2 text-[11px] text-slate-700">
                  <div className="flex justify-between items-center font-bold">
                    <span>✂️ وصل إرجاع الاستدعاء والتزام ولي الأمر (يسلم لإدارة المركز)</span>
                    <span className="font-mono text-[10px]">{printingConv.date}</span>
                  </div>
                  <p>
                    أنا الموقع أسفله السيد(ة) : .................................................... بصفتي ولي أمر المستفيد(ة) : <strong>{ben?.prenomAr} {ben?.nomAr}</strong>
                  </p>
                  <p>
                    أشهد أنني توصلت بهذا الاستدعاء والتزم بالحضور في الموعد المحدد أعلاه.
                  </p>
                  <div className="flex justify-between pt-2">
                    <span>رقم هاتف الولي : .................................</span>
                    <span>توقيع ولي الأمر : .................................</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف الاستدعاء"
        message="هل أنت متأكد من رغبتك في حذف هذا الاستدعاء؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteConvocation(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

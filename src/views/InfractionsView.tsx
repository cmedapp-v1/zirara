import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  FileSpreadsheet,
  Printer,
  FileText,
  Trash2,
  Edit2,
  X,
  ShieldAlert
} from 'lucide-react';
import {
  Infraction,
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  TypeInfraction,
  GraviteInfraction,
  ActionDisciplinaire,
  StatutInfraction,
  ParametresCentre
} from '../types';
import { excelUtils } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  formatGraviteAr,
  formatTypeInfractionAr,
  formatActionDisciplinaireAr
} from '../utils/arabicLabels';

const AR_TYPES_INFRACTION = [
  'غياب متكرر',
  'تأخر متكرر',
  'عدم احترام النظام الداخلي',
  'سلوك غير لائق',
  'عنف لفظي',
  'عنف جسدي',
  'إتلاف التجهيزات',
  'التشويش على الحصة',
  'عدم احترام المؤطر',
  'عدم احترام الزملاء',
  'استعمال الهاتف بدون إذن',
  'أخرى'
];

const AR_GRAVITES = ['طفيفة', 'متوسطة', 'خطيرة', 'خطيرة جداً'];

const AR_ACTIONS = [
  'إنذار شفهي',
  'إنذار كتابي',
  'مقابلة مع الإدارة',
  'استدعاء المعني بالأمر',
  'استدعاء ولي الأمر',
  'وساطة تربوية',
  'أخرى'
];

interface InfractionsViewProps {
  infractions: Infraction[];
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  animateurs: Animateur[];
  parametres: ParametresCentre;
  onSaveInfraction: (infr: Infraction) => void;
  onDeleteInfraction: (id: string) => void;
  onCreateConvocationFromInfraction: (infr: Infraction) => void;
}

export const InfractionsView: React.FC<InfractionsViewProps> = ({
  infractions,
  beneficiaires,
  filieres,
  classes,
  animateurs,
  parametres,
  onSaveInfraction,
  onDeleteInfraction,
  onCreateConvocationFromInfraction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [graviteFilter, setGraviteFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInfr, setEditingInfr] = useState<Infraction | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const benMap = useMemo(() => new Map(beneficiaires.map((b) => [b.id, b])), [beneficiaires]);
  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const initialFormState: Partial<Infraction> = {
    beneficiaireId: beneficiaires[0]?.id || '',
    numeroMassar: beneficiaires[0]?.numeroMassar || '',
    date: new Date().toISOString().split('T')[0],
    heure: '10:30',
    filiereId: filieres[0]?.id || '',
    classeId: classes[0]?.id || '',
    animateurId: animateurs[0]?.id || '',
    typeInfraction: 'Comportement inapproprié',
    description: '',
    lieu: 'قاعة التكوين',
    gravite: 'Moyenne',
    observation: '',
    actionPrise: 'Avertissement verbal',
    statut: 'En cours'
  };

  const [formData, setFormData] = useState<Partial<Infraction>>(initialFormState);
  const [formError, setFormError] = useState('');

  const handleSelectBeneficiaire = (benId: string) => {
    const ben = benMap.get(benId);
    if (ben) {
      setFormData({
        ...formData,
        beneficiaireId: ben.id,
        numeroMassar: ben.numeroMassar,
        filiereId: ben.filiereId,
        classeId: ben.classeId
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingInfr(null);
    setFormData(initialFormState);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (infr: Infraction) => {
    setEditingInfr(infr);
    setFormData({ ...infr });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaireId) {
      setFormError('يرجى اختيار المستفيد المعني بالمخالفة.');
      return;
    }
    if (!formData.description?.trim()) {
      setFormError('يرجى إدخال وصف المخالفة.');
      return;
    }

    const saved: Infraction = {
      id: editingInfr ? editingInfr.id : `infr-${Date.now()}`,
      beneficiaireId: formData.beneficiaireId,
      numeroMassar: formData.numeroMassar || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      heure: formData.heure || '10:00',
      filiereId: formData.filiereId || '',
      classeId: formData.classeId || '',
      animateurId: formData.animateurId || '',
      typeInfraction: formData.typeInfraction as TypeInfraction,
      description: formData.description.trim(),
      lieu: formData.lieu || 'المركز',
      gravite: formData.gravite as GraviteInfraction,
      observation: formData.observation || '',
      actionPrise: formData.actionPrise as ActionDisciplinaire,
      statut: (formData.statut || 'En cours') as StatutInfraction
    };

    onSaveInfraction(saved);
    setIsFormOpen(false);
  };

  const filteredInfractions = useMemo(() => {
    return infractions.filter((i) => {
      const ben = benMap.get(i.beneficiaireId);
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          ben?.nomFr.toLowerCase().includes(q) ||
          ben?.prenomFr.toLowerCase().includes(q) ||
          ben?.nomAr.includes(q) ||
          ben?.prenomAr.includes(q) ||
          i.numeroMassar.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (graviteFilter && i.gravite !== graviteFilter) return false;
      if (typeFilter && i.typeInfraction !== typeFilter) return false;
      if (filiereFilter && i.filiereId !== filiereFilter) return false;
      return true;
    });
  }, [infractions, searchTerm, graviteFilter, typeFilter, filiereFilter, benMap]);

  const gravesCount = infractions.filter((i) => i.gravite === 'Grave' || i.gravite === 'Très grave').length;

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-purple-700 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>السجل التأديبي والانضباط</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            سجل المخالفات والإجراءات التربوية
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · توثيق الحالات والإجراءات المتخذة والاستدعاءات
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مخالفة</span>
          </button>

          <button
            onClick={() => excelUtils.exportInfractions(filteredInfractions, beneficiaires, filieres, classes)}
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
            <span>طباعة السجل</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 mb-1">مجموع المخالفات</div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {infractions.length}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">مسجلة بالسنة الدراسية</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-700 mb-1">مخالفات خطيرة</div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {gravesCount}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold">تستوجب استدعاء الولي</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 mb-1">مخالفات متوسطة</div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {infractions.filter((i) => i.gravite === 'Moyenne').length}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">إنذار شفهي أو كتابي</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 mb-1">مخالفات تمت معالجتها</div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums">
            {infractions.filter((i) => i.statut === 'Résolu' || i.statut === 'Traité').length}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">تم حلها والصلح التربوي</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالمستفيد، رقم مسار، وصف المخالفة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <select
              value={graviteFilter}
              onChange={(e) => setGraviteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">درجة الخطورة (الكل)</option>
              <option value="Faible">طفيفة</option>
              <option value="Moyenne">متوسطة</option>
              <option value="Grave">خطيرة</option>
              <option value="Très grave">خطيرة جداً</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold focus:outline-hidden focus:border-blue-500"
            >
              <option value="">نوع المخالفة (الكل)</option>
              <option value="Comportement inapproprié">سلوك غير لائق</option>
              <option value="Absence répétée">غياب متكرر</option>
              <option value="Retard répété">تأخر متكرر</option>
              <option value="Violence verbale">عنف لفظي</option>
              <option value="Violence physique">عنف جسدي</option>
              <option value="Dégradation du matériel">إتلاف التجهيزات</option>
              <option value="Utilisation interdite du téléphone">استعمال الهاتف بدون إذن</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100">
          <span>
            عدد المخالفات المعروضة: <strong className="text-slate-900 font-black">{filteredInfractions.length}</strong>
          </span>
          {(searchTerm || graviteFilter || typeFilter || filiereFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setGraviteFilter('');
                setTypeFilter('');
                setFiliereFilter('');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* 4. Infractions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">التاريخ والساعة</th>
                <th className="py-3 px-3">المستفيد</th>
                <th className="py-3 px-3">نوع المخالفة</th>
                <th className="py-3 px-3 text-center">درجة الخطورة</th>
                <th className="py-3 px-3">وصف المخالفة</th>
                <th className="py-3 px-3">المكان</th>
                <th className="py-3 px-3">الإجراء المتخذ</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInfractions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد مخالفات مسجلة تطابق البحث
                  </td>
                </tr>
              ) : (
                filteredInfractions.map((i) => {
                  const ben = benMap.get(i.beneficiaireId);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        <div>{i.date}</div>
                        <div className="text-[10px] text-slate-400">{i.heure}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900">
                          {ben ? `${ben.prenomAr} ${ben.nomAr}` : 'مستفيد غير معروف'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {i.numeroMassar}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {formatTypeInfractionAr(i.typeInfraction)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            i.gravite === 'Faible'
                              ? 'bg-slate-100 text-slate-800'
                              : i.gravite === 'Moyenne'
                              ? 'bg-amber-100 text-amber-900'
                              : i.gravite === 'Grave'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-red-700 text-white'
                          }`}
                        >
                          {formatGraviteAr(i.gravite)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-[220px] truncate">
                        {i.description}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {i.lieu}
                      </td>
                      <td className="py-3 px-3 font-bold text-purple-900 bg-purple-50/60 rounded-md">
                        {formatActionDisciplinaireAr(i.actionPrise)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onCreateConvocationFromInfraction(i)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg transition-colors border border-amber-200"
                            title="إنشاء استدعاء لولي الأمر"
                          >
                            <FileText className="w-3 h-3" />
                            <span>استدعاء</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(i)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل المخالفة"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(i.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف المخالفة"
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

      {/* 5. Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingInfr ? 'تعديل تسجيل المخالفة' : 'إضافة مخالفة جديدة'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Beneficiary selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المستفيد المعني *
                </label>
                <select
                  value={formData.beneficiaireId || ''}
                  onChange={(e) => handleSelectBeneficiaire(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {beneficiaires.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.prenomAr} {b.nomAr} — ({b.numeroMassar})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    التاريخ *
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
                    الساعة *
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

              {/* Type & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    نوع المخالفة *
                  </label>
                  <select
                    value={formData.typeInfraction || 'Comportement inapproprié'}
                    onChange={(e) => setFormData({ ...formData, typeInfraction: e.target.value as TypeInfraction })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Comportement inapproprié">سلوك غير لائق</option>
                    <option value="Absence répétée">غياب متكرر</option>
                    <option value="Retard répété">تأخر متكرر</option>
                    <option value="Non-respect du règlement">عدم احترام النظام الداخلي</option>
                    <option value="Violence verbale">عنف لفظي</option>
                    <option value="Violence physique">عنف جسدي</option>
                    <option value="Dégradation du matériel">إتلاف التجهيزات</option>
                    <option value="Perturbation de séance">التشويش على الحصة</option>
                    <option value="Non-respect de l'animateur">عدم احترام المؤطر</option>
                    <option value="Utilisation interdite du téléphone">استعمال الهاتف بدون إذن</option>
                    <option value="Autre">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    درجة الخطورة *
                  </label>
                  <select
                    value={formData.gravite || 'Moyenne'}
                    onChange={(e) => setFormData({ ...formData, gravite: e.target.value as GraviteInfraction })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Faible">طفيفة</option>
                    <option value="Moyenne">متوسطة</option>
                    <option value="Grave">خطيرة</option>
                    <option value="Très grave">خطيرة جداً</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  وصف تفصيلي للواقعة *
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="اكتب وقائع الحادثة بدقة..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-right"
                />
              </div>

              {/* Place & Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    المكان
                  </label>
                  <input
                    type="text"
                    value={formData.lieu || 'قاعة التكوين'}
                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الإجراء المتخذ *
                  </label>
                  <select
                    value={formData.actionPrise || 'Avertissement verbal'}
                    onChange={(e) => setFormData({ ...formData, actionPrise: e.target.value as ActionDisciplinaire })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Avertissement verbal">إنذار شفهي</option>
                    <option value="Avertissement écrit">إنذار كتابي</option>
                    <option value="Entretien avec l'administration">مقابلة مع الإدارة</option>
                    <option value="Convocation">استدعاء المعني بالأمر</option>
                    <option value="Convocation du parent/tuteur">استدعاء ولي الأمر</option>
                    <option value="Médiation">وساطة تربوية</option>
                    <option value="Autre">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs"
                >
                  حفظ المخالفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف المخالفة"
        message="هل أنت متأكد من رغبتك في حذف هذا التسجيل التأديبي؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteInfraction(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

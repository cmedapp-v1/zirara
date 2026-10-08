import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Printer,
  FileSpreadsheet,
  Trash2,
  Edit2,
  X,
  Clock,
  MapPin,
  Layers,
  Users
} from 'lucide-react';
import {
  SeancePlanning,
  Filiere,
  Classe,
  Animateur,
  ParametresCentre
} from '../types';
import { excelUtils } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';

interface PlanningViewProps {
  planning: SeancePlanning[];
  filieres: Filiere[];
  classes: Classe[];
  animateurs: Animateur[];
  parametres: ParametresCentre;
  onSaveSeance: (seance: SeancePlanning) => void;
  onDeleteSeance: (id: string) => void;
}

const JOURS_AR_MAP: Record<string, string> = {
  Lundi: 'الإثنين',
  Mardi: 'الثلاثاء',
  Mercredi: 'الأربعاء',
  Jeudi: 'الخميس',
  Vendredi: 'الجمعة',
  Samedi: 'السبت'
};

const AR_JOURS = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const PlanningView: React.FC<PlanningViewProps> = ({
  planning,
  filieres,
  classes,
  animateurs,
  parametres,
  onSaveSeance,
  onDeleteSeance
}) => {
  const [selectedJour, setSelectedJour] = useState<string>('الكل');
  const [filiereFilter, setFiliereFilter] = useState<string>('');
  const [classeFilter, setClasseFilter] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState<SeancePlanning | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const animMap = useMemo(() => new Map(animateurs.map((a) => [a.id, a])), [animateurs]);

  const initialFormState: Partial<SeancePlanning> = {
    jour: 'Lundi',
    heureDebut: '08:30',
    heureFin: '12:30',
    filiereId: filieres[0]?.id || '',
    classeId: classes[0]?.id || '',
    matiere: 'تكوين تطبيقي ومهني',
    animateurId: animateurs[0]?.id || '',
    salle: 'قاعة 1'
  };

  const [formData, setFormData] = useState<Partial<SeancePlanning>>(initialFormState);
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingSeance(null);
    setFormData(initialFormState);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (seance: SeancePlanning) => {
    setEditingSeance(seance);
    setFormData({ ...seance });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matiere?.trim()) {
      setFormError('يرجى إدخال اسم المادة أو الحصة.');
      return;
    }

    const saved: SeancePlanning = {
      id: editingSeance ? editingSeance.id : `seance-${Date.now()}`,
      jour: (formData.jour || 'Lundi') as any,
      heureDebut: formData.heureDebut || '08:30',
      heureFin: formData.heureFin || '12:30',
      filiereId: formData.filiereId || filieres[0]?.id || '',
      classeId: formData.classeId || classes[0]?.id || '',
      matiere: formData.matiere.trim(),
      animateurId: formData.animateurId || animateurs[0]?.id || '',
      salle: formData.salle || 'قاعة 1'
    };

    onSaveSeance(saved);
    setIsFormOpen(false);
  };

  const filteredPlanning = useMemo(() => {
    return planning.filter((s) => {
      const jourArabic = JOURS_AR_MAP[s.jour] || s.jour;
      if (selectedJour !== 'الكل' && jourArabic !== selectedJour && s.jour !== selectedJour) return false;
      if (filiereFilter && s.filiereId !== filiereFilter) return false;
      if (classeFilter && s.classeId !== classeFilter) return false;
      return true;
    });
  }, [planning, selectedJour, filiereFilter, classeFilter]);

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>التنظيم الزمني والحصص</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            استعمال الزمن الأسبوعي
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · برمجة الحصص التدريبية، القاعات، والمؤطرين
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة</span>
          </button>

          <button
            onClick={() => excelUtils.exportPlanning(filteredPlanning, filieres, classes, animateurs)}
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
            <span>طباعة الجدول</span>
          </button>
        </div>
      </div>

      {/* 2. Days Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          <button
            onClick={() => setSelectedJour('الكل')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors ${
              selectedJour === 'الكل'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            جميع الأيام
          </button>
          {AR_JOURS.map((j) => (
            <button
              key={j}
              onClick={() => setSelectedJour(j)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedJour === j
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {j}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
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

          <span className="text-[11px] text-slate-500 font-bold mr-auto">
            عدد الحصص المبرمجة: <strong className="text-slate-900 font-black">{filteredPlanning.length}</strong>
          </span>
        </div>
      </div>

      {/* 3. Planning Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">اليوم</th>
                <th className="py-3 px-3 text-center">التوقيت</th>
                <th className="py-3 px-3">الحصة / المادة</th>
                <th className="py-3 px-3">الشعبة</th>
                <th className="py-3 px-3">القسم</th>
                <th className="py-3 px-3">المؤطر / المدرب</th>
                <th className="py-3 px-3">القاعة</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlanning.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    لا توجد حصص مبرمجة تطابق الاختيار
                  </td>
                </tr>
              ) : (
                filteredPlanning.map((s) => {
                  const fil = filiereMap.get(s.filiereId);
                  const cls = classeMap.get(s.classeId);
                  const anim = animMap.get(s.animateurId);
                  const jourAr = JOURS_AR_MAP[s.jour] || s.jour;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-black text-slate-900">
                        {jourAr}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-900 bg-blue-50/40 rounded-md">
                        {s.heureDebut} - {s.heureFin}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {s.matiere}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-bold">
                        {fil?.nom || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {cls?.nom || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">
                        {anim ? `${anim.prenom} ${anim.nom}` : '-'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {s.salle}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل الحصة"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(s.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف الحصة"
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

      {/* 4. Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingSeance ? 'تعديل الحصة المبرمجة' : 'إضافة حصة جديدة'}
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
                  اليوم *
                </label>
                <select
                  value={formData.jour || 'Lundi'}
                  onChange={(e) => setFormData({ ...formData, jour: e.target.value as any })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Lundi">الإثنين</option>
                  <option value="Mardi">الثلاثاء</option>
                  <option value="Mercredi">الأربعاء</option>
                  <option value="Jeudi">الخميس</option>
                  <option value="Vendredi">الجمعة</option>
                  <option value="Samedi">السبت</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    وقت البداية *
                  </label>
                  <input
                    type="time"
                    value={formData.heureDebut || '08:30'}
                    onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    وقت النهاية *
                  </label>
                  <input
                    type="time"
                    value={formData.heureFin || '12:30'}
                    onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الشعبة *
                  </label>
                  <select
                    value={formData.filiereId || ''}
                    onChange={(e) => setFormData({ ...formData, filiereId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {filieres.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    القسم *
                  </label>
                  <select
                    value={formData.classeId || ''}
                    onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المادة / نوع الحصة *
                </label>
                <input
                  type="text"
                  value={formData.matiere || ''}
                  onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  required
                  placeholder="مثال: تكوين مهني تطبيقي، دعم تربوي..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    المؤطر / المدرب *
                  </label>
                  <select
                    value={formData.animateurId || ''}
                    onChange={(e) => setFormData({ ...formData, animateurId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {animateurs.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.prenom} {a.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    القاعة / الورشة
                  </label>
                  <input
                    type="text"
                    value={formData.salle || 'قاعة 1'}
                    onChange={(e) => setFormData({ ...formData, salle: e.target.value })}
                    placeholder="رقم القاعة أو اسم الورشة"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-right"
                  />
                </div>
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
                  حفظ الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف الحصة"
        message="هل أنت متأكد من رغبتك في حذف هذه الحصة من استعمال الزمن؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteSeance(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

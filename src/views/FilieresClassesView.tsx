import React, { useState, useMemo } from 'react';
import {
  Layers,
  Building,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Filiere, Classe, Beneficiaire, ParametresCentre } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface FilieresClassesViewProps {
  filieres: Filiere[];
  classes: Classe[];
  beneficiaires: Beneficiaire[];
  parametres: ParametresCentre;
  onSaveFiliere: (fil: Filiere) => void;
  onDeleteFiliere: (id: string) => void;
  onSaveClasse: (cls: Classe) => void;
  onDeleteClasse: (id: string) => void;
}

export const FilieresClassesView: React.FC<FilieresClassesViewProps> = ({
  filieres,
  classes,
  beneficiaires,
  parametres,
  onSaveFiliere,
  onDeleteFiliere,
  onSaveClasse,
  onDeleteClasse
}) => {
  const [activeTab, setActiveTab] = useState<'filieres' | 'classes'>('filieres');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFiliereModalOpen, setIsFiliereModalOpen] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null);

  const [isClasseModalOpen, setIsClasseModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'filiere' | 'classe'; id: string } | null>(null);

  // Form states
  const [filiereForm, setFiliereForm] = useState<Partial<Filiere>>({
    code: '',
    nom: '',
    description: '',
    dureeMois: 10,
    statut: 'Active'
  });

  const [classeForm, setClasseForm] = useState<Partial<Classe>>({
    code: '',
    nom: '',
    filiereId: filieres[0]?.id || '',
    anneeScolaire: parametres.anneeScolaireActive,
    capaciteMax: 25,
    statut: 'Active'
  });

  const [formError, setFormError] = useState('');

  // Beneficiary count maps
  const bensCountByFiliere = useMemo(() => {
    const map = new Map<string, number>();
    beneficiaires.forEach((b) => {
      map.set(b.filiereId, (map.get(b.filiereId) || 0) + 1);
    });
    return map;
  }, [beneficiaires]);

  const bensCountByClasse = useMemo(() => {
    const map = new Map<string, number>();
    beneficiaires.forEach((b) => {
      map.set(b.classeId, (map.get(b.classeId) || 0) + 1);
    });
    return map;
  }, [beneficiaires]);

  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);

  // Filière modal handlers
  const handleOpenAddFiliere = () => {
    setEditingFiliere(null);
    setFiliereForm({
      code: '',
      nom: '',
      description: '',
      dureeMois: 10,
      statut: 'Active'
    });
    setFormError('');
    setIsFiliereModalOpen(true);
  };

  const handleOpenEditFiliere = (fil: Filiere) => {
    setEditingFiliere(fil);
    setFiliereForm({ ...fil });
    setFormError('');
    setIsFiliereModalOpen(true);
  };

  const handleSaveFiliereSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filiereForm.nom?.trim() || !filiereForm.code?.trim()) {
      setFormError('يرجى إدخال اسم الشعبة ورمزها.');
      return;
    }

    const saved: Filiere = {
      id: editingFiliere ? editingFiliere.id : `fil-${Date.now()}`,
      code: filiereForm.code.trim().toUpperCase(),
      nom: filiereForm.nom.trim(),
      description: filiereForm.description || '',
      dureeMois: Number(filiereForm.dureeMois) || 10,
      statut: filiereForm.statut || 'Active'
    };

    onSaveFiliere(saved);
    setIsFiliereModalOpen(false);
  };

  // Classe modal handlers
  const handleOpenAddClasse = () => {
    setEditingClasse(null);
    setClasseForm({
      code: '',
      nom: '',
      filiereId: filieres[0]?.id || '',
      anneeScolaire: parametres.anneeScolaireActive,
      capaciteMax: 25,
      statut: 'Active'
    });
    setFormError('');
    setIsClasseModalOpen(true);
  };

  const handleOpenEditClasse = (cls: Classe) => {
    setEditingClasse(cls);
    setClasseForm({ ...cls });
    setFormError('');
    setIsClasseModalOpen(true);
  };

  const handleSaveClasseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classeForm.nom?.trim() || !classeForm.code?.trim() || !classeForm.filiereId) {
      setFormError('يرجى ملء جميع الحقول الإلزامية للقسم.');
      return;
    }

    const saved: Classe = {
      id: editingClasse ? editingClasse.id : `cls-${Date.now()}`,
      code: classeForm.code.trim().toUpperCase(),
      nom: classeForm.nom.trim(),
      filiereId: classeForm.filiereId,
      anneeScolaire: classeForm.anneeScolaire || parametres.anneeScolaireActive,
      capaciteMax: Number(classeForm.capaciteMax) || 25,
      statut: classeForm.statut || 'Active'
    };

    onSaveClasse(saved);
    setIsClasseModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'filiere') {
      onDeleteFiliere(deleteTarget.id);
    } else {
      onDeleteClasse(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const filteredFilieres = filieres.filter(
    (f) =>
      f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClasses = classes.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>البنية التربوية والتنظيمية</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            الشعب التكوينية والأقسام
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · تدبير الشعب المهنية والمجموعات الدراسية
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'filieres' ? (
            <button
              onClick={handleOpenAddFiliere}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شعبة</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddClasse}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('filieres')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'filieres'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الشعب التكوينية ({filieres.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'classes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            الأقسام والمجموعات ({classes.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرمز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
          />
        </div>
      </div>

      {/* 3. Content Table: Filieres */}
      {activeTab === 'filieres' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">رمز الشعبة</th>
                  <th className="py-3 px-4">اسم الشعبة</th>
                  <th className="py-3 px-4">الوصف</th>
                  <th className="py-3 px-4 text-center">مدة التكوين</th>
                  <th className="py-3 px-4 text-center">عدد الأقسام</th>
                  <th className="py-3 px-4 text-center">المستفيدون</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFilieres.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      لا توجد شعب مسجلة تطابق البحث
                    </td>
                  </tr>
                ) : (
                  filteredFilieres.map((f) => {
                    const clsCount = classes.filter((c) => c.filiereId === f.id).length;
                    const benCount = bensCountByFiliere.get(f.id) || 0;
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-blue-900 bg-blue-50/40 rounded-md">
                          {f.code}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                          {f.nom}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[240px] truncate">
                          {f.description || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {f.dureeMois} أشهر
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {clsCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-blue-800">
                          {benCount}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.statut === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {f.statut === 'Active' ? 'نشطة' : 'غير نشطة'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditFiliere(f)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="تعديل الشعبة"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'filiere', id: f.id })}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف الشعبة"
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
      )}

      {/* 4. Content Table: Classes */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">رمز القسم</th>
                  <th className="py-3 px-4">اسم القسم</th>
                  <th className="py-3 px-4">الشعبة التابع لها</th>
                  <th className="py-3 px-4 text-center">السنة الدراسية</th>
                  <th className="py-3 px-4 text-center">المسجلون فعلياً</th>
                  <th className="py-3 px-4 text-center">الطاقة الاستيعابية</th>
                  <th className="py-3 px-4 text-center">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      لا توجد أقسام مسجلة تطابق البحث
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => {
                    const fil = filiereMap.get(c.filiereId);
                    const benCount = bensCountByClasse.get(c.id) || 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-900 bg-emerald-50/40 rounded-md">
                          {c.code}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                          {c.nom}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {fil?.nom || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 font-semibold">
                          {c.anneeScolaire}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-blue-900">
                          {benCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-semibold">
                          {c.capaciteMax} مقعد
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.statut === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.statut === 'Active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditClasse(c)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="تعديل القسم"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'classe', id: c.id })}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف القسم"
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
      )}

      {/* 5. Filière Modal */}
      {isFiliereModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingFiliere ? 'تعديل بيانات الشعبة' : 'إضافة شعبة جديدة'}
              </h2>
              <button
                onClick={() => setIsFiliereModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFiliereSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  رمز الشعبة (Code) *
                </label>
                <input
                  type="text"
                  value={filiereForm.code || ''}
                  onChange={(e) => setFiliereForm({ ...filiereForm, code: e.target.value })}
                  placeholder="مثال: ELEC, COUT..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اسم الشعبة التكوينية *
                </label>
                <input
                  type="text"
                  value={filiereForm.nom || ''}
                  onChange={(e) => setFiliereForm({ ...filiereForm, nom: e.target.value })}
                  placeholder="مثال: كهرباء البناء وأنظمة التحكم..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  الوصف والمقرر
                </label>
                <textarea
                  rows={3}
                  value={filiereForm.description || ''}
                  onChange={(e) => setFiliereForm({ ...filiereForm, description: e.target.value })}
                  placeholder="وصف أهداف التكوين والمهارات المستهدفة..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    مدة التكوين (أشهر) *
                  </label>
                  <input
                    type="number"
                    value={filiereForm.dureeMois || 10}
                    onChange={(e) => setFiliereForm({ ...filiereForm, dureeMois: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={filiereForm.statut || 'Active'}
                    onChange={(e) => setFiliereForm({ ...filiereForm, statut: e.target.value as any })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Active">نشطة</option>
                    <option value="Inactive">غير نشطة</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFiliereModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  حفظ الشعبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Classe Modal */}
      {isClasseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingClasse ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h2>
              <button
                onClick={() => setIsClasseModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClasseSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  رمز القسم *
                </label>
                <input
                  type="text"
                  value={classeForm.code || ''}
                  onChange={(e) => setClasseForm({ ...classeForm, code: e.target.value })}
                  placeholder="مثال: ELEC-G1..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اسم القسم / الفوج *
                </label>
                <input
                  type="text"
                  value={classeForm.nom || ''}
                  onChange={(e) => setClasseForm({ ...classeForm, nom: e.target.value })}
                  placeholder="مثال: كهرباء الفوج أ..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  الشعبة التابع لها *
                </label>
                <select
                  value={classeForm.filiereId || ''}
                  onChange={(e) => setClasseForm({ ...classeForm, filiereId: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  {filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الطاقة الاستيعابية
                  </label>
                  <input
                    type="number"
                    value={classeForm.capaciteMax || 25}
                    onChange={(e) => setClasseForm({ ...classeForm, capaciteMax: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    السنة الدراسية
                  </label>
                  <input
                    type="text"
                    value={classeForm.anneeScolaire || parametres.anneeScolaireActive}
                    onChange={(e) => setClasseForm({ ...classeForm, anneeScolaire: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClasseModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'filiere' ? 'تأكيد حذف الشعبة' : 'تأكيد حذف القسم'}
        message="هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لن يمكن التراجع عن هذه العملية."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

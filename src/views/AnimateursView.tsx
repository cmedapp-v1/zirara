import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { Animateur, Filiere, ParametresCentre } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface AnimateursViewProps {
  animateurs: Animateur[];
  filieres: Filiere[];
  parametres: ParametresCentre;
  onSaveAnimateur: (anim: Animateur) => void;
  onDeleteAnimateur: (id: string) => void;
}

export const AnimateursView: React.FC<AnimateursViewProps> = ({
  animateurs,
  filieres,
  parametres,
  onSaveAnimateur,
  onDeleteAnimateur
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnim, setEditingAnim] = useState<Animateur | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const initialFormData: Partial<Animateur> = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    fonction: 'Formateur',
    filiereId: filieres[0]?.id || '',
    matiere: '',
    statut: 'Actif',
    remarque: ''
  };

  const [formData, setFormData] = useState<Partial<Animateur>>(initialFormData);
  const filiereMap = new Map(filieres.map((f) => [f.id, f.nom]));

  const filtered = animateurs.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.matiere.toLowerCase().includes(q) ||
      a.telephone.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingAnim(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (anim: Animateur) => {
    setEditingAnim(anim);
    setFormData({ ...anim });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom?.trim() || !formData.prenom?.trim()) return;

    const saved: Animateur = {
      id: editingAnim ? editingAnim.id : `anim-${Date.now()}`,
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone || '',
      email: formData.email || '',
      fonction: (formData.fonction || 'Formateur') as any,
      filiereId: formData.filiereId || filieres[0]?.id || '',
      matiere: formData.matiere || 'تكوين عام',
      statut: formData.statut || 'Actif',
      remarque: formData.remarque || ''
    };

    onSaveAnimateur(saved);
    setIsFormOpen(false);
  };

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>الأطر التربوية والتكوينية</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            المنشطون والمدربون
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · بيانات إدارية توثيقية لربط الحصص والغيابات
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مؤطر / مدرب</span>
        </button>
      </div>

      {/* Notice box */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          تنبيه إداري: يتم تسجيل المنشطين والمدربين كبيانات إدارية فقط لربطهم بالحصص والغيابات، ولا يملكون حسابات دخول للنظام عملاً بمبدأ حساب المسؤول الحصري.
        </span>
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالاسم، المادة، رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
          />
        </div>

        <span className="text-[11px] text-slate-500 font-bold">
          عدد المؤطرين: <strong className="text-slate-900 font-black">{filtered.length}</strong>
        </span>
      </div>

      {/* 3. Animateurs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">المؤطر / المدرب</th>
                <th className="py-3 px-4">المهمة / الوظيفة</th>
                <th className="py-3 px-4">الشعبة والتخصص</th>
                <th className="py-3 px-4">المادة / الورشة</th>
                <th className="py-3 px-4">رقم الهاتف</th>
                <th className="py-3 px-4">البريد الإلكتروني</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    لا يوجد مؤطرون مطابقون لمعايير البحث
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const filNom = filiereMap.get(a.filiereId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                        {a.prenom} {a.nom}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-900 bg-blue-50/40 rounded-md">
                        {a.fonction}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold truncate max-w-[180px]">
                        {filNom || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-bold">
                        {a.matiere}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {a.telephone || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {a.email || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.statut === 'Actif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {a.statut === 'Actif' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="تعديل البيانات"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(a.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف"
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

      {/* 4. Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingAnim ? 'تعديل بيانات المؤطر' : 'إضافة مؤطر / مدرب جديد'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم الشخصي *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom || ''}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم العائلي *
                  </label>
                  <input
                    type="text"
                    value={formData.nom || ''}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المهمة / الوظيفة *
                </label>
                <select
                  value={formData.fonction || 'Formateur'}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value as any })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="Formateur">مكون / مدرب مهني</option>
                  <option value="Animateur">منشط تربوي</option>
                  <option value="Animatrice">منشطة تربوية</option>
                  <option value="Éducateur spécialisé">مربي متخصص</option>
                  <option value="Intervenant externe">متدخل خارجي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  الشعبة التابع لها *
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
                  المادة / الورشة التدريبية *
                </label>
                <input
                  type="text"
                  value={formData.matiere || ''}
                  onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  placeholder="مثال: الأعمال التطبيقية، السلامة المهنية..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={formData.statut || 'Actif'}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Actif">نشط</option>
                    <option value="Inactif">غير نشط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.ma"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
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
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="تأكيد حذف المؤطر"
        message="هل أنت متأكد من رغبتك في حذف هذا المؤطر من السجل الإداري؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteAnimateur(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

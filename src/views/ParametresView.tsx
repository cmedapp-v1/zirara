import React, { useState, useRef } from 'react';
import {
  Settings,
  Building,
  Shield,
  Database,
  Lock,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  UserCheck,
  KeyRound,
  Wifi,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ParametresCentre, CompteAdministratif, Beneficiaire, Animateur, UserRole } from '../types';
import { storage } from '../services/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { CMEDLogo } from '../components/CMEDLogo';

interface ParametresViewProps {
  parametres: ParametresCentre;
  comptesAdmin: CompteAdministratif[];
  beneficiaires?: Beneficiaire[];
  animateurs?: Animateur[];
  onSaveParametres: (params: ParametresCentre) => void;
  onSaveCompteAdmin: (compte: CompteAdministratif) => void;
  onDeleteCompteAdmin: (id: string) => void;
  onDataReset: () => void;
  onDataRestored: () => void;
}

export const ParametresView: React.FC<ParametresViewProps> = ({
  parametres,
  comptesAdmin,
  beneficiaires = [],
  animateurs = [],
  onSaveParametres,
  onSaveCompteAdmin,
  onDeleteCompteAdmin,
  onDataReset,
  onDataRestored
}) => {
  const [formData, setFormData] = useState<ParametresCentre>({ ...parametres });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Administrative accounts modal state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CompteAdministratif | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [accountFormError, setAccountFormError] = useState('');

  const initialAccountForm: Partial<CompteAdministratif> = {
    identifiant: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    roleTitre: 'مسؤول إداري',
    role: 'ADMIN',
    beneficiaireId: '',
    animateurId: '',
    motDePasse: 'admin123',
    statut: 'Actif'
  };
  const [accountFormData, setAccountFormData] = useState<Partial<CompteAdministratif>>(initialAccountForm);
  const [confirmDuplicateBenAccount, setConfirmDuplicateBenAccount] = useState(false);

  // Local network URL copy feedback
  const [copiedNetworkUrl, setCopiedNetworkUrl] = useState(false);
  const localNetworkUrl = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.1.100:3000';

  // Backup & Restore state
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveParametres(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormData(initialAccountForm);
    setAccountFormError('');
    setConfirmDuplicateBenAccount(false);
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: CompteAdministratif) => {
    setEditingAccount(acc);
    setAccountFormData({ ...acc });
    setAccountFormError('');
    setConfirmDuplicateBenAccount(false);
    setIsAccountModalOpen(true);
  };

  const handleSelectBeneficiaire = (benId: string) => {
    const ben = beneficiaires.find((b) => b.id === benId);
    if (!ben) {
      setAccountFormData({
        ...accountFormData,
        beneficiaireId: ''
      });
      return;
    }

    // Check if another account is already linked
    const existing = comptesAdmin.find(
      (a) => a.beneficiaireId === benId && a.id !== editingAccount?.id
    );

    setAccountFormData({
      ...accountFormData,
      beneficiaireId: ben.id,
      prenom: ben.prenomAr,
      nom: ben.nomAr,
      identifiant: accountFormData.identifiant || `ben_${ben.numeroMassar.toLowerCase()}`,
      roleTitre: `مستفيد (${ben.prenomAr} ${ben.nomAr})`,
      email: accountFormData.email || `${ben.numeroMassar.toLowerCase()}@cmedmaroc.org`
    });

    if (existing) {
      setAccountFormError(`تنبيه: هذا المستفيد مرتبط مسبقاً بالحساب «${existing.identifiant}». يرجى التأكيد إذا كنت ترغب في إنشاء حساب ثانٍ.`);
    } else {
      setAccountFormError('');
    }
  };

  const handleToggleAccountStatus = (acc: CompteAdministratif) => {
    const updated: CompteAdministratif = {
      ...acc,
      statut: acc.statut === 'Actif' ? 'Inactif' : 'Actif'
    };
    onSaveCompteAdmin(updated);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormData.identifiant?.trim()) {
      setAccountFormError('يرجى إدخال اسم المستخدم.');
      return;
    }
    if (!accountFormData.nom?.trim() || !accountFormData.prenom?.trim()) {
      setAccountFormError('يرجى إدخال الاسم والنسب.');
      return;
    }
    if (!accountFormData.motDePasse || accountFormData.motDePasse.length < 4) {
      setAccountFormError('يجب أن تتكون كلمة المرور من 4 أحرف أو أرقام على الأقل.');
      return;
    }

    // Check role === 'BENEFICIAIRE' requirement
    if (accountFormData.role === 'BENEFICIAIRE') {
      if (!accountFormData.beneficiaireId) {
        setAccountFormError('يرجى اختيار المستفيد المرتبط بهذا الحساب (حقل إلزامي لحسابات المستفيدين).');
        return;
      }

      // Check duplicate accounts for same beneficiary
      const duplicateBen = comptesAdmin.find(
        (a) => a.beneficiaireId === accountFormData.beneficiaireId && a.id !== editingAccount?.id
      );
      if (duplicateBen && !confirmDuplicateBenAccount) {
        setAccountFormError(`هذا المستفيد مرتبط بالحساب «${duplicateBen.identifiant}». يرجى وضع علامة الموافقة أدناه للسماح بإنشاء حساب إضافي.`);
        return;
      }
    }

    const cleanIdentifiant = accountFormData.identifiant.trim().toLowerCase();
    const existingUsername = comptesAdmin.find(
      (a) => a.identifiant.toLowerCase() === cleanIdentifiant && a.id !== editingAccount?.id
    );
    if (existingUsername) {
      setAccountFormError('اسم المستخدم هذا مستعمل من طرف حساب آخر.');
      return;
    }

    const saved: CompteAdministratif = {
      id: editingAccount ? editingAccount.id : `adm-${Date.now()}`,
      identifiant: cleanIdentifiant,
      nom: accountFormData.nom.trim(),
      prenom: accountFormData.prenom.trim(),
      email: accountFormData.email?.trim() || `${cleanIdentifiant}@cmedmaroc.org`,
      telephone: accountFormData.telephone?.trim() || '',
      roleTitre: accountFormData.roleTitre || (accountFormData.role === 'BENEFICIAIRE' ? 'مستفيد' : 'المسؤول الإداري'),
      role: accountFormData.role || 'ADMIN',
      beneficiaireId: accountFormData.role === 'BENEFICIAIRE' ? accountFormData.beneficiaireId : undefined,
      animateurId: accountFormData.role === 'ANIMATEUR' ? accountFormData.animateurId : undefined,
      motDePasse: accountFormData.motDePasse,
      statut: accountFormData.statut || 'Actif',
      dateCreation: editingAccount?.dateCreation || new Date().toISOString().split('T')[0],
      dernierAcces: editingAccount?.dernierAcces
    };

    onSaveCompteAdmin(saved);
    setIsAccountModalOpen(false);
  };

  const handleConfirmDeleteAccount = () => {
    if (deleteAccountId) {
      if (comptesAdmin.length <= 1) {
        setDeleteAccountId(null);
        return;
      }
      onDeleteCompteAdmin(deleteAccountId);
      setDeleteAccountId(null);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_مركز_الفرصة_الثانية_زرارة_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const result = storage.importBackupJSON(text);
        if (result.success) {
          setRestoreMessage({ text: 'تمت استعادة النسخة الاحتياطية بنجاح.', error: false });
          onDataRestored();
        } else {
          setRestoreMessage({ text: 'فشل استيراد النسخة الاحتياطية. يرجى التحقق من صحة الملف.', error: true });
        }
      } catch {
        setRestoreMessage({ text: 'الملف غير صالح أو تالف.', error: true });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    storage.resetToDefault();
    onDataReset();
    setIsResetConfirmOpen(false);
  };

  const copyNetworkAddress = () => {
    navigator.clipboard.writeText(localNetworkUrl);
    setCopiedNetworkUrl(true);
    setTimeout(() => setCopiedNetworkUrl(false), 2500);
  };

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl mx-auto font-arabic text-right select-none">
      {/* 1. Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-700" />
          <span>إعدادات المركز والنظام · {parametres.nomCentre} {parametres.nomSousTitre}</span>
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          إعدادات المؤسسة الرسمية، حسابات المستخدمين (المسؤول، المؤطر، المستفيد)، الخادم والنسخ الاحتياطي
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم حفظ الإعدادات بنجاح.</span>
        </div>
      )}

      {/* 2. Multiple User Accounts Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>إدارة الحسابات والمستخدمين ({comptesAdmin.length})</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              صلاحيات الدخول لـ Admin، المؤطرين (Animateurs)، وحسابات المستفيدين (Bénéficiaires) المرتبطة بـ ID
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddAccount}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب مستخدم</span>
          </button>
        </div>

        {/* Table of Accounts */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-black border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">اسم المستخدم</th>
                <th className="px-3 py-2.5">الاسم والنسب</th>
                <th className="px-3 py-2.5">نوع الحساب / الصلاحية</th>
                <th className="px-3 py-2.5">المستفيد المرتبط</th>
                <th className="px-3 py-2.5 text-center">الحالة</th>
                <th className="px-3 py-2.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comptesAdmin.map((acc) => {
                const linkedBen = acc.beneficiaireId
                  ? beneficiaires.find((b) => b.id === acc.beneficiaireId)
                  : null;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                      {acc.identifiant}
                    </td>
                    <td className="px-3 py-2.5 font-black text-slate-800">
                      {acc.prenom} {acc.nom}
                    </td>
                    <td className="px-3 py-2.5">
                      {acc.role === 'BENEFICIAIRE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          <GraduationCap className="w-3 h-3" />
                          <span>Bénéficiaire (مستفيد)</span>
                        </span>
                      ) : acc.role === 'ANIMATEUR' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span>Animateur (مؤطر)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3" />
                          <span>Admin (إدارة)</span>
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {acc.roleTitre}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {linkedBen ? (
                        <div>
                          <div className="font-bold text-slate-900">
                            {linkedBen.prenomAr} {linkedBen.nomAr}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            مسار: {linkedBen.numeroMassar}
                          </div>
                        </div>
                      ) : acc.role === 'BENEFICIAIRE' ? (
                        <span className="text-rose-600 text-[10px] font-bold">غير مرتبط!</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAccountStatus(acc)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          acc.statut === 'Actif'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="انقر لتفعيل أو تعطيل الحساب"
                      >
                        {acc.statut === 'Actif' ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditAccount(acc)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="تعديل الحساب أو تغيير كلمة المرور"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {comptesAdmin.length > 1 && (
                          <button
                            onClick={() => setDeleteAccountId(acc.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="حذف هذا الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Center Official Identity */}
      <form onSubmit={handleSaveParams} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Building className="w-4 h-4 text-blue-700" />
          <span>إعدادات المركز والهوية المؤسساتية</span>
        </h2>

        {/* Logo preview */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-800">
              الشعار المؤسساتي المعتمد (CMED)
            </span>
            <p className="text-[11px] text-slate-500 font-semibold">
              شعار الهيئة المغربية للتربية والتنمية المعتمد لطباعة الأوراق والاستدعاءات الرسمية.
            </p>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0">
            <CMEDLogo className="w-48 h-auto" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              اسم المركز الرسمي *
            </label>
            <input
              type="text"
              value={formData.nomCentre}
              onChange={(e) => setFormData({ ...formData, nomCentre: e.target.value })}
              required
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              العنوان الفرعي للمؤسسة *
            </label>
            <input
              type="text"
              value={formData.nomSousTitre}
              onChange={(e) => setFormData({ ...formData, nomSousTitre: e.target.value })}
              required
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              السنة التكوينية النشطة *
            </label>
            <input
              type="text"
              value={formData.anneeScolaireActive}
              onChange={(e) => setFormData({ ...formData, anneeScolaireActive: e.target.value })}
              required
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              اسم مدير المركز
            </label>
            <input
              type="text"
              value={formData.directeurNom}
              onChange={(e) => setFormData({ ...formData, directeurNom: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              المدينة
            </label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              العنوان الكامل
            </label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              الهاتف الإداري
            </label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>

      {/* 4. Local Network Server Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Wifi className="w-4 h-4 text-emerald-600" />
          <span>الخادم المحلي والشبكة الداخلية (LAN Server)</span>
        </h2>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-900">
                الخادم المحلي يعمل وجاهز للربط
              </span>
            </div>
            <span className="text-[11px] font-mono bg-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-bold">
              Port: 3000
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            يمكن لجميع الأجهزة المرتبطة بنفس شبكة Wi-Fi أو الكابل (حواسب الإدارة، هواتف المؤطرين) فتح التطبيق عبر الرابط التالي:
          </p>

          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-300 font-mono text-xs">
            <span className="text-blue-900 font-bold flex-1 truncate text-left" dir="ltr">
              {localNetworkUrl}
            </span>
            <button
              type="button"
              onClick={copyNetworkAddress}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition-colors shrink-0"
            >
              {copiedNetworkUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNetworkUrl ? 'تم النسخ!' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Backup & Restore Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Database className="w-4 h-4 text-blue-700" />
          <span>النسخ الاحتياطي وإدارة البيانات</span>
        </h2>

        <p className="text-xs text-slate-500 font-medium">
          قم بتصدير نسخة احتياطية دورية بصيغة JSON لحفظ كامل سجلات الحضور والمستفيدين والمخالفات، أو استرجاعها عند تغيير الجهاز.
        </p>

        {restoreMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              restoreMessage.error
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {restoreMessage.error ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{restoreMessage.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>استيراد واستعادة نسخة احتياطية</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black rounded-xl transition-colors mr-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة ضبط البيانات الافتراضية</span>
          </button>
        </div>
      </div>

      {/* 6. User Account Modal (Admin / Animateur / Beneficiaire) */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingAccount ? 'تعديل حساب المستخدم' : 'إنشاء حساب مستخدم جديد'}</span>
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {accountFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold leading-relaxed">
                  {accountFormError}
                </div>
              )}

              {/* Account Type Selector (ADMIN / ANIMATEUR / BENEFICIAIRE) */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  نوع الحساب والصلاحية (Type de compte) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, role: 'ADMIN', roleTitre: 'مسؤول إداري' })}
                    className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                      (accountFormData.role || 'ADMIN') === 'ADMIN'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👑 Admin (إدارة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, role: 'ANIMATEUR', roleTitre: 'مؤطر / مدرب' })}
                    className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                      accountFormData.role === 'ANIMATEUR'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👨‍🏫 Animateur (مؤطر)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, role: 'BENEFICIAIRE', roleTitre: 'مستفيد' })}
                    className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                      accountFormData.role === 'BENEFICIAIRE'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎓 Bénéficiaire (مستفيد)
                  </button>
                </div>
              </div>

              {/* Mandatory Beneficiary selector if role === 'BENEFICIAIRE' */}
              {accountFormData.role === 'BENEFICIAIRE' && (
                <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-black text-purple-900">
                    المستفيد المرتبط بالحساب (ربط إلزامي عبر Beneficiary ID) *
                  </label>
                  <select
                    value={accountFormData.beneficiaireId || ''}
                    onChange={(e) => handleSelectBeneficiaire(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs bg-white border border-purple-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="">-- اختر المستفيد من اللائحة --</option>
                    {beneficiaires.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.prenomAr} {b.nomAr} — {b.prenomFr} {b.nomFr} (مسار: {b.numeroMassar})
                      </option>
                    ))}
                  </select>

                  {accountFormData.beneficiaireId && (
                    <div className="text-[11px] text-purple-800 font-semibold pt-1">
                      المستفيد المحدد: <strong className="text-purple-950 font-black">{accountFormData.prenom} {accountFormData.nom}</strong>
                      <br />
                      رقم مسار: <span className="font-mono">{beneficiaires.find(b => b.id === accountFormData.beneficiaireId)?.numeroMassar}</span>
                    </div>
                  )}

                  {/* Allow duplicate checkbox if needed */}
                  {accountFormError.includes('مرتبط مسبقاً') && (
                    <label className="flex items-center gap-2 text-[11px] font-black text-amber-900 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmDuplicateBenAccount}
                        onChange={(e) => setConfirmDuplicateBenAccount(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded-md"
                      />
                      <span>أؤكد كمسؤول السماح بإنشاء حساب إضافي لهذا المستفيد</span>
                    </label>
                  )}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  اسم المستخدم (Identifiant) *
                </label>
                <input
                  type="text"
                  value={accountFormData.identifiant || ''}
                  onChange={(e) => setAccountFormData({ ...accountFormData, identifiant: e.target.value })}
                  placeholder="مثال: admin, mohammed, beneficiary001..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم الشخصي *
                  </label>
                  <input
                    type="text"
                    value={accountFormData.prenom || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, prenom: e.target.value })}
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
                    value={accountFormData.nom || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, nom: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Title / Role description */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  المهمة الإدارية أو الصفة *
                </label>
                <input
                  type="text"
                  value={accountFormData.roleTitre || ''}
                  onChange={(e) => setAccountFormData({ ...accountFormData, roleTitre: e.target.value })}
                  placeholder="مثال: مدير المركز، الحراسة العامة، مؤطر، مستفيد..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  كلمة المرور *
                </label>
                <input
                  type="text"
                  value={accountFormData.motDePasse || ''}
                  onChange={(e) => setAccountFormData({ ...accountFormData, motDePasse: e.target.value })}
                  placeholder="أدخل كلمة المرور..."
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Contact & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={accountFormData.telephone || ''}
                    onChange={(e) => setAccountFormData({ ...accountFormData, telephone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    حالة الحساب
                  </label>
                  <select
                    value={accountFormData.statut || 'Actif'}
                    onChange={(e) => setAccountFormData({ ...accountFormData, statut: e.target.value as any })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Actif">نشط</option>
                    <option value="Inactif">غير نشط (معطل)</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteAccountId)}
        title="تأكيد حذف الحساب"
        message="هل أنت متأكد من حذف هذا الحساب؟ لن يتمكن صاحبه من تسجيل الدخول إلى النظام."
        confirmLabel="حذف الحساب"
        cancelLabel="إلغاء"
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setDeleteAccountId(null)}
      />

      {/* Data Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="إعادة ضبط بيانات المركز الافتراضية"
        message="تحذير: سيتم مسح التعديلات المؤقتة وإعادة تحميل البيانات النموذجية الأصلية. هل تود المتابعة؟"
        confirmLabel="تأكيد إعادة الضبط"
        cancelLabel="تراجع"
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

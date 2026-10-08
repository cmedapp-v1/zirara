import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Trash2,
  Edit2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  AlertTriangle,
  Check,
  CheckSquare,
  Square,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  NiveauScolaire,
  Sexe,
  StatutBeneficiaire,
  EnregistrementPresence,
  Infraction,
  Convocation,
  ParametresCentre,
  CompteAdministratif
} from '../types';
import { excelUtils, ExcelImportAnalysis } from '../utils/excel';
import { ConfirmModal } from '../components/ConfirmModal';
import { FicheIndividuelleModal } from './FicheIndividuelleModal';
import {
  AR_NIVEAUX_SCOLAIRES,
  formatNiveauAr,
  formatSexeAr,
  formatStatutBeneficiaireAr
} from '../utils/arabicLabels';

interface BeneficiairesViewProps {
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  presences: EnregistrementPresence[];
  infractions: Infraction[];
  convocations: Convocation[];
  parametres: ParametresCentre;
  comptesAdmin?: CompteAdministratif[];
  currentUserRole?: 'ADMIN' | 'ANIMATEUR' | 'BENEFICIAIRE';
  onSaveBeneficiaire: (ben: Beneficiaire) => void;
  onDeleteBeneficiaire: (id: string) => void;
  onDeleteMultipleBeneficiaires?: (ids: string[]) => void;
  onImportBeneficiaires: (newBens: Beneficiaire[]) => void;
  onDisableAccountForBeneficiaire?: (beneficiaireId: string) => void;
}

export const BeneficiairesView: React.FC<BeneficiairesViewProps> = ({
  beneficiaires,
  filieres,
  classes,
  presences,
  infractions,
  convocations,
  parametres,
  comptesAdmin = [],
  currentUserRole = 'ADMIN',
  onSaveBeneficiaire,
  onDeleteBeneficiaire,
  onDeleteMultipleBeneficiaires,
  onImportBeneficiaires,
  onDisableAccountForBeneficiaire
}) => {
  const isAdmin = currentUserRole === 'ADMIN';

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');
  const [classeFilter, setClasseFilter] = useState('');
  const [sexeFilter, setSexeFilter] = useState('');
  const [niveauFilter, setNiveauFilter] = useState('');
  const [anneeFilter, setAnneeFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Success / Info notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBen, setEditingBen] = useState<Beneficiaire | null>(null);
  const [selectedForFiche, setSelectedForFiche] = useState<Beneficiaire | null>(null);

  // Deletion modals state
  const [deleteTargetBen, setDeleteTargetBen] = useState<Beneficiaire | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [disableLinkedAccounts, setDisableLinkedAccounts] = useState(true);

  // Excel Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState<ExcelImportAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewTab, setPreviewTab] = useState<'valid' | 'duplicate' | 'error'>('valid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const initialFormState: Partial<Beneficiaire> = {
    numeroInscription: `INS-2025-${String(beneficiaires.length + 1).padStart(3, '0')}`,
    numeroMassar: '',
    nomAr: '',
    prenomAr: '',
    nomFr: '',
    prenomFr: '',
    sexe: 'Masculin',
    dateNaissance: '2008-01-01',
    lieuNaissance: parametres.ville || 'زرارة',
    niveauScolaire: '2 إعدادي',
    filiereId: filieres[0]?.id || '',
    classeId: classes[0]?.id || '',
    telephone: '',
    telephoneTuteur: '',
    nomTuteur: '',
    adresse: parametres.ville || 'زرارة',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    anneeScolaire: parametres.anneeScolaireActive,
    statut: 'En cours',
    dateInscription: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState<Partial<Beneficiaire>>(initialFormState);
  const [customNiveau, setCustomNiveau] = useState('');
  const [isCustomNiveauActive, setIsCustomNiveauActive] = useState(false);
  const [formError, setFormError] = useState('');

  const filiereMap = useMemo(() => new Map(filieres.map((f) => [f.id, f])), [filieres]);
  const classeMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Map of linked accounts by beneficiaireId
  const linkedAccountsMap = useMemo(() => {
    const map = new Map<string, CompteAdministratif[]>();
    comptesAdmin.forEach((acc) => {
      if (acc.beneficiaireId) {
        const list = map.get(acc.beneficiaireId) || [];
        list.push(acc);
        map.set(acc.beneficiaireId, list);
      }
    });
    return map;
  }, [comptesAdmin]);

  // Filtered beneficiaries
  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter((b) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase().trim();
        const match =
          b.nomFr.toLowerCase().includes(q) ||
          b.prenomFr.toLowerCase().includes(q) ||
          b.nomAr.includes(q) ||
          b.prenomAr.includes(q) ||
          b.numeroMassar.toLowerCase().includes(q) ||
          b.numeroInscription.toLowerCase().includes(q) ||
          b.telephone.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filiereFilter && b.filiereId !== filiereFilter) return false;
      if (classeFilter && b.classeId !== classeFilter) return false;
      if (sexeFilter && b.sexe !== sexeFilter) return false;
      if (niveauFilter && b.niveauScolaire !== niveauFilter) return false;
      if (anneeFilter && b.anneeScolaire !== anneeFilter) return false;
      if (statutFilter && b.statut !== statutFilter) return false;
      return true;
    });
  }, [beneficiaires, searchTerm, filiereFilter, classeFilter, sexeFilter, niveauFilter, anneeFilter, statutFilter]);

  // Selection handlers
  const isAllSelected = filteredBeneficiaires.length > 0 && filteredBeneficiaires.every((b) => selectedIds.has(b.id));
  const isSomeSelected = filteredBeneficiaires.some((b) => selectedIds.has(b.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      filteredBeneficiaires.forEach((b) => next.add(b.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Form Handlers
  const handleOpenAdd = () => {
    setEditingBen(null);
    setFormData({
      ...initialFormState,
      numeroInscription: `INS-2025-${String(beneficiaires.length + 1).padStart(3, '0')}`
    });
    setCustomNiveau('');
    setIsCustomNiveauActive(false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ben: Beneficiaire) => {
    setEditingBen(ben);
    setFormData({ ...ben });
    const standardLevels = ['4 ابتدائي', '5 ابتدائي', '6 ابتدائي', '1 إعدادي', '2 إعدادي', '3 إعدادي'];
    if (ben.niveauScolaire && !standardLevels.includes(ben.niveauScolaire)) {
      setIsCustomNiveauActive(true);
      setCustomNiveau(ben.niveauScolaire);
    } else {
      setIsCustomNiveauActive(false);
      setCustomNiveau('');
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroMassar || !formData.numeroInscription) {
      setFormError('يرجى ملء رقم مسار ورقم التسجيل.');
      return;
    }
    if (!formData.nomAr || !formData.prenomAr || !formData.nomFr || !formData.prenomFr) {
      setFormError('يرجى ملء الاسم والنسب بالعربية والفرنسية.');
      return;
    }

    // Check duplicate massar
    const massarUpper = formData.numeroMassar.trim().toUpperCase();
    const existing = beneficiaires.find(
      (b) => b.id !== editingBen?.id && b.numeroMassar.toUpperCase() === massarUpper
    );
    if (existing) {
      setFormError(`رقم مسار «${massarUpper}» مستعمل بالفعل للمستفيد ${existing.prenomAr} ${existing.nomAr}.`);
      return;
    }

    const finalNiveau = isCustomNiveauActive && customNiveau.trim()
      ? customNiveau.trim()
      : (formData.niveauScolaire || '2 إعدادي');

    const saved: Beneficiaire = {
      id: editingBen ? editingBen.id : `ben-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      numeroInscription: formData.numeroInscription.trim(),
      numeroMassar: massarUpper,
      nomAr: formData.nomAr.trim(),
      prenomAr: formData.prenomAr.trim(),
      nomFr: formData.nomFr.trim(),
      prenomFr: formData.prenomFr.trim(),
      sexe: formData.sexe as Sexe,
      dateNaissance: formData.dateNaissance || '2008-01-01',
      lieuNaissance: formData.lieuNaissance || parametres.ville || 'زرارة',
      niveauScolaire: finalNiveau,
      filiereId: formData.filiereId || filieres[0]?.id || '',
      classeId: formData.classeId || classes[0]?.id || '',
      telephone: formData.telephone || '',
      telephoneTuteur: formData.telephoneTuteur || '',
      nomTuteur: formData.nomTuteur || '',
      adresse: formData.adresse || parametres.ville || 'زرارة',
      photoUrl: formData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${massarUpper}`,
      anneeScolaire: formData.anneeScolaire || parametres.anneeScolaireActive,
      statut: (formData.statut || 'En cours') as StatutBeneficiaire,
      dateInscription: editingBen ? editingBen.dateInscription : (formData.dateInscription || new Date().toISOString().split('T')[0]),
      remarques: formData.remarques || ''
    };

    onSaveBeneficiaire(saved);
    setIsFormOpen(false);
    showToast(editingBen ? 'تم تعديل بيانات المستفيد بنجاح.' : 'تمت إضافة المستفيد بنجاح.');
  };

  // Single Delete
  const handleRequestSingleDelete = (ben: Beneficiaire) => {
    setDeleteTargetBen(ben);
  };

  const handleConfirmSingleDelete = () => {
    if (!deleteTargetBen) return;
    const benId = deleteTargetBen.id;
    if (disableLinkedAccounts && onDisableAccountForBeneficiaire) {
      onDisableAccountForBeneficiaire(benId);
    }
    onDeleteBeneficiaire(benId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(benId);
      return next;
    });
    setDeleteTargetBen(null);
    showToast(`تم حذف المستفيد «${deleteTargetBen.prenomAr} ${deleteTargetBen.nomAr}» بنجاح.`);
  };

  // Bulk Delete
  const selectedLinkedCount = useMemo(() => {
    let count = 0;
    selectedIds.forEach((id) => {
      if (linkedAccountsMap.has(id)) count++;
    });
    return count;
  }, [selectedIds, linkedAccountsMap]);

  const handleConfirmBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (disableLinkedAccounts && onDisableAccountForBeneficiaire) {
      ids.forEach((id) => onDisableAccountForBeneficiaire(id));
    }

    if (onDeleteMultipleBeneficiaires) {
      onDeleteMultipleBeneficiaires(ids);
    } else {
      ids.forEach((id) => onDeleteBeneficiaire(id));
    }

    setSelectedIds(new Set());
    setIsBulkDeleteModalOpen(false);
    showToast(`تم حذف ${ids.length} مستفيد(ين) محددين بنجاح.`);
  };

  // Excel Import Flow
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setImportAnalysis(null);

    try {
      const analysis = await excelUtils.analyzeBeneficiaireExcel(
        file,
        filieres,
        classes,
        beneficiaires
      );
      setImportAnalysis(analysis);
      if (analysis.validRows.length > 0) {
        setPreviewTab('valid');
      } else if (analysis.duplicateRows.length > 0) {
        setPreviewTab('duplicate');
      } else {
        setPreviewTab('error');
      }
    } catch (err: any) {
      setImportAnalysis({
        totalRows: 0,
        validRows: [],
        duplicateRows: [],
        errorRows: [
          {
            rowNumber: 1,
            raw: {},
            reason: `حدث خطأ أثناء قراءة ملف Excel: ${err.message || 'صيغة غير مدعومة'}`
          }
        ]
      });
      setPreviewTab('error');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!importAnalysis || importAnalysis.validRows.length === 0) return;
    const count = importAnalysis.validRows.length;
    onImportBeneficiaires(importAnalysis.validRows);
    setIsImportModalOpen(false);
    setImportAnalysis(null);
    showToast(`تم استيراد ${count} مستفيدًا بنجاح.`);
  };

  const handleCancelImport = () => {
    setIsImportModalOpen(false);
    setImportAnalysis(null);
  };

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right select-none">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Title & Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>إدارة المستفيدين والملفات المدرسية</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            لائحة المستفيدين · {parametres.nomCentre} {parametres.nomSousTitre}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            إدارة متكاملة لبيانات التلاميذ، الحذف الفردي والجماعي، واستيراد ملفات Excel المعتمدة
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Excel Template */}
          <button
            type="button"
            onClick={() => excelUtils.downloadBeneficiaireTemplate()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="تحميل نموذج Excel الرسمي لتعبئة المستفيدين"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>📄 تحميل نموذج Excel</span>
          </button>

          {/* Import Excel */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setImportAnalysis(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              title="استيراد لائحة المستفيدين من ملف Excel"
            >
              <Upload className="w-4 h-4" />
              <span>📥 استيراد المستفيدين Excel</span>
            </button>
          )}

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => excelUtils.exportBeneficiaires(filteredBeneficiaires, filieres, classes)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            title="تصدير المستفيدين إلى ملف Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير البيانات</span>
          </button>

          {/* Add Beneficiary (Admin Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مستفيد</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Floating Selection Bar (Appears when 1 or more beneficiaries selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-l from-[#0B2545] to-[#1E3A8A] text-white p-4 rounded-2xl shadow-lg border border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/30 text-blue-200 font-mono font-black text-xs">
              {selectedIds.size}
            </span>
            <div>
              <p className="text-xs font-black">
                {selectedIds.size === 1
                  ? 'مستفيد واحد محدد'
                  : selectedIds.size === 2
                  ? 'مستفيدان محددان'
                  : `${selectedIds.size} مستفيدين محددين`}
              </p>
              <p className="text-[11px] text-blue-200">
                يمكنك حذف المحددين دفعة واحدة أو إلغاء التحديد
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>🗑️ حذف المحددين ({selectedIds.size})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* 3. Search and Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Quick Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالاسم، النسب، رقم مسار، رقم التسجيل، الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium text-right"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Sexe */}
            <select
              value={sexeFilter}
              onChange={(e) => setSexeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-blue-500 font-bold"
            >
              <option value="">الجنس (الكل)</option>
              <option value="Masculin">ذكر</option>
              <option value="Féminin">أنثى</option>
            </select>

            {/* Niveau */}
            <select
              value={niveauFilter}
              onChange={(e) => setNiveauFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-blue-500 font-bold"
            >
              <option value="">المستوى (الكل)</option>
              {AR_NIVEAUX_SCOLAIRES.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {/* Filière */}
            <select
              value={filiereFilter}
              onChange={(e) => setFiliereFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-blue-500 font-bold"
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
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-blue-500 font-bold"
            >
              <option value="">جميع الأقسام</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>

            {/* Statut */}
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-blue-500 font-bold"
            >
              <option value="">الحالة (الكل)</option>
              <option value="En cours">مستمر</option>
              <option value="Inscrit">مسجل</option>
              <option value="Abandonné">منقطع</option>
              <option value="Réorienté">تمت إعادة توجيهه</option>
              <option value="Diplômé">متخرج</option>
            </select>
          </div>
        </div>

        {/* Counter & Reset Filter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pt-1 border-t border-slate-100">
          <span>
            عدد النتائج المعروضة: <strong className="text-slate-900 font-black">{filteredBeneficiaires.length}</strong> من أصل {beneficiaires.length}
          </span>
          {(searchTerm || filiereFilter || classeFilter || sexeFilter || niveauFilter || statutFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFiliereFilter('');
                setClasseFilter('');
                setSexeFilter('');
                setNiveauFilter('');
                setStatutFilter('');
              }}
              className="text-rose-600 hover:underline font-bold"
            >
              إلغاء التصفية
            </button>
          )}
        </div>
      </div>

      {/* 4. Beneficiaires Table with Checkboxes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                      title="تحديد الكل"
                    />
                  </label>
                </th>
                <th className="py-3 px-2 w-12 text-center">الرقم</th>
                <th className="py-3 px-3 text-center">الصورة</th>
                <th className="py-3 px-3">رقم التسجيل</th>
                <th className="py-3 px-3">رقم مسار</th>
                <th className="py-3 px-3">الاسم والنسب (عربي / فرنسي)</th>
                <th className="py-3 px-3 text-center">الجنس</th>
                <th className="py-3 px-3">الشعبة والقسم</th>
                <th className="py-3 px-3">المستوى الدراسي</th>
                <th className="py-3 px-3">الهاتف</th>
                <th className="py-3 px-3 text-center">الحساب</th>
                <th className="py-3 px-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBeneficiaires.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-bold">
                    لا يوجد مستفيدون يطابقون معايير البحث
                  </td>
                </tr>
              ) : (
                filteredBeneficiaires.map((ben, idx) => {
                  const fil = filiereMap.get(ben.filiereId);
                  const cls = classeMap.get(ben.classeId);
                  const isSelected = selectedIds.has(ben.id);
                  const linkedAccounts = linkedAccountsMap.get(ben.id) || [];

                  return (
                    <tr
                      key={ben.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(ben.id)}
                          className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Order Number */}
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-500 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Photo */}
                      <td className="py-3 px-3 text-center">
                        <img
                          src={ben.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ben.numeroMassar || ben.id}`}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs mx-auto"
                        />
                      </td>

                      {/* N° Inscription */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {ben.numeroInscription}
                      </td>

                      {/* N° Massar */}
                      <td className="py-3 px-3 font-mono font-black text-blue-900 bg-blue-50/40 rounded-md">
                        {ben.numeroMassar}
                      </td>

                      {/* Names AR / FR */}
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-900 text-xs">
                          {ben.prenomAr} {ben.nomAr}
                        </div>
                        <div className="font-latin text-[10px] text-slate-500 font-semibold">
                          {ben.prenomFr} {ben.nomFr}
                        </div>
                      </td>

                      {/* Sexe */}
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${
                            ben.sexe === 'Masculin' || ben.sexe === ('ذكر' as any)
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {formatSexeAr(ben.sexe)}
                        </span>
                      </td>

                      {/* Filière & Classe */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{fil?.nom || '-'}</div>
                        <div className="text-[10px] text-slate-500">{cls?.nom || '-'}</div>
                      </td>

                      {/* Niveau scolaire */}
                      <td className="py-3 px-3 font-bold text-slate-700">
                        {formatNiveauAr(ben.niveauScolaire)}
                      </td>

                      {/* Téléphone */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {ben.telephone || '-'}
                      </td>

                      {/* Linked User Account indicator */}
                      <td className="py-3 px-3 text-center">
                        {linkedAccounts.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800"
                            title={`مرتبط بالحساب: ${linkedAccounts.map((a) => a.identifiant).join(', ')}`}
                          >
                            <span>حساب مفعل</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">بدون حساب</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Fiche */}
                          <button
                            type="button"
                            onClick={() => setSelectedForFiche(ben)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض البطاقة الفردية للطباعة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit (Admin Only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ben)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="تعديل بيانات المستفيد"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete (Admin Only) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRequestSingleDelete(ben)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="حذف المستفيد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* 5. Add / Edit Beneficiary Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-arabic">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between">
              <h2 className="text-base font-black">
                {editingBen ? 'تعديل بيانات المستفيد' : 'إضافة مستفيد جديد'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Photo du Bénéficiaire */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={formData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.numeroMassar || 'avatar'}`}
                    alt="صورة المستفيد"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                  />
                </div>
                <div className="flex-1 w-full space-y-2 text-right">
                  <label className="block text-xs font-black text-slate-700">
                    الصورة الشخصية للمستفيد (واضحة ومناسبة للملف)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors">
                      <span>📷 رفع صورة من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setFormData((prev) => ({ ...prev, photoUrl: evt.target!.result as string }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const seed = formData.numeroMassar || `avatar-${Date.now()}`;
                        setFormData((prev) => ({
                          ...prev,
                          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
                        }));
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      🎲 توليد صورة رمزية
                    </button>
                  </div>
                  <input
                    type="url"
                    value={formData.photoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="أو أدخل رابط الصورة مباشرة (URL)..."
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Administrative IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم التسجيل الداخلي *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroInscription || ''}
                    onChange={(e) => setFormData({ ...formData, numeroInscription: e.target.value })}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    رقم مسار (Massar) *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroMassar || ''}
                    onChange={(e) => setFormData({ ...formData, numeroMassar: e.target.value })}
                    required
                    placeholder="مثال: G139988112"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Arabic Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم الشخصي (بالعربية) *
                  </label>
                  <input
                    type="text"
                    value={formData.prenomAr || ''}
                    onChange={(e) => setFormData({ ...formData, prenomAr: e.target.value })}
                    required
                    placeholder="الاسم الشخصي بالعربية"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم العائلي / النسب (بالعربية) *
                  </label>
                  <input
                    type="text"
                    value={formData.nomAr || ''}
                    onChange={(e) => setFormData({ ...formData, nomAr: e.target.value })}
                    required
                    placeholder="النسب بالعربية"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* French Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم الشخصي بالفرنسية (Prénom) *
                  </label>
                  <input
                    type="text"
                    value={formData.prenomFr || ''}
                    onChange={(e) => setFormData({ ...formData, prenomFr: e.target.value })}
                    required
                    placeholder="Prénom en français"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-latin font-bold text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الاسم العائلي بالفرنسية (Nom) *
                  </label>
                  <input
                    type="text"
                    value={formData.nomFr || ''}
                    onChange={(e) => setFormData({ ...formData, nomFr: e.target.value })}
                    required
                    placeholder="Nom de famille en français"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-latin font-bold text-left"
                  />
                </div>
              </div>

              {/* Sexe, Date de naissance, Lieu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الجنس *
                  </label>
                  <select
                    value={formData.sexe || 'Masculin'}
                    onChange={(e) => setFormData({ ...formData, sexe: e.target.value as Sexe })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Masculin">ذكر</option>
                    <option value="Féminin">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    تاريخ الازدياد *
                  </label>
                  <input
                    type="date"
                    value={formData.dateNaissance || '2008-01-01'}
                    onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    مكان الازدياد
                  </label>
                  <input
                    type="text"
                    value={formData.lieuNaissance || ''}
                    onChange={(e) => setFormData({ ...formData, lieuNaissance: e.target.value })}
                    placeholder="مكان الازدياد (زرارة)"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Niveau scolaire with 'آخر' manual entry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    المستوى الدراسي *
                  </label>
                  <select
                    value={isCustomNiveauActive ? 'آخر' : (formData.niveauScolaire || '2 إعدادي')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'آخر') {
                        setIsCustomNiveauActive(true);
                      } else {
                        setIsCustomNiveauActive(false);
                        setFormData({ ...formData, niveauScolaire: val });
                      }
                    }}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="4 ابتدائي">4 ابتدائي</option>
                    <option value="5 ابتدائي">5 ابتدائي</option>
                    <option value="6 ابتدائي">6 ابتدائي</option>
                    <option value="1 إعدادي">1 إعدادي</option>
                    <option value="2 إعدادي">2 إعدادي</option>
                    <option value="3 إعدادي">3 إعدادي</option>
                    <option value="آخر">آخر (إدخال يدوي)</option>
                  </select>
                </div>

                {isCustomNiveauActive && (
                  <div>
                    <label className="block text-xs font-black text-blue-700 mb-1">
                      حدد المستوى يدوياً *
                    </label>
                    <input
                      type="text"
                      value={customNiveau}
                      onChange={(e) => setCustomNiveau(e.target.value)}
                      placeholder="أدخل المستوى الدراسي..."
                      required
                      className="w-full p-2.5 text-xs bg-blue-50/50 border border-blue-300 rounded-xl font-bold"
                    />
                  </div>
                )}

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
                    القسم / الفوج *
                  </label>
                  <select
                    value={formData.classeId || ''}
                    onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {classes
                      .filter((c) => !formData.filiereId || c.filiereId === formData.filiereId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Tuteur & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    هاتف المستفيد
                  </label>
                  <input
                    type="text"
                    value={formData.telephone || ''}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    اسم ولي الأمر
                  </label>
                  <input
                    type="text"
                    value={formData.nomTuteur || ''}
                    onChange={(e) => setFormData({ ...formData, nomTuteur: e.target.value })}
                    placeholder="اسم الأب أو الأم"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    هاتف ولي الأمر
                  </label>
                  <input
                    type="text"
                    value={formData.telephoneTuteur || ''}
                    onChange={(e) => setFormData({ ...formData, telephoneTuteur: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Address, Année, Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    العنوان السكني
                  </label>
                  <input
                    type="text"
                    value={formData.adresse || ''}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="العنوان السكني (زرارة)"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    السنة الدراسية
                  </label>
                  <input
                    type="text"
                    value={formData.anneeScolaire || parametres.anneeScolaireActive}
                    onChange={(e) => setFormData({ ...formData, anneeScolaire: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    الحالة التكوينية
                  </label>
                  <select
                    value={formData.statut || 'En cours'}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as StatutBeneficiaire })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="En cours">مستمر</option>
                    <option value="Inscrit">مسجل</option>
                    <option value="Abandonné">منقطع</option>
                    <option value="Réorienté">تمت إعادة توجيهه</option>
                    <option value="Diplômé">متخرج</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Single Delete Confirmation Modal */}
      {deleteTargetBen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>تأكيد حذف المستفيد</span>
              </h3>
              <button
                onClick={() => setDeleteTargetBen(null)}
                className="p-1 text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="font-black text-slate-900 text-sm">
                هل أنت متأكد من حذف المستفيد:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-black text-slate-900">
                  {deleteTargetBen.prenomAr} {deleteTargetBen.nomAr} ({deleteTargetBen.prenomFr} {deleteTargetBen.nomFr})
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  مسار: {deleteTargetBen.numeroMassar} · التسجيل: {deleteTargetBen.numeroInscription}
                </div>
              </div>

              {/* Warning if linked to user account */}
              {linkedAccountsMap.has(deleteTargetBen.id) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>تنبيه: هذا المستفيد مرتبط بحساب مستخدم مسجل</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                    هذا المستفيد لديه حساب تسجيل دخول نشط ({linkedAccountsMap.get(deleteTargetBen.id)?.map((a) => a.identifiant).join(', ')}). هل تريد تعطيل الحساب المرتبط؟
                  </p>
                  <label className="flex items-center gap-2 text-xs font-black text-amber-900 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={disableLinkedAccounts}
                      onChange={(e) => setDisableLinkedAccounts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-amber-300"
                    />
                    <span>تعطيل الحساب المرتبط بهذا المستفيد</span>
                  </label>
                </div>
              )}

              <p className="text-[11px] text-slate-500 font-semibold">
                سيتم منع الحذف العرضي ولن تتم العملية إلا بعد تأكيدك.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetBen(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSingleDelete}
                  className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right">
            <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-white" />
                <span>تأكيد حذف المستفيدين المحددين</span>
              </h3>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="p-1 text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-black text-sm">
                هل أنت متأكد من حذف المستفيدين المحددين؟ (عددهم: {selectedIds.size})
              </div>

              {/* Warning if linked accounts exist among selected */}
              {selectedLinkedCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>تنبيه: {selectedLinkedCount} مستفيد(ين) مرتبطين بحسابات مستخدمين</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                    بعض المستفيدين المحددين لديهم حسابات نشطة في النظام. هل تريد أيضًا تعطيل الحسابات المرتبطة بهم؟
                  </p>
                  <label className="flex items-center gap-2 text-xs font-black text-amber-900 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={disableLinkedAccounts}
                      onChange={(e) => setDisableLinkedAccounts(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md border-amber-300"
                    />
                    <span>تعطيل الحسابات المرتبطة بالمستفيدين المحددين</span>
                  </label>
                </div>
              )}

              <p className="text-[11px] text-slate-500 font-semibold">
                هذه العملية نهائية لحذف {selectedIds.size} مستفيد، ولن يتم حذف البيانات القديمة غير المحددة.
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkDelete}
                  className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
                >
                  نعم، حذف {selectedIds.size} مستفيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Excel Import Modal with Live Preview & Verification */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-arabic overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-right my-8 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-[#0B2545] text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-black flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>استيراد المستفيدين من Excel ومعاينة التحقق</span>
              </h3>
              <button
                onClick={handleCancelImport}
                className="p-1 text-slate-300 hover:text-white"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Instructions & Template Download */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-blue-900">النموذج الرسمي للاستيراد</h4>
                  <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                    حمّل النموذج الرسمي المعتمد لتعبئة البيانات بالترتيب الصحيح (الرقم، رقم مسار، الاسم، النسب، الشعبة...).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => excelUtils.downloadBeneficiaireTemplate()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📄 تحميل نموذج Excel</span>
                </button>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  اختر ملف Excel (.xlsx) من جهازك :
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {/* Loading Analysis */}
              {isAnalyzing && (
                <div className="p-8 text-center text-slate-600 space-y-2">
                  <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-black text-slate-800">جاري تحليل ملف Excel والتحقق من البيانات ومنع التكرار...</p>
                </div>
              )}

              {/* Import Verification Preview Result */}
              {importAnalysis && !isAnalyzing && (
                <div className="space-y-4 pt-2">
                  <div className="border-t border-slate-200 pt-3">
                    <h4 className="text-xs font-black text-slate-900 mb-2">
                      معاينة الاستيراد والتحقق من السجلات
                    </h4>

                    {/* Summary KPI Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block">عدد السجلات</span>
                        <span className="text-lg font-black text-slate-900 font-mono">{importAnalysis.totalRows}</span>
                      </div>
                      <div
                        onClick={() => setPreviewTab('valid')}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                          previewTab === 'valid'
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                            : 'bg-emerald-50/40 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">السجلات الجديدة</span>
                        <span className="text-lg font-black font-mono">{importAnalysis.validRows.length}</span>
                      </div>
                      <div
                        onClick={() => setPreviewTab('duplicate')}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                          previewTab === 'duplicate'
                            ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                            : 'bg-amber-50/40 border-amber-200 text-amber-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">السجلات المكررة</span>
                        <span className="text-lg font-black font-mono">{importAnalysis.duplicateRows.length}</span>
                      </div>
                      <div
                        onClick={() => setPreviewTab('error')}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                          previewTab === 'error'
                            ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-2xs'
                            : 'bg-rose-50/40 border-rose-200 text-rose-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">أخطاء</span>
                        <span className="text-lg font-black font-mono">{importAnalysis.errorRows.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabbed Preview Tables */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="flex border-b border-slate-200 bg-white text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('valid')}
                        className={`px-4 py-2.5 transition-colors border-b-2 ${
                          previewTab === 'valid'
                            ? 'border-emerald-600 text-emerald-800 font-black bg-emerald-50/40'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        السجلات الجديدة الصالحة ({importAnalysis.validRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('duplicate')}
                        className={`px-4 py-2.5 transition-colors border-b-2 ${
                          previewTab === 'duplicate'
                            ? 'border-amber-600 text-amber-800 font-black bg-amber-50/40'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        السجلات المكررة ({importAnalysis.duplicateRows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('error')}
                        className={`px-4 py-2.5 transition-colors border-b-2 ${
                          previewTab === 'error'
                            ? 'border-rose-600 text-rose-800 font-black bg-rose-50/40'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        صفوف بها أخطاء ({importAnalysis.errorRows.length})
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-3 text-xs">
                      {/* Valid Tab */}
                      {previewTab === 'valid' && (
                        <div>
                          {importAnalysis.validRows.length === 0 ? (
                            <p className="text-center py-6 text-slate-400 font-bold">
                              لا توجد سجلات جديدة صالحة للاستيراد.
                            </p>
                          ) : (
                            <table className="w-full text-right text-xs">
                              <thead className="bg-slate-100 text-slate-700 text-[10px] font-black">
                                <tr>
                                  <th className="p-2">رقم مسار</th>
                                  <th className="p-2">الاسم والنسب (AR)</th>
                                  <th className="p-2">الاسم والنسب (FR)</th>
                                  <th className="p-2">المستوى</th>
                                  <th className="p-2">الشعبة</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {importAnalysis.validRows.map((b, i) => (
                                  <tr key={i} className="hover:bg-white">
                                    <td className="p-2 font-mono font-bold text-blue-900">{b.numeroMassar}</td>
                                    <td className="p-2 font-black">{b.prenomAr} {b.nomAr}</td>
                                    <td className="p-2 font-latin text-slate-600">{b.prenomFr} {b.nomFr}</td>
                                    <td className="p-2 font-bold">{b.niveauScolaire}</td>
                                    <td className="p-2 text-slate-600">{filiereMap.get(b.filiereId)?.nom || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}

                      {/* Duplicate Tab */}
                      {previewTab === 'duplicate' && (
                        <div>
                          {importAnalysis.duplicateRows.length === 0 ? (
                            <p className="text-center py-6 text-emerald-600 font-bold">
                              رائع! لا يوجد أي تكرار برقم مسار أو رقم التسجيل.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {importAnalysis.duplicateRows.map((dup, i) => (
                                <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                                  <div>
                                    <span className="font-bold">الصف #{dup.rowNumber}: </span>
                                    <span>{dup.reason}</span>
                                  </div>
                                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                                    ممنوع التكرار
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Error Tab */}
                      {previewTab === 'error' && (
                        <div>
                          {importAnalysis.errorRows.length === 0 ? (
                            <p className="text-center py-6 text-emerald-600 font-bold">
                              لا توجد أخطاء بيانات في الملف.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {importAnalysis.errorRows.map((err, i) => (
                                <div key={i} className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                                  <span className="font-bold">الصف #{err.rowNumber}: </span>
                                  <span>{err.reason}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions for Import */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-bold">
                {importAnalysis && `الاستيراد سيحفظ ${importAnalysis.validRows.length} سجل جديد دون المساس بالسجلات القديمة.`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelImport}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  ❌ إلغاء
                </button>
                {importAnalysis && importAnalysis.validRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
                  >
                    ✅ تأكيد الاستيراد ({importAnalysis.validRows.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Individual Beneficiary File Modal */}
      {selectedForFiche && (
        <FicheIndividuelleModal
          beneficiaire={selectedForFiche}
          onClose={() => setSelectedForFiche(null)}
          filiere={filiereMap.get(selectedForFiche.filiereId)}
          classe={classeMap.get(selectedForFiche.classeId)}
          presences={presences.filter((p) => p.beneficiaireId === selectedForFiche.id)}
          infractions={infractions.filter((i) => i.beneficiaireId === selectedForFiche.id)}
          convocations={convocations.filter((c) => c.beneficiaireId === selectedForFiche.id)}
          parametres={parametres}
        />
      )}
    </div>
  );
};

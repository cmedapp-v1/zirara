import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Layers,
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  Save,
  Check,
  Info
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  SeancePlanning,
  EnregistrementPresence,
  StatutPresence,
  ParametresCentre
} from '../types';
import { FeuilleAppelPrintModal } from './FeuilleAppelPrintModal';

interface AppelDuJourViewProps {
  beneficiaires: Beneficiaire[];
  filieres: Filiere[];
  classes: Classe[];
  animateurs: Animateur[];
  planning: SeancePlanning[];
  presences: EnregistrementPresence[];
  parametres: ParametresCentre;
  onSavePresencesBatch: (newRecords: EnregistrementPresence[]) => void;
}

interface StudentAttendanceRow {
  beneficiaire: Beneficiaire;
  statut: StatutPresence;
  dureeRetardMinutes: number;
  motif: string;
  observation: string;
  justifie: boolean;
}

export const AppelDuJourView: React.FC<AppelDuJourViewProps> = ({
  beneficiaires,
  filieres,
  classes,
  animateurs,
  planning,
  presences,
  parametres,
  onSavePresencesBatch
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Parameters
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedFiliereId, setSelectedFiliereId] = useState<string>(filieres[0]?.id || '');
  const [selectedClasseId, setSelectedClasseId] = useState<string>(classes[0]?.id || '');
  const [selectedSeance, setSelectedSeance] = useState<string>('الحصة الصباحية (08:30 - 12:30)');
  const [selectedAnimateurId, setSelectedAnimateurId] = useState<string>(animateurs[0]?.id || '');

  // Print modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  // Available classes for selected filière
  const availableClasses = useMemo(() => {
    return classes.filter((c) => c.filiereId === selectedFiliereId);
  }, [classes, selectedFiliereId]);

  // Keep selectedClasseId synced
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.some((c) => c.id === selectedClasseId)) {
      setSelectedClasseId(availableClasses[0].id);
    }
  }, [availableClasses, selectedClasseId]);

  // Beneficiaries of selected class
  const classBeneficiaires = useMemo(() => {
    return beneficiaires.filter((b) => b.classeId === selectedClasseId);
  }, [beneficiaires, selectedClasseId]);

  // Attendance state for current session
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);

  useEffect(() => {
    // Check if attendance already recorded for this date, class and session
    const existingMap = new Map<string, EnregistrementPresence>();
    presences.forEach((p) => {
      if (
        p.date === selectedDate &&
        p.classeId === selectedClasseId &&
        p.seanceMatiere === selectedSeance
      ) {
        existingMap.set(p.beneficiaireId, p);
      }
    });

    const initialRows: StudentAttendanceRow[] = classBeneficiaires.map((ben) => {
      const existing = existingMap.get(ben.id);
      if (existing) {
        return {
          beneficiaire: ben,
          statut: existing.statut,
          dureeRetardMinutes: existing.dureeRetardMinutes || 15,
          motif: existing.motif || '',
          observation: existing.observation || '',
          justifie: Boolean(existing.justifie)
        };
      }
      return {
        beneficiaire: ben,
        statut: 'Présent',
        dureeRetardMinutes: 15,
        motif: '',
        observation: '',
        justifie: false
      };
    });

    setRows(initialRows);
  }, [classBeneficiaires, selectedDate, selectedClasseId, selectedSeance, presences]);

  // Bulk actions
  const handleMarkAllPresents = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        statut: 'Présent',
        motif: '',
        dureeRetardMinutes: 0
      }))
    );
  };

  const handleMarkAllAbsents = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        statut: 'Absent',
        motif: r.motif || 'غياب بدون تبرير'
      }))
    );
  };

  const handleUpdateRow = (benId: string, partial: Partial<StudentAttendanceRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.beneficiaire.id === benId ? { ...r, ...partial } : r))
    );
  };

  const handleSaveAttendance = () => {
    const timeNow = new Date().toTimeString().slice(0, 5);
    const newRecords: EnregistrementPresence[] = rows.map((r) => ({
      id: `pres-${selectedDate}-${selectedClasseId}-${r.beneficiaire.id}-${Date.now()}`,
      date: selectedDate,
      heure: timeNow,
      beneficiaireId: r.beneficiaire.id,
      filiereId: selectedFiliereId,
      classeId: selectedClasseId,
      seanceMatiere: selectedSeance,
      animateurId: selectedAnimateurId,
      statut: r.statut,
      dureeRetardMinutes: r.statut === 'Retard' ? r.dureeRetardMinutes : 0,
      motif: r.motif,
      observation: r.observation,
      justifie: r.justifie
    }));

    onSavePresencesBatch(newRecords);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3500);
  };

  // Real-time counters
  const presentsCount = rows.filter((r) => r.statut === 'Présent').length;
  const absentsCount = rows.filter((r) => r.statut === 'Absent').length;
  const retardsCount = rows.filter((r) => r.statut === 'Retard').length;

  const currentFiliere = filieres.find((f) => f.id === selectedFiliereId);
  const currentClasse = classes.find((c) => c.id === selectedClasseId);
  const currentAnimateur = animateurs.find((a) => a.id === selectedAnimateurId);

  return (
    <div dir="rtl" className="space-y-6 font-arabic text-right">
      {/* 1. Header with Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>تسجيل الحضور والغياب</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            نداء الحضور اليومي
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {parametres.nomCentre} {parametres.nomSousTitre} · ورقة مناداة القسم الرسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة ورقة النداء</span>
          </button>

          <button
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الحضور</span>
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم حفظ ورقة الحضور بنجاح في قاعدة البيانات الإدارية.</span>
        </div>
      )}

      {/* 2. Selection Parameters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
        {/* Date */}
        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            تاريخ الحصة *
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden focus:border-blue-500 text-right"
            />
          </div>
        </div>

        {/* Filière */}
        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            الشعبة *
          </label>
          <select
            value={selectedFiliereId}
            onChange={(e) => setSelectedFiliereId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            {filieres.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Classe */}
        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            القسم *
          </label>
          <select
            value={selectedClasseId}
            onChange={(e) => setSelectedClasseId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Séance / Matière */}
        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            الحصة / المادة *
          </label>
          <select
            value={selectedSeance}
            onChange={(e) => setSelectedSeance(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="الحصة الصباحية (08:30 - 12:30)">الحصة الصباحية (08:30 - 12:30)</option>
            <option value="الحصة المسائية (14:30 - 18:30)">الحصة المسائية (14:30 - 18:30)</option>
            <option value="تكوين مهني تطبيقي">تكوين مهني تطبيقي</option>
            <option value="دعم تربوي وإدماج">دعم تربوي وإدماج</option>
            <option value="إعلاميات وتواصل">إعلاميات وتواصل</option>
          </select>
        </div>

        {/* Animateur */}
        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            المؤطر / المدرب *
          </label>
          <select
            value={selectedAnimateurId}
            onChange={(e) => setSelectedAnimateurId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-hidden focus:border-blue-500"
          >
            {animateurs.map((a) => (
              <option key={a.id} value={a.id}>
                {a.prenom} {a.nom} ({a.fonction})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Session Status Summary & Bulk Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Real-time counters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">مجموع القسم:</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-mono font-black">
              {rows.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>الحاضرون: {presentsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>الغائبون: {absentsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>المتأخرون: {retardsCount}</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllPresents}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black rounded-xl transition-colors"
          >
            تحديد الكل كحاضر
          </button>
          <button
            type="button"
            onClick={handleMarkAllAbsents}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black rounded-xl transition-colors"
          >
            تحديد الكل كغائب
          </button>
        </div>
      </div>

      {/* 4. Student Attendance Call Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">الصورة</th>
                <th className="py-3 px-3">رقم التسجيل</th>
                <th className="py-3 px-3">رقم مسار</th>
                <th className="py-3 px-3">الاسم والنسب</th>
                <th className="py-3 px-3 text-center">الحالة</th>
                <th className="py-3 px-3">مدة التأخر (دقيقة)</th>
                <th className="py-3 px-3 text-center">مبرر</th>
                <th className="py-3 px-3">سبب الغياب أو التأخر</th>
                <th className="py-3 px-3">ملاحظة إدارية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                    لا يوجد مستفيدون مسجلون في هذا القسم
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.beneficiaire.id}
                    className={`transition-colors ${
                      row.statut === 'Absent'
                        ? 'bg-rose-50/40'
                        : row.statut === 'Retard'
                        ? 'bg-amber-50/40'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <img
                        src={row.beneficiaire.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.beneficiaire.id}`}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {row.beneficiaire.numeroInscription}
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-blue-900">
                      {row.beneficiaire.numeroMassar}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 text-xs">
                        {row.beneficiaire.prenomAr} {row.beneficiaire.nomAr}
                      </div>
                      <div className="font-latin text-[10px] text-slate-500 font-semibold">
                        {row.beneficiaire.prenomFr} {row.beneficiaire.nomFr}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.beneficiaire.id, { statut: 'Présent' })}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors ${
                            row.statut === 'Présent'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          🟢 حاضر
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.beneficiaire.id, { statut: 'Absent' })}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors ${
                            row.statut === 'Absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          🔴 غائب
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateRow(row.beneficiaire.id, { statut: 'Retard' })}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors ${
                            row.statut === 'Retard'
                              ? 'bg-amber-500 text-slate-950 shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          🟠 متأخر
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {row.statut === 'Retard' ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="5"
                            max="120"
                            step="5"
                            value={row.dureeRetardMinutes}
                            onChange={(e) =>
                              handleUpdateRow(row.beneficiaire.id, {
                                dureeRetardMinutes: Number(e.target.value)
                              })
                            }
                            className="w-16 p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-center font-mono font-bold"
                          />
                          <span className="text-slate-500 font-bold">دقيقة</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {row.statut !== 'Présent' ? (
                        <input
                          type="checkbox"
                          checked={row.justifie}
                          onChange={(e) =>
                            handleUpdateRow(row.beneficiaire.id, { justifie: e.target.checked })
                          }
                          className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {row.statut !== 'Présent' ? (
                        <input
                          type="text"
                          placeholder="السبب..."
                          value={row.motif}
                          onChange={(e) =>
                            handleUpdateRow(row.beneficiaire.id, { motif: e.target.value })
                          }
                          className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-right"
                        />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="ملاحظة إدارية..."
                        value={row.observation}
                        onChange={(e) =>
                          handleUpdateRow(row.beneficiaire.id, { observation: e.target.value })
                        }
                        className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-right"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Print Attendance Modal */}
      {isPrintModalOpen && (
        <FeuilleAppelPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          date={selectedDate}
          filiere={currentFiliere}
          classe={currentClasse}
          seance={selectedSeance}
          animateur={currentAnimateur}
          beneficiaires={classBeneficiaires}
          parametres={parametres}
        />
      )}
    </div>
  );
};

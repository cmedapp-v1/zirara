import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  UserX,
  Building,
  CheckCircle2
} from 'lucide-react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  EnregistrementPresence,
  Infraction,
  Convocation,
  ParametresCentre
} from '../types';
import { CMEDLogo } from '../components/CMEDLogo';
import {
  formatNiveauAr,
  formatSexeAr,
  formatStatutBeneficiaireAr,
  formatGraviteAr,
  formatTypeInfractionAr,
  formatActionDisciplinaireAr,
  formatStatutConvocationAr,
  formatPersonneConcerneeAr
} from '../utils/arabicLabels';

interface FicheIndividuelleModalProps {
  beneficiaire: Beneficiaire | null;
  onClose: () => void;
  filiere?: Filiere;
  classe?: Classe;
  presences: EnregistrementPresence[];
  infractions: Infraction[];
  convocations: Convocation[];
  parametres: ParametresCentre;
}

export const FicheIndividuelleModal: React.FC<FicheIndividuelleModalProps> = ({
  beneficiaire,
  onClose,
  filiere,
  classe,
  presences,
  infractions,
  convocations,
  parametres
}) => {
  const [activeTab, setActiveTab] = useState<
    'presences' | 'absences' | 'retards' | 'infractions' | 'convocations'
  >('absences');

  const [printMode, setPrintMode] = useState<'complete' | 'simple'>('complete');

  if (!beneficiaire) return null;

  const benPresences = presences.filter((p) => p.beneficiaireId === beneficiaire.id);
  const benPresents = benPresences.filter((p) => p.statut === 'Présent');
  const benAbsences = benPresences.filter((p) => p.statut === 'Absent');
  const benRetards = benPresences.filter((p) => p.statut === 'Retard');
  const benInfractions = infractions.filter((i) => i.beneficiaireId === beneficiaire.id);
  const benConvocations = convocations.filter((c) => c.beneficiaireId === beneficiaire.id);

  const totalSessions = benPresences.length;
  const assiduiteRate = totalSessions > 0 ? Math.round((benPresents.length / totalSessions) * 100) : 100;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150 font-arabic text-right"
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-800">صيغة الطباعة :</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPrintMode('complete')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                  printMode === 'complete'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                بطاقة شاملة (مع السجل)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('simple')}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-colors ${
                  printMode === 'simple'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                بطاقة إدارية مبسطة
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة البطاقة الرسمية</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-white">
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-black">المملكة المغربية</div>
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

          {/* Document Title */}
          <div className="text-center">
            <h1 className="text-lg font-black underline underline-offset-8 text-slate-900">
              البطاقة الفردية للمستفيد
            </h1>
            <p className="text-xs text-slate-600 font-bold mt-2">
              السنة الدراسية والتكوينية : <span className="font-mono">{parametres.anneeScolaireActive}</span>
            </p>
          </div>

          {/* Student Profile Card (Photo 2x2 & Identité) */}
          <div className="p-5 bg-slate-50 border border-slate-300 rounded-3xl flex flex-col sm:flex-row gap-5 items-start">
            {/* Photo 2x2 */}
            <div className="shrink-0 flex flex-col items-center gap-1.5 mx-auto sm:mx-0">
              <img
                src={beneficiaire.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${beneficiaire.numeroMassar}`}
                alt="الصورة الشخصية"
                className="w-28 h-32 object-cover rounded-2xl border-2 border-slate-300 shadow-sm bg-white"
              />
              <span className="text-[10px] font-mono text-slate-500 font-bold">صورة 2×2</span>
            </div>

            {/* Profile Info Details Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">الاسم والنسب (بالعربية) :</span>
                <span className="text-sm font-black text-slate-900">
                  {beneficiaire.prenomAr} {beneficiaire.nomAr}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">الاسم والنسب (بالفرنسية) :</span>
                <span className="text-xs font-latin font-bold text-slate-700">
                  {beneficiaire.prenomFr} {beneficiaire.nomFr}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">رقم مسار (Massar) :</span>
                <span className="font-mono font-black text-blue-900 text-sm">
                  {beneficiaire.numeroMassar}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">رقم التسجيل الداخلي :</span>
                <span className="font-mono font-bold text-slate-800">
                  {beneficiaire.numeroInscription}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">الجنس :</span>
                <span className="font-bold text-slate-800">
                  {formatSexeAr(beneficiaire.sexe)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">تاريخ ومكان الازدياد :</span>
                <span className="font-semibold text-slate-800">
                  {beneficiaire.dateNaissance} ({beneficiaire.lieuNaissance || parametres.ville || 'زرارة'})
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">المستوى الدراسي :</span>
                <span className="font-bold text-slate-800">
                  {formatNiveauAr(beneficiaire.niveauScolaire)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">الشعبة التكوينية :</span>
                <span className="font-bold text-blue-900">
                  {filiere?.nom || 'غير محدد'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">القسم / الفوج :</span>
                <span className="font-bold text-slate-800">
                  {classe?.nom || 'غير محدد'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">هاتف المستفيد :</span>
                <span className="font-mono font-bold text-slate-800">
                  {beneficiaire.telephone || '-'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">هاتف ولي الأمر :</span>
                <span className="font-mono font-bold text-slate-800">
                  {beneficiaire.telephoneTuteur || '-'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-bold block">حالة المستفيد :</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 inline-block">
                  {formatStatutBeneficiaireAr(beneficiaire.statut)}
                </span>
              </div>

              <div className="sm:col-span-3">
                <span className="text-[11px] text-slate-500 font-bold block">العنوان السكني :</span>
                <span className="font-semibold text-slate-800">
                  {beneficiaire.adresse}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Attendance Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500">نسبة المواظبة</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{assiduiteRate}%</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="text-[10px] font-bold text-emerald-700">حالات الحضور</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{benPresents.length}</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <div className="text-[10px] font-bold text-rose-700">الغيابات</div>
              <div className="text-xl font-black text-rose-700 mt-0.5">{benAbsences.length}</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="text-[10px] font-bold text-amber-700">التأخرات</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">{benRetards.length}</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-purple-700">المخالفات</div>
              <div className="text-xl font-black text-purple-700 mt-0.5">{benInfractions.length}</div>
            </div>
          </div>

          {/* Mode Complete: Tabs for Absence, Retards, Infractions, Convocations */}
          {printMode === 'complete' && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 no-print">
                <button
                  type="button"
                  onClick={() => setActiveTab('absences')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    activeTab === 'absences'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  الغيابات ({benAbsences.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('retards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    activeTab === 'retards'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  التأخرات ({benRetards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('infractions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    activeTab === 'infractions'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  المخالفات ({benInfractions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('convocations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    activeTab === 'convocations'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  الاستدعاءات ({benConvocations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presences')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    activeTab === 'presences'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  سجل الحضور ({benPresents.length})
                </button>
              </div>

              {/* Tab: Absences */}
              {activeTab === 'absences' && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 font-black text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3">الحصة / المادة</th>
                        <th className="py-2.5 px-3">السبب</th>
                        <th className="py-2.5 px-3 text-center">التبرير</th>
                        <th className="py-2.5 px-3">ملاحظة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {benAbsences.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                            لا توجد غيابات مسجلة لهذا المستفيد
                          </td>
                        </tr>
                      ) : (
                        benAbsences.map((a) => (
                          <tr key={a.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{a.date}</td>
                            <td className="py-2.5 px-3 text-slate-800">{a.seanceMatiere}</td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{a.motif || 'بدون عذر'}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  a.justifie ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {a.justifie ? 'مبرر' : 'غير مبرر'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{a.observation || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Retards */}
              {activeTab === 'retards' && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 font-black text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3 text-center">مدة التأخر</th>
                        <th className="py-2.5 px-3">الحصة / المادة</th>
                        <th className="py-2.5 px-3">السبب</th>
                        <th className="py-2.5 px-3">ملاحظة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {benRetards.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                            لا توجد تأخرات مسجلة لهذا المستفيد
                          </td>
                        </tr>
                      ) : (
                        benRetards.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.date}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-800">
                              {r.dureeRetardMinutes || 15} دقيقة
                            </td>
                            <td className="py-2.5 px-3 text-slate-800">{r.seanceMatiere}</td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{r.motif || 'بدون عذر'}</td>
                            <td className="py-2.5 px-3 text-slate-500">{r.observation || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Infractions */}
              {activeTab === 'infractions' && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 font-black text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3">نوع المخالفة</th>
                        <th className="py-2.5 px-3 text-center">الخطورة</th>
                        <th className="py-2.5 px-3">الوصف</th>
                        <th className="py-2.5 px-3">الإجراء المتخذ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {benInfractions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                            لا توجد مخالفات مسجلة لهذا المستفيد
                          </td>
                        </tr>
                      ) : (
                        benInfractions.map((i) => (
                          <tr key={i.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{i.date}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{formatTypeInfractionAr(i.typeInfraction)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900">
                                {formatGraviteAr(i.gravite)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{i.description}</td>
                            <td className="py-2.5 px-3 font-bold text-blue-900">{formatActionDisciplinaireAr(i.actionPrise)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Convocations */}
              {activeTab === 'convocations' && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 font-black text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">تاريخ الاستدعاء</th>
                        <th className="py-2.5 px-3">الساعة</th>
                        <th className="py-2.5 px-3">سبب الاستدعاء</th>
                        <th className="py-2.5 px-3">المعني بالحضور</th>
                        <th className="py-2.5 px-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {benConvocations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                            لا توجد استدعاءات مسجلة لهذا المستفيد
                          </td>
                        </tr>
                      ) : (
                        benConvocations.map((c) => (
                          <tr key={c.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{c.date}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{c.heure}</td>
                            <td className="py-2.5 px-3 text-slate-800 font-medium">{c.motif}</td>
                            <td className="py-2.5 px-3 font-bold text-blue-900">{formatPersonneConcerneeAr(c.personneConcernee)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                {formatStatutConvocationAr(c.statut)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab: Presences */}
              {activeTab === 'presences' && (
                <div className="border border-slate-300 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-100 font-black text-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3">الحصة / المادة</th>
                        <th className="py-2.5 px-3 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {benPresents.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-slate-400 font-bold">
                            لا توجد حصص مسجلة
                          </td>
                        </tr>
                      ) : (
                        benPresents.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.date}</td>
                            <td className="py-2.5 px-3 text-slate-800">{p.seanceMatiere}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">🟢 حاضر</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Signatures & Approvals */}
          <div className="pt-8 flex justify-between items-end text-xs font-bold border-t border-slate-300">
            <div className="text-center space-y-6">
              <p className="text-slate-700">توقيع المستفيد(ة)</p>
              <div className="text-[10px] text-slate-400 font-mono">.......................................</div>
            </div>

            <div className="text-center space-y-6">
              <p className="text-slate-700">توقيع ولي الأمر</p>
              <div className="text-[10px] text-slate-400 font-mono">.......................................</div>
            </div>

            <div className="text-center space-y-6">
              <p className="text-slate-900 font-black">إدارة المركز (الخاتم والتوقيع)</p>
              <div className="text-[10px] text-slate-400 font-mono">.......................................</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

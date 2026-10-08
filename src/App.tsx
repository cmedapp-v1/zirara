import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  SeancePlanning,
  EnregistrementPresence,
  Infraction,
  Convocation,
  ParametresCentre,
  CompteAdministratif
} from './types';
import { storage } from './services/storage';
import { Header } from './components/Header';
import { Sidebar, NavView } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { AppLanguage, translations } from './utils/i18n';

// Views
import { DashboardView } from './views/DashboardView';
import { AppelDuJourView } from './views/AppelDuJourView';
import { BeneficiairesView } from './views/BeneficiairesView';
import { AbsencesView } from './views/AbsencesView';
import { RetardsView } from './views/RetardsView';
import { InfractionsView } from './views/InfractionsView';
import { ConvocationsView } from './views/ConvocationsView';
import { PlanningView } from './views/PlanningView';
import { FilieresClassesView } from './views/FilieresClassesView';
import { AnimateursView } from './views/AnimateursView';
import { ParametresView } from './views/ParametresView';
import { StatsView } from './views/StatsView';
import { FeuilleAppelPrintModal } from './views/FeuilleAppelPrintModal';
import { FicheIndividuelleModal } from './views/FicheIndividuelleModal';

// Mobile bottom icons
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  UserX,
  Menu as MenuIcon
} from 'lucide-react';

export default function App() {
  // Language State: default Arabic RTL, toggleable to French
  const [lang, setLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('c2c_language');
    return saved === 'fr' || saved === 'ar' ? saved : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('c2c_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'fr' : 'ar'));
  };

  // Authentication State: Administrator only (multi-admin accounts supported)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storage.isLoggedIn());
  const [comptesAdmin, setComptesAdmin] = useState<CompteAdministratif[]>(() => storage.getComptesAdmin());
  const [currentAdmin, setCurrentAdmin] = useState<CompteAdministratif>(() => storage.getCurrentAdmin());

  // Navigation State
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core Data State
  const [parametres, setParametres] = useState<ParametresCentre>(() => storage.getParametres());
  const [filieres, setFilieres] = useState<Filiere[]>(() => storage.getFilieres());
  const [classes, setClasses] = useState<Classe[]>(() => storage.getClasses());
  const [animateurs, setAnimateurs] = useState<Animateur[]>(() => storage.getAnimateurs());
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>(() => storage.getBeneficiaires());
  const [planning, setPlanning] = useState<SeancePlanning[]>(() => storage.getPlanning());
  const [presences, setPresences] = useState<EnregistrementPresence[]>(() => storage.getPresences());
  const [infractions, setInfractions] = useState<Infraction[]>(() => storage.getInfractions());
  const [convocations, setConvocations] = useState<Convocation[]>(() => storage.getConvocations());

  // Direct print modal for "Feuilles d'appel à imprimer"
  const [isQuickPrintModalOpen, setIsQuickPrintModalOpen] = useState(false);

  // Global Beneficiary file modal (openable from header search or dashboard)
  const [modalBeneficiaire, setModalBeneficiaire] = useState<Beneficiaire | null>(null);

  // Reload all data from storage (after reset or restore)
  const reloadData = useCallback(() => {
    setParametres(storage.getParametres());
    setFilieres(storage.getFilieres());
    setClasses(storage.getClasses());
    setAnimateurs(storage.getAnimateurs());
    setBeneficiaires(storage.getBeneficiaires());
    setPlanning(storage.getPlanning());
    setPresences(storage.getPresences());
    setInfractions(storage.getInfractions());
    setConvocations(storage.getConvocations());
    setComptesAdmin(storage.getComptesAdmin());
    setCurrentAdmin(storage.getCurrentAdmin());
  }, []);

  // Authentication Handlers
  const handleLogin = (identifiant: string, password: string): boolean => {
    const match = storage.authenticate(identifiant, password);
    if (match) {
      setCurrentAdmin(match);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    storage.setLoggedIn(false);
    setIsAuthenticated(false);
  };

  const handleSwitchAdmin = (acc: CompteAdministratif) => {
    storage.setCurrentAdminId(acc.id);
    setCurrentAdmin(acc);
  };

  const handleSaveCompteAdmin = (acc: CompteAdministratif) => {
    const index = comptesAdmin.findIndex((a) => a.id === acc.id);
    let updated: CompteAdministratif[];
    if (index >= 0) {
      updated = [...comptesAdmin];
      updated[index] = acc;
    } else {
      updated = [...comptesAdmin, acc];
    }
    storage.saveComptesAdmin(updated);
    setComptesAdmin(updated);
    if (currentAdmin.id === acc.id) {
      setCurrentAdmin(acc);
    }
  };

  const handleDeleteCompteAdmin = (id: string) => {
    const updated = comptesAdmin.filter((a) => a.id !== id);
    storage.saveComptesAdmin(updated);
    setComptesAdmin(updated);
  };

  // State update helpers with automatic storage persistence
  const handleSaveParametres = (params: ParametresCentre) => {
    storage.saveParametres(params);
    setParametres(params);
  };

  const handleSaveBeneficiaire = (ben: Beneficiaire) => {
    const existingIndex = beneficiaires.findIndex((b) => b.id === ben.id);
    let updated: Beneficiaire[];
    if (existingIndex >= 0) {
      updated = [...beneficiaires];
      updated[existingIndex] = ben;
    } else {
      updated = [ben, ...beneficiaires];
    }
    storage.saveBeneficiaires(updated);
    setBeneficiaires(updated);
  };

  const handleDeleteBeneficiaire = (id: string) => {
    const updated = beneficiaires.filter((b) => b.id !== id);
    storage.saveBeneficiaires(updated);
    setBeneficiaires(updated);
  };

  const handleDeleteMultipleBeneficiaires = (ids: string[]) => {
    const setIds = new Set(ids);
    const updated = beneficiaires.filter((b) => !setIds.has(b.id));
    storage.saveBeneficiaires(updated);
    setBeneficiaires(updated);
  };

  const handleDisableAccountForBeneficiaire = (beneficiaireId: string) => {
    const updated = comptesAdmin.map((acc) => {
      if (acc.beneficiaireId === beneficiaireId) {
        return { ...acc, statut: 'Inactif' as const };
      }
      return acc;
    });
    storage.saveComptesAdmin(updated);
    setComptesAdmin(updated);
  };

  const handleImportBeneficiaires = (newBens: Beneficiaire[]) => {
    const updated = [...newBens, ...beneficiaires];
    storage.saveBeneficiaires(updated);
    setBeneficiaires(updated);
  };

  const handleSavePresencesBatch = (newRecords: EnregistrementPresence[]) => {
    const newKeys = new Set(
      newRecords.map((r) => `${r.date}_${r.classeId}_${r.seanceMatiere}_${r.beneficiaireId}`)
    );
    const retained = presences.filter(
      (p) => !newKeys.has(`${p.date}_${p.classeId}_${p.seanceMatiere}_${p.beneficiaireId}`)
    );
    const updated = [...newRecords, ...retained];
    storage.savePresences(updated);
    setPresences(updated);
  };

  const handleUpdatePresence = (record: EnregistrementPresence) => {
    const updated = presences.map((p) => (p.id === record.id ? record : p));
    storage.savePresences(updated);
    setPresences(updated);
  };

  const handleDeletePresence = (id: string) => {
    const updated = presences.filter((p) => p.id !== id);
    storage.savePresences(updated);
    setPresences(updated);
  };

  const handleSaveInfraction = (infr: Infraction) => {
    const index = infractions.findIndex((i) => i.id === infr.id);
    let updated: Infraction[];
    if (index >= 0) {
      updated = [...infractions];
      updated[index] = infr;
    } else {
      updated = [infr, ...infractions];
    }
    storage.saveInfractions(updated);
    setInfractions(updated);
  };

  const handleDeleteInfraction = (id: string) => {
    const updated = infractions.filter((i) => i.id !== id);
    storage.saveInfractions(updated);
    setInfractions(updated);
  };

  const handleSaveConvocation = (conv: Convocation) => {
    const index = convocations.findIndex((c) => c.id === conv.id);
    let updated: Convocation[];
    if (index >= 0) {
      updated = [...convocations];
      updated[index] = conv;
    } else {
      updated = [conv, ...convocations];
    }
    storage.saveConvocations(updated);
    setConvocations(updated);
  };

  const handleDeleteConvocation = (id: string) => {
    const updated = convocations.filter((c) => c.id !== id);
    storage.saveConvocations(updated);
    setConvocations(updated);
  };

  const handleSaveFiliere = (fil: Filiere) => {
    const index = filieres.findIndex((f) => f.id === fil.id);
    let updated: Filiere[];
    if (index >= 0) {
      updated = [...filieres];
      updated[index] = fil;
    } else {
      updated = [...filieres, fil];
    }
    storage.saveFilieres(updated);
    setFilieres(updated);
  };

  const handleDeleteFiliere = (id: string) => {
    const updated = filieres.filter((f) => f.id !== id);
    storage.saveFilieres(updated);
    setFilieres(updated);
  };

  const handleSaveClasse = (cls: Classe) => {
    const index = classes.findIndex((c) => c.id === cls.id);
    let updated: Classe[];
    if (index >= 0) {
      updated = [...classes];
      updated[index] = cls;
    } else {
      updated = [...classes, cls];
    }
    storage.saveClasses(updated);
    setClasses(updated);
  };

  const handleDeleteClasse = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    storage.saveClasses(updated);
    setClasses(updated);
  };

  const handleSaveAnimateur = (anim: Animateur) => {
    const index = animateurs.findIndex((a) => a.id === anim.id);
    let updated: Animateur[];
    if (index >= 0) {
      updated = [...animateurs];
      updated[index] = anim;
    } else {
      updated = [...animateurs, anim];
    }
    storage.saveAnimateurs(updated);
    setAnimateurs(updated);
  };

  const handleDeleteAnimateur = (id: string) => {
    const updated = animateurs.filter((a) => a.id !== id);
    storage.saveAnimateurs(updated);
    setAnimateurs(updated);
  };

  const handleSaveSeance = (seance: SeancePlanning) => {
    const index = planning.findIndex((s) => s.id === seance.id);
    let updated: SeancePlanning[];
    if (index >= 0) {
      updated = [...planning];
      updated[index] = seance;
    } else {
      updated = [...planning, seance];
    }
    storage.savePlanning(updated);
    setPlanning(updated);
  };

  const handleDeleteSeance = (id: string) => {
    const updated = planning.filter((s) => s.id !== id);
    storage.savePlanning(updated);
    setPlanning(updated);
  };

  // Cross-entity shortcuts: create convocation from absence / retard / infraction
  const handleCreateConvocationFromAbsence = (presence: EnregistrementPresence) => {
    const newConv: Convocation = {
      id: `conv-${Date.now()}`,
      beneficiaireId: presence.beneficiaireId,
      date: new Date().toISOString().split('T')[0],
      heure: '10:00',
      motif: `Absence non justifiée le ${presence.date} (${presence.seanceMatiere})`,
      observation: 'Convocation générée automatiquement pour signature d engagement d assiduité.',
      personneConcernee: 'Parent/Tuteur',
      statut: 'En attente',
      sourceType: 'absence',
      sourceId: presence.id,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    handleSaveConvocation(newConv);
    setCurrentView('convocations');
  };

  const handleCreateConvocationFromRetard = (presence: EnregistrementPresence) => {
    const newConv: Convocation = {
      id: `conv-${Date.now()}`,
      beneficiaireId: presence.beneficiaireId,
      date: new Date().toISOString().split('T')[0],
      heure: '11:00',
      motif: `Retards répétés (${presence.dureeRetardMinutes || 15} min le ${presence.date})`,
      observation: 'Mise au point sur la ponctualité nécessaire avec l administration.',
      personneConcernee: 'Bénéficiaire',
      statut: 'En attente',
      sourceType: 'retard',
      sourceId: presence.id,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    handleSaveConvocation(newConv);
    setCurrentView('convocations');
  };

  const handleCreateConvocationFromInfraction = (infr: Infraction) => {
    const newConv: Convocation = {
      id: `conv-${Date.now()}`,
      beneficiaireId: infr.beneficiaireId,
      date: new Date().toISOString().split('T')[0],
      heure: '11:30',
      motif: `Infraction disciplinaire : ${infr.typeInfraction} (${infr.gravite})`,
      observation: `Description du motif : ${infr.description}. Entretien requis.`,
      personneConcernee:
        infr.gravite === 'Grave' || infr.gravite === 'Très grave'
          ? 'Bénéficiaire et Parent'
          : 'Bénéficiaire',
      statut: 'En attente',
      sourceType: 'infraction',
      sourceId: infr.id,
      dateCreation: new Date().toISOString().split('T')[0]
    };
    handleSaveConvocation(newConv);
    setCurrentView('convocations');
  };

  // Select beneficiary for modal from anywhere
  const handleSelectBeneficiaire = (benId: string) => {
    const ben = beneficiaires.find((b) => b.id === benId);
    if (ben) {
      setModalBeneficiaire(ben);
    }
  };

  // Today calculations for header & badges
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const sidebarCounts = useMemo(() => {
    const presToday = presences.filter((p) => p.date === todayStr);
    return {
      beneficiaires: beneficiaires.length,
      absencesToday: presToday.filter((p) => p.statut === 'Absent').length,
      retardsToday: presToday.filter((p) => p.statut === 'Retard').length,
      infractionsCount: infractions.length,
      convocationsPending: convocations.filter(
        (c) => c.statut === 'En attente' || c.statut === 'Convoqué'
      ).length
    };
  }, [presences, todayStr, convocations, beneficiaires.length, infractions.length]);

  const t = translations[lang];

  // If not authenticated, render LoginScreen
  if (!isAuthenticated) {
    return (
      <LoginScreen
        parametres={parametres}
        comptesAdmin={comptesAdmin}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex bg-slate-100/70 text-slate-900 font-sans antialiased pb-16 lg:pb-0 font-arabic"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          if (v === 'feuille_appel_print') {
            setIsQuickPrintModalOpen(true);
          } else {
            setCurrentView(v);
          }
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        counts={sidebarCounts}
      />

      {/* Main App Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Multi-Admin Profile & Search */}
        <Header
          parametres={parametres}
          currentAdmin={currentAdmin}
          comptesAdmin={comptesAdmin}
          onSwitchAdmin={handleSwitchAdmin}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          activeViewTitle={currentView}
          convocations={convocations}
          infractions={infractions}
          beneficiaires={beneficiaires}
          onSelectBeneficiaire={handleSelectBeneficiaire}
          onNavigateToView={(view) => setCurrentView(view)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                presences={presences}
                infractions={infractions}
                convocations={convocations}
                planning={planning}
                parametres={parametres}
                onNavigate={(v) => setCurrentView(v)}
                onSelectBeneficiaire={handleSelectBeneficiaire}
              />
            )}

            {currentView === 'appel' && (
              <AppelDuJourView
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                animateurs={animateurs}
                planning={planning}
                presences={presences}
                parametres={parametres}
                onSavePresencesBatch={handleSavePresencesBatch}
              />
            )}

            {currentView === 'beneficiaires' && (
              <BeneficiairesView
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                presences={presences}
                infractions={infractions}
                convocations={convocations}
                parametres={parametres}
                comptesAdmin={comptesAdmin}
                currentUserRole={currentAdmin.role || 'ADMIN'}
                onSaveBeneficiaire={handleSaveBeneficiaire}
                onDeleteBeneficiaire={handleDeleteBeneficiaire}
                onDeleteMultipleBeneficiaires={handleDeleteMultipleBeneficiaires}
                onImportBeneficiaires={handleImportBeneficiaires}
                onDisableAccountForBeneficiaire={handleDisableAccountForBeneficiaire}
              />
            )}

            {currentView === 'absences' && (
              <AbsencesView
                presences={presences}
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                animateurs={animateurs}
                parametres={parametres}
                onUpdatePresence={handleUpdatePresence}
                onDeletePresence={handleDeletePresence}
                onCreateConvocationFromAbsence={handleCreateConvocationFromAbsence}
              />
            )}

            {currentView === 'retards' && (
              <RetardsView
                presences={presences}
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                animateurs={animateurs}
                parametres={parametres}
                onUpdatePresence={handleUpdatePresence}
                onDeletePresence={handleDeletePresence}
                onCreateConvocationFromRetard={handleCreateConvocationFromRetard}
              />
            )}

            {currentView === 'infractions' && (
              <InfractionsView
                infractions={infractions}
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                animateurs={animateurs}
                parametres={parametres}
                onSaveInfraction={handleSaveInfraction}
                onDeleteInfraction={handleDeleteInfraction}
                onCreateConvocationFromInfraction={handleCreateConvocationFromInfraction}
              />
            )}

            {currentView === 'convocations' && (
              <ConvocationsView
                convocations={convocations}
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                parametres={parametres}
                onSaveConvocation={handleSaveConvocation}
                onDeleteConvocation={handleDeleteConvocation}
              />
            )}

            {currentView === 'planning' && (
              <PlanningView
                planning={planning}
                filieres={filieres}
                classes={classes}
                animateurs={animateurs}
                parametres={parametres}
                onSaveSeance={handleSaveSeance}
                onDeleteSeance={handleDeleteSeance}
              />
            )}

            {currentView === 'filieres_classes' && (
              <FilieresClassesView
                filieres={filieres}
                classes={classes}
                beneficiaires={beneficiaires}
                parametres={parametres}
                onSaveFiliere={handleSaveFiliere}
                onDeleteFiliere={handleDeleteFiliere}
                onSaveClasse={handleSaveClasse}
                onDeleteClasse={handleDeleteClasse}
              />
            )}

            {currentView === 'animateurs' && (
              <AnimateursView
                animateurs={animateurs}
                filieres={filieres}
                parametres={parametres}
                onSaveAnimateur={handleSaveAnimateur}
                onDeleteAnimateur={handleDeleteAnimateur}
              />
            )}

            {currentView === 'stats' && (
              <StatsView
                beneficiaires={beneficiaires}
                filieres={filieres}
                classes={classes}
                presences={presences}
                infractions={infractions}
                convocations={convocations}
                parametres={parametres}
              />
            )}

            {currentView === 'parametres' && (
              <ParametresView
                parametres={parametres}
                comptesAdmin={comptesAdmin}
                onSaveParametres={handleSaveParametres}
                onSaveCompteAdmin={handleSaveCompteAdmin}
                onDeleteCompteAdmin={handleDeleteCompteAdmin}
                onDataReset={reloadData}
                onDataRestored={reloadData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Smartphones) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden flex items-center justify-around py-2 px-1 shadow-lg no-print">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t.navDashboard}</span>
        </button>

        <button
          onClick={() => setCurrentView('appel')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'appel' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>{t.navAppel}</span>
        </button>

        <button
          onClick={() => setCurrentView('beneficiaires')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            currentView === 'beneficiaires' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>{t.navBeneficiaires}</span>
        </button>

        <button
          onClick={() => setCurrentView('absences')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            currentView === 'absences' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserX className="w-5 h-5" />
          <span>{t.navAbsences}</span>
          {sidebarCounts.absencesToday > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
              {sidebarCounts.absencesToday}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900"
        >
          <MenuIcon className="w-5 h-5" />
          <span>{lang === 'ar' ? 'القائمة' : 'Menu'}</span>
        </button>
      </div>

      {/* Global Beneficiaire Fiche Modal */}
      {modalBeneficiaire && (
        <FicheIndividuelleModal
          beneficiaire={modalBeneficiaire}
          onClose={() => setModalBeneficiaire(null)}
          filiere={filieres.find((f) => f.id === modalBeneficiaire.filiereId)}
          classe={classes.find((c) => c.id === modalBeneficiaire.classeId)}
          presences={presences.filter((p) => p.beneficiaireId === modalBeneficiaire.id)}
          infractions={infractions.filter((i) => i.beneficiaireId === modalBeneficiaire.id)}
          convocations={convocations.filter((c) => c.beneficiaireId === modalBeneficiaire.id)}
          parametres={parametres}
        />
      )}

      {/* Quick Print Attendance Sheet Modal */}
      {isQuickPrintModalOpen && (
        <FeuilleAppelPrintModal
          isOpen={isQuickPrintModalOpen}
          onClose={() => setIsQuickPrintModalOpen(false)}
          date={todayStr}
          filiere={filieres[0]}
          classe={classes[0]}
          seance="Séance Générale"
          animateur={animateurs[0]}
          beneficiaires={beneficiaires.filter((b) => b.classeId === classes[0]?.id)}
          parametres={parametres}
        />
      )}
    </div>
  );
}

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
} from '../types';
import {
  initialParametres,
  initialFilieres,
  initialClasses,
  initialAnimateurs,
  initialBeneficiaires,
  initialPlanning,
  initialPresences,
  initialInfractions,
  initialConvocations
} from '../data/initialData';

const KEYS = {
  PARAMETRES: 'c2c_parametres_v2',
  FILIERES: 'c2c_filieres_v2',
  CLASSES: 'c2c_classes_v2',
  ANIMATEURS: 'c2c_animateurs_v2',
  BENEFICIAIRES: 'c2c_beneficiaires_v2',
  PLANNING: 'c2c_planning_v2',
  PRESENCES: 'c2c_presences_v2',
  INFRACTIONS: 'c2c_infractions_v2',
  CONVOCATIONS: 'c2c_convocations_v2',
  ADMIN_PASSWORD: 'c2c_admin_password_v2',
  AUTH_SESSION: 'c2c_auth_session_v2',
  COMPTES_ADMIN: 'c2c_comptes_admin_v2',
  CURRENT_ADMIN_ID: 'c2c_current_admin_id_v2'
};

const DEFAULT_ADMIN_PASSWORD = 'admin';

export const initialComptesAdmin: CompteAdministratif[] = [
  {
    id: 'adm-01',
    identifiant: 'admin',
    nom: 'Bennani',
    prenom: 'Mohammed',
    email: 'm.bennani@cmedmaroc.org',
    telephone: '0661234567',
    roleTitre: 'Directeur du Centre',
    role: 'ADMIN',
    motDePasse: 'admin',
    statut: 'Actif',
    dateCreation: '2025-09-01'
  },
  {
    id: 'adm-02',
    identifiant: 'surveillant',
    nom: 'El Amrani',
    prenom: 'Leila',
    email: 'l.elamrani@cmedmaroc.org',
    telephone: '0662345678',
    roleTitre: 'Surveillante Générale',
    role: 'ADMIN',
    motDePasse: 'admin123',
    statut: 'Actif',
    dateCreation: '2025-09-05'
  },
  {
    id: 'adm-03',
    identifiant: 'formateur1',
    nom: 'Tazi',
    prenom: 'Karim',
    email: 'k.tazi@cmedmaroc.org',
    telephone: '0663456789',
    roleTitre: 'Formateur Électricité',
    role: 'ANIMATEUR',
    animateurId: 'anim-1',
    motDePasse: 'anim123',
    statut: 'Actif',
    dateCreation: '2025-09-10'
  },
  {
    id: 'adm-04',
    identifiant: 'beneficiary001',
    nom: 'الإدريسي',
    prenom: 'يوسف',
    email: 'youssef.elidrissi@cmedmaroc.org',
    telephone: '0612457890',
    roleTitre: 'مستفيد (Bénéficiaire)',
    role: 'BENEFICIAIRE',
    beneficiaireId: 'ben-001',
    motDePasse: 'ben123',
    statut: 'Actif',
    dateCreation: '2025-09-12'
  }
];

export const storage = {
  // Parametres
  getParametres(): ParametresCentre {
    try {
      const data = localStorage.getItem(KEYS.PARAMETRES);
      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed.nomSousTitre !== 'زرارة' ||
          parsed.ville !== 'زرارة' ||
          parsed.nomSousTitre?.includes('YAAKOUB') ||
          parsed.nomSousTitre?.includes('يعقوب') ||
          parsed.nomSousTitre?.includes('المحمدية') ||
          parsed.ville?.includes('المحمدية')
        ) {
          const updated: ParametresCentre = {
            ...parsed,
            nomCentre: initialParametres.nomCentre,
            nomSousTitre: 'زرارة',
            adresse: initialParametres.adresse,
            ville: 'زرارة',
            email: initialParametres.email
          };
          localStorage.setItem(KEYS.PARAMETRES, JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
      return initialParametres;
    } catch {
      return initialParametres;
    }
  },
  saveParametres(params: ParametresCentre): void {
    localStorage.setItem(KEYS.PARAMETRES, JSON.stringify(params));
  },

  // Filieres
  getFilieres(): Filiere[] {
    try {
      const data = localStorage.getItem(KEYS.FILIERES);
      return data ? JSON.parse(data) : initialFilieres;
    } catch {
      return initialFilieres;
    }
  },
  saveFilieres(items: Filiere[]): void {
    localStorage.setItem(KEYS.FILIERES, JSON.stringify(items));
  },

  // Classes
  getClasses(): Classe[] {
    try {
      const data = localStorage.getItem(KEYS.CLASSES);
      return data ? JSON.parse(data) : initialClasses;
    } catch {
      return initialClasses;
    }
  },
  saveClasses(items: Classe[]): void {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(items));
  },

  // Animateurs / Formateurs (administrative data only)
  getAnimateurs(): Animateur[] {
    try {
      const data = localStorage.getItem(KEYS.ANIMATEURS);
      return data ? JSON.parse(data) : initialAnimateurs;
    } catch {
      return initialAnimateurs;
    }
  },
  saveAnimateurs(items: Animateur[]): void {
    localStorage.setItem(KEYS.ANIMATEURS, JSON.stringify(items));
  },

  // Beneficiaires
  getBeneficiaires(): Beneficiaire[] {
    try {
      const data = localStorage.getItem(KEYS.BENEFICIAIRES);
      return data ? JSON.parse(data) : initialBeneficiaires;
    } catch {
      return initialBeneficiaires;
    }
  },
  saveBeneficiaires(items: Beneficiaire[]): void {
    localStorage.setItem(KEYS.BENEFICIAIRES, JSON.stringify(items));
  },

  // Planning
  getPlanning(): SeancePlanning[] {
    try {
      const data = localStorage.getItem(KEYS.PLANNING);
      return data ? JSON.parse(data) : initialPlanning;
    } catch {
      return initialPlanning;
    }
  },
  savePlanning(items: SeancePlanning[]): void {
    localStorage.setItem(KEYS.PLANNING, JSON.stringify(items));
  },

  // Presences
  getPresences(): EnregistrementPresence[] {
    try {
      const data = localStorage.getItem(KEYS.PRESENCES);
      return data ? JSON.parse(data) : initialPresences;
    } catch {
      return initialPresences;
    }
  },
  savePresences(items: EnregistrementPresence[]): void {
    localStorage.setItem(KEYS.PRESENCES, JSON.stringify(items));
  },

  // Infractions
  getInfractions(): Infraction[] {
    try {
      const data = localStorage.getItem(KEYS.INFRACTIONS);
      return data ? JSON.parse(data) : initialInfractions;
    } catch {
      return initialInfractions;
    }
  },
  saveInfractions(items: Infraction[]): void {
    localStorage.setItem(KEYS.INFRACTIONS, JSON.stringify(items));
  },

  // Convocations
  getConvocations(): Convocation[] {
    try {
      const data = localStorage.getItem(KEYS.CONVOCATIONS);
      return data ? JSON.parse(data) : initialConvocations;
    } catch {
      return initialConvocations;
    }
  },
  saveConvocations(items: Convocation[]): void {
    localStorage.setItem(KEYS.CONVOCATIONS, JSON.stringify(items));
  },

  // Multiple Administrative Accounts
  getComptesAdmin(): CompteAdministratif[] {
    try {
      const data = localStorage.getItem(KEYS.COMPTES_ADMIN);
      if (data) {
        let accounts: CompteAdministratif[] = JSON.parse(data);
        // Ensure role exists for older stored accounts
        let changed = false;
        accounts = accounts.map((acc) => {
          if (!acc.role) {
            changed = true;
            if (acc.identifiant === 'beneficiary001' || acc.beneficiaireId) {
              return { ...acc, role: 'BENEFICIAIRE' };
            } else if (acc.identifiant.includes('anim') || acc.identifiant.includes('formateur')) {
              return { ...acc, role: 'ANIMATEUR' };
            } else {
              return { ...acc, role: 'ADMIN' };
            }
          }
          return acc;
        });

        // Ensure at least one beneficiary account exists for testing
        if (!accounts.some((a) => a.role === 'BENEFICIAIRE')) {
          accounts.push(initialComptesAdmin[3]);
          changed = true;
        }

        if (changed) {
          localStorage.setItem(KEYS.COMPTES_ADMIN, JSON.stringify(accounts));
        }
        return accounts;
      }
      return initialComptesAdmin;
    } catch {
      return initialComptesAdmin;
    }
  },
  saveComptesAdmin(items: CompteAdministratif[]): void {
    localStorage.setItem(KEYS.COMPTES_ADMIN, JSON.stringify(items));
  },

  getCurrentAdmin(): CompteAdministratif {
    const list = this.getComptesAdmin();
    const currentId = localStorage.getItem(KEYS.CURRENT_ADMIN_ID);
    if (currentId) {
      const found = list.find((a) => a.id === currentId && a.statut === 'Actif');
      if (found) return found;
    }
    return list[0] || initialComptesAdmin[0];
  },
  setCurrentAdminId(id: string): void {
    localStorage.setItem(KEYS.CURRENT_ADMIN_ID, id);
  },

  // Authenticate across any administrative account
  authenticate(identifiantOrEmail: string, motDePasse: string): CompteAdministratif | null {
    const list = this.getComptesAdmin();
    const cleanId = identifiantOrEmail.trim().toLowerCase();

    // Check specific accounts
    const match = list.find(
      (a) =>
        (a.identifiant.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId) &&
        a.motDePasse === motDePasse &&
        a.statut === 'Actif'
    );

    if (match) {
      // Update last access
      match.dernierAcces = new Date().toISOString();
      this.saveComptesAdmin(list);
      this.setCurrentAdminId(match.id);
      this.setLoggedIn(true);
      return match;
    }

    // Fallback: default admin password check for backward compatibility
    if (cleanId === 'admin' && motDePasse === (localStorage.getItem(KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD)) {
      const adminAcc = list[0] || initialComptesAdmin[0];
      this.setCurrentAdminId(adminAcc.id);
      this.setLoggedIn(true);
      return adminAcc;
    }

    return null;
  },

  // Admin Auth Status
  getAdminPassword(): string {
    return localStorage.getItem(KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  },
  setAdminPassword(password: string): void {
    localStorage.setItem(KEYS.ADMIN_PASSWORD, password);
  },
  isLoggedIn(): boolean {
    return localStorage.getItem(KEYS.AUTH_SESSION) === 'true';
  },
  setLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(KEYS.AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(KEYS.AUTH_SESSION);
      localStorage.removeItem(KEYS.CURRENT_ADMIN_ID);
    }
  },

  // Reset to initial
  resetToDefault(): void {
    localStorage.setItem(KEYS.PARAMETRES, JSON.stringify(initialParametres));
    localStorage.setItem(KEYS.FILIERES, JSON.stringify(initialFilieres));
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(initialClasses));
    localStorage.setItem(KEYS.ANIMATEURS, JSON.stringify(initialAnimateurs));
    localStorage.setItem(KEYS.BENEFICIAIRES, JSON.stringify(initialBeneficiaires));
    localStorage.setItem(KEYS.PLANNING, JSON.stringify(initialPlanning));
    localStorage.setItem(KEYS.PRESENCES, JSON.stringify(initialPresences));
    localStorage.setItem(KEYS.INFRACTIONS, JSON.stringify(initialInfractions));
    localStorage.setItem(KEYS.CONVOCATIONS, JSON.stringify(initialConvocations));
    localStorage.setItem(KEYS.COMPTES_ADMIN, JSON.stringify(initialComptesAdmin));
    localStorage.setItem(KEYS.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD);
  },

  // Export full system backup JSON
  exportBackupJSON(): string {
    const backup = {
      version: '2.5',
      timestamp: new Date().toISOString(),
      parametres: this.getParametres(),
      filieres: this.getFilieres(),
      classes: this.getClasses(),
      animateurs: this.getAnimateurs(),
      beneficiaires: this.getBeneficiaires(),
      planning: this.getPlanning(),
      presences: this.getPresences(),
      infractions: this.getInfractions(),
      convocations: this.getConvocations(),
      comptesAdmin: this.getComptesAdmin()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import full system backup JSON
  importBackupJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (data.parametres) this.saveParametres(data.parametres);
      if (data.filieres) this.saveFilieres(data.filieres);
      if (data.classes) this.saveClasses(data.classes);
      if (data.animateurs) this.saveAnimateurs(data.animateurs);
      if (data.beneficiaires) this.saveBeneficiaires(data.beneficiaires);
      if (data.planning) this.savePlanning(data.planning);
      if (data.presences) this.savePresences(data.presences);
      if (data.infractions) this.saveInfractions(data.infractions);
      if (data.convocations) this.saveConvocations(data.convocations);
      if (data.comptesAdmin) this.saveComptesAdmin(data.comptesAdmin);
      return { success: true, message: 'Sauvegarde restaurée avec succès.' };
    } catch {
      return { success: false, message: 'Fichier de sauvegarde invalide ou corrompu.' };
    }
  }
};

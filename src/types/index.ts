export type Sexe = 'Masculin' | 'Féminin';

export type NiveauScolaire =
  | '4 ابتدائي'
  | '5 ابتدائي'
  | '6 ابتدائي'
  | '1 إعدادي'
  | '2 إعدادي'
  | '3 إعدادي'
  | 'آخر'
  | string;

export type StatutBeneficiaire = 'Inscrit' | 'En cours' | 'Abandonné' | 'Réorienté' | 'Diplômé';

export type StatutPresence = 'Présent' | 'Absent' | 'Retard';

export type GraviteInfraction = 'Faible' | 'Moyenne' | 'Grave' | 'Très grave';

export type TypeInfraction =
  | 'Absence répétée'
  | 'Retard répété'
  | 'Non-respect du règlement'
  | 'Comportement inapproprié'
  | 'Violence verbale'
  | 'Violence physique'
  | 'Dégradation du matériel'
  | 'Perturbation de séance'
  | 'Non-respect de l\'animateur'
  | 'Non-respect des autres bénéficiaires'
  | 'Utilisation interdite du téléphone'
  | 'Autre';

export type ActionDisciplinaire =
  | 'Avertissement verbal'
  | 'Avertissement écrit'
  | 'Entretien avec l\'administration'
  | 'Convocation'
  | 'Convocation du parent/tuteur'
  | 'Médiation'
  | 'Autre';

export type StatutInfraction = 'En cours' | 'Traité' | 'Résolu' | 'Clôturé';

export type StatutConvocation = 'En attente' | 'Convoqué' | 'Présent' | 'Traité' | 'Annulé';

export type PersonneConcernee = 'Bénéficiaire' | 'Parent/Tuteur' | 'Bénéficiaire et Parent';

export interface Beneficiaire {
  id: string;
  numeroInscription: string;
  numeroMassar: string;
  nomAr: string;
  prenomAr: string;
  nomFr: string;
  prenomFr: string;
  sexe: Sexe;
  dateNaissance: string;
  lieuNaissance: string;
  niveauScolaire: NiveauScolaire;
  filiereId: string;
  classeId: string;
  telephone: string;
  telephoneTuteur?: string;
  nomTuteur?: string;
  adresse: string;
  photoUrl: string;
  anneeScolaire: string;
  statut: StatutBeneficiaire;
  dateInscription: string;
  remarques?: string;
}

export interface Filiere {
  id: string;
  code: string;
  nom: string;
  description: string;
  dureeMois: number;
  statut: 'Active' | 'Inactive';
}

export interface Classe {
  id: string;
  code: string;
  nom: string;
  filiereId: string;
  anneeScolaire: string;
  capaciteMax: number;
  statut: 'Active' | 'Inactive';
}

export interface Animateur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  fonction: 'Animateur' | 'Animatrice' | 'Formateur' | 'Éducateur spécialisé' | 'Intervenant externe';
  filiereId: string;
  matiere: string;
  statut: 'Actif' | 'Inactif';
  remarque?: string;
}

export interface SeancePlanning {
  id: string;
  jour: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  date?: string;
  heureDebut: string;
  heureFin: string;
  filiereId: string;
  classeId: string;
  matiere: string;
  animateurId: string;
  salle: string;
}

export interface EnregistrementPresence {
  id: string;
  date: string;
  heure: string;
  beneficiaireId: string;
  filiereId: string;
  classeId: string;
  seanceMatiere: string;
  animateurId: string;
  statut: StatutPresence;
  dureeRetardMinutes?: number;
  motif?: string;
  observation?: string;
  justifie?: boolean;
}

export interface Infraction {
  id: string;
  beneficiaireId: string;
  numeroMassar: string;
  date: string;
  heure: string;
  filiereId: string;
  classeId: string;
  animateurId: string;
  typeInfraction: TypeInfraction;
  description: string;
  lieu: string;
  gravite: GraviteInfraction;
  observation: string;
  actionPrise: ActionDisciplinaire;
  statut: StatutInfraction;
}

export interface Convocation {
  id: string;
  beneficiaireId: string;
  date: string;
  heure: string;
  motif: string;
  observation: string;
  personneConcernee: PersonneConcernee;
  statut: StatutConvocation;
  sourceType: 'manuel' | 'absence' | 'retard' | 'infraction';
  sourceId?: string;
  dateCreation: string;
}

export interface ParametresCentre {
  nomCentre: string;
  nomSousTitre: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  directeurNom: string;
  anneeScolaireActive: string;
  horaireMatin: string;
  horaireApresMidi: string;
}

export type UserRole = 'ADMIN' | 'ANIMATEUR' | 'BENEFICIAIRE';

export interface CompteAdministratif {
  id: string;
  identifiant: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  roleTitre: string;
  role?: UserRole;
  beneficiaireId?: string;
  animateurId?: string;
  motDePasse: string;
  statut: 'Actif' | 'Inactif';
  dateCreation: string;
  dernierAcces?: string;
}


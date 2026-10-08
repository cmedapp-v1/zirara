import {
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  SeancePlanning,
  EnregistrementPresence,
  Infraction,
  Convocation,
  ParametresCentre
} from '../types';

export const initialParametres: ParametresCentre = {
  nomCentre: 'مركز الفرصة الثانية الجيل الجديد',
  nomSousTitre: 'زرارة',
  adresse: 'مركز الفرصة الثانية الجيل الجديد، زرارة',
  ville: 'زرارة',
  telephone: '+212 5 37 90 00 10',
  email: 'contact.c2c.zirara@men.gov.ma',
  directeurNom: 'مدير المركز',
  anneeScolaireActive: '2025-2026',
  horaireMatin: '08:30 - 12:30',
  horaireApresMidi: '14:30 - 18:30'
};

export const initialFilieres: Filiere[] = [
  {
    id: 'fil-1',
    code: 'ELEC',
    nom: 'Électricité de Bâtiment et Domotique',
    description: 'Installation, maintenance et équipements électriques basse tension et domotique.',
    dureeMois: 10,
    statut: 'Active'
  },
  {
    id: 'fil-2',
    code: 'COUT',
    nom: 'Couture, Modélisme et Confection',
    description: 'Conception, coupe et fabrication artisanale et industrielle de vêtements.',
    dureeMois: 10,
    statut: 'Active'
  },
  {
    id: 'fil-3',
    code: 'INFO',
    nom: 'Informatique et Métiers du Numérique',
    description: 'Bureautique avancée, infographie, maintenance informatique et développement web.',
    dureeMois: 10,
    statut: 'Active'
  },
  {
    id: 'fil-4',
    code: 'MEN-BOIS',
    nom: 'Menuiserie, Agencement et Décoration',
    description: 'Travail du bois, machines-outils traditionnelles et agencement moderne.',
    dureeMois: 10,
    statut: 'Active'
  },
  {
    id: 'fil-5',
    code: 'CUIS',
    nom: 'Cuisine et Restauration Professionnelle',
    description: 'Techniques culinaires marocaines et internationales, hygiène alimentaire et service.',
    dureeMois: 10,
    statut: 'Active'
  }
];

export const initialClasses: Classe[] = [
  {
    id: 'cls-101',
    code: 'ELEC-1',
    nom: 'Électricité Groupe A',
    filiereId: 'fil-1',
    anneeScolaire: '2025-2026',
    capaciteMax: 20,
    statut: 'Active'
  },
  {
    id: 'cls-102',
    code: 'ELEC-2',
    nom: 'Électricité Groupe B',
    filiereId: 'fil-1',
    anneeScolaire: '2025-2026',
    capaciteMax: 20,
    statut: 'Active'
  },
  {
    id: 'cls-201',
    code: 'COUT-1',
    nom: 'Couture & Modélisme A',
    filiereId: 'fil-2',
    anneeScolaire: '2025-2026',
    capaciteMax: 18,
    statut: 'Active'
  },
  {
    id: 'cls-301',
    code: 'INFO-1',
    nom: 'Numérique & Bureautique A',
    filiereId: 'fil-3',
    anneeScolaire: '2025-2026',
    capaciteMax: 22,
    statut: 'Active'
  },
  {
    id: 'cls-401',
    code: 'MEN-1',
    nom: 'Menuiserie Agencement A',
    filiereId: 'fil-4',
    anneeScolaire: '2025-2026',
    capaciteMax: 16,
    statut: 'Active'
  }
];

export const initialAnimateurs: Animateur[] = [
  {
    id: 'anim-1',
    nom: 'El Amrani',
    prenom: 'Karim',
    telephone: '0661234589',
    email: 'k.elamrani@c2c.ma',
    fonction: 'Formateur',
    filiereId: 'fil-1',
    matiere: 'Installations Électriques & Schémas',
    statut: 'Actif',
    remarque: 'Formateur certifié OFPPT'
  },
  {
    id: 'anim-2',
    nom: 'Benjelloun',
    prenom: 'Fatima-Zahra',
    telephone: '0663456789',
    email: 'fz.benjelloun@c2c.ma',
    fonction: 'Animatrice',
    filiereId: 'fil-2',
    matiere: 'Patronage & Couture Traditionnelle',
    statut: 'Actif',
    remarque: 'Formatrice d’expérience artisanale'
  },
  {
    id: 'anim-3',
    nom: 'Tazi',
    prenom: 'Omar',
    telephone: '0667890123',
    email: 'o.tazi@c2c.ma',
    fonction: 'Formateur',
    filiereId: 'fil-3',
    matiere: 'Bureautique & Développement Web',
    statut: 'Actif',
    remarque: 'Ingénieur informatique'
  },
  {
    id: 'anim-4',
    nom: 'Mansouri',
    prenom: 'Hassan',
    telephone: '0668901234',
    email: 'h.mansouri@c2c.ma',
    fonction: 'Formateur',
    filiereId: 'fil-4',
    matiere: 'Technologie du Bois & Machines',
    statut: 'Actif'
  },
  {
    id: 'anim-5',
    nom: 'Alami',
    prenom: 'Nadia',
    telephone: '0669012345',
    email: 'n.alami@c2c.ma',
    fonction: 'Éducateur spécialisé',
    filiereId: 'fil-1',
    matiere: 'Mise à niveau scolaire & Soft Skills',
    statut: 'Actif',
    remarque: 'Suivi psychosocial et réinsertion'
  }
];

export const initialBeneficiaires: Beneficiaire[] = [];

export const initialPlanning: SeancePlanning[] = [
  {
    id: 'plan-1',
    jour: 'Lundi',
    heureDebut: '08:30',
    heureFin: '10:30',
    filiereId: 'fil-1',
    classeId: 'cls-101',
    matiere: 'Installations Électriques & Schémas',
    animateurId: 'anim-1',
    salle: 'Atelier Électricité 1'
  },
  {
    id: 'plan-2',
    jour: 'Lundi',
    heureDebut: '10:45',
    heureFin: '12:30',
    filiereId: 'fil-1',
    classeId: 'cls-101',
    matiere: 'Sécurité au Travail & Normes',
    animateurId: 'anim-1',
    salle: 'Salle de cours 2'
  },
  {
    id: 'plan-3',
    jour: 'Lundi',
    heureDebut: '08:30',
    heureFin: '12:30',
    filiereId: 'fil-2',
    classeId: 'cls-201',
    matiere: 'Patronage & Couture',
    animateurId: 'anim-2',
    salle: 'Atelier Couture'
  },
  {
    id: 'plan-4',
    jour: 'Lundi',
    heureDebut: '14:30',
    heureFin: '16:30',
    filiereId: 'fil-3',
    classeId: 'cls-301',
    matiere: 'Bureautique & Informatique',
    animateurId: 'anim-3',
    salle: 'Laboratoire Informatique'
  },
  {
    id: 'plan-5',
    jour: 'Mardi',
    heureDebut: '08:30',
    heureFin: '12:30',
    filiereId: 'fil-4',
    classeId: 'cls-401',
    matiere: 'Menuiserie & Travail du Bois',
    animateurId: 'anim-4',
    salle: 'Atelier Menuiserie'
  },
  {
    id: 'plan-6',
    jour: 'Mardi',
    heureDebut: '14:30',
    heureFin: '17:30',
    filiereId: 'fil-1',
    classeId: 'cls-101',
    matiere: 'Mise à niveau & Compétences de vie',
    animateurId: 'anim-5',
    salle: 'Salle Polyvalente'
  }
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const initialPresences: EnregistrementPresence[] = [];

export const initialInfractions: Infraction[] = [];

export const initialConvocations: Convocation[] = [];

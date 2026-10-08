import * as XLSX from 'xlsx';
import {
  Beneficiaire,
  Filiere,
  Classe,
  Animateur,
  EnregistrementPresence,
  Infraction,
  Convocation,
  SeancePlanning,
  Sexe
} from '../types';

export interface ExcelImportAnalysis {
  totalRows: number;
  validRows: Beneficiaire[];
  duplicateRows: {
    rowNumber: number;
    raw: Record<string, any>;
    reason: string;
    existingBen?: Beneficiaire;
  }[];
  errorRows: {
    rowNumber: number;
    raw: Record<string, any>;
    reason: string;
  }[];
}

// Helper to format Excel dates (serial numbers or strings) to YYYY-MM-DD
function parseExcelDate(rawVal: any): string {
  if (!rawVal) return '2008-01-01';
  if (typeof rawVal === 'number') {
    // Excel date serial number to JS Date
    const date = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(rawVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // Handle DD/MM/YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return str || '2008-01-01';
}

export const excelUtils = {
  // 1. Download official Excel template for Beneficiaires
  downloadBeneficiaireTemplate(): void {
    const templateData = [
      {
        'الرقم': 1,
        'رقم مسار': 'G139988112',
        'الاسم بالعربية': 'عمر',
        'النسب بالعربية': 'المريني',
        'الاسم بالفرنسية': 'Omar',
        'النسب بالفرنسية': 'El Marini',
        'تاريخ الازدياد': '2008-05-15',
        'مكان الازدياد': 'زرارة',
        'الجنس': 'ذكر',
        'المستوى الدراسي': '2 إعدادي',
        'رقم التسجيل': 'INS-2025-050',
        'الشعبة / الحرفة': 'Électricité de Bâtiment et Domotique',
        'القسم': 'Électricité Groupe A',
        'السنة الدراسية': '2025-2026'
      },
      {
        'الرقم': 2,
        'رقم مسار': 'J142233445',
        'الاسم بالعربية': 'سلمى',
        'النسب بالعربية': 'الفاسي',
        'الاسم بالفرنسية': 'Salma',
        'النسب بالفرنسية': 'El Fassi',
        'تاريخ الازدياد': '2008-09-20',
        'مكان الازدياد': 'زرارة',
        'الجنس': 'أنثى',
        'المستوى الدراسي': '3 إعدادي',
        'رقم التسجيل': 'INS-2025-051',
        'الشعبة / الحرفة': 'Couture, Modélisme et Confection',
        'القسم': 'Couture & Modélisme A',
        'السنة الدراسية': '2025-2026'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج_المستفيدين');
    XLSX.writeFile(workbook, 'Modele_Import_Beneficiaires_CDC_Zirara.xlsx');
  },

  // 2. Parse and thoroughly analyze imported Excel file
  async analyzeBeneficiaireExcel(
    file: File,
    filieres: Filiere[],
    classes: Classe[],
    existingBeneficiaires: Beneficiaire[]
  ): Promise<ExcelImportAnalysis> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

          if (!rows || rows.length === 0) {
            resolve({
              totalRows: 0,
              validRows: [],
              duplicateRows: [],
              errorRows: [
                {
                  rowNumber: 1,
                  raw: {},
                  reason: 'ملف Excel فارغ أو لا يحتوي على صفوف بيانات صالحة.'
                }
              ]
            });
            return;
          }

          // Existing records maps for fast duplicate checking (by Massar & Inscription)
          const existingByMassar = new Map<string, Beneficiaire>();
          const existingByInscription = new Map<string, Beneficiaire>();

          existingBeneficiaires.forEach((b) => {
            if (b.numeroMassar) existingByMassar.set(b.numeroMassar.trim().toLowerCase(), b);
            if (b.numeroInscription) existingByInscription.set(b.numeroInscription.trim().toLowerCase(), b);
          });

          // In-file uniqueness tracker to prevent duplicating inside the same uploaded file
          const fileSeenMassar = new Set<string>();
          const fileSeenInscription = new Set<string>();

          const validRows: Beneficiaire[] = [];
          const duplicateRows: ExcelImportAnalysis['duplicateRows'] = [];
          const errorRows: ExcelImportAnalysis['errorRows'] = [];

          rows.forEach((row, index) => {
            const rowNumber = index + 2; // +1 for 0-index, +1 for header row

            // Helper to get value across Arabic and French column name variants
            const getVal = (...keys: string[]): string => {
              for (const k of keys) {
                if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                  return String(row[k]).trim();
                }
              }
              return '';
            };

            const numeroMassar = getVal('رقم مسار', 'مسار', 'Numéro Massar', 'Numero Massar', 'Massar');
            const numeroInscription = getVal('رقم التسجيل', 'رقم التسجيل الإداري', 'Numéro d\'inscription', 'Numero inscription', 'num_inscription');
            const prenomAr = getVal('الاسم بالعربية', 'الاسم الشخصي بالعربية', 'الاسم الشخصي', 'Prénom arabe');
            const nomAr = getVal('النسب بالعربية', 'الاسم العائلي بالعربية', 'النسب', 'Nom arabe');
            const prenomFr = getVal('الاسم بالفرنسية', 'Prénom français', 'Prénom', 'Prenom');
            const nomFr = getVal('النسب بالفرنسية', 'Nom français', 'Nom');
            const dateNaissanceRaw = row['تاريخ الازدياد'] || row['Date de naissance'] || row['date_naissance'];
            const lieuNaissance = getVal('مكان الازدياد', 'Lieu de naissance') || 'زرارة';
            const sexeRaw = getVal('الجنس', 'Sexe');
            const niveauScolaireRaw = getVal('المستوى الدراسي', 'المستوى', 'Niveau scolaire', 'Niveau') || '2 إعدادي';
            const filiereRaw = getVal('الشعبة / الحرفة', 'الشعبة', 'الحرفة', 'Filière', 'Filiere');
            const classeRaw = getVal('القسم', 'الفوج', 'Classe');
            const anneeScolaire = getVal('السنة الدراسية', 'Année scolaire', 'Annee scolaire') || '2025-2026';

            // Check if entire row is empty
            if (!numeroMassar && !numeroInscription && !prenomAr && !nomAr && !prenomFr && !nomFr) {
              return; // skip completely empty rows
            }

            // 1. Mandatory data validation
            const missingFields: string[] = [];
            if (!prenomAr && !prenomFr) missingFields.push('الاسم الشخصي (بالعربية أو الفرنسية)');
            if (!nomAr && !nomFr) missingFields.push('الاسم العائلي (بالعربية أو الفرنسية)');
            if (!numeroMassar && !numeroInscription) missingFields.push('رقم مسار أو رقم التسجيل');

            if (missingFields.length > 0) {
              errorRows.push({
                rowNumber,
                raw: row,
                reason: `بيانات إلزامية ناقصة: ${missingFields.join('، ')}`
              });
              return;
            }

            // 2. Normalized values
            const cleanMassar = numeroMassar.toUpperCase();
            const cleanInscription = numeroInscription || `INS-2025-${String(existingBeneficiaires.length + validRows.length + 1).padStart(3, '0')}`;
            const cleanPrenomAr = prenomAr || prenomFr;
            const cleanNomAr = nomAr || nomFr;
            const cleanPrenomFr = prenomFr || prenomAr;
            const cleanNomFr = nomFr || nomAr;

            // Sexe
            let cleanSexe: Sexe = 'Masculin';
            if (sexeRaw.includes('أنثى') || sexeRaw.toLowerCase().startsWith('f')) {
              cleanSexe = 'Féminin';
            }

            // Date
            const cleanDate = parseExcelDate(dateNaissanceRaw);

            // 3. Anti-duplicate check using (رقم مسار + رقم التسجيل)
            let isDuplicate = false;
            let duplicateReason = '';
            let matchedBen: Beneficiaire | undefined;

            if (cleanMassar && existingByMassar.has(cleanMassar.toLowerCase())) {
              isDuplicate = true;
              matchedBen = existingByMassar.get(cleanMassar.toLowerCase());
              duplicateReason = `رقم مسار «${cleanMassar}» مسجل مسبقاً بالمؤسسة (${matchedBen?.prenomAr} ${matchedBen?.nomAr})`;
            } else if (cleanInscription && existingByInscription.has(cleanInscription.toLowerCase())) {
              isDuplicate = true;
              matchedBen = existingByInscription.get(cleanInscription.toLowerCase());
              duplicateReason = `رقم التسجيل «${cleanInscription}» مسجل مسبقاً بالمؤسسة (${matchedBen?.prenomAr} ${matchedBen?.nomAr})`;
            } else if (cleanMassar && fileSeenMassar.has(cleanMassar.toLowerCase())) {
              isDuplicate = true;
              duplicateReason = `رقم مسار «${cleanMassar}» مكرر داخل نفس الملف المرفوع`;
            } else if (cleanInscription && fileSeenInscription.has(cleanInscription.toLowerCase())) {
              isDuplicate = true;
              duplicateReason = `رقم التسجيل «${cleanInscription}» مكرر داخل نفس الملف المرفوع`;
            }

            if (isDuplicate) {
              duplicateRows.push({
                rowNumber,
                raw: row,
                reason: duplicateReason,
                existingBen: matchedBen
              });
              return;
            }

            // 4. Filière and Classe Matching
            let matchedFiliere = filieres.find(
              (f) =>
                f.nom.toLowerCase().includes(filiereRaw.toLowerCase()) ||
                filiereRaw.toLowerCase().includes(f.nom.toLowerCase()) ||
                f.code.toLowerCase() === filiereRaw.toLowerCase()
            );
            if (!matchedFiliere && filieres.length > 0) {
              matchedFiliere = filieres[0];
            }

            let matchedClasse = classes.find(
              (c) =>
                c.nom.toLowerCase().includes(classeRaw.toLowerCase()) ||
                classeRaw.toLowerCase().includes(c.nom.toLowerCase()) ||
                c.code.toLowerCase() === classeRaw.toLowerCase()
            );
            if (!matchedClasse && classes.length > 0) {
              matchedClasse = classes.find((c) => c.filiereId === matchedFiliere?.id) || classes[0];
            }

            // Valid Beneficiaire record
            const newBen: Beneficiaire = {
              id: 'ben-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
              numeroInscription: cleanInscription,
              numeroMassar: cleanMassar || `MASSAR-${Math.floor(100000000 + Math.random() * 900000000)}`,
              nomAr: cleanNomAr,
              prenomAr: cleanPrenomAr,
              nomFr: cleanNomFr,
              prenomFr: cleanPrenomFr,
              sexe: cleanSexe,
              dateNaissance: cleanDate,
              lieuNaissance: lieuNaissance || 'زرارة',
              niveauScolaire: niveauScolaireRaw,
              filiereId: matchedFiliere ? matchedFiliere.id : (filieres[0]?.id || ''),
              classeId: matchedClasse ? matchedClasse.id : (classes[0]?.id || ''),
              telephone: getVal('الهاتف', 'Téléphone', 'Telephone') || '',
              telephoneTuteur: getVal('هاتف الولي', 'Téléphone tuteur', 'Telephone tuteur') || '',
              nomTuteur: getVal('اسم الولي', 'Nom tuteur') || '',
              adresse: getVal('العنوان', 'العنوان السكني', 'Adresse') || 'زرارة',
              photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanMassar || cleanInscription}`,
              anneeScolaire,
              statut: 'En cours',
              dateInscription: new Date().toISOString().split('T')[0]
            };

            validRows.push(newBen);
            if (cleanMassar) fileSeenMassar.add(cleanMassar.toLowerCase());
            if (cleanInscription) fileSeenInscription.add(cleanInscription.toLowerCase());
          });

          resolve({
            totalRows: rows.length,
            validRows,
            duplicateRows,
            errorRows
          });
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },

  // 3. Export Beneficiaires to Excel
  exportBeneficiaires(beneficiaires: Beneficiaire[], filieres: Filiere[], classes: Classe[]): void {
    const filiereMap = new Map(filieres.map((f) => [f.id, f.nom]));
    const classeMap = new Map(classes.map((c) => [c.id, c.nom]));

    const data = beneficiaires.map((b, idx) => ({
      'الرقم': idx + 1,
      'رقم التسجيل': b.numeroInscription,
      'رقم مسار': b.numeroMassar,
      'الاسم بالعربية': b.prenomAr,
      'النسب بالعربية': b.nomAr,
      'الاسم بالفرنسية': b.prenomFr,
      'النسب بالفرنسية': b.nomFr,
      'الجنس': b.sexe === 'Masculin' || b.sexe === ('ذكر' as any) ? 'ذكر' : 'أنثى',
      'تاريخ الازدياد': b.dateNaissance,
      'مكان الازدياد': b.lieuNaissance,
      'المستوى الدراسي': b.niveauScolaire,
      'الشعبة / الحرفة': filiereMap.get(b.filiereId) || '',
      'القسم': classeMap.get(b.classeId) || '',
      'الهاتف': b.telephone,
      'هاتف الولي': b.telephoneTuteur || '',
      'اسم الولي': b.nomTuteur || '',
      'العنوان': b.adresse,
      'الحالة': b.statut,
      'السنة الدراسية': b.anneeScolaire,
      'تاريخ التسجيل': b.dateInscription
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستفيدون');
    XLSX.writeFile(workbook, `Beneficiaires_CDC_Zirara_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 4. Export Presences / Absences
  exportPresences(
    presences: EnregistrementPresence[],
    beneficiaires: Beneficiaire[],
    filieres: Filiere[],
    classes: Classe[],
    animateurs: Animateur[],
    filterStatut?: 'Absent' | 'Retard'
  ): void {
    const benMap = new Map(beneficiaires.map((b) => [b.id, b]));
    const filiereMap = new Map(filieres.map((f) => [f.id, f.nom]));
    const classeMap = new Map(classes.map((c) => [c.id, c.nom]));
    const animMap = new Map(animateurs.map((a) => [a.id, `${a.prenom} ${a.nom}`]));

    const filtered = filterStatut ? presences.filter((p) => p.statut === filterStatut) : presences;

    const data = filtered.map((p) => {
      const ben = benMap.get(p.beneficiaireId);
      return {
        'Date': p.date,
        'Heure': p.heure,
        'N° Inscription': ben?.numeroInscription || '-',
        'N° Massar': ben?.numeroMassar || '-',
        'Bénéficiaire (FR)': ben ? `${ben.prenomFr} ${ben.nomFr}` : 'Inconnu',
        'Bénéficiaire (AR)': ben ? `${ben.prenomAr} ${ben.nomAr}` : '-',
        'Statut': p.statut,
        'Durée Retard (min)': p.dureeRetardMinutes || '',
        'Filière': filiereMap.get(p.filiereId) || '-',
        'Classe': classeMap.get(p.classeId) || '-',
        'Séance / Matière': p.seanceMatiere || '-',
        'Animateur': animMap.get(p.animateurId) || '-',
        'Motif': p.motif || '',
        'Observation': p.observation || '',
        'Justifié': p.justifie ? 'Oui' : 'Non'
      };
    });

    const prefix = filterStatut ? filterStatut.toLowerCase() + 's' : 'presences';
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, prefix.toUpperCase());
    XLSX.writeFile(workbook, `${prefix}_CDC_Zirara_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 5. Export Infractions
  exportInfractions(
    infractions: Infraction[],
    beneficiaires: Beneficiaire[],
    filieres?: Filiere[],
    classes?: Classe[],
    animateurs?: Animateur[]
  ): void {
    const benMap = new Map(beneficiaires.map((b) => [b.id, b]));
    const filiereMap = new Map((filieres || []).map((f) => [f.id, f.nom]));
    const classeMap = new Map((classes || []).map((c) => [c.id, c.nom]));
    const animMap = new Map((animateurs || []).map((a) => [a.id, `${a.prenom} ${a.nom}`]));

    const data = infractions.map((i) => {
      const ben = benMap.get(i.beneficiaireId);
      return {
        'Date': i.date,
        'Heure': i.heure,
        'Bénéficiaire': ben ? `${ben.prenomFr} ${ben.nomFr}` : 'Inconnu',
        'N° Massar': i.numeroMassar || ben?.numeroMassar || '',
        'Filière': filiereMap.get(i.filiereId) || '',
        'Classe': classeMap.get(i.classeId) || '',
        'Formateur': animMap.get(i.animateurId) || '',
        'Type Infraction': i.typeInfraction,
        'Gravité': i.gravite,
        'Description': i.description,
        'Lieu': i.lieu,
        'Action Prise': i.actionPrise,
        'Statut': i.statut,
        'Observation': i.observation
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Infractions');
    XLSX.writeFile(workbook, `Infractions_CDC_Zirara_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 6. Export Convocations
  exportConvocations(
    convocations: Convocation[],
    beneficiaires: Beneficiaire[],
    filieres?: Filiere[],
    classes?: Classe[]
  ): void {
    const benMap = new Map(beneficiaires.map((b) => [b.id, b]));
    const filiereMap = new Map((filieres || []).map((f) => [f.id, f.nom]));
    const classeMap = new Map((classes || []).map((c) => [c.id, c.nom]));

    const data = convocations.map((c) => {
      const ben = benMap.get(c.beneficiaireId);
      return {
        'Date Convocation': c.date,
        'Heure': c.heure,
        'Bénéficiaire': ben ? `${ben.prenomFr} ${ben.nomFr}` : 'Inconnu',
        'N° Inscription': ben?.numeroInscription || '',
        'N° Massar': ben?.numeroMassar || '',
        'Filière': ben ? (filiereMap.get(ben.filiereId) || '') : '',
        'Classe': ben ? (classeMap.get(ben.classeId) || '') : '',
        'Téléphone Tuteur': ben?.telephoneTuteur || ben?.telephone || '',
        'Personne Concernée': c.personneConcernee,
        'Motif': c.motif,
        'Statut': c.statut,
        'Origine': c.sourceType,
        'Observation': c.observation,
        'Date Création': c.dateCreation
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Convocations');
    XLSX.writeFile(workbook, `Convocations_CDC_Zirara_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 7. Export Planning
  exportPlanning(planning: SeancePlanning[], filieres: Filiere[], classes: Classe[], animateurs: Animateur[]): void {
    const filiereMap = new Map(filieres.map((f) => [f.id, f.nom]));
    const classeMap = new Map(classes.map((c) => [c.id, c.nom]));
    const animMap = new Map(animateurs.map((a) => [a.id, `${a.prenom} ${a.nom}`]));

    const data = planning.map((p) => ({
      'Jour': p.jour,
      'Heure Début': p.heureDebut,
      'Heure Fin': p.heureFin,
      'Filière': filiereMap.get(p.filiereId) || '',
      'Classe': classeMap.get(p.classeId) || '',
      'Séance / Matière': p.matiere,
      'Formateur / Animateur': animMap.get(p.animateurId) || '',
      'Salle / Atelier': p.salle
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planning');
    XLSX.writeFile(workbook, `Planning_CDC_Zirara_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

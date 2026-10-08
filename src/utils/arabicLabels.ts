export const AR_NIVEAUX_SCOLAIRES = [
  '4 ابتدائي',
  '5 ابتدائي',
  '6 ابتدائي',
  '1 إعدادي',
  '2 إعدادي',
  '3 إعدادي',
  'آخر'
];

export const formatNiveauAr = (niveau: string): string => {
  if (!niveau) return 'غير محدد';
  switch (niveau.trim()) {
    case '4ème année primaire':
    case 'السنة الرابعة ابتدائي':
    case '4 ابتدائي':
      return '4 ابتدائي';
    case '5ème année primaire':
    case 'السنة الخامسة ابتدائي':
    case '5 ابتدائي':
      return '5 ابتدائي';
    case '6ème année primaire':
    case 'السنة السادسة ابتدائي':
    case '6 ابتدائي':
      return '6 ابتدائي';
    case '1ère année collège':
    case 'السنة الأولى إعدادي':
    case '1 إعدادي':
      return '1 إعدادي';
    case '2ème année collège':
    case 'السنة الثانية إعدادي':
    case '2 إعدادي':
      return '2 إعدادي';
    case '3ème année collège':
    case 'السنة الثالثة إعدادي':
    case '3 إعدادي':
      return '3 إعدادي';
    default:
      return niveau;
  }
};

export const formatSexeAr = (sexe: string): string => {
  if (sexe === 'Masculin' || sexe === 'ذكر') return 'ذكر';
  if (sexe === 'Féminin' || sexe === 'أنثى') return 'أنثى';
  return sexe;
};

export const formatStatutBeneficiaireAr = (statut: string): string => {
  switch (statut) {
    case 'Inscrit':
    case 'مسجل':
      return 'مسجل';
    case 'En cours':
    case 'مستمر':
      return 'مستمر';
    case 'Abandonné':
    case 'منقطع':
      return 'منقطع';
    case 'Réorienté':
    case 'تمت إعادة توجيهه':
      return 'تمت إعادة توجيهه';
    case 'Diplômé':
    case 'متخرج':
      return 'متخرج';
    default:
      return statut;
  }
};

export const formatStatutPresenceAr = (statut: string): string => {
  switch (statut) {
    case 'Présent':
    case 'حاضر':
      return 'حاضر';
    case 'Absent':
    case 'غائب':
      return 'غائب';
    case 'Retard':
    case 'متأخر':
      return 'متأخر';
    default:
      return statut;
  }
};

export const formatGraviteAr = (gravite: string): string => {
  switch (gravite) {
    case 'Faible':
    case 'طفيفة':
      return 'طفيفة';
    case 'Moyenne':
    case 'متوسطة':
      return 'متوسطة';
    case 'Grave':
    case 'خطيرة':
      return 'خطيرة';
    case 'Très grave':
    case 'خطيرة جداً':
      return 'خطيرة جداً';
    default:
      return gravite;
  }
};

export const formatTypeInfractionAr = (type: string): string => {
  switch (type) {
    case 'Absence répétée':
      return 'غياب متكرر';
    case 'Retard répété':
      return 'تأخر متكرر';
    case 'Non-respect du règlement':
      return 'عدم احترام النظام الداخلي';
    case 'Comportement inapproprié':
      return 'سلوك غير لائق';
    case 'Violence verbale':
      return 'عنف لفظي';
    case 'Violence physique':
      return 'عنف جسدي';
    case 'Dégradation du matériel':
      return 'إتلاف التجهيزات';
    case 'Perturbation de séance':
      return 'التشويش على الحصة';
    case 'Non-respect de l\'animateur':
      return 'عدم احترام المؤطر';
    case 'Non-respect des autres bénéficiaires':
      return 'عدم احترام الزملاء';
    case 'Utilisation interdite du téléphone':
      return 'استعمال الهاتف بدون إذن';
    default:
      return type;
  }
};

export const formatActionDisciplinaireAr = (action: string): string => {
  switch (action) {
    case 'Avertissement verbal':
      return 'إنذار شفهي';
    case 'Avertissement écrit':
      return 'إنذار كتابي';
    case 'Entretien avec l\'administration':
      return 'مقابلة مع الإدارة';
    case 'Convocation':
      return 'استدعاء المعني بالأمر';
    case 'Convocation du parent/tuteur':
      return 'استدعاء ولي الأمر';
    case 'Médiation':
      return 'وساطة تربوية';
    default:
      return action;
  }
};

export const formatStatutConvocationAr = (statut: string): string => {
  switch (statut) {
    case 'En attente':
      return 'قيد الانتظار';
    case 'Convoqué':
      return 'تم الاستدعاء';
    case 'Présent':
      return 'حضر';
    case 'Traité':
      return 'تمت المعالجة';
    case 'Annulé':
      return 'ملغى';
    default:
      return statut;
  }
};

export const formatPersonneConcerneeAr = (personne: string): string => {
  switch (personne) {
    case 'Bénéficiaire':
      return 'المستفيد';
    case 'Parent/Tuteur':
      return 'ولي الأمر';
    case 'Bénéficiaire et Parent':
      return 'المستفيد وولي الأمر معاً';
    default:
      return personne;
  }
};

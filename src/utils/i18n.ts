export type AppLanguage = 'ar' | 'fr';

export interface Translations {
  centreTitle: string;
  centreSubtitle: string;
  adminSpace: string;
  adminAccount: string;
  superAdminOnly: string;
  searchPlaceholder: string;
  notifications: string;
  switchAccount: string;
  accountsCount: string;
  logout: string;
  settings: string;
  today: string;
  schoolYear: string;
  
  // Menu Sections
  sectionMain: string;
  sectionManagement: string;
  sectionAttendance: string;
  sectionFollowup: string;
  sectionReports: string;
  sectionSettings: string;

  // Nav Views
  navDashboard: string;
  navBeneficiaires: string;
  navClasses: string;
  navFilieres: string;
  navAnimateurs: string;
  navPlanning: string;
  navAppel: string;
  navPresences: string;
  navAbsences: string;
  navRetards: string;
  navInfractions: string;
  navConvocations: string;
  navStats: string;
  navPrintAppel: string;
  navSettingsGeneral: string;
  navAdminAccounts: string;
  navBackup: string;
  navLocalNetwork: string;

  // KPI Cards
  kpiTotalBeneficiaires: string;
  kpiTotalBeneficiairesDesc: string;
  kpiPresentsToday: string;
  kpiPresentsTodayDesc: string;
  kpiAbsentsToday: string;
  kpiAbsentsTodayDesc: string;
  kpiRetardsToday: string;
  kpiRetardsTodayDesc: string;
  kpiInfractions: string;
  kpiInfractionsDesc: string;
  kpiConvocations: string;
  kpiConvocationsDesc: string;

  // Actions
  actionTakeCall: string;
  actionPrintReport: string;
  actionExportExcel: string;
  actionAdd: string;
  actionEdit: string;
  actionDelete: string;
  actionSearch: string;
  actionFilter: string;
  actionCancel: string;
  actionSave: string;
  actionConfirm: string;
  actionView: string;
}

export const translations: Record<AppLanguage, Translations> = {
  ar: {
    centreTitle: 'مركز الفرصة الثانية الجيل الجديد',
    centreSubtitle: 'زرارة',
    adminSpace: 'الفضاء الإداري الرسمي · تدبير الغياب والحضور',
    adminAccount: 'حساب إداري',
    superAdminOnly: 'خاص بالإدارة فقط',
    searchPlaceholder: 'بحث شامل عن مستفيد، رقم مسار، غياب، استدعاء...',
    notifications: 'التنبيهات الإدارية',
    switchAccount: 'تبديل الحساب الإداري',
    accountsCount: 'حسابات إدارية نشطة',
    logout: 'تسجيل الخروج',
    settings: 'الإعدادات',
    today: 'اليوم',
    schoolYear: 'السنة التكوينية النشطة',

    sectionMain: 'الرئيسية',
    sectionManagement: 'التسيير',
    sectionAttendance: 'الحضور والغياب',
    sectionFollowup: 'المتابعة والانضباط',
    sectionReports: 'التقارير والإحصائيات',
    sectionSettings: 'الإعدادات والنظام',

    navDashboard: 'لوحة القيادة',
    navBeneficiaires: 'المستفيدون',
    navClasses: 'الأقسام',
    navFilieres: 'الشعب والتخصصات',
    navAnimateurs: 'المنشطون والمدربون',
    navPlanning: 'استعمال الزمن',
    navAppel: 'نداء الحضور (اليومي)',
    navPresences: 'سجل الحضور',
    navAbsences: 'لائحة الغياب',
    navRetards: 'سجل التأخرات',
    navInfractions: 'المخالفات والانضباط',
    navConvocations: 'الاستدعاءات الرسمية',
    navStats: 'الإحصائيات والتقارير',
    navPrintAppel: 'أوراق النداء للطباعة',
    navSettingsGeneral: 'إعدادات المركز',
    navAdminAccounts: 'الحسابات الإدارية',
    navBackup: 'النسخ الاحتياطي',
    navLocalNetwork: 'الشبكة المحلية',

    kpiTotalBeneficiaires: 'مجموع المستفيدين',
    kpiTotalBeneficiairesDesc: 'المسجلون بجميع الشعب والأقسام',
    kpiPresentsToday: 'الحاضرون اليوم',
    kpiPresentsTodayDesc: 'نسبة الحضور الفعلي المسجلة',
    kpiAbsentsToday: 'الغائبون اليوم',
    kpiAbsentsTodayDesc: 'حالات الغياب غير المبررة والمبررة',
    kpiRetardsToday: 'المتأخرون اليوم',
    kpiRetardsTodayDesc: 'التأخرات المسجلة خلال الحصص',
    kpiInfractions: 'المخالفات والانضباط',
    kpiInfractionsDesc: 'الحالات المسجلة مع درجات الخطورة',
    kpiConvocations: 'الاستدعاءات',
    kpiConvocationsDesc: 'استدعاءات الأولياء قيد المتابعة',

    actionTakeCall: 'إنجاز نداء الحضور',
    actionPrintReport: 'طباعة التقرير',
    actionExportExcel: 'تصدير Excel',
    actionAdd: 'إضافة جديد',
    actionEdit: 'تعديل',
    actionDelete: 'حذف',
    actionSearch: 'بحث...',
    actionFilter: 'تصفية',
    actionCancel: 'إلغاء',
    actionSave: 'حفظ التغييرات',
    actionConfirm: 'تأكيد',
    actionView: 'معاينة'
  },
  fr: {
    centreTitle: 'CENTRE DE DEUXIÈME CHANCE – NOUVELLE GÉNÉRATION',
    centreSubtitle: 'ZIRARA',
    adminSpace: 'Espace Administratif · Gestion des Absences',
    adminAccount: 'Compte Administrateur',
    superAdminOnly: 'Réservé à l\'administration',
    searchPlaceholder: 'Recherche globale bénéficiaire, Massar, absence, convocation...',
    notifications: 'Notifications administratives',
    switchAccount: 'Changer de compte administrateur',
    accountsCount: 'Comptes administratifs autorisés',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    today: 'Aujourd\'hui',
    schoolYear: 'Année scolaire active',

    sectionMain: 'Principal',
    sectionManagement: 'Gestion',
    sectionAttendance: 'Présence & Absence',
    sectionFollowup: 'Suivi & Discipline',
    sectionReports: 'Rapports & Statistiques',
    sectionSettings: 'Paramètres & Système',

    navDashboard: 'Tableau de bord',
    navBeneficiaires: 'Bénéficiaires',
    navClasses: 'Classes',
    navFilieres: 'Filières',
    navAnimateurs: 'Formateurs / Animateurs',
    navPlanning: 'Emploi du temps',
    navAppel: 'Appel du jour',
    navPresences: 'Présences',
    navAbsences: 'Absences',
    navRetards: 'Retards',
    navInfractions: 'Infractions & Discipline',
    navConvocations: 'Convocations',
    navStats: 'Statistiques & Rapports',
    navPrintAppel: 'Feuilles d\'appel à imprimer',
    navSettingsGeneral: 'Paramètres du centre',
    navAdminAccounts: 'Comptes administratifs',
    navBackup: 'Sauvegarde & Restauration',
    navLocalNetwork: 'Réseau local',

    kpiTotalBeneficiaires: 'Total Bénéficiaires',
    kpiTotalBeneficiairesDesc: 'Inscrits dans toutes les filières',
    kpiPresentsToday: 'Présents aujourd\'hui',
    kpiPresentsTodayDesc: 'Taux de présence effectif',
    kpiAbsentsToday: 'Absents aujourd\'hui',
    kpiAbsentsTodayDesc: 'Absences enregistrées',
    kpiRetardsToday: 'Retards aujourd\'hui',
    kpiRetardsTodayDesc: 'Retards enregistrés en séance',
    kpiInfractions: 'Infractions',
    kpiInfractionsDesc: 'Cas disciplinaires enregistrés',
    kpiConvocations: 'Convocations',
    kpiConvocationsDesc: 'Convocations en attente ou traitées',

    actionTakeCall: 'Faire l\'appel du jour',
    actionPrintReport: 'Imprimer rapport',
    actionExportExcel: 'Exporter Excel',
    actionAdd: 'Ajouter',
    actionEdit: 'Modifier',
    actionDelete: 'Supprimer',
    actionSearch: 'Rechercher...',
    actionFilter: 'Filtrer',
    actionCancel: 'Annuler',
    actionSave: 'Enregistrer',
    actionConfirm: 'Confirmer',
    actionView: 'Consulter'
  }
};

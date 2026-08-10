import { MajorConfig, Course, KnowledgeCluster } from '../../types';

export function createSharifCE1400(courses: Course[], clusters: KnowledgeCluster[]): MajorConfig {
  return {
    id: 'ce_1400',
    department: {
      id: 'ce',
      titleFa: 'دانشکده مهندسی کامپیوتر',
      titleEn: 'Department of Computer Engineering',
    },
    universityTitleFa: 'دانشگاه صنعتی شریف',
    universityTitleEn: 'Sharif University of Technology',
    programTitleFa: 'دوره کارشناسی مهندسی کامپیوتر',
    programTitleEn: 'B.Sc. in Computer Engineering',
    curriculumCode: 'BS-CE-1400_2',
    entryYear: '1400+',
    degreeRequirement: {
      totalCredits: 140,
      specializedElectiveMinCourses: 7,
      specializedElectiveMinCredits: 21,
      generalElectiveMinCredits: 13,
      generalCoreMinCredits: 20,
    },
    rulesSummaryFa: [
      'دروس نمودار درختی (اجباری): طبق چیدمان ترم‌های ۱ تا ۸ اخذ شوند و پیش‌نیاز/همنیازهای آن‌ها رعایت شود.',
      'دروس تخصصی (جدول ۱): دانشجو ملزم به گذراندن حداقل ۷ درس (حداقل ۲۱ واحد) است.',
      'دروس اختیاری (جدول ۲): دانشجو ملزم به گذراندن حداقل ۱۳ واحد است.',
      'تطبیق‌ها: درس «طراحی شیء‌گرای سیستم‌ها» با «ایجاد چابک نرم‌افزار» و «برنامه‌سازی وب» با «برنامه‌سازی موبایل» قابل تطبیق است.',
    ],
    rulesSummaryEn: [
      'Tree Core Courses (Mandatory): Must be taken according to terms 1-8 sequence adhering to prerequisites/corequisites.',
      'Specialized Electives (Table 1): Students must pass at least 7 courses (min 21 credits).',
      'General Electives (Table 2): Students must pass at least 13 credits.',
      'Equivalencies: "Object-Oriented Design" matches "Agile Software Creation", and "Web Programming" matches "Mobile Programming".',
    ],
    courses,
    clusters,
  };
}


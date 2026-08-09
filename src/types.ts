export type CourseType = 'tree' | 'specialized' | 'general_elective' | 'general_core' | 'foundation';

export type CourseStatus = 'NOT_TAKEN' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';

export interface Course {
  id: string; // e.g. "40153"
  titleFa: string; // e.g. "مبانی برنامه‌سازی"
  titleEn: string; // e.g. "Fundamentals of Programming"
  credits: number;
  type: CourseType;
  term?: number; // 1..8 for tree courses, undefined for electives
  prerequisites: string[]; // Course IDs
  corequisites: string[]; // Course IDs
  clusters: string[]; // Cluster IDs
  notesFa?: string;
  notesEn?: string;
  isLab?: boolean;
  categoryGroup?: string; // Group identifier for General Education options (e.g. "group_ethics")
}

export interface KnowledgeCluster {
  id: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  courseIds: string[]; // Required or recommended course IDs in this cluster
  extraCoursesTextFa?: string; // Text for basket+ courses
  extraCoursesTextEn?: string;
  iconName?: string;
}

export interface StudentProgress {
  courseStatuses: Record<string, CourseStatus>; // courseId -> CourseStatus
  courseGrades?: Record<string, number>; // courseId -> grade (0-20)
  courseTermOverrides?: Record<string, number>; // courseId -> term number override (1..8+)
  targetClusterId?: string; // Legacy single cluster target
  targetClusterIds?: string[]; // Multi-select target clusters
  plannedSemesters: PlannedSemester[];
  studentName?: string;
  entryYear?: number;
}

export interface PlannedSemester {
  id: string;
  termNumber: number;
  titleFa: string;
  titleEn: string;
  courseIds: string[];
}

export interface RuleValidation {
  courseId: string;
  type: 'prerequisite_missing' | 'corequisite_missing' | 'credit_limit_exceeded';
  messageFa: string;
  messageEn: string;
  missingPrereqs: string[];
  missingCoreqs: string[];
}

export interface ClusterProgress {
  cluster: KnowledgeCluster;
  totalCoursesCount: number;
  passedCoursesCount: number;
  inProgressCoursesCount: number;
  passedCourseIds: string[];
  missingCourseIds: string[];
  percentage: number;
  projectedPercentage: number;
}

export interface GraduationStats {
  totalCreditsPassed: number;
  totalCreditsInProgress: number;
  treeCreditsPassed: number;
  treeCreditsInProgress: number;
  treeCreditsTotal: number;
  treeProgressPercent: number;
  treeProjectedPercent: number;
  foundationCreditsPassed: number;
  foundationCreditsInProgress: number;
  foundationCreditsTotal: number;
  specializedCoursesPassedCount: number;
  specializedCoursesInProgressCount: number;
  specializedCreditsPassed: number;
  specializedCreditsInProgress: number;
  specializedRequirementMet: boolean; // >= 7 courses & >= 21 credits
  generalElectiveCreditsPassed: number;
  generalElectiveCreditsInProgress: number;
  generalElectiveRequirementMet: boolean; // >= 13 credits
  generalCoreCreditsPassed: number;
  generalCoreCreditsInProgress: number;
  generalCoreRequirementMet: boolean; // 20 credits with 5 groups covered
  overallGpa?: number;
  isGraduationEligible: boolean;
}

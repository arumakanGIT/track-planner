import { COURSES, KNOWLEDGE_CLUSTERS, DEFAULT_MAJOR } from '../data/curriculumData';
import {
  ClusterProgress,
  Course,
  CourseStatus,
  GraduationStats,
  KnowledgeCluster,
  MajorConfig,
  RuleValidation,
  StudentProgress,
} from '../types';

export const STORAGE_KEY = 'ce_curriculum_tracker_v1';

export function getCourseById(id: string, courses: Course[] = COURSES): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getInitialProgress(): StudentProgress {
  const courseStatuses: Record<string, CourseStatus> = {};
  COURSES.forEach((c) => {
    courseStatuses[c.id] = 'NOT_TAKEN';
  });

  return {
    courseStatuses,
    courseGrades: {},
    plannedSemesters: [
      {
        id: 'sem_1',
        termNumber: 1,
        titleFa: 'ترم ۱ پیش‌فرض',
        titleEn: 'Default Term 1',
        courseIds: ['22015', '24011', '40153', '40108', '33018', '30003', '31123'],
      },
    ],
    studentName: 'دانشجوی مهندسی کامپیوتر',
    entryYear: 1402,
  };
}

export function loadSavedProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialProgress();
    const parsed = JSON.parse(raw);
    // Ensure all current courses exist in statuses
    const initial = getInitialProgress();
    const mergedStatuses = { ...initial.courseStatuses, ...(parsed.courseStatuses || {}) };
    return {
      ...initial,
      ...parsed,
      courseStatuses: mergedStatuses,
    };
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return getInitialProgress();
  }
}

export function saveProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

/**
 * Validate prerequisite and corequisite rules for a target course given current course statuses.
 */
export function validateCourseRules(
  course: Course,
  statuses: Record<string, CourseStatus>
): RuleValidation[] {
  const warnings: RuleValidation[] = [];

  // Check prerequisites: Must be PASSED
  const missingPrereqs: string[] = [];
  course.prerequisites.forEach((pId) => {
    if (statuses[pId] !== 'PASSED') {
      missingPrereqs.push(pId);
    }
  });

  if (missingPrereqs.length > 0) {
    const missingNamesFa = missingPrereqs
      .map((id) => getCourseById(id)?.titleFa || id)
      .join('، ');
    const missingNamesEn = missingPrereqs
      .map((id) => getCourseById(id)?.titleEn || id)
      .join(', ');

    warnings.push({
      courseId: course.id,
      type: 'prerequisite_missing',
      missingPrereqs,
      missingCoreqs: [],
      messageFa: `پیش‌نیازهای این درس (${missingNamesFa}) هنوز پاس نشده‌اند.`,
      messageEn: `Prerequisites for this course (${missingNamesEn}) have not been passed yet.`,
    });
  }

  // Check corequisites: Must be PASSED or IN_PROGRESS
  const missingCoreqs: string[] = [];
  course.corequisites.forEach((cId) => {
    const status = statuses[cId];
    if (status !== 'PASSED' && status !== 'IN_PROGRESS') {
      missingCoreqs.push(cId);
    }
  });

  if (missingCoreqs.length > 0) {
    const missingNamesFa = missingCoreqs
      .map((id) => getCourseById(id)?.titleFa || id)
      .join('، ');
    const missingNamesEn = missingCoreqs
      .map((id) => getCourseById(id)?.titleEn || id)
      .join(', ');

    warnings.push({
      courseId: course.id,
      type: 'corequisite_missing',
      missingPrereqs: [],
      missingCoreqs,
      messageFa: `همنیازهای این درس (${missingNamesFa}) باید همزمان یا قبل‌تر اخذ شوند.`,
      messageEn: `Corequisites (${missingNamesEn}) must be taken concurrently or prior.`,
    });
  }

  return warnings;
}

/**
 * Calculate Graduation Statistics and Counters
 */
export function calculateGraduationStats(
  statuses: Record<string, CourseStatus>,
  grades: Record<string, number> = {},
  majorConfig: MajorConfig = DEFAULT_MAJOR
): GraduationStats {
  const req = majorConfig.degreeRequirement;
  let totalCreditsPassed = 0;
  let totalCreditsInProgress = 0;

  let treeCreditsPassed = 0;
  let treeCreditsInProgress = 0;
  let treeCreditsTotal = 0;

  let foundationCreditsPassed = 0;
  let foundationCreditsInProgress = 0;
  let foundationCreditsTotal = 0;

  let specializedCoursesPassedCount = 0;
  let specializedCoursesInProgressCount = 0;
  let specializedCreditsPassed = 0;
  let specializedCreditsInProgress = 0;

  let generalElectiveCreditsPassed = 0;
  let generalElectiveCreditsInProgress = 0;

  let generalCoreCreditsPassed = 0;
  let generalCoreCreditsInProgress = 0;

  let totalGradePoints = 0;
  let totalGradedCredits = 0;

  majorConfig.courses.forEach((course) => {
    const status = statuses[course.id];
    const isPassed = status === 'PASSED';
    const isInProgress = status === 'IN_PROGRESS';
    const grade = grades[course.id];

    if (isPassed && typeof grade === 'number' && grade >= 10) {
      totalGradePoints += grade * course.credits;
      totalGradedCredits += course.credits;
    }

    if (course.type === 'tree') {
      treeCreditsTotal += course.credits;
      if (isPassed) {
        treeCreditsPassed += course.credits;
        totalCreditsPassed += course.credits;
      } else if (isInProgress) {
        treeCreditsInProgress += course.credits;
        totalCreditsInProgress += course.credits;
      }
    } else if (course.type === 'foundation') {
      foundationCreditsTotal += course.credits;
      if (isPassed) {
        foundationCreditsPassed += course.credits;
        totalCreditsPassed += course.credits;
      } else if (isInProgress) {
        foundationCreditsInProgress += course.credits;
        totalCreditsInProgress += course.credits;
      }
    } else if (course.type === 'general_core') {
      if (isPassed) {
        generalCoreCreditsPassed += course.credits;
        totalCreditsPassed += course.credits;
      } else if (isInProgress) {
        generalCoreCreditsInProgress += course.credits;
        totalCreditsInProgress += course.credits;
      }
    } else if (course.type === 'specialized') {
      if (isPassed) {
        specializedCoursesPassedCount += 1;
        specializedCreditsPassed += course.credits;
        totalCreditsPassed += course.credits;
      } else if (isInProgress) {
        specializedCoursesInProgressCount += 1;
        specializedCreditsInProgress += course.credits;
        totalCreditsInProgress += course.credits;
      }
    } else if (course.type === 'general_elective') {
      if (isPassed) {
        generalElectiveCreditsPassed += course.credits;
        totalCreditsPassed += course.credits;
      } else if (isInProgress) {
        generalElectiveCreditsInProgress += course.credits;
        totalCreditsInProgress += course.credits;
      }
    }
  });

  const treeProgressPercent =
    treeCreditsTotal > 0 ? Math.round((treeCreditsPassed / treeCreditsTotal) * 100) : 0;
  const treeProjectedPercent =
    treeCreditsTotal > 0
      ? Math.round(((treeCreditsPassed + treeCreditsInProgress) / treeCreditsTotal) * 100)
      : 0;

  const specializedRequirementMet =
    specializedCoursesPassedCount >= req.specializedElectiveMinCourses &&
    specializedCreditsPassed >= req.specializedElectiveMinCredits;

  const generalElectiveRequirementMet =
    generalElectiveCreditsPassed >= req.generalElectiveMinCredits;
  const generalCoreRequirementMet =
    generalCoreCreditsPassed >= (req.generalCoreMinCredits || 20);

  const overallGpa =
    totalGradedCredits > 0 ? Math.round((totalGradePoints / totalGradedCredits) * 100) / 100 : undefined;

  const isGraduationEligible =
    totalCreditsPassed >= req.totalCredits &&
    treeCreditsPassed >= treeCreditsTotal &&
    foundationCreditsPassed >= foundationCreditsTotal &&
    specializedRequirementMet &&
    generalElectiveRequirementMet &&
    generalCoreRequirementMet;

  return {
    totalCreditsPassed,
    totalCreditsInProgress,
    treeCreditsPassed,
    treeCreditsInProgress,
    treeCreditsTotal,
    treeProgressPercent,
    treeProjectedPercent,
    foundationCreditsPassed,
    foundationCreditsInProgress,
    foundationCreditsTotal,
    specializedCoursesPassedCount,
    specializedCoursesInProgressCount,
    specializedCreditsPassed,
    specializedCreditsInProgress,
    specializedRequirementMet,
    generalElectiveCreditsPassed,
    generalElectiveCreditsInProgress,
    generalElectiveRequirementMet,
    generalCoreCreditsPassed,
    generalCoreCreditsInProgress,
    generalCoreRequirementMet,
    overallGpa,
    isGraduationEligible,
  };
}

/**
 * Calculate Progress across all 17 Knowledge Clusters
 */
export function calculateClusterProgresses(
  statuses: Record<string, CourseStatus>,
  clusters: KnowledgeCluster[] = KNOWLEDGE_CLUSTERS
): ClusterProgress[] {
  return clusters.map((cluster) => {
    const totalCoursesCount = cluster.courseIds.length;
    let passedCoursesCount = 0;
    let inProgressCoursesCount = 0;
    const passedCourseIds: string[] = [];
    const missingCourseIds: string[] = [];

    cluster.courseIds.forEach((cId) => {
      const status = statuses[cId];
      if (status === 'PASSED') {
        passedCoursesCount += 1;
        passedCourseIds.push(cId);
      } else if (status === 'IN_PROGRESS') {
        inProgressCoursesCount += 1;
        missingCourseIds.push(cId);
      } else {
        missingCourseIds.push(cId);
      }
    });

    const percentage =
      totalCoursesCount > 0 ? Math.round((passedCoursesCount / totalCoursesCount) * 100) : 0;
    const projectedPercentage =
      totalCoursesCount > 0
        ? Math.round(((passedCoursesCount + inProgressCoursesCount) / totalCoursesCount) * 100)
        : 0;

    return {
      cluster,
      totalCoursesCount,
      passedCoursesCount,
      inProgressCoursesCount,
      passedCourseIds,
      missingCourseIds,
      percentage,
      projectedPercentage,
    };
  });
}

/**
 * Get Recommended Next Courses for a student based on their active target specialization tracks or highest-progress track
 */
export function getRecommendedCourses(
  statuses: Record<string, CourseStatus>,
  targetClusterIds?: string[] | string
): { course: Course; reasonFa: string; reasonEn: string; clusterTitleFa: string }[] {
  const clusterProgresses = calculateClusterProgresses(statuses);

  // Normalize targetClusterIds to string array
  const targetIds: string[] = Array.isArray(targetClusterIds)
    ? targetClusterIds
    : targetClusterIds
    ? [targetClusterIds]
    : [];

  const targetClusters = KNOWLEDGE_CLUSTERS.filter((c) => targetIds.includes(c.id));

  // Items to recommend
  const candidates: {
    course: Course;
    reasonFa: string;
    reasonEn: string;
    clusterTitleFa: string;
    score: number;
  }[] = [];

  if (targetClusters.length > 0) {
    // Mode A: User has selected specific Target Tracks
    COURSES.forEach((course) => {
      // Must not be passed
      if (statuses[course.id] === 'PASSED') return;

      // Check prerequisites
      const warnings = validateCourseRules(course, statuses);
      const prereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');
      if (prereqMissing) return;

      // Check which target clusters contain this course
      const matchingClusters = targetClusters.filter((tc) => tc.courseIds.includes(course.id));
      if (matchingClusters.length > 0) {
        const overlapCount = matchingClusters.length;
        
        let reasonFa = '';
        let reasonEn = '';
        let clusterTitleFa = matchingClusters[0].titleFa;

        if (overlapCount > 1) {
          const clusterNamesFa = matchingClusters.map((c) => `«${c.titleFa}»`).join(' و ');
          const clusterNamesEn = matchingClusters.map((c) => `"${c.titleEn}"`).join(' & ');
          reasonFa = `⭐ همپوشانی بین ${overlapCount} گرایش (${clusterNamesFa})\nپیش‌نیازها تکمیل شده.`;
          reasonEn = `⭐ Overlap across ${overlapCount} tracks (${clusterNamesEn})\nPrerequisites met.`;
        } else {
          reasonFa = `درس کلیدی گرایش هدف «${matchingClusters[0].titleFa}»\nپیش‌نیازها تکمیل شده.`;
          reasonEn = `Key course for target track "${matchingClusters[0].titleEn}"\nPrerequisites met.`;
        }

        // Score formulation: Overlap count gets highest weight, then tree core priority
        const score = overlapCount * 1000 + (course.type === 'tree' ? 100 : 0) + (10 - (course.term || 5));

        candidates.push({
          course,
          reasonFa,
          reasonEn,
          clusterTitleFa,
          score,
        });
      }
    });

    // Sort candidates by score descending
    candidates.sort((a, b) => b.score - a.score);

    // If fewer than 6, add unlocked core tree courses
    if (candidates.length < 6) {
      COURSES.filter((c) => c.type === 'tree' && statuses[c.id] === 'NOT_TAKEN').forEach((c) => {
        if (candidates.some((item) => item.course.id === c.id)) return;
        const warnings = validateCourseRules(c, statuses);
        if (!warnings.some((w) => w.type === 'prerequisite_missing')) {
          candidates.push({
            course: c,
            clusterTitleFa: 'دروس عمومی و پایه',
            reasonFa: `درس پایه ترم ${c.term || 'آزاد'} نمودار درختی\nپیش‌نیازها تکمیل شده.`,
            reasonEn: `Core tree course for term ${c.term || 'any'}\nPrerequisites met.`,
            score: 10,
          });
        }
      });
    }
  } else {
    // Mode B: No target tracks selected yet - Pick top incomplete clusters by progress
    let focusClusters = clusterProgresses
      .filter((cp) => cp.percentage < 100)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    if (focusClusters.length === 0 && clusterProgresses.length > 0) {
      focusClusters = [clusterProgresses[0]];
    }

    focusClusters.forEach((focusCluster) => {
      focusCluster.missingCourseIds.forEach((courseId) => {
        const course = getCourseById(courseId);
        if (!course || statuses[course.id] === 'PASSED') return;
        if (candidates.some((item) => item.course.id === course.id)) return;

        const warnings = validateCourseRules(course, statuses);
        const prereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');

        if (!prereqMissing) {
          candidates.push({
            course,
            clusterTitleFa: focusCluster.cluster.titleFa,
            reasonFa: `تکمیل‌کننده گرایش تخصصی «${focusCluster.cluster.titleFa}»\nپیش‌نیازها تکمیل شده.`,
            reasonEn: `Completes the "${focusCluster.cluster.titleEn}" track\nPrerequisites met.`,
            score: focusCluster.percentage,
          });
        }
      });
    });

    // Also append core tree courses
    COURSES.filter((c) => c.type === 'tree' && statuses[c.id] === 'NOT_TAKEN').forEach((c) => {
      if (candidates.some((item) => item.course.id === c.id)) return;
      const warnings = validateCourseRules(c, statuses);
      if (!warnings.some((w) => w.type === 'prerequisite_missing')) {
        candidates.push({
          course: c,
          clusterTitleFa: 'دروس عمومی و پایه',
          reasonFa: `درس پایه ترم ${c.term || 'آزاد'} نمودار درختی که پیش‌نیازهایش آماده است.`,
          reasonEn: `Core tree course for term ${c.term || 'any'} with satisfied prerequisites.`,
          score: 5,
        });
      }
    });
  }

  return candidates.slice(0, 6).map(({ course, reasonFa, reasonEn, clusterTitleFa }) => ({
    course,
    reasonFa,
    reasonEn,
    clusterTitleFa,
  }));
}

import React, { useEffect, useState } from 'react';
import { Github, Mail, Send } from 'lucide-react';
import { AboutView } from './components/AboutView';
import { AcademicRulesView } from './components/AcademicRulesView';
import { ChecklistView } from './components/ChecklistView';
import { ClusterTracker } from './components/ClusterTracker';
import { CourseModal } from './components/CourseModal';
import { FlowchartView } from './components/FlowchartView';
import { AppTab, Header } from './components/Header';
import { PrerequisiteWarnings } from './components/PrerequisiteWarnings';
import { ProgressSummary } from './components/ProgressSummary';
import { TranscriptView } from './components/TranscriptView';
import { COURSES } from './data/curriculumData';
import {
  calculateGraduationStats,
  getInitialProgress,
  loadSavedProgress,
  saveProgress,
  validateCourseRules,
} from './lib/curriculumEngine';
import { Course, CourseStatus, StudentProgress } from './types';

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(() => loadSavedProgress());
  const [lang, setLang] = useState<'fa' | 'en' | 'dual'>('fa');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ce_curriculum_darkmode_v1');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeTab, setActiveTab] = useState<AppTab>('flowchart');
  const [selectedModalCourse, setSelectedModalCourse] = useState<Course | null>(null);
  const [showWarningsModal, setShowWarningsModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  // Auto-save progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Dark mode HTML class sync
  useEffect(() => {
    localStorage.setItem('ce_curriculum_darkmode_v1', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // RTL/LTR sync based on language choice
  useEffect(() => {
    if (lang === 'en') {
      document.documentElement.dir = 'ltr';
    } else {
      document.documentElement.dir = 'rtl';
    }
  }, [lang]);

  // Calculate graduation statistics
  const stats = calculateGraduationStats(progress.courseStatuses, progress.courseGrades);

  // Calculate warning counts
  let warningCount = 0; // Total violations count for header badge
  let unignoredWarningCount = 0; // Violations count excluding ignored ones for floating button
  const ignoredSet = new Set(progress.ignoredWarningCourseIds || []);

  COURSES.forEach((course) => {
    const st = progress.courseStatuses[course.id] || 'NOT_TAKEN';
    if (st === 'PASSED' || st === 'IN_PROGRESS') {
      const warnings = validateCourseRules(course, progress.courseStatuses);
      if (warnings.length > 0) {
        warningCount += warnings.length;
        if (!ignoredSet.has(course.id)) {
          unignoredWarningCount += warnings.length;
        }
      }
    }
  });

  const handleToggleIgnoreWarning = (courseId: string) => {
    setProgress((prev) => {
      const current = prev.ignoredWarningCourseIds || [];
      const updated = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      return { ...prev, ignoredWarningCourseIds: updated };
    });
  };

  const handlePassPrerequisitesForCourse = (courseId: string) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;
    const warnings = validateCourseRules(course, progress.courseStatuses);
    const missingIds = new Set<string>();
    warnings.forEach((w) => {
      w.missingPrereqs.forEach((id) => missingIds.add(id));
      w.missingCoreqs.forEach((id) => missingIds.add(id));
    });

    if (missingIds.size === 0) return;

    setProgress((prev) => {
      const newStatuses = { ...prev.courseStatuses };
      missingIds.forEach((id) => {
        newStatuses[id] = 'PASSED';
      });
      return { ...prev, courseStatuses: newStatuses };
    });
  };

  const handlePassAllPrerequisites = () => {
    const missingIds = new Set<string>();
    COURSES.forEach((course) => {
      const st = progress.courseStatuses[course.id] || 'NOT_TAKEN';
      if (st === 'PASSED' || st === 'IN_PROGRESS') {
        const warnings = validateCourseRules(course, progress.courseStatuses);
        warnings.forEach((w) => {
          w.missingPrereqs.forEach((id) => missingIds.add(id));
          w.missingCoreqs.forEach((id) => missingIds.add(id));
        });
      }
    });

    if (missingIds.size === 0) return;

    setProgress((prev) => {
      const newStatuses = { ...prev.courseStatuses };
      missingIds.forEach((id) => {
        newStatuses[id] = 'PASSED';
      });
      return { ...prev, courseStatuses: newStatuses };
    });
  };

  const handleIgnoreAllWarnings = () => {
    const violatedCourseIds: string[] = [];
    COURSES.forEach((course) => {
      const st = progress.courseStatuses[course.id] || 'NOT_TAKEN';
      if (st === 'PASSED' || st === 'IN_PROGRESS') {
        const warnings = validateCourseRules(course, progress.courseStatuses);
        if (warnings.length > 0) {
          violatedCourseIds.push(course.id);
        }
      }
    });

    setProgress((prev) => ({
      ...prev,
      ignoredWarningCourseIds: Array.from(new Set([...(prev.ignoredWarningCourseIds || []), ...violatedCourseIds])),
    }));
  };

  const handleUpdateStatus = (courseId: string, status: CourseStatus) => {
    setProgress((prev) => {
      const newStatuses = {
        ...prev.courseStatuses,
        [courseId]: status,
      };

      // Auto-assign course to a term in flowchart if status changes to taken/in-progress and has no term set
      let newOverrides = prev.courseTermOverrides;
      const course = COURSES.find((c) => c.id === courseId);
      if (course && (status === 'PASSED' || status === 'IN_PROGRESS' || status === 'FAILED')) {
        const currentOverride = prev.courseTermOverrides?.[courseId];
        if (currentOverride === undefined) {
          const autoTerm = course.term || (course.type === 'specialized' ? 5 : course.type === 'foundation' ? 2 : 7);
          newOverrides = {
            ...(prev.courseTermOverrides || {}),
            [courseId]: autoTerm,
          };
        }
      }

      return {
        ...prev,
        courseStatuses: newStatuses,
        ...(newOverrides !== prev.courseTermOverrides ? { courseTermOverrides: newOverrides } : {}),
      };
    });
  };

  const handleUpdateGrade = (courseId: string, grade: number | undefined) => {
    setProgress((prev) => {
      const newGrades = { ...(prev.courseGrades || {}) };
      if (grade === undefined) {
        delete newGrades[courseId];
      } else {
        newGrades[courseId] = grade;
      }
      return {
        ...prev,
        courseGrades: newGrades,
      };
    });
  };

  const handleUpdateTermOverride = (courseId: string, termNum: number) => {
    setProgress((prev) => ({
      ...prev,
      courseTermOverrides: {
        ...(prev.courseTermOverrides || {}),
        [courseId]: termNum,
      },
    }));
  };

  const handleToggleBookmark = (courseId: string) => {
    setProgress((prev) => {
      const current = prev.bookmarkedCourseIds || [];
      const exists = current.includes(courseId);
      const updated = exists ? current.filter((id) => id !== courseId) : [...current, courseId];
      return {
        ...prev,
        bookmarkedCourseIds: updated,
      };
    });
  };

  const handleUpdateTargetCluster = (clusterId: string) => {
    setProgress((prev) => ({
      ...prev,
      targetClusterId: clusterId,
      targetClusterIds: [clusterId],
    }));
  };

  const handleToggleTargetCluster = (clusterId: string) => {
    setProgress((prev) => {
      const current = prev.targetClusterIds || (prev.targetClusterId ? [prev.targetClusterId] : []);
      const exists = current.includes(clusterId);
      const updated = exists ? current.filter((id) => id !== clusterId) : [...current, clusterId];
      return {
        ...prev,
        targetClusterId: updated[0] || '',
        targetClusterIds: updated,
      };
    });
  };

  const handleConfirmReset = () => {
    const initial = getInitialProgress();
    setProgress(initial);
    saveProgress(initial);
    setShowResetConfirmModal(false);
  };


  return (
    <div className="min-h-screen bg-[var(--bg-light-body)] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Top Header */}
      <Header
        progress={progress}
        onUpdateProgress={setProgress}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={() => setShowResetConfirmModal(true)}
        warningCount={warningCount}
        onOpenWarnings={() => setShowWarningsModal(true)}
      />

      {/* Graduation Stats & Requirement Indicators (Shown only on Chart / Flowchart Tab) */}
      {activeTab === 'flowchart' && (
        <ProgressSummary
          stats={stats}
          progress={progress}
          onUpdateTargetCluster={handleUpdateTargetCluster}
          lang={lang}
        />
      )}

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'flowchart' && (
          <FlowchartView
            progress={progress}
            onUpdateStatus={handleUpdateStatus}
            onUpdateGrade={handleUpdateGrade}
            onUpdateTermOverride={handleUpdateTermOverride}
            onToggleBookmark={handleToggleBookmark}
            onOpenCourseModal={setSelectedModalCourse}
            lang={lang}
          />
        )}

        {activeTab === 'checklist' && (
          <ChecklistView
            progress={progress}
            onUpdateStatus={handleUpdateStatus}
            onUpdateGrade={handleUpdateGrade}
            onToggleBookmark={handleToggleBookmark}
            onOpenCourseModal={setSelectedModalCourse}
            lang={lang}
          />
        )}

        {activeTab === 'transcript' && (
          <TranscriptView
            progress={progress}
            onUpdateStatus={handleUpdateStatus}
            onUpdateGrade={handleUpdateGrade}
            onUpdateTermOverride={handleUpdateTermOverride}
            lang={lang}
          />
        )}

        {activeTab === 'clusters' && (
          <ClusterTracker
            progress={progress}
            onUpdateStatus={handleUpdateStatus}
            onToggleTargetCluster={handleToggleTargetCluster}
            onToggleBookmark={handleToggleBookmark}
            onOpenCourseModal={setSelectedModalCourse}
            lang={lang}
          />
        )}

        {activeTab === 'rules' && (
          <AcademicRulesView lang={lang} />
        )}

        {activeTab === 'about' && (
          <AboutView lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium">
            {lang === 'en'
              ? 'Computer Engineering B.Sc. Curriculum Tracker & Specialization Planner'
              : 'سامانه برنامه‌ریزی دروس و گرایش‌های کارشناسی مهندسی کامپیوتر'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <a
              href="https://t.me/arumakan0"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram: @arumakan0"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:ar1umak1an@gmail.com"
              title="Email: ar1umak1an@gmail.com"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/arumakanGIT"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub: arumakanGIT"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CourseModal
        course={selectedModalCourse}
        onClose={() => setSelectedModalCourse(null)}
        progress={progress}
        onUpdateStatus={handleUpdateStatus}
        onUpdateGrade={handleUpdateGrade}
        onUpdateTermOverride={handleUpdateTermOverride}
        onToggleBookmark={handleToggleBookmark}
        lang={lang}
      />

      {showWarningsModal && (
        <PrerequisiteWarnings
          progress={progress}
          onClose={() => setShowWarningsModal(false)}
          onOpenCourseModal={setSelectedModalCourse}
          onToggleIgnoreWarning={handleToggleIgnoreWarning}
          onPassPrerequisitesForCourse={handlePassPrerequisitesForCourse}
          onPassAllPrerequisites={handlePassAllPrerequisites}
          onIgnoreAllWarnings={handleIgnoreAllWarnings}
          lang={lang}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'en' ? 'Reset All Progress?' : 'بازنشانی کامل اطلاعات پیشرفت درسی'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Are you sure you want to reset all courses, grades, and custom semester overrides? This action cannot be undone.'
                : 'آیا از بازنشانی کامل اطلاعات پیشرفت درسی مطمئن هستید؟ با این کار تمام وضعیت‌های گذرانده شده و نمرات ثبت‌شده به حالت اولیه بازمی‌گردند.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                {lang === 'en' ? 'Cancel' : 'انصراف'}
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition"
              >
                {lang === 'en' ? 'Yes, Reset' : 'بله، بازنشانی شود'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Prerequisite Warning Floating Button */}
      {unignoredWarningCount > 0 && !showWarningsModal && (
        <button
          onClick={() => setShowWarningsModal(true)}
          className="fixed bottom-6 left-6 z-40 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs transition animate-bounce border border-amber-300 cursor-pointer"
        >
          <span>⚠️</span>
          <span>{lang === 'en' ? `${unignoredWarningCount} Prerequisite Alert(s)` : `${unignoredWarningCount} هشدار پیش‌نیاز`}</span>
        </button>
      )}

    </div>
  );
}

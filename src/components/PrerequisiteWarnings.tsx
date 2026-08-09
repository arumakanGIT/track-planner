import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { COURSES } from '../data/curriculumData';
import { Course, CourseStatus, StudentProgress } from '../types';
import { getCourseById, validateCourseRules } from '../lib/curriculumEngine';

interface PrerequisiteWarningsProps {
  progress: StudentProgress;
  onClose: () => void;
  onOpenCourseModal: (course: Course) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const PrerequisiteWarnings: React.FC<PrerequisiteWarningsProps> = ({
  progress,
  onClose,
  onOpenCourseModal,
  lang,
}) => {
  // Find all active/passed courses with violations
  const violations: { course: Course; messagesFa: string[]; messagesEn: string[] }[] = [];

  COURSES.forEach((course) => {
    const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';
    if (status === 'PASSED' || status === 'IN_PROGRESS') {
      const warnings = validateCourseRules(course, progress.courseStatuses);
      if (warnings.length > 0) {
        violations.push({
          course,
          messagesFa: warnings.map((w) => w.messageFa),
          messagesEn: warnings.map((w) => w.messageEn),
        });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 font-bold" />
            <h2 className="text-sm font-bold">
              {lang === 'en' ? 'Prerequisite Violation Alerts' : 'هشدار عدم رعایت پیش‌نیازها'}
            </h2>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Violations */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {violations.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              🎉 {lang === 'en' ? 'All prerequisites for taken courses are fully satisfied!' : 'تمام پیش‌نیازهای دروس اخذ شده به‌طور کامل رعایت شده‌اند!'}
            </div>
          ) : (
            violations.map(({ course, messagesFa, messagesEn }) => (
              <div
                key={course.id}
                onClick={() => {
                  onClose();
                  onOpenCourseModal(course);
                }}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 hover:border-amber-400 cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span>{lang === 'en' ? course.titleEn : course.titleFa} ({course.id})</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900">
                    {progress.courseStatuses[course.id] === 'PASSED'
                      ? (lang === 'en' ? 'Passed' : 'پاس شده')
                      : (lang === 'en' ? 'Enrolled' : 'در حال اخذ')}
                  </span>
                </div>

                {messagesFa.map((msg, i) => (
                  <p key={i} className="text-[11px] text-amber-700 dark:text-amber-400">
                    • {lang === 'en' ? messagesEn[i] : msg}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            {lang === 'en' ? 'Understood' : 'متوجه شدم'}
          </button>
        </div>

      </div>
    </div>
  );
};

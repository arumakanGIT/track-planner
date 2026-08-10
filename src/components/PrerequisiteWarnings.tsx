import React from 'react';
import { AlertTriangle, CheckCircle2, EyeOff, Eye, Sparkles, X } from 'lucide-react';
import { COURSES } from '../data/curriculumData';
import { Course, StudentProgress } from '../types';
import { validateCourseRules } from '../lib/curriculumEngine';

interface PrerequisiteWarningsProps {
  progress: StudentProgress;
  onClose: () => void;
  onOpenCourseModal: (course: Course) => void;
  onToggleIgnoreWarning: (courseId: string) => void;
  onPassPrerequisitesForCourse: (courseId: string) => void;
  onPassAllPrerequisites: () => void;
  onIgnoreAllWarnings: () => void;
  lang: 'fa' | 'en' | 'dual';
}

export const PrerequisiteWarnings: React.FC<PrerequisiteWarningsProps> = ({
  progress,
  onClose,
  onOpenCourseModal,
  onToggleIgnoreWarning,
  onPassPrerequisitesForCourse,
  onPassAllPrerequisites,
  onIgnoreAllWarnings,
  lang,
}) => {
  const ignoredSet = new Set(progress.ignoredWarningCourseIds || []);

  // Find all active/passed courses with violations
  const violations: { course: Course; messagesFa: string[]; messagesEn: string[]; isIgnored: boolean }[] = [];

  COURSES.forEach((course) => {
    const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';
    if (status === 'PASSED' || status === 'IN_PROGRESS') {
      const warnings = validateCourseRules(course, progress.courseStatuses);
      if (warnings.length > 0) {
        violations.push({
          course,
          messagesFa: warnings.map((w) => w.messageFa),
          messagesEn: warnings.map((w) => w.messageEn),
          isIgnored: ignoredSet.has(course.id),
        });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 bg-amber-500 text-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 font-bold shrink-0" />
            <div>
              <h2 className="text-sm font-bold">
                {lang === 'en' ? 'Prerequisite Violation Alerts' : 'هشدار عدم رعایت پیش‌نیازها'}
              </h2>
              <p className="text-[11px] text-amber-950 font-medium">
                {lang === 'en'
                  ? `${violations.length} course(s) have unfulfilled prerequisites`
                  : `${violations.length} درس دارای پیش‌نیاز ناپاس شده هستند`}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar / Bulk Actions */}
        {violations.length > 0 && (
          <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            <button
              onClick={onPassAllPrerequisites}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Pass All Missing Prerequisites' : 'پاس‌کردن تمام پیش‌نیازهای ناقص'}</span>
            </button>

            <button
              onClick={onIgnoreAllWarnings}
              className="px-3 py-1.5 bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-900 rounded-xl font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <EyeOff className="w-4 h-4" />
              <span>{lang === 'en' ? 'Ignore All in Floating Alert' : 'ایگنور کردن همه (بنر شناور)'}</span>
            </button>
          </div>
        )}

        {/* List of Violations */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {violations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs space-y-2">
              <div className="text-3xl">🎉</div>
              <p className="font-bold text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'All prerequisites for taken courses are fully satisfied!' : 'تمام پیش‌نیازهای دروس اخذ شده به‌طور کامل رعایت شده‌اند!'}
              </p>
            </div>
          ) : (
            violations.map(({ course, messagesFa, messagesEn, isIgnored }) => (
              <div
                key={course.id}
                className={`p-3.5 rounded-2xl border transition space-y-2.5 ${
                  isIgnored
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-80'
                    : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCourseModal(course);
                      }}
                      className="font-bold text-xs text-amber-950 dark:text-amber-200 hover:underline text-right"
                    >
                      {lang === 'en' ? course.titleEn : course.titleFa} ({course.id})
                    </button>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 font-bold">
                        {progress.courseStatuses[course.id] === 'PASSED'
                          ? (lang === 'en' ? 'Passed' : 'پاس شده')
                          : (lang === 'en' ? 'Enrolled' : 'در حال اخذ')}
                      </span>
                      {isIgnored && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>{lang === 'en' ? 'Ignored in floating alert' : 'ایگنور شده در هشدار شناور'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                  {messagesFa.map((msg, i) => (
                    <p key={i} className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      • {lang === 'en' ? messagesEn[i] : msg}
                    </p>
                  ))}
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onToggleIgnoreWarning(course.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isIgnored
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 hover:bg-amber-200'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isIgnored ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>
                      {isIgnored
                        ? (lang === 'en' ? 'Unignore Warning' : 'لغو ایگنور')
                        : (lang === 'en' ? 'Ignore Warning' : 'ایگنور کردن')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPassPrerequisitesForCourse(course.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Pass Prerequisites' : 'پاس‌کردن پیش‌نیازها'}</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'بستن'}
          </button>
        </div>

      </div>
    </div>
  );
};

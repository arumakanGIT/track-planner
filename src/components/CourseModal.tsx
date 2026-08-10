import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  CheckCircle,
  Clock,
  Info,
  Layers,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { KNOWLEDGE_CLUSTERS } from '../data/curriculumData';
import { Course, CourseStatus, StudentProgress } from '../types';
import { getAssignedTerm, getCourseById, validateCourseRules } from '../lib/curriculumEngine';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  progress: StudentProgress;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onUpdateGrade: (courseId: string, grade: number | undefined) => void;
  onUpdateTermOverride?: (courseId: string, termNum: number) => void;
  onToggleBookmark?: (courseId: string) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const CourseModal: React.FC<CourseModalProps> = ({
  course,
  onClose,
  progress,
  onUpdateStatus,
  onUpdateGrade,
  onUpdateTermOverride,
  onToggleBookmark,
  lang,
}) => {
  if (!course) return null;

  const currentStatus = progress.courseStatuses[course.id] || 'NOT_TAKEN';
  const currentGrade = progress.courseGrades?.[course.id];
  const isBookmarked = (progress.bookmarkedCourseIds || []).includes(course.id);
  const warnings = validateCourseRules(course, progress.courseStatuses);

  // Clusters this course belongs to
  const courseClusters = KNOWLEDGE_CLUSTERS.filter((cl) =>
    cl.courseIds.includes(course.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/30">
                {course.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                {course.credits} {lang === 'en' ? 'Credits' : 'واحد درسی'}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-1.5">{course.titleFa}</h2>
            <p className="text-xs text-indigo-200 font-sans">{course.titleEn}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(course.id)}
                className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold ${
                  isBookmarked
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
                title={isBookmarked ? (lang === 'en' ? 'Unmark course' : 'حذف از نشان‌شده‌ها') : (lang === 'en' ? 'Bookmark course' : 'نشان‌کردن درس')}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-slate-950' : ''}`} />
                <span>{isBookmarked ? (lang === 'en' ? 'Marked' : 'نشان‌شده') : (lang === 'en' ? 'Mark' : 'نشان‌کردن')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Status & Grade Quick Edit */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Course Progress Status:' : 'وضعیت گذراندن درس:'}
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <button
                    onClick={() => onUpdateStatus(course.id, 'NOT_TAKEN')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'NOT_TAKEN'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'en' ? 'Not Taken' : 'اخذ نشده'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(course.id, 'IN_PROGRESS')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'IN_PROGRESS'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'en' ? 'In Progress' : 'در حال اخذ'}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(course.id, 'PASSED')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'PASSED'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lang === 'en' ? 'Passed' : 'پاس شد'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Grade (0-20):' : 'نمره:'}
                </span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.25}
                  value={currentGrade !== undefined ? currentGrade : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    onUpdateGrade(course.id, val);
                  }}
                  placeholder="--"
                  className="w-16 text-center py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {onUpdateTermOverride && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Assigned Semester:' : 'ترم برنامه‌ریزی‌شده:'}
                </span>
                <select
                  value={getAssignedTerm(course, progress) || 0}
                  onChange={(e) => onUpdateTermOverride(course.id, parseInt(e.target.value, 10))}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, idx) => idx + 1).map((t) => (
                    <option key={t} value={t}>
                      {lang === 'en' ? `Semester ${t}` : `ترم ${t}`}
                    </option>
                  ))}
                  <option value={0}>{lang === 'en' ? 'Unassigned' : 'بدون ترم'}</option>
                </select>
              </div>
            )}
          </div>

          {/* Prerequisite Warnings */}
          {warnings.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{lang === 'en' ? 'Rule Alert' : 'هشدار پیش‌نیاز/همنیاز'}</span>
              </div>
              {warnings.map((w, idx) => (
                <p key={idx}>• {lang === 'en' ? w.messageEn : w.messageFa}</p>
              ))}
            </div>
          )}

          {/* Prerequisites */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {lang === 'en' ? 'Prerequisites (پیشنیاز):' : 'پیش‌نیازها:'}
            </h3>
            {course.prerequisites.length === 0 ? (
              <p className="text-xs text-slate-400">{lang === 'en' ? 'None' : 'ندارد'}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {course.prerequisites.map((pId) => {
                  const pCourse = getCourseById(pId);
                  const isPassed = progress.courseStatuses[pId] === 'PASSED';
                  return (
                    <div
                      key={pId}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 border ${
                        isPassed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{lang === 'en' ? (pCourse?.titleEn || pCourse?.titleFa || pId) : (pCourse?.titleFa || pId)}</span>
                      <span className="font-mono text-[10px] opacity-75">({pId})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Corequisites */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {lang === 'en' ? 'Corequisites:' : 'همنیازها:'}
            </h3>
            {course.corequisites.length === 0 ? (
              <p className="text-xs text-slate-400">{lang === 'en' ? 'None' : 'ندارد'}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {course.corequisites.map((cId) => {
                  const cCourse = getCourseById(cId);
                  const isMet =
                    progress.courseStatuses[cId] === 'PASSED' ||
                    progress.courseStatuses[cId] === 'IN_PROGRESS';
                  return (
                    <div
                      key={cId}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 border ${
                        isMet
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? (cCourse?.titleEn || cCourse?.titleFa || cId) : (cCourse?.titleFa || cId)}</span>
                      <span className="font-mono text-[10px] opacity-75">({cId})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Knowledge Clusters */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {lang === 'en' ? 'Associated Specialization Tracks:' : 'گرایش‌های تخصصی مرتبط:'}
            </h3>
            {courseClusters.length === 0 ? (
              <p className="text-xs text-slate-400">{lang === 'en' ? 'General / Foundational course' : 'درس عمومی / عمومی پایه'}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {courseClusters.map((cl) => (
                  <span
                    key={cl.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                  >
                    {lang === 'en' ? cl.titleEn : cl.titleFa}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Equivalencies */}
          {course.notesFa && (
            <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Equivalency & Rules Note:' : 'توضیحات تطبیق و مقررات:'}</span>
              </div>
              <p>• {lang === 'en' ? course.notesEn : course.notesFa}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            {lang === 'en' ? 'Close' : 'بستن'}
          </button>
        </div>

      </div>
    </div>
  );
};

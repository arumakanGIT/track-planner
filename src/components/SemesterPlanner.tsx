import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { COURSES } from '../data/curriculumData';
import { Course, CourseStatus, CourseType, StudentProgress } from '../types';
import {
  getCourseById,
  validateCourseRules,
} from '../lib/curriculumEngine';

interface SemesterPlannerProps {
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onOpenCourseModal: (course: Course) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const SemesterPlanner: React.FC<SemesterPlannerProps> = ({
  progress,
  onUpdateProgress,
  onOpenCourseModal,
  lang,
}) => {
  const [selectedTermIndex, setSelectedTermIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const plannedSemesters = progress.plannedSemesters || [];
  const currentPlan = plannedSemesters[selectedTermIndex] || {
    id: 'sem_1',
    termNumber: 1,
    titleFa: 'ترم ۱',
    titleEn: 'Term 1',
    courseIds: [],
  };

  const planCredits = currentPlan.courseIds.reduce(
    (sum, id) => sum + (getCourseById(id)?.credits || 0),
    0
  );

  const handleAddCourseToPlan = (courseId: string) => {
    if (!courseId) return;
    if (currentPlan.courseIds.includes(courseId)) return;

    const updatedPlan = {
      ...currentPlan,
      courseIds: [...currentPlan.courseIds, courseId],
    };

    const updatedSemesters = [...plannedSemesters];
    updatedSemesters[selectedTermIndex] = updatedPlan;

    onUpdateProgress({
      ...progress,
      plannedSemesters: updatedSemesters,
    });
  };

  const handleRemoveCourseFromPlan = (courseId: string) => {
    const updatedPlan = {
      ...currentPlan,
      courseIds: currentPlan.courseIds.filter((id) => id !== courseId),
    };

    const updatedSemesters = [...plannedSemesters];
    updatedSemesters[selectedTermIndex] = updatedPlan;

    onUpdateProgress({
      ...progress,
      plannedSemesters: updatedSemesters,
    });
  };

  const handleCreateNewSemester = () => {
    const nextNum = plannedSemesters.length + 1;
    const newSem = {
      id: `sem_${Date.now()}`,
      termNumber: nextNum,
      titleFa: `ترم ${nextNum}`,
      titleEn: `Term ${nextNum}`,
      courseIds: [],
    };

    onUpdateProgress({
      ...progress,
      plannedSemesters: [...plannedSemesters, newSem],
    });
    setSelectedTermIndex(plannedSemesters.length);
  };

  const handleEnrollSemester = (statusToSet: 'IN_PROGRESS' | 'PASSED') => {
    const newStatuses = { ...progress.courseStatuses };
    currentPlan.courseIds.forEach((cId) => {
      newStatuses[cId] = statusToSet;
    });

    onUpdateProgress({
      ...progress,
      courseStatuses: newStatuses,
    });
  };

  // Filter available courses across ALL categories (Tree, Specialized, General, Foundation)
  const availableCourses = useMemo(() => {
    return COURSES.filter((c) => {
      // Exclude courses already in this term
      if (currentPlan.courseIds.includes(c.id)) return false;

      // Filter by type
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;

      // Filter by search query (Title Fa, Title En, or Course Code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitleFa = c.titleFa.toLowerCase().includes(q);
        const matchTitleEn = c.titleEn.toLowerCase().includes(q);
        const matchCode = c.id.toLowerCase().includes(q);
        return matchTitleFa || matchTitleEn || matchCode;
      }

      return true;
    });
  }, [currentPlan.courseIds, typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Interactive Semester Draft Planner' : 'برنامه‌ریز و چیدمان واحدهای ترم پیش‌رو'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en'
                ? 'Search and draft all course types (Core, Foundation, Specialized, General) with credit & prerequisite checks.'
                : 'امکان جستجو و چیدمان تمام دروس (اصلی، پایه، تخصصی و عمومی) با پایش سقف unit و پیش‌نیازها'}
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewSemester}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'en' ? 'Add New Draft Term' : 'ایجاد ترم جدید'}</span>
        </button>
      </div>

      {/* Semester Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {plannedSemesters.map((sem, idx) => {
          const semCredits = sem.courseIds.reduce((sum, id) => sum + (getCourseById(id)?.credits || 0), 0);
          return (
            <button
              key={sem.id}
              onClick={() => setSelectedTermIndex(idx)}
              className={`px-4 py-2 font-bold rounded-xl transition whitespace-nowrap flex items-center gap-2 border ${
                selectedTermIndex === idx
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                  : 'bg-indigo-50/70 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-indigo-200/80 dark:border-slate-800 hover:bg-indigo-100/80 dark:hover:bg-slate-800'
              }`}
            >
              <span>{lang === 'en' ? (sem.titleEn || `Term ${sem.termNumber}`) : sem.titleFa}</span>
              <span className="text-[10px] opacity-80 font-sans font-normal">
                ({semCredits} {lang === 'en' ? 'cr' : 'واحد'})
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Semester Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (7/12): Courses in Current Draft Term */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {lang === 'en' ? (currentPlan.titleEn || `Term ${currentPlan.termNumber}`) : currentPlan.titleFa}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentPlan.courseIds.length} {lang === 'en' ? 'courses drafted' : 'درس چیده شده'}
                </p>
              </div>

              {/* Credit Cap Counter */}
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-sans font-bold flex items-center gap-1.5 ${
                  planCredits > 20
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                }`}
              >
                <span>{lang === 'en' ? 'Credits:' : 'مجموع واحد:'} <span className="font-mono">{planCredits} / 20</span></span>
                {planCredits > 20 && (
                  <span title={lang === 'en' ? 'Credit limit exceeded (max 20)' : 'سقف مجاز واحد (۲۰ واحد) فراتر رفته است'}>
                    ⚠️
                  </span>
                )}
              </div>
            </div>

            {/* Draft Courses List */}
            {currentPlan.courseIds.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                <p>
                  {lang === 'en'
                    ? 'No courses added to this draft term yet. Search or select a course from the right panel.'
                    : 'هنوز درسی به این ترم اضافه نشده است. از پنل سمت راست درس‌های مورد نظر را جستجو و اضافه کنید.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentPlan.courseIds.map((cId) => {
                  const course = getCourseById(cId);
                  if (!course) return null;

                  const warnings = validateCourseRules(course, progress.courseStatuses);
                  const hasPrereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');
                  const currentStatus = progress.courseStatuses[cId] || 'NOT_TAKEN';

                  return (
                    <div
                      key={cId}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        currentStatus === 'PASSED'
                          ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                          : currentStatus === 'IN_PROGRESS'
                          ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-800'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {course.id}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {lang === 'en' ? course.titleEn : course.titleFa}
                          </span>
                          <span className="text-xs font-sans font-bold text-indigo-600 dark:text-indigo-400">
                            <span className="font-mono">{course.credits}</span> {lang === 'en' ? 'cr' : 'واحد'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {course.type === 'tree'
                              ? (lang === 'en' ? 'Core' : 'اصلی')
                              : course.type === 'foundation'
                              ? (lang === 'en' ? 'Foundation' : 'پایه')
                              : course.type === 'specialized'
                              ? (lang === 'en' ? 'Specialized' : 'تخصصی')
                              : (lang === 'en' ? 'General' : 'عمومی')}
                          </span>
                        </div>

                        {/* Missing Prerequisite Warnings */}
                        {hasPrereqMissing && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium pt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{lang === 'en' ? warnings[0].messageEn : warnings[0].messageFa}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpenCourseModal(course)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-600"
                        >
                          {lang === 'en' ? 'Details' : 'جزئیات'}
                        </button>
                        <button
                          onClick={() => handleRemoveCourseFromPlan(cId)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                          title={lang === 'en' ? 'Remove course' : 'حذف از ترم'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Batch Status Enrollment */}
            {currentPlan.courseIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleEnrollSemester('IN_PROGRESS')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Clock className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Enroll Terms (In Progress)' : 'ثبت به عنوان «در حال اخذ»'}</span>
                </button>

                <button
                  onClick={() => handleEnrollSemester('PASSED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Pass Terms (Completed)' : 'علامت‌گذاری به عنوان پاس شده'}</span>
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Col (5/12): Fast Master Course Search & Add Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {lang === 'en' ? 'Master Course Database Search' : 'جستجو و انتخاب درس از تمام بانک دروس'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Search by title or code across tree, foundation, specialized & general courses'
                  : 'جستجو بر اساس نام درس یا کد درس بین تمامی دروس پایه، اصلی، تخصصی و عمومی'}
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search by course name or code (e.g. 40153 or OS)...' : 'جستجوی کد درس یا عنوان (مثلاً ۴۰۱۵۳ یا هوش مصنوعی)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', labelFa: 'همه', labelEn: 'All' },
                { id: 'foundation', labelFa: 'دروس پایه', labelEn: 'Foundation' },
                { id: 'tree', labelFa: 'اصلی چارت', labelEn: 'Tree Core' },
                { id: 'specialized', labelFa: 'تخصصی', labelEn: 'Specialized' },
                { id: 'general_core', labelFa: 'عمومی', labelEn: 'General' },
                { id: 'general_elective', labelFa: 'اختیاری', labelEn: 'Electives' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                    typeFilter === f.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'en' ? f.labelEn : f.labelFa}
                </button>
              ))}
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>
                {lang === 'en' ? `${availableCourses.length} courses available` : `${availableCourses.length} درس یافت شد`}
              </span>
            </div>

            {/* Search Results List */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 text-xs">
              {availableCourses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {lang === 'en' ? 'No matching courses found.' : 'درسی با این مشخصات یافت نشد.'}
                </div>
              ) : (
                availableCourses.map((course) => {
                  const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';
                  return (
                    <div
                      key={course.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2 hover:border-indigo-300 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {course.id}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {lang === 'en' ? course.titleEn : course.titleFa}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{course.credits} {lang === 'en' ? 'Credits' : 'واحد'}</span>
                          <span>•</span>
                          <span>
                            {course.type === 'foundation'
                              ? (lang === 'en' ? 'Foundation' : 'پایه')
                              : course.type === 'tree'
                              ? (lang === 'en' ? `Core (Term ${course.term || 'Elective'})` : `اصلی (ترم ${course.term || 'آزاد'})`)
                              : course.type === 'specialized'
                              ? (lang === 'en' ? 'Specialized' : 'تخصصی')
                              : (lang === 'en' ? 'General/Elective' : 'عمومی/اختیاری')}
                          </span>
                          {status === 'PASSED' && (
                            <span className="text-emerald-600 font-bold">{lang === 'en' ? '✓ Passed' : '✓ پاس شده'}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddCourseToPlan(course.id)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Add' : 'افزودن'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

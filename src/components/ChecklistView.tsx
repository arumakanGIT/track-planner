import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  Filter,
  Info,
  Layers,
  Lock,
  Search,
  XCircle,
} from 'lucide-react';
import { COURSES } from '../data/curriculumData';
import { Course, CourseStatus, StudentProgress } from '../types';
import { getCourseById, validateCourseRules } from '../lib/curriculumEngine';

interface ChecklistViewProps {
  progress: StudentProgress;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onUpdateGrade: (courseId: string, grade: number | undefined) => void;
  onOpenCourseModal: (course: Course) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  progress,
  onUpdateStatus,
  onUpdateGrade,
  onOpenCourseModal,
  lang,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'tree' | 'specialized' | 'general_elective'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'IN_PROGRESS' | 'NOT_TAKEN' | 'UNLOCKED'>('ALL');

  const filteredCourses = COURSES.filter((course) => {
    // Category match
    if (activeCategory === 'tree' && course.type !== 'tree' && course.type !== 'general_core') return false;
    if (activeCategory === 'specialized' && course.type !== 'specialized') return false;
    if (activeCategory === 'general_elective' && course.type !== 'general_elective') return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = course.id.toLowerCase().includes(q);
      const matchFa = course.titleFa.toLowerCase().includes(q);
      const matchEn = course.titleEn.toLowerCase().includes(q);
      if (!matchId && !matchFa && !matchEn) return false;
    }

    // Status filter match
    const currentStatus = progress.courseStatuses[course.id] || 'NOT_TAKEN';
    if (statusFilter === 'PASSED' && currentStatus !== 'PASSED') return false;
    if (statusFilter === 'IN_PROGRESS' && currentStatus !== 'IN_PROGRESS') return false;
    if (statusFilter === 'NOT_TAKEN' && currentStatus !== 'NOT_TAKEN') return false;

    if (statusFilter === 'UNLOCKED') {
      if (currentStatus === 'PASSED') return false;
      const warnings = validateCourseRules(course, progress.courseStatuses);
      if (warnings.some((w) => w.type === 'prerequisite_missing')) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Category Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'en' ? 'All Courses' : 'همه دروس'}
            </button>
            <button
              onClick={() => setActiveCategory('tree')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeCategory === 'tree'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'en' ? 'Tree Core Courses' : 'دروس نمودار درختی (پایه/اصلی)'}
            </button>
            <button
              onClick={() => setActiveCategory('specialized')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeCategory === 'specialized'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'en' ? 'Specialized Electives' : 'دروس تخصصی'}
            </button>
            <button
              onClick={() => setActiveCategory('general_elective')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                activeCategory === 'general_elective'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {lang === 'en' ? 'General Electives' : 'دروس اختیاری'}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search title or code...' : 'جستجوی نام یا شماره درس...'}
              className="w-full pl-9 pr-9 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2 rtl:left-2.5 rtl:right-auto text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">
            {lang === 'en' ? 'Filter Status:' : 'وضعیت:'}
          </span>
          {(['ALL', 'PASSED', 'IN_PROGRESS', 'NOT_TAKEN', 'UNLOCKED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && (lang === 'en' ? 'All' : 'همه')}
              {st === 'PASSED' && (lang === 'en' ? 'Passed' : 'پاس شده')}
              {st === 'IN_PROGRESS' && (lang === 'en' ? 'In Progress' : 'در حال اخذ')}
              {st === 'NOT_TAKEN' && (lang === 'en' ? 'Not Taken' : 'اخذ نشده')}
              {st === 'UNLOCKED' && (lang === 'en' ? 'Unlocked & Ready' : 'قابل اخذ (پیش‌نیاز تکمیل)')}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-mono mr-auto">
            ({filteredCourses.length} {lang === 'en' ? 'courses' : 'درس'})
          </span>
        </div>

      </div>

      {/* Courses Checklist Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 font-mono text-center">{lang === 'en' ? 'Code / ID' : 'کد / ID'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Course Title' : 'عنوان درس'}</th>
                <th className="py-3 px-4 text-center">{lang === 'en' ? 'Credits' : 'واحد'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Category / Term' : 'نوع / ترم'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Prerequisites & Corequisites' : 'پیش‌نیازها و همنیازها'}</th>
                <th className="py-3 px-4 text-center">{lang === 'en' ? 'Status' : 'وضعیت'}</th>
                <th className="py-3 px-4 text-center">{lang === 'en' ? 'Grade (0-20)' : 'نمره'}</th>
                <th className="py-3 px-4 text-center">{lang === 'en' ? 'Details' : 'جزئیات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {lang === 'en' ? 'No courses match the criteria.' : 'هیچ درسی با مشخصات وارد شده یافت نشد.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';
                  const grade = progress.courseGrades?.[course.id];
                  const warnings = validateCourseRules(course, progress.courseStatuses);
                  const hasPrereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {course.id}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {lang === 'en' ? course.titleEn : course.titleFa}
                        </div>
                        {lang === 'fa' && (
                          <div className="text-[11px] text-slate-400 font-sans">
                            {course.titleEn}
                          </div>
                        )}
                        {course.notesFa && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                            ★ {lang === 'en' && course.notesEn ? course.notesEn : course.notesFa}
                          </div>
                        )}
                      </td>

                      {/* Credits */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {course.credits}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {course.type === 'tree' && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {lang === 'en' ? `Core - Semester ${course.term}` : `درختی - ترم ${course.term}`}
                          </span>
                        )}
                        {course.type === 'general_core' && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {lang === 'en' ? 'General Core' : 'عمومی / پایه'}
                          </span>
                        )}
                        {course.type === 'specialized' && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {lang === 'en' ? 'Specialized' : 'تخصصی'}
                          </span>
                        )}
                        {course.type === 'general_elective' && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {lang === 'en' ? 'General Elective' : 'اختیاری'}
                          </span>
                        )}
                      </td>

                      {/* Prerequisites & Corequisites */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          {course.prerequisites.length === 0 && course.corequisites.length === 0 && (
                            <span className="text-slate-400 text-[11px]">{lang === 'en' ? 'None' : 'ندارد'}</span>
                          )}

                          {course.prerequisites.map((pId) => {
                            const pCourse = getCourseById(pId);
                            const isPassed = progress.courseStatuses[pId] === 'PASSED';
                            const pTitle = lang === 'en' ? (pCourse?.titleEn || pId) : (pCourse?.titleFa || pId);
                            return (
                              <span
                                key={pId}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  isPassed
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                                title={`${lang === 'en' ? 'Prerequisite: ' : 'پیش‌نیاز: '}${pTitle}`}
                              >
                                {lang === 'en' ? 'Pre: ' : 'پیش: '}{pTitle}
                              </span>
                            );
                          })}

                          {course.corequisites.map((cId) => {
                            const cCourse = getCourseById(cId);
                            const isMet =
                              progress.courseStatuses[cId] === 'PASSED' ||
                              progress.courseStatuses[cId] === 'IN_PROGRESS';
                            const cTitle = lang === 'en' ? (cCourse?.titleEn || cId) : (cCourse?.titleFa || cId);
                            return (
                              <span
                                key={cId}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  isMet
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                                title={`${lang === 'en' ? 'Corequisite: ' : 'همنیاز: '}${cTitle}`}
                              >
                                {lang === 'en' ? 'Co: ' : 'هم: '}{cTitle}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Buttons */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex rounded-lg shadow-2xs bg-slate-100 dark:bg-slate-800 p-0.5">
                          <button
                            onClick={() => onUpdateStatus(course.id, 'NOT_TAKEN')}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                              status === 'NOT_TAKEN'
                                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {lang === 'en' ? 'Not Taken' : 'اخذ نشده'}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(course.id, 'IN_PROGRESS')}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                              status === 'IN_PROGRESS'
                                ? 'bg-amber-500 text-white shadow-xs font-bold'
                                : 'text-slate-500 hover:text-amber-600'
                            }`}
                          >
                            {lang === 'en' ? 'Taking' : 'در حال اخذ'}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(course.id, 'PASSED')}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                              status === 'PASSED'
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : 'text-slate-500 hover:text-emerald-600'
                            }`}
                          >
                            {lang === 'en' ? 'Passed' : 'پاس شد'}
                          </button>
                        </div>
                      </td>

                      {/* Grade Input */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          step={0.25}
                          value={grade !== undefined ? grade : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            onUpdateGrade(course.id, val);
                          }}
                          placeholder="--"
                          className="w-14 text-center py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold"
                        />
                      </td>

                      {/* Details Modal Trigger */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenCourseModal(course)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title={lang === 'en' ? 'View Details' : 'مشاهده جزئیات'}
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

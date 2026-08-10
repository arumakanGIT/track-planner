import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { COURSES } from '../data/curriculumData';
import { Course, CourseStatus, StudentProgress } from '../types';
import { getAssignedTerm } from '../lib/curriculumEngine';
import { exportElementAsPng } from '../lib/exportUtils';

interface TranscriptViewProps {
  progress: StudentProgress;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onUpdateGrade: (courseId: string, grade: number | undefined) => void;
  onUpdateTermOverride?: (courseId: string, termNum: number) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  progress,
  onUpdateStatus,
  onUpdateGrade,
  onUpdateTermOverride,
  lang,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine max term
  const overrideTerms = (Object.values(progress.courseTermOverrides || {}).filter(
    (t) => typeof t === 'number' && t > 0
  )) as number[];
  const maxTerm = Math.max(8, ...overrideTerms, 1);

  // Group courses by term
  const termsMap: Record<number, Course[]> = {};
  for (let t = 1; t <= maxTerm; t++) {
    termsMap[t] = COURSES.filter((c) => getAssignedTerm(c, progress) === t);
  }

  // Find courses that are taken, in-progress, failed, or graded but not assigned to any term
  const unassignedCourses = COURSES.filter((c) => {
    const term = getAssignedTerm(c, progress);
    if (term !== null) return false;
    const status = progress.courseStatuses[c.id];
    const grade = progress.courseGrades?.[c.id];
    return (status && status !== 'NOT_TAKEN') || (typeof grade === 'number' && grade >= 0);
  });

  // Calculate Cumulative overall stats
  let totalGradePoints = 0;
  let totalGradedCredits = 0;
  let totalPassedCredits = 0;
  let totalAttemptedCredits = 0;

  COURSES.forEach((c) => {
    const status = progress.courseStatuses[c.id];
    const grade = progress.courseGrades?.[c.id];

    if (status === 'PASSED' || (typeof grade === 'number' && grade >= 10)) {
      totalPassedCredits += c.credits;
    }
    if (status === 'PASSED' || status === 'FAILED' || status === 'IN_PROGRESS') {
      totalAttemptedCredits += c.credits;
    }
    if (typeof grade === 'number' && grade >= 0 && grade <= 20) {
      totalGradePoints += grade * c.credits;
      totalGradedCredits += c.credits;
    }
  });

  const cumulativeGpa =
    totalGradedCredits > 0 ? Math.round((totalGradePoints / totalGradedCredits) * 100) / 100 : undefined;

  // Calculate term-by-term stats
  const getTermStats = (termNum: number) => {
    const courses = termsMap[termNum] || [];
    let termGradePoints = 0;
    let termGradedCredits = 0;
    let termPassedCredits = 0;

    courses.forEach((c) => {
      const status = progress.courseStatuses[c.id];
      const grade = progress.courseGrades?.[c.id];

      if (status === 'PASSED' || (typeof grade === 'number' && grade >= 10)) {
        termPassedCredits += c.credits;
      }
      if (typeof grade === 'number' && grade >= 0 && grade <= 20) {
        termGradePoints += grade * c.credits;
        termGradedCredits += c.credits;
      }
    });

    const semesterGpa =
      termGradedCredits > 0 ? Math.round((termGradePoints / termGradedCredits) * 100) / 100 : undefined;
    const isProbation = typeof semesterGpa === 'number' && semesterGpa < 12.00;

    // Cumulative up to this term
    let cumGP = 0;
    let cumGC = 0;
    for (let t = 1; t <= termNum; t++) {
      (termsMap[t] || []).forEach((c) => {
        const g = progress.courseGrades?.[c.id];
        if (typeof g === 'number' && g >= 0 && g <= 20) {
          cumGP += g * c.credits;
          cumGC += c.credits;
        }
      });
    }
    const cumGpaUpToTerm = cumGC > 0 ? Math.round((cumGP / cumGC) * 100) / 100 : undefined;

    return {
      courses,
      semesterGpa,
      cumGpaUpToTerm,
      termPassedCredits,
      termGradedCredits,
      isProbation,
    };
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    await exportElementAsPng('transcript-view-card', 'sharif_ce_transcript_gpa');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lang === 'en' ? 'Transcript & GPA Calculation' : 'کارنامه و محاسبه معدل ترم به ترم'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'en'
                ? 'Enter grades (0-20) to compute semester and overall cumulative GPA accurately.'
                : 'وارد کردن نمرات (۰ تا ۲۰)، محاسبه معدل ترمی و معدل کل به همراه بررسی وضعیت مشروطی.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search course in transcript...' : 'جستجوی درس در کارنامه...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? (lang === 'en' ? 'Exporting...' : 'در حال خروجی...') : (lang === 'en' ? 'Export Transcript Image' : 'دانلود تصویر کارنامه')}</span>
          </button>
        </div>
      </div>

      {/* Main Exportable Container */}
      <div id="transcript-view-card" className="space-y-6 bg-slate-50/50 dark:bg-slate-950/20 p-2 sm:p-4 rounded-3xl">
        
        {/* Overall GPA Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'en' ? 'Cumulative GPA' : 'معدل کل (GPA)'}
            </div>
            <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {typeof cumulativeGpa === 'number' ? cumulativeGpa.toFixed(2) : '--'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              {lang === 'en' ? 'out of 20.00' : 'از ۲۰ نمره‌ای'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'en' ? 'Graded Credits' : 'واحد‌های نمره‌دار'}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {totalGradedCredits}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              {lang === 'en' ? `of ${totalPassedCredits} total passed credits` : `از مجموع ${totalPassedCredits} واحد پاس شده`}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'en' ? 'Total Grade Points' : 'مجموع امتیاز نمره‌ای'}
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {totalGradePoints.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-sans">
              {lang === 'en' ? '(Grade × Credits)' : '(نمره × واحد)'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'en' ? 'Academic Standing' : 'وضعیت تحصیلی'}
            </div>
            <div className="mt-1.5">
              {typeof cumulativeGpa === 'number' ? (
                cumulativeGpa >= 17 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                    <Award className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Honors (GPA ≥ 17)' : 'ممتاز (GPA ≥ ۱۷)'}</span>
                  </span>
                ) : cumulativeGpa < 12 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-bold border border-rose-300 dark:border-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Probation (GPA < 12)' : 'مشروط (GPA < ۱۲)'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-300 dark:border-blue-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Good Standing' : 'عادی (مجاز)'}</span>
                  </span>
                )
              ) : (
                <span className="text-xs text-slate-400 font-medium">{lang === 'en' ? 'No grades recorded' : 'نمره‌ای ثبت نشده'}</span>
              )}
            </div>
          </div>

        </div>

        {/* Term-by-Term Transcript Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: maxTerm }, (_, i) => i + 1).map((termNum) => {
            const stats = getTermStats(termNum);
            const filteredCourses = stats.courses.filter(
              (c) =>
                !searchQuery ||
                c.titleFa.includes(searchQuery) ||
                c.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.id.includes(searchQuery)
            );

            if (searchQuery && filteredCourses.length === 0) return null;

            return (
              <div
                key={termNum}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-xs space-y-4 transition ${
                  stats.isProbation
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Term Transcript Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                      T{termNum}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'en' ? `Semester ${termNum} Transcript` : `کارنامه ترم ${termNum}`}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans">
                        {stats.termPassedCredits} {lang === 'en' ? 'passed credits' : 'واحد پاس شده'} / {stats.courses.reduce((a, b) => a + b.credits, 0)} {lang === 'en' ? 'enrolled' : 'واحد ثبت‌شده'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left font-sans">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {lang === 'en' ? 'Term GPA:' : 'معدل ترم:'} <span className="font-mono">{typeof stats.semesterGpa === 'number' ? stats.semesterGpa.toFixed(2) : '--'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {lang === 'en' ? 'Cum. GPA:' : 'معدل کل تا این ترم:'} <span className="font-mono">{typeof stats.cumGpaUpToTerm === 'number' ? stats.cumGpaUpToTerm.toFixed(2) : '--'}</span>
                    </div>
                    {stats.isProbation && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                        ⚠️ {lang === 'en' ? 'Probation (GPA < 12)' : 'مشروط (معدل زیر ۱۲)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Course Grade Items */}
                <div className="space-y-2 text-xs">
                  {stats.courses.length === 0 ? (
                    <div className="text-slate-400 text-center py-6 text-xs italic">
                      {lang === 'en' ? 'No courses assigned to this term.' : 'درسی در این ترم قرار داده نشده است.'}
                    </div>
                  ) : (
                    filteredCourses.map((c) => {
                      const grade = progress.courseGrades?.[c.id];
                      const status = progress.courseStatuses[c.id] || 'NOT_TAKEN';

                      return (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900 transition"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                {c.id}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                {lang === 'en' ? c.titleEn : c.titleFa}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {c.credits} {lang === 'en' ? 'credits' : 'واحد'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                            {/* Term Selector Dropdown */}
                            {onUpdateTermOverride && (
                              <select
                                value={getAssignedTerm(c, progress) || 0}
                                onChange={(e) => {
                                  const newTerm = parseInt(e.target.value, 10);
                                  onUpdateTermOverride(c.id, newTerm);
                                }}
                                className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                title={lang === 'en' ? 'Assign Semester' : 'تغییر ترم درس'}
                              >
                                {Array.from({ length: Math.max(8, maxTerm) }, (_, idx) => idx + 1).map((t) => (
                                  <option key={t} value={t}>
                                    {lang === 'en' ? `Term ${t}` : `ترم ${t}`}
                                  </option>
                                ))}
                                <option value={0}>{lang === 'en' ? 'Unassigned' : 'بدون ترم'}</option>
                              </select>
                            )}

                            {/* Status Toggle Button */}
                            <button
                              onClick={() => {
                                const nextStatus: Record<CourseStatus, CourseStatus> = {
                                  NOT_TAKEN: 'PASSED',
                                  PASSED: 'FAILED',
                                  FAILED: 'IN_PROGRESS',
                                  IN_PROGRESS: 'NOT_TAKEN',
                                };
                                onUpdateStatus(c.id, nextStatus[status]);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                status === 'PASSED'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : status === 'FAILED'
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {status === 'PASSED'
                                ? (lang === 'en' ? 'Passed' : 'پاس شد')
                                : status === 'FAILED'
                                ? (lang === 'en' ? 'Failed' : 'افتاده')
                                : status === 'IN_PROGRESS'
                                ? (lang === 'en' ? 'Enrolled' : 'در حال اخذ')
                                : (lang === 'en' ? 'Not Taken' : 'اخذ نشده')}
                            </button>

                            {/* Grade Number Input */}
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                placeholder={lang === 'en' ? 'Grade (0-20)' : 'نمره (۰-۲۰)'}
                                value={typeof grade === 'number' ? grade : ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (isNaN(val)) {
                                    onUpdateGrade(c.id, undefined);
                                  } else {
                                    const bounded = Math.min(20, Math.max(0, val));
                                    onUpdateGrade(c.id, bounded);
                                    if (bounded >= 10) {
                                      onUpdateStatus(c.id, 'PASSED');
                                    } else {
                                      onUpdateStatus(c.id, 'FAILED');
                                    }
                                  }
                                }}
                                className="w-20 sm:w-24 px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          {/* Unassigned Courses Section (if student has taken/graded courses outside terms 1..N) */}
          {unassignedCourses.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    ?
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {lang === 'en' ? 'Unassigned Courses' : 'دروس اخذشده/نمره‌دار بدون ترم مشخص'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {unassignedCourses.length} {lang === 'en' ? 'courses pending term assignment' : 'درس بدون تخصیص به ترم'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {unassignedCourses.map((c) => {
                  const grade = progress.courseGrades?.[c.id];
                  const status = progress.courseStatuses[c.id] || 'NOT_TAKEN';

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                            {c.id}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                            {lang === 'en' ? c.titleEn : c.titleFa}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {c.credits} {lang === 'en' ? 'credits' : 'واحد'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                        {onUpdateTermOverride && (
                          <select
                            value={0}
                            onChange={(e) => {
                              const newTerm = parseInt(e.target.value, 10);
                              if (newTerm > 0) {
                                onUpdateTermOverride(c.id, newTerm);
                              }
                            }}
                            className="px-2 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-800 rounded-lg text-[11px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                          >
                            <option value={0}>{lang === 'en' ? '-- Select Term --' : '-- انتقال به ترم --'}</option>
                            {Array.from({ length: Math.max(8, maxTerm) }, (_, idx) => idx + 1).map((t) => (
                              <option key={t} value={t}>
                                {lang === 'en' ? `Term ${t}` : `ترم ${t}`}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => {
                            const nextStatus: Record<CourseStatus, CourseStatus> = {
                              NOT_TAKEN: 'PASSED',
                              PASSED: 'FAILED',
                              FAILED: 'IN_PROGRESS',
                              IN_PROGRESS: 'NOT_TAKEN',
                            };
                            onUpdateStatus(c.id, nextStatus[status]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            status === 'PASSED'
                              ? 'bg-emerald-600 text-white'
                              : status === 'FAILED'
                              ? 'bg-rose-600 text-white'
                              : status === 'IN_PROGRESS'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {status === 'PASSED'
                            ? (lang === 'en' ? 'Passed' : 'پاس شد')
                            : status === 'FAILED'
                            ? (lang === 'en' ? 'Failed' : 'افتاده')
                            : status === 'IN_PROGRESS'
                            ? (lang === 'en' ? 'Enrolled' : 'در حال اخذ')
                            : (lang === 'en' ? 'Not Taken' : 'اخذ نشده')}
                        </button>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            placeholder=" نمره "
                            value={typeof grade === 'number' ? grade : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (isNaN(val)) {
                                onUpdateGrade(c.id, undefined);
                              } else {
                                const bounded = Math.min(20, Math.max(0, val));
                                onUpdateGrade(c.id, bounded);
                              }
                            }}
                            className="w-20 px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'en' ? 'Sharif University Academic Evaluation Rules:' : 'نکات آیین‌نامه محاسبه معدل دانشگاه صنعت شریف:'}</span>
          </div>
          <p>• {lang === 'en' ? 'Passing grade for all undergraduate courses is 10.00 out of 20.00.' : 'نمره قبولی در تمامی دروس کارشناسی ۱۰ از ۲۰ می‌باشد.'}</p>
          <p>• {lang === 'en' ? 'Cumulative GPA is computed as total (Grade × Credits) divided by total graded credits.' : 'معدل کل بر اساس مجموع (نمره × واحد) تقسیم بر مجموع واحدهای نمره‌دار محاسبه می‌گردد.'}</p>
          <p>• {lang === 'en' ? 'Semester GPA below 12.00 triggers academic probation and caps next semester course load to 14 credits.' : 'معدل ترمی زیر ۱۲.۰۰ موجب مشروطی دانشجو و محدودیت سقف اخذ unit به ۱۴ واحد در ترم بعدی می‌گردد.'}</p>
        </div>
      </div>
    </div>
  );
};

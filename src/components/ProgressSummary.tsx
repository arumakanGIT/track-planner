import React, { useState } from 'react';
import {
  Award,
  BookCheck,
  CheckCircle,
  Clock,
  Download,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { KNOWLEDGE_CLUSTERS } from '../data/curriculumData';
import { GraduationStats, StudentProgress } from '../types';
import { exportElementAsPng } from '../lib/exportUtils';

interface ProgressSummaryProps {
  stats: GraduationStats;
  progress: StudentProgress;
  onUpdateTargetCluster?: (clusterId: string) => void;
  lang: 'fa' | 'en';
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  stats,
  progress,
  lang,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    await exportElementAsPng('overall-graduation-status-card', 'sharif_ce_graduation_status');
    setIsExporting(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Main Exportable Container */}
        <div id="overall-graduation-status-card" className="space-y-4 bg-slate-50/60 dark:bg-slate-950/30 p-4 sm:p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800">
          
          {/* Top Banner: Graduation Status */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-slate-50/90 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white border border-indigo-200/80 dark:border-indigo-900/50 shadow-xs dark:shadow-lg">
            
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stats.isGraduationEligible ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'}`}>
                {stats.isGraduationEligible ? <Trophy className="w-7 h-7 animate-bounce" /> : <Award className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {stats.isGraduationEligible
                      ? (lang === 'en' ? 'Graduation Requirements Satisfied!' : 'شرایط فارغ‌التحصیلی احراز شد!')
                      : (lang === 'en' ? 'Degree Progress Status (B.Sc. Computer Engineering)' : 'وضعیت کلی فارغ‌التحصیلی (کارشناسی مهندسی کامپیوتر)')}
                  </h2>
                  {stats.isGraduationEligible && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500 text-white rounded-full">
                      {lang === 'en' ? 'Eligible for B.Sc.' : 'واجد شرایط اخذ مدرک کارشناسی'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {lang === 'en'
                    ? `${stats.totalCreditsPassed} of 140 total credits completed (${Math.max(0, 140 - stats.totalCreditsPassed)} remaining)`
                    : `${stats.totalCreditsPassed} واحد از ۱۴۰ واحد کل گذرانده شده (${Math.max(0, 140 - stats.totalCreditsPassed)} واحد باقیمانده)`}
                </p>
              </div>
            </div>

            {/* Export PNG */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                title={lang === 'en' ? 'Download Graduation Status Image' : 'دانلود تصویر وضعیت فارغ‌التحصیلی'}
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? (lang === 'en' ? 'Exporting...' : 'در حال خروجی...') : (lang === 'en' ? 'Export Image' : 'دانلود تصویر')}</span>
              </button>
            </div>

          </div>

          {/* 4 Core Requirement Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Total Credits */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookCheck className="w-4 h-4 text-indigo-500" />
                  {lang === 'en' ? 'Total Credits' : 'کل واحد‌های گذرانده شده'}
                </span>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.totalCreditsPassed} {stats.totalCreditsInProgress > 0 && <span className="text-indigo-400 dark:text-indigo-300 font-normal">({stats.totalCreditsInProgress}+)</span>} / 140
                  </span>
                </div>
              </div>

              {/* Dual Stacked Progress Bar */}
              <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                {/* Projected layer (Passed + In Progress) */}
                {stats.totalCreditsInProgress > 0 && (
                  <div
                    className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-indigo-300/80 dark:bg-indigo-600/60 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(((stats.totalCreditsPassed + stats.totalCreditsInProgress) / 140) * 100))}%`,
                    }}
                    title={`پیش‌بینی دروس اخذ شده: ${stats.totalCreditsPassed + stats.totalCreditsInProgress} واحد`}
                  />
                )}
                {/* Solid Passed layer */}
                <div
                  className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 rounded-full z-10"
                  style={{
                    width: `${Math.min(100, Math.round((stats.totalCreditsPassed / 140) * 100))}%`,
                  }}
                  title={`پاس شده: ${stats.totalCreditsPassed} واحد`}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-1">
                <span>
                  {Math.round((stats.totalCreditsPassed / 140) * 100)}% {lang === 'en' ? 'passed' : 'پاس‌شده'}
                  {stats.totalCreditsInProgress > 0 && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-1">
                      (+{Math.round((stats.totalCreditsInProgress / 140) * 100)}% {lang === 'en' ? 'enrolled' : 'اخذ شده'})
                    </span>
                  )}
                </span>
                {stats.overallGpa && (
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {lang === 'en' ? 'GPA:' : 'معدل:'} {stats.overallGpa}
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Tree Core Courses */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  {lang === 'en' ? 'Tree / Core Courses' : 'دروس پایه (اجباری)'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.treeCreditsPassed} {stats.treeCreditsInProgress > 0 && <span className="text-emerald-400 font-normal">({stats.treeCreditsInProgress}+)</span>} / {stats.treeCreditsTotal}
                </span>
              </div>

              {/* Dual Stacked Progress Bar */}
              <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                {stats.treeCreditsInProgress > 0 && (
                  <div
                    className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-emerald-300/80 dark:bg-emerald-600/60 transition-all duration-500 rounded-full"
                    style={{ width: `${stats.treeProjectedPercent}%` }}
                    title={`پیش‌بینی: ${stats.treeCreditsPassed + stats.treeCreditsInProgress} واحد`}
                  />
                )}
                <div
                  className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-emerald-500 transition-all duration-500 rounded-full z-10"
                  style={{ width: `${stats.treeProgressPercent}%` }}
                  title={`پاس شده: ${stats.treeCreditsPassed} واحد`}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-1">
                <span>
                  {stats.treeProgressPercent}% {lang === 'en' ? 'passed' : 'پاس شده'}
                  {stats.treeCreditsInProgress > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
                      (+{stats.treeProjectedPercent - stats.treeProgressPercent}% {lang === 'en' ? 'enrolled' : 'اخذ شده'})
                    </span>
                  )}
                </span>
                <span>
                  {Math.max(0, stats.treeCreditsTotal - stats.treeCreditsPassed - stats.treeCreditsInProgress)} {lang === 'en' ? 'credits left' : 'واحد مانده'}
                </span>
              </div>
            </div>

            {/* Card 3: Specialized Electives */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {lang === 'en' ? 'Specialized Electives' : 'دروس تخصصی'}
                </span>
                <span className={`text-xs font-mono font-bold ${stats.specializedRequirementMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {stats.specializedCoursesPassedCount} {stats.specializedCoursesInProgressCount > 0 && <span className="text-amber-400 font-normal">({stats.specializedCoursesInProgressCount}+)</span>} / 7 {lang === 'en' ? 'courses' : 'درس'}
                </span>
              </div>

              {/* Dual Stacked Progress Bar */}
              <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                {stats.specializedCoursesInProgressCount > 0 && (
                  <div
                    className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-amber-300/80 dark:bg-amber-600/60 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(((stats.specializedCoursesPassedCount + stats.specializedCoursesInProgressCount) / 7) * 100))}%`,
                    }}
                  />
                )}
                <div
                  className={`absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full transition-all duration-500 rounded-full z-10 ${stats.specializedRequirementMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{
                    width: `${Math.min(100, Math.round((stats.specializedCoursesPassedCount / 7) * 100))}%`,
                  }}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-1">
                <span>
                  {stats.specializedCreditsPassed} {stats.specializedCreditsInProgress > 0 && <span className="text-amber-600 dark:text-amber-400">({stats.specializedCreditsInProgress}+ اخذ)</span>} / 21 {lang === 'en' ? 'credits' : 'واحد'}
                </span>
                {stats.specializedRequirementMet ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> {lang === 'en' ? 'Requirement Met' : 'پاس شد'}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                    <Clock className="w-3 h-3" /> {Math.max(0, 7 - stats.specializedCoursesPassedCount - stats.specializedCoursesInProgressCount)} {lang === 'en' ? 'more needed' : 'درس مانده'}
                  </span>
                )}
              </div>
            </div>

            {/* Card 4: General Electives */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookCheck className="w-4 h-4 text-purple-500" />
                  {lang === 'en' ? 'General Electives' : 'دروس اختیاری'}
                </span>
                <span className={`text-xs font-mono font-bold ${stats.generalElectiveRequirementMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                  {stats.generalElectiveCreditsPassed} {stats.generalElectiveCreditsInProgress > 0 && <span className="text-purple-400 font-normal">({stats.generalElectiveCreditsInProgress}+)</span>} / 13 {lang === 'en' ? 'cr' : 'واحد'}
                </span>
              </div>

              {/* Dual Stacked Progress Bar */}
              <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                {stats.generalElectiveCreditsInProgress > 0 && (
                  <div
                    className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-purple-300/80 dark:bg-purple-600/60 transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(((stats.generalElectiveCreditsPassed + stats.generalElectiveCreditsInProgress) / 13) * 100))}%`,
                    }}
                  />
                )}
                <div
                  className={`absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full transition-all duration-500 rounded-full z-10 ${stats.generalElectiveRequirementMet ? 'bg-emerald-500' : 'bg-purple-500'}`}
                  style={{
                    width: `${Math.min(100, Math.round((stats.generalElectiveCreditsPassed / 13) * 100))}%`,
                  }}
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-1">
                <span>
                  {stats.generalElectiveCreditsPassed} {lang === 'en' ? 'passed' : 'واحد پاس'}
                  {stats.generalElectiveCreditsInProgress > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 font-semibold mr-1">
                      (+{stats.generalElectiveCreditsInProgress} {lang === 'en' ? 'enrolled' : 'اخذ شده'})
                    </span>
                  )}
                </span>
                {stats.generalElectiveRequirementMet ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> {lang === 'en' ? 'Requirement Met' : 'پاس شد'}
                  </span>
                ) : (
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {Math.max(0, 13 - stats.generalElectiveCreditsPassed - stats.generalElectiveCreditsInProgress)} {lang === 'en' ? 'credits left' : 'واحد مانده'}
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

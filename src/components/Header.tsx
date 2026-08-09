import React from 'react';
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Download,
  FileJson,
  Github,
  GraduationCap,
  Info,
  Moon,
  RefreshCw,
  RotateCcw,
  Scale,
  Sun,
  Upload,
  UserCheck,
} from 'lucide-react';
import { StudentProgress } from '../types';

export type AppTab = 'flowchart' | 'checklist' | 'transcript' | 'clusters' | 'rules' | 'about';

interface HeaderProps {
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onReset: () => void;
  warningCount: number;
  onOpenWarnings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onUpdateProgress,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  onReset,
  warningCount,
  onOpenWarnings,
}) => {
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ce_curriculum_progress_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.courseStatuses) {
          onUpdateProgress(parsed);
          alert(lang === 'en' ? 'Progress imported successfully!' : 'پیشرفت با موفقیت وارد شد!');
        } else {
          alert(lang === 'en' ? 'Invalid progress JSON file.' : 'فایل پشتیبان معتبر نیست.');
        }
      } catch (err) {
        alert(lang === 'en' ? 'Error reading JSON file.' : 'خطا در خواندن فایل JSON.');
      }
    };
    reader.readAsText(file);
  };

  const applyPreset = (presetType: 'freshman' | 'junior_ai' | 'senior_sw') => {
    const statuses: Record<string, 'NOT_TAKEN' | 'IN_PROGRESS' | 'PASSED' | 'FAILED'> = { ...progress.courseStatuses };
    const grades: Record<string, number> = { ...progress.courseGrades };
    
    // Reset all
    Object.keys(statuses).forEach((k) => (statuses[k] = 'NOT_TAKEN'));

    if (presetType === 'freshman') {
      ['30003', '22015', '24011', '33018', '40153', '40108', '31123', 'GEN_1'].forEach((id) => {
        statuses[id] = 'PASSED';
        grades[id] = 18.5;
      });
      ['30004', '22016', '24012', '24002', '40212', '40244', '40115'].forEach((id) => (statuses[id] = 'IN_PROGRESS'));
    } else if (presetType === 'junior_ai') {
      const passedList = [
        '30003', '22015', '24011', '33018', '40153', '40108', '31123', 'GEN_1',
        '30004', '22016', '24012', '24002', '40212', '40244', '40115',
        'GEN_2', '22034', '40124', '40126', '40206', '40254', '40211',
        'GEN_3', '40181', '40323', '40223', '40203', '40415', '40221',
        '40282', '40417', '40384'
      ];
      passedList.forEach((id) => {
        statuses[id] = 'PASSED';
        grades[id] = 17.0 + (Math.floor(Math.random() * 6) / 2);
      });
      ['40717', '40424', '40354'].forEach((id) => (statuses[id] = 'IN_PROGRESS'));
    } else if (presetType === 'senior_sw') {
      const passedList = [
        '30003', '22015', '24011', '33018', '40153', '40108', '31123', 'GEN_1',
        '30004', '22016', '24012', '24002', '40212', '40244', '40115',
        'GEN_2', '22034', '40124', '40126', '40206', '40254', '40211',
        'GEN_3', '40181', '40323', '40223', '40203', '40415', '40221',
        '40282', '40424', '40103', '37514', '40417', '40384',
        '31119', '40443', '40416', '40408', '40418', '40474', '40484', '40419'
      ];
      passedList.forEach((id) => {
        statuses[id] = 'PASSED';
        grades[id] = 16.5 + (Math.floor(Math.random() * 7) / 2);
      });
      ['40441', '40450', '40760', '40828'].forEach((id) => (statuses[id] = 'IN_PROGRESS'));
    }

    onUpdateProgress({
      ...progress,
      courseStatuses: statuses,
      courseGrades: grades,
    });
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'en' ? 'CE Curriculum & Specialization Tracker' : 'برنامه‌ریز و چارت برنامه‌سازی مهندسی کامپیوتر'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-medium border border-indigo-200 dark:border-indigo-800">
                    {lang === 'en' ? 'Batch 2021' : 'ورودی ۱۴۰۰'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'en'
                    ? 'Based on Sharif CE Curriculum (bs-ce-1400_2)'
                    : 'مطابق چارت مصوب وزارت علوم و آیین‌نامه آموزش دانشگاه'}
                </p>
              </div>
            </div>

            {/* Mobile dark mode & warning indicator */}
            <div className="flex md:hidden items-center gap-2">
              {warningCount > 0 && (
                <button
                  onClick={onOpenWarnings}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5 animate-pulse"
                >
                  ⚠️ {warningCount}
                </button>
              )}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            
            {/* Warning indicator */}
            {warningCount > 0 && (
              <button
                onClick={onOpenWarnings}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
              >
                <span>⚠️</span>
                <span>{lang === 'en' ? `${warningCount} Alert(s)` : `${warningCount} هشدار پیش‌نیاز`}</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setLang('fa')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  lang === 'fa' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                فارسی
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  lang === 'en' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
            </div>

            {/* Export & Import Backup */}
            <button
              onClick={handleExportJSON}
              title={lang === 'en' ? 'Export Progress Backup JSON' : 'خروجی پشتیبان فایل JSON'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              title={lang === 'en' ? 'Import Progress JSON' : 'بارگذاری فایل پشتیبان JSON'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* GitHub Profile */}
            <a
              href="https://github.com/arumakanGIT"
              target="_blank"
              rel="noopener noreferrer"
              title={lang === 'en' ? 'GitHub Profile' : 'پروفایل گیتهاب'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Reset */}
            <button
              onClick={onReset}
              title={lang === 'en' ? 'Reset Progress' : 'بازنشانی اطلاعات'}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-200 dark:border-slate-800 pt-1 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('flowchart')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'flowchart'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'en' ? 'Term Tree Chart' : 'چارت'}</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{lang === 'en' ? 'Course Checklist' : 'فهرست دروس'}</span>
          </button>

          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'transcript'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{lang === 'en' ? 'Transcript & GPA' : 'کارنامه'}</span>
          </button>

          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'clusters'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'en' ? 'Specialization Tracks' : 'گرایش‌ها'}</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{lang === 'en' ? 'Academic Rules & Notes' : 'قوانین و نکات آموزشی'}</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{lang === 'en' ? 'About Project' : 'درباره پروژه'}</span>
          </button>

        </div>
      </div>
    </header>
  );
};

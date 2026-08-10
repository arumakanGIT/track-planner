import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Grid,
  Info,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { COURSES, KNOWLEDGE_CLUSTERS } from '../data/curriculumData';
import { Course, CourseStatus, StudentProgress } from '../types';
import { getAssignedTerm, getCourseById, validateCourseRules } from '../lib/curriculumEngine';
import { exportElementAsPng } from '../lib/exportUtils';

interface FlowchartViewProps {
  progress: StudentProgress;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onUpdateGrade?: (courseId: string, grade: number | undefined) => void;
  onUpdateTermOverride: (courseId: string, termNum: number) => void;
  onOpenCourseModal: (course: Course) => void;
  lang: 'fa' | 'en' | 'dual';
}

export const FlowchartView: React.FC<FlowchartViewProps> = ({
  progress,
  onUpdateStatus,
  onUpdateGrade,
  onUpdateTermOverride,
  onOpenCourseModal,
  lang,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [clusterFilter, setClusterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Drag and Drop State
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
  const [dragOverTerm, setDragOverTerm] = useState<number | null>(null);

  // Term Drawer / Management Panel state
  const [activeManageTerm, setActiveManageTerm] = useState<number | null>(null);
  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [panelTypeFilter, setPanelTypeFilter] = useState<string>('all');
  const overrideTerms = (Object.values(progress.courseTermOverrides || {}).filter(
    (t) => typeof t === 'number' && t > 0
  )) as number[];
  const maxOverrideTerm = Math.max(8, ...overrideTerms, 1);

  const [customTermCount, setCustomTermCount] = useState<number>(maxOverrideTerm);

  // Detect mobile / tablet touch device or small screen for showing term selector selectbox
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 1024;
    return hasTouch || isSmallScreen;
  });

  useEffect(() => {
    const checkDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobileOrTablet(hasTouch || isSmallScreen);
    };
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Keep customTermCount in sync if new max override term is added anywhere
  useEffect(() => {
    setCustomTermCount((prev) => Math.max(prev, maxOverrideTerm));
  }, [maxOverrideTerm]);

  const activeFocusId = hoveredCourseId || selectedCourseId;
  const activeFocusCourse = activeFocusId ? getCourseById(activeFocusId) : null;

  // Derive term lists (1..customTermCount)
  const termsMap: Record<number, Course[]> = {};
  for (let t = 1; t <= customTermCount; t++) {
    termsMap[t] = COURSES.filter((c) => getAssignedTerm(c, progress) === t);
  }

  // Calculate term credit sums
  const getTermCredits = (termNum: number) => {
    return (termsMap[termNum] || []).reduce((acc, c) => acc + c.credits, 0);
  };

  // Connection calculations
  const activeFocusPrereqs = activeFocusCourse ? activeFocusCourse.prerequisites : [];
  const activeFocusCoreqs = activeFocusCourse ? activeFocusCourse.corequisites : [];
  const activeFocusDependents = activeFocusId
    ? COURSES.filter(
        (c) => c.prerequisites.includes(activeFocusId) || c.corequisites.includes(activeFocusId)
      ).map((c) => c.id)
    : [];

  const handleExportImage = async () => {
    setIsExporting(true);
    await exportElementAsPng('term-tree-chart-canvas', 'sharif_ce_term_tree_flowchart');
    setIsExporting(false);
  };

  const handleAddNewTerm = () => {
    setCustomTermCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      
      {/* View Switcher & Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Term Tree Chart & Semester Planner' : 'چارت و برنامه‌ریزی ترم‌ها'}
            </h2>
          </div>
        </div>

        {/* Right Actions: Filter, Search & Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Cluster Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[170px]"
            >
              <option value="all">-- {lang === 'en' ? 'All Tracks' : 'همه گرایش‌ها'} --</option>
              {KNOWLEDGE_CLUSTERS.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.titleFa}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search course...' : 'جستجوی درس...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 pl-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 w-36 sm:w-44"
            />
          </div>

          {/* Manage Terms Drawer Trigger */}
          <button
            onClick={() => setActiveManageTerm(1)}
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-indigo-200/80 dark:border-indigo-800"
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'en' ? 'Manage Terms' : 'مدیریت و انتخاب دروس'}</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? (lang === 'en' ? 'Exporting...' : 'خروجی...') : (lang === 'en' ? 'Export Image' : 'دانلود تصویر نمودار')}</span>
          </button>

        </div>

      </div>

      {/* Connection Focus Banner (Fixed height slot to prevent flowchart vertical shifting/jittering) */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs min-h-[52px]">
        {activeFocusCourse ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {lang === 'en' ? 'Course Connections:' : 'اتصالات و وابستگی‌های درس:'}
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {lang === 'en' ? activeFocusCourse.titleEn : activeFocusCourse.titleFa} ({activeFocusCourse.id})
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] flex-wrap">
              <span className="text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                {lang === 'en' ? 'Prereqs:' : 'پیش‌نیازها:'} {activeFocusPrereqs.length}
              </span>
              <span className="text-blue-800 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60">
                {lang === 'en' ? 'Coreqs:' : 'هم‌نیازها:'} {activeFocusCoreqs.length}
              </span>
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                {lang === 'en' ? 'Unlocks:' : 'دروس وابسته:'} {activeFocusDependents.length}
              </span>
              {selectedCourseId && (
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition text-[11px] flex items-center gap-0.5"
                  title={lang === 'en' ? 'Clear selection' : 'لغو انتخاب'}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Clear' : 'پاک کردن'}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              {lang === 'en'
                ? 'Hover over or click any course to highlight its prerequisites and unlocked courses. You can drag and drop courses between terms!'
                : 'برای مشاهده پیش‌نیازها و دروس وابسته، موس را روی درس قرار دهید. می‌توانید درس‌ها را با درگ و دراپ بین ترم‌ها منتقل کنید.'}
            </span>
          </div>
        )}
      </div>

      {/* Main Exportable Flowchart Container */}
      <div id="term-tree-chart-canvas" className="bg-slate-100/50 dark:bg-slate-950/40 p-3 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        
        {/* Grid Flowchart Layout (Terms 1 to customTermCount) */}
        <div className="overflow-x-auto pb-4 pt-1 no-scrollbar">
          <div
            className="grid gap-3 min-w-[1250px]"
            style={{
              gridTemplateColumns: `repeat(${customTermCount}, minmax(150px, 1fr))`,
            }}
          >
            {Array.from({ length: customTermCount }, (_, i) => i + 1).map((termNum) => {
              const coursesInTerm = termsMap[termNum] || [];
              const termCredits = getTermCredits(termNum);
              const isTargetDrop = dragOverTerm === termNum;

              return (
                <div
                  key={termNum}
                  className="flex flex-col space-y-2.5"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverTerm !== termNum) {
                      setDragOverTerm(termNum);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverTerm(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const courseId = e.dataTransfer.getData('text/plain') || draggedCourseId;
                    if (courseId) {
                      onUpdateTermOverride(courseId, termNum);
                    }
                    setDragOverTerm(null);
                    setDraggedCourseId(null);
                  }}
                >
                  
                  {/* Term Header */}
                  <div className={`p-2.5 rounded-xl text-center shadow-xs flex flex-col items-center justify-between gap-1 transition-all ${
                    isTargetDrop
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-slate-800 dark:bg-slate-900 text-white'
                  }`}>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">
                        {lang === 'en' ? `Semester ${termNum}` : `ترم ${termNum}`}
                      </span>
                      <button
                        onClick={() => setActiveManageTerm(termNum)}
                        className="p-1 hover:bg-slate-700 dark:hover:bg-slate-800 text-indigo-300 rounded-lg transition text-[10px] font-semibold flex items-center gap-0.5"
                        title="مدیریت و افزودن درس به این ترم"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {termCredits} {lang === 'en' ? 'Credits' : 'واحد'}
                    </div>
                  </div>

                  {/* Courses Column (Droppable) */}
                  <div
                    className={`space-y-2 flex-1 p-2 rounded-2xl border transition-all duration-200 min-h-[300px] ${
                      isTargetDrop
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 border-dashed ring-2 ring-indigo-500/30'
                        : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80'
                    }`}
                  >
                    {coursesInTerm.length === 0 ? (
                      <div className="text-center py-10 text-[11px] text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        {isTargetDrop
                          ? (lang === 'en' ? 'Drop here!' : 'درس را اینجا رها کنید')
                          : (lang === 'en' ? 'No courses assigned' : 'درسی ثبت نشده')}
                      </div>
                    ) : (
                      coursesInTerm.map((course) => {
                        const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';
                        const warnings = validateCourseRules(course, progress.courseStatuses);
                        const hasPrereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');

                        const matchesCluster =
                          clusterFilter === 'all' || course.clusters.includes(clusterFilter);
                        const matchesSearch =
                          !searchQuery ||
                          course.titleFa.includes(searchQuery) ||
                          course.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.id.includes(searchQuery);

                        // Connection highlights
                        const isFocusTarget = activeFocusId === course.id;
                        const isPrereqOfFocus = activeFocusPrereqs.includes(course.id);
                        const isCoreqOfFocus = activeFocusCoreqs.includes(course.id);
                        const isDependentOfFocus = activeFocusDependents.includes(course.id);
                        const isBeingDragged = draggedCourseId === course.id;

                        let borderClass = 'border-slate-200 dark:border-slate-700/80';
                        let bgClass = 'bg-white dark:bg-slate-800';

                        if (status === 'PASSED') {
                          bgClass = 'bg-emerald-50/90 dark:bg-emerald-950/40';
                          borderClass = 'border-emerald-300 dark:border-emerald-700/80';
                        } else if (status === 'IN_PROGRESS') {
                          bgClass = 'bg-amber-50/90 dark:bg-amber-950/40';
                          borderClass = 'border-amber-300 dark:border-amber-700/80';
                        } else if (status === 'FAILED') {
                          bgClass = 'bg-rose-50/90 dark:bg-rose-950/40';
                          borderClass = 'border-rose-300 dark:border-rose-800';
                        } else if (hasPrereqMissing) {
                          bgClass = 'bg-slate-100/70 dark:bg-slate-900/60';
                          borderClass = 'border-slate-200 dark:border-slate-800';
                        }

                        if (isFocusTarget) {
                          borderClass = 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/40';
                        } else if (isPrereqOfFocus) {
                          borderClass = 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/50';
                        } else if (isCoreqOfFocus) {
                          borderClass = 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-400/50';
                        } else if (isDependentOfFocus) {
                          borderClass = 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-400/50';
                        }

                        return (
                          <div
                            key={course.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', course.id);
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedCourseId(course.id);
                            }}
                            onDragEnd={() => {
                              setDraggedCourseId(null);
                              setDragOverTerm(null);
                            }}
                            onMouseEnter={() => setHoveredCourseId(course.id)}
                            onMouseLeave={() => setHoveredCourseId(null)}
                            onClick={() => {
                              setSelectedCourseId(course.id);
                              onOpenCourseModal(course);
                            }}
                            className={`p-2.5 rounded-xl border transition-all duration-200 shadow-2xs relative group cursor-grab active:cursor-grabbing ${bgClass} ${borderClass} ${
                              !matchesCluster || !matchesSearch ? 'opacity-30 hover:opacity-100' : 'opacity-100'
                            } ${isBeingDragged ? 'opacity-40 scale-95 border-dashed border-indigo-500' : ''}`}
                          >
                            {/* Top Line: Code & Credits & Quick Remove */}
                            <div className="flex items-center justify-between text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                                  {course.id}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateTermOverride(course.id, 0);
                                  }}
                                  className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                                  title={lang === 'en' ? 'Remove course from chart' : 'حذف درس از چارت'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-semibold">{course.credits} {lang === 'en' ? 'cr' : 'واحد'}</span>
                            </div>

                            {/* Title */}
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                              {lang === 'en' ? course.titleEn : course.titleFa}
                            </div>

                            {/* Term Selector Override & Quick Status */}
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] gap-1 flex-wrap">
                              
                              {/* Quick Status Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus: Record<CourseStatus, CourseStatus> = {
                                    NOT_TAKEN: 'IN_PROGRESS',
                                    IN_PROGRESS: 'PASSED',
                                    PASSED: 'FAILED',
                                    FAILED: 'NOT_TAKEN',
                                  };
                                  onUpdateStatus(course.id, nextStatus[status]);
                                }}
                                className={`px-2 py-0.5 rounded-md font-semibold transition flex items-center gap-1 ${
                                  status === 'PASSED'
                                    ? 'bg-emerald-600 text-white'
                                    : status === 'IN_PROGRESS'
                                    ? 'bg-amber-500 text-white'
                                    : status === 'FAILED'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span>
                                  {status === 'PASSED'
                                    ? (lang === 'en' ? 'Passed' : 'پاس شد')
                                    : status === 'IN_PROGRESS'
                                    ? (lang === 'en' ? 'Enrolled' : 'در حال اخذ')
                                    : status === 'FAILED'
                                    ? (lang === 'en' ? 'Failed' : 'افتاده')
                                    : (lang === 'en' ? 'Not Taken' : 'اخذ نشده')}
                                </span>
                              </button>

                              {/* Term Selector dropdown for Mobile / Tablet */}
                              {isMobileOrTablet && (
                                <select
                                  value={termNum}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    const newTerm = parseInt(e.target.value, 10);
                                    onUpdateTermOverride(course.id, newTerm);
                                  }}
                                  className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-md text-[10px] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                  title={lang === 'en' ? 'Change semester' : 'تغییر ترم درس'}
                                >
                                  {Array.from({ length: Math.max(8, customTermCount) }, (_, idx) => idx + 1).map((t) => (
                                    <option key={t} value={t}>
                                      {lang === 'en' ? `T${t}` : `ترم ${t}`}
                                    </option>
                                  ))}
                                  <option value={0}>{lang === 'en' ? 'Remove' : 'حذف'}</option>
                                </select>
                              )}

                              {/* Details Info Modal Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCourseModal(course);
                                }}
                                className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-0.5 shrink-0"
                                title={lang === 'en' ? 'Course details' : 'جزئیات کامل درس'}
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>

                            </div>

                            {/* Prerequisite Missing Lock Badge */}
                            {hasPrereqMissing && status === 'NOT_TAKEN' && (
                              <div className="absolute -top-1 -right-1 p-0.5 bg-slate-500 text-white rounded-full shadow-xs" title={lang === 'en' ? 'Prerequisites for this course are not fulfilled yet' : 'پیش‌نیازهای این درس هنوز پاس نشده‌اند'}>
                                <Lock className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Term Button Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleAddNewTerm}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Add Extra Term' : 'افزودن ترم جدید'}</span>
          </button>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {lang === 'en' ? `${COURSES.length} Total Courses in Curriculum` : `${COURSES.length} درس کل در سامانه چارت`}
          </div>
        </div>

      </div>

      {/* Interactive Semester Management Drawer / Modal */}
      {activeManageTerm !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold font-mono text-base flex items-center justify-center shadow-xs">
                  T{activeManageTerm}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {lang === 'en' ? `Manage & Plan Semester ${activeManageTerm}` : `مدیریت و انتخاب دروس ترم ${activeManageTerm}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {getTermCredits(activeManageTerm)} {lang === 'en' ? 'credits currently assigned' : 'واحد کل انتخاب‌شده برای این ترم'}
                  </p>
                </div>
              </div>

              {/* Term Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={activeManageTerm}
                  onChange={(e) => setActiveManageTerm(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: customTermCount }, (_, i) => i + 1).map((t) => (
                    <option key={t} value={t}>
                      ترم {t}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setActiveManageTerm(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Section 1: Assigned Courses in Term */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{lang === 'en' ? `Courses assigned to Semester ${activeManageTerm}:` : `دروس قرار داده شده در ترم ${activeManageTerm}:`}</span>
                </h4>

                <div className="space-y-2">
                  {termsMap[activeManageTerm]?.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      {lang === 'en' ? `No courses currently assigned to Semester ${activeManageTerm}. Search and add courses below.` : `هیچ درسی هنوز برای ترم ${activeManageTerm} انتخاب نشده است. از کادر زیر درس اضافه کنید.`}
                    </div>
                  ) : (
                    termsMap[activeManageTerm]?.map((course) => {
                      const status = progress.courseStatuses[course.id] || 'NOT_TAKEN';

                      return (
                        <div
                          key={course.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                {course.id}
                              </span>
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {lang === 'en' ? course.titleEn : course.titleFa}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {course.credits} {lang === 'en' ? 'Credits' : 'واحد'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Move Term Dropdown */}
                            <select
                              value={activeManageTerm}
                              onChange={(e) => onUpdateTermOverride(course.id, Number(e.target.value))}
                              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200"
                            >
                              {Array.from({ length: customTermCount }, (_, i) => i + 1).map((t) => (
                                <option key={t} value={t}>
                                  {lang === 'en' ? `Move to Semester ${t}` : `انتقال به ترم ${t}`}
                                </option>
                              ))}
                            </select>

                            {/* Remove from Term */}
                            <button
                              onClick={() => {
                                // Remove from flowchart completely
                                onUpdateTermOverride(course.id, 0);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                              title={lang === 'en' ? 'Remove course from chart' : 'حذف درس از چارت'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Section 2: Search & Add New Course */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>{lang === 'en' ? `Add new course to Semester ${activeManageTerm}:` : `افزودن درس جدید به ترم ${activeManageTerm}:`}</span>
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'Search course title or code (e.g. 40153)...' : 'جستجوی نام درس یا کد درس (مثلاً ۴۰۱۵۳)...'}
                      value={panelSearchQuery}
                      onChange={(e) => setPanelSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Type Filter */}
                  <select
                    value={panelTypeFilter}
                    onChange={(e) => setPanelTypeFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">{lang === 'en' ? 'All Course Types' : 'همه انواع دروس'}</option>
                    <option value="unassigned">{lang === 'en' ? 'Unassigned / Removed' : 'دروس حذف‌شده / غیرفعال'}</option>
                    <option value="tree">{lang === 'en' ? 'Tree Core Courses' : 'دروس درختی (اصلی)'}</option>
                    <option value="specialized">{lang === 'en' ? 'Specialized Courses' : 'دروس تخصصی'}</option>
                    <option value="foundation">{lang === 'en' ? 'Foundation Courses' : 'دروس پایه'}</option>
                    <option value="general_core">{lang === 'en' ? 'General Core' : 'دروس عمومی اجباری'}</option>
                    <option value="general_elective">{lang === 'en' ? 'General Elective' : 'دروس عمومی اختیاری'}</option>
                  </select>
                </div>

                {/* Search Results List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pt-1 pr-1">
                  {COURSES.filter((c) => {
                    const currentAssignedTerm = getAssignedTerm(c, progress);
                    const matchesSearch =
                      !panelSearchQuery ||
                      c.titleFa.includes(panelSearchQuery) ||
                      c.titleEn.toLowerCase().includes(panelSearchQuery.toLowerCase()) ||
                      c.id.includes(panelSearchQuery);
                    const matchesType =
                      panelTypeFilter === 'all' ||
                      (panelTypeFilter === 'unassigned'
                        ? currentAssignedTerm === null
                        : c.type === panelTypeFilter);
                    const notInCurrentTerm = currentAssignedTerm !== activeManageTerm;

                    return matchesSearch && matchesType && notInCurrentTerm;
                  })
                    .slice(0, 15)
                    .map((course) => {
                      const currentAssignedTerm = getAssignedTerm(course, progress);
                      const warnings = validateCourseRules(course, progress.courseStatuses);
                      const hasPrereqMissing = warnings.some((w) => w.type === 'prerequisite_missing');

                      return (
                        <div
                          key={course.id}
                          className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 hover:border-indigo-400 transition"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                {course.id}
                              </span>
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {lang === 'en' ? course.titleEn : course.titleFa}
                              </span>
                              {currentAssignedTerm === null && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold">
                                  {lang === 'en' ? 'Unassigned' : 'حذف شده'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {course.credits} {lang === 'en' ? 'Credits' : 'واحد'} • {course.type === 'tree' ? (lang === 'en' ? 'Tree Core' : 'اصلی چارت') : (lang === 'en' ? 'Elective / General' : 'اختیاری / عمومی')}
                            </div>
                          </div>

                          <button
                            onClick={() => onUpdateTermOverride(course.id, activeManageTerm)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? `Add to Semester ${activeManageTerm}` : `افزودن به ترم ${activeManageTerm}`}</span>
                          </button>
                        </div>
                      );
                    })}
                </div>

              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleAddNewTerm}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'en' ? `Add Term ${customTermCount + 1}` : `افزودن ترم ${customTermCount + 1}`}</span>
              </button>

              <button
                onClick={() => setActiveManageTerm(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                {lang === 'en' ? 'Confirm & Close' : 'تأیید و بستن'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footnote Notes */}
      <div className="bg-slate-100/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <div className="font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>{lang === 'en' ? 'Curriculum Chart Notes:' : 'نکات مهم چارت آموزشی (دانشگاه شریف):'}</span>
        </div>
        <p>• {lang === 'en' ? 'Engineering Mathematics (22035) can be taken instead of Linear Algebra (40282).' : 'درس ریاضی مهندسی (۲۲۰۳۵) به جای درس جبر خطی (۴۰۲۸۲) قابل اخذ است.'}</p>
        <p>• {lang === 'en' ? 'Semester GPA below 12.00 triggers an academic probation alert.' : 'معدل زیر ۱۲ در هر ترم موجب هشدار مشروطی و محدودیت سقف ۱۴ واحد در ترم بعدی می‌گردد.'}</p>
      </div>

    </div>
  );
};

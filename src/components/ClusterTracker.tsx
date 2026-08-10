import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  Bot,
  Brain,
  Briefcase,
  CheckCircle,
  Code,
  Cpu,
  Database,
  Dna,
  Download,
  Eye,
  Filter,
  Info,
  Layers,
  MessageSquareText,
  Microchip,
  Network,
  Plus,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { KNOWLEDGE_CLUSTERS } from '../data/curriculumData';
import { ClusterProgress, Course, CourseStatus, StudentProgress } from '../types';
import {
  calculateClusterProgresses,
  getCourseById,
  getRecommendedCourses,
} from '../lib/curriculumEngine';
import { exportElementAsPng } from '../lib/exportUtils';

interface ClusterTrackerProps {
  progress: StudentProgress;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onToggleTargetCluster: (clusterId: string) => void;
  onToggleBookmark?: (courseId: string) => void;
  onOpenCourseModal: (course: Course) => void;
  lang: 'fa' | 'en' | 'dual';
}

// Icon mapping helper
const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5 text-indigo-500" />,
  Brain: <Brain className="w-5 h-5 text-purple-500" />,
  Eye: <Eye className="w-5 h-5 text-blue-500" />,
  Dna: <Dna className="w-5 h-5 text-emerald-500" />,
  MessageSquareText: <MessageSquareText className="w-5 h-5 text-teal-500" />,
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-rose-500" />,
  Bot: <Bot className="w-5 h-5 text-cyan-500" />,
  Microchip: <Microchip className="w-5 h-5 text-indigo-500" />,
  Layers: <Layers className="w-5 h-5 text-violet-500" />,
  Network: <Network className="w-5 h-5 text-sky-500" />,
  BarChart3: <BarChart3 className="w-5 h-5 text-emerald-500" />,
  Activity: <Activity className="w-5 h-5 text-rose-500" />,
  Briefcase: <Briefcase className="w-5 h-5 text-amber-500" />,
  Server: <Server className="w-5 h-5 text-slate-500" />,
  Database: <Database className="w-5 h-5 text-blue-500" />,
  Code: <Code className="w-5 h-5 text-indigo-500" />,
};

interface RecommendationCardProps {
  course: Course;
  reasonFa: string;
  reasonEn: string;
  clusterTitleFa: string;
  lang: 'fa' | 'en' | 'dual';
  status: CourseStatus;
  isBookmarked: boolean;
  onUpdateStatus: (courseId: string, status: CourseStatus) => void;
  onToggleBookmark?: (courseId: string) => void;
  onOpenCourseModal: (course: Course) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  course,
  reasonFa,
  reasonEn,
  lang,
  status,
  isBookmarked,
  onUpdateStatus,
  onToggleBookmark,
  onOpenCourseModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const reasonText = lang === 'en' ? reasonEn : reasonFa;
  const isLong = reasonText.length > 55 || reasonText.includes('\n');

  const isInProgress = status === 'IN_PROGRESS';
  const isPassed = status === 'PASSED';

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3.5 space-y-2 flex flex-col justify-between hover:bg-white/15 transition">
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-indigo-200">
          <span className="font-bold">{course.id}</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-white font-sans">
            {course.credits} {lang === 'en' ? 'credits' : 'واحد'}
          </span>
        </div>
        <h3 className="font-bold text-sm text-white mt-1">
          {lang === 'en' ? course.titleEn : course.titleFa}
        </h3>

        <div className="mt-1.5">
          <p
            className={`text-[11px] text-amber-200/95 leading-relaxed whitespace-pre-line transition-all ${
              isExpanded
                ? 'bg-black/25 p-2 rounded-lg border border-amber-200/20 text-amber-100 font-medium'
                : 'line-clamp-2'
            }`}
          >
            {reasonText}
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[10px] text-indigo-200 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-0.5 focus:outline-hidden cursor-pointer"
            >
              {isExpanded
                ? lang === 'en' ? 'Show Less' : 'کمتر...'
                : lang === 'en' ? 'Show More...' : 'مشاهده متن کامل...'}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-2">
        <button
          type="button"
          onClick={() => {
            if (isInProgress) {
              onUpdateStatus(course.id, 'NOT_TAKEN');
            } else if (!isPassed) {
              onUpdateStatus(course.id, 'IN_PROGRESS');
            }
          }}
          disabled={isPassed}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer ${
            isInProgress
              ? 'bg-emerald-600/90 text-white shadow-xs hover:bg-emerald-700 opacity-90'
              : isPassed
              ? 'bg-white/10 text-emerald-300 cursor-not-allowed opacity-60'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
          title={
            isInProgress
              ? (lang === 'en' ? 'Click to remove from current term' : 'برای لغو اخذ کلیک کنید')
              : isPassed
              ? (lang === 'en' ? 'Passed' : 'پاس شده')
              : (lang === 'en' ? 'Mark as In Progress' : 'افزودن به ترم جاری')
          }
        >
          {isInProgress ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-white" />
              <span>{lang === 'en' ? 'In Current Term' : 'در حال اخذ (ترم جاری)'}</span>
            </>
          ) : isPassed ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'en' ? 'Passed' : 'پاس شده'}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Mark as In Progress' : 'افزودن به ترم جاری'}</span>
            </>
          )}
        </button>

        {onToggleBookmark && (
          <button
            type="button"
            onClick={() => onToggleBookmark(course.id)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={
              isBookmarked
                ? (lang === 'en' ? 'Unmark course' : 'حذف نشان')
                : (lang === 'en' ? 'Bookmark course' : 'نشان‌کردن')
            }
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenCourseModal(course)}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
          title={lang === 'en' ? 'View Details' : 'مشاهده جزئیات'}
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export const ClusterTracker: React.FC<ClusterTrackerProps> = ({
  progress,
  onUpdateStatus,
  onToggleTargetCluster,
  onToggleBookmark,
  onOpenCourseModal,
  lang,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeInfoCluster, setActiveInfoCluster] = useState<string | null>(null);

  const bookmarkedIds = progress.bookmarkedCourseIds || [];

  // Active target cluster IDs array
  const targetClusterIds = progress.targetClusterIds || (progress.targetClusterId ? [progress.targetClusterId] : []);

  const clusterProgresses = calculateClusterProgresses(progress.courseStatuses);
  const recommendations = getRecommendedCourses(progress.courseStatuses, targetClusterIds);

  // Sort cluster progress: selected target clusters first, then highest percentage
  const sortedClusters = [...clusterProgresses].sort((a, b) => {
    const aIsTarget = targetClusterIds.includes(a.cluster.id);
    const bIsTarget = targetClusterIds.includes(b.cluster.id);
    if (aIsTarget && !bIsTarget) return -1;
    if (!aIsTarget && bIsTarget) return 1;
    return b.percentage - a.percentage;
  });

  const handleExportImage = async () => {
    setIsExporting(true);
    await exportElementAsPng('knowledge-clusters-overview-card', 'sharif_ce_knowledge_clusters');
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lang === 'en' ? 'Specialization Tracks' : 'گرایش‌های تخصصی'}</span>
          </h2>
        </div>

        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? (lang === 'en' ? 'Exporting...' : 'در حال خروجی...') : (lang === 'en' ? 'Export Tracks Image' : 'دانلود تصویر گرایش‌ها')}</span>
        </button>
      </div>

      {/* Selected Target Clusters Badges Bar */}
      {targetClusterIds.length > 0 && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {lang === 'en' ? 'Selected Target Tracks:' : 'گرایش‌های هدف انتخاب‌شده شما:'}
            </span>
            {targetClusterIds.map((id) => {
              const cluster = KNOWLEDGE_CLUSTERS.find((c) => c.id === id);
              if (!cluster) return null;

              return (
                <span
                  key={id}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold border border-indigo-200 dark:border-indigo-700 shadow-2xs flex items-center gap-1.5"
                >
                  <span>{lang === 'en' ? cluster.titleEn : cluster.titleFa}</span>
                  <button
                    onClick={() => onToggleTargetCluster(id)}
                    className="text-slate-400 hover:text-rose-500 font-bold ml-1"
                    title={lang === 'en' ? 'Remove target' : 'حذف از اهداف'}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          <button
            onClick={() => targetClusterIds.forEach((id) => onToggleTargetCluster(id))}
            className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
          >
            {lang === 'en' ? 'Clear All Targets' : 'حذف همه اهداف'}
          </button>
        </div>
      )}

      {/* Smart Recommendations Section */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-xl space-y-4 border border-indigo-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {lang === 'en' ? 'Recommended Next Courses for Your Specialization' : 'پیشنهاد هوشمند دروس ترم بعد برای گرایش شما'}
              </h2>
              <p className="text-xs text-indigo-200">
                {lang === 'en'
                  ? 'Based on your selected tracks and fulfilled prerequisites'
                  : 'بر اساس بیشترین پیشرفت در گرایش‌های تخصصی و تکمیل پیش‌نیازها'}
              </p>
            </div>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-xs text-indigo-200 py-2">
            {lang === 'en' ? 'All recommended courses in this track are already completed!' : 'تمام دروس پیشنهادی برای گرایش انتخابی گذرانده شده‌اند!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map(({ course, reasonFa, reasonEn, clusterTitleFa }) => (
              <RecommendationCard
                key={course.id}
                course={course}
                reasonFa={reasonFa}
                reasonEn={reasonEn}
                clusterTitleFa={clusterTitleFa}
                lang={lang}
                status={progress.courseStatuses[course.id] || 'NOT_TAKEN'}
                isBookmarked={bookmarkedIds.includes(course.id)}
                onUpdateStatus={onUpdateStatus}
                onToggleBookmark={onToggleBookmark}
                onOpenCourseModal={onOpenCourseModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Exportable Clusters Container */}
      <div id="knowledge-clusters-overview-card" className="bg-slate-50/50 dark:bg-slate-950/20 p-2 sm:p-4 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'All 17 Specialization Tracks Progress' : '۱۷ گرایش تخصصی برنامه درسی'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedClusters.map(({ cluster, percentage, projectedPercentage, passedCoursesCount, inProgressCoursesCount, totalCoursesCount }) => {
            const isTarget = targetClusterIds.includes(cluster.id);
            const isInfoOpen = activeInfoCluster === cluster.id;

            return (
              <div
                key={cluster.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200 shadow-xs flex flex-col justify-between relative ${
                  isTarget
                    ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20 dark:bg-indigo-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        {iconMap[cluster.iconName || 'Cpu'] || <Cpu className="w-5 h-5 text-indigo-500" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span>{lang === 'en' ? cluster.titleEn : cluster.titleFa}</span>
                          <button
                            type="button"
                            onClick={() => setActiveInfoCluster(isInfoOpen ? null : cluster.id)}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition"
                            title={lang === 'en' ? 'Show track description' : 'توضیحات گرایش'}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          {isTarget && (
                            <span className="p-0.5 bg-amber-400/20 text-amber-600 dark:text-amber-300 rounded" title="گرایش هدف شما">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleTargetCluster(cluster.id)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition shrink-0 ${
                        isTarget
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isTarget ? (lang === 'en' ? 'Selected ✓' : 'هدف انتخابی ✓') : (lang === 'en' ? '+ Target' : '+ انتخاب هدف')}
                    </button>
                  </div>

                  {/* Info Modal/Popover if clicked */}
                  {isInfoOpen && (
                    <div className="bg-indigo-50/90 dark:bg-slate-800 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-700 text-xs text-slate-700 dark:text-slate-200 relative animate-in fade-in duration-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                        <span>{lang === 'en' ? 'Track Info:' : 'درباره این گرایش:'}</span>
                        <button
                          onClick={() => setActiveInfoCluster(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {lang === 'en' ? cluster.descriptionEn : cluster.descriptionFa}
                      </p>
                    </div>
                  )}

                  {/* Dual Stacked Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {percentage}% {lang === 'en' ? 'passed' : 'پاس شده'}
                        {inProgressCoursesCount > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold mr-1">
                            (+{projectedPercentage - percentage}% {lang === 'en' ? 'enrolled' : 'اخذ شده'})
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {passedCoursesCount} {inProgressCoursesCount > 0 && <span className="text-amber-600 dark:text-amber-400 font-bold">({inProgressCoursesCount}+)</span>} / {totalCoursesCount} {lang === 'en' ? 'passed' : 'درس'}
                      </span>
                    </div>

                    <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      {/* Projected light layer for in-progress courses */}
                      {inProgressCoursesCount > 0 && (
                        <div
                          className="absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full bg-amber-300/80 dark:bg-amber-500/50 transition-all duration-500 rounded-full"
                          style={{ width: `${projectedPercentage}%` }}
                          title={`پیش‌بینی: ${passedCoursesCount + inProgressCoursesCount} از ${totalCoursesCount} درس`}
                        />
                      )}
                      {/* Solid passed layer */}
                      <div
                        className={`absolute top-0 rtl:right-0 rtl:left-auto ltr:left-0 ltr:right-auto h-full transition-all duration-500 rounded-full z-10 ${
                          percentage === 100
                            ? 'bg-emerald-500'
                            : percentage >= 50
                            ? 'bg-indigo-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                        title={`پاس شده: ${passedCoursesCount} از ${totalCoursesCount} درس`}
                      />
                    </div>
                  </div>

                  {/* Courses List in Cluster */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {lang === 'en' ? 'Cluster Basket Courses:' : 'دروس این سبد دانشی:'}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cluster.courseIds.map((cId) => {
                        const course = getCourseById(cId);
                        if (!course) return null;
                        const status = progress.courseStatuses[cId] || 'NOT_TAKEN';

                        return (
                          <button
                            key={cId}
                            onClick={() => onOpenCourseModal(course)}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                              status === 'PASSED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : status === 'IN_PROGRESS'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {status === 'PASSED' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            <span>{lang === 'en' ? course.titleEn : course.titleFa}</span>
                          </button>
                        );
                      })}
                    </div>

                    {cluster.extraCoursesTextFa && (
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium italic mt-1">
                        {lang === 'en' ? cluster.extraCoursesTextEn : cluster.extraCoursesTextFa}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

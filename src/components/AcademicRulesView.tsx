import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface AcademicRulesViewProps {
  lang: 'fa' | 'en' | 'dual';
}

export const AcademicRulesView: React.FC<AcademicRulesViewProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  return (
    <div className="space-y-6">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono tracking-wider font-bold text-indigo-400 uppercase">
                {lang === 'en' ? 'Official Curriculum Guidelines' : 'دستورالعمل‌ها و آیین‌نامه‌های آموزشی'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {lang === 'en'
                ? 'Academic Rules, Prerequisites & Curriculum Notes'
                : 'قوانین و نکات مهم آموزشی و آیین‌نامه مقطع کارشناسی'}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Comprehensive guide to course load limits, probation conditions, general education groups, prerequisite rules, and graduation requirements based on Sharif CE regulations.'
                : 'راهنمای جامع آیین‌نامه آموزشی، سقف مجاز واحدها، شرایط مشروطی، گروه‌بندی دروس عمومی، قوانین پیش‌نیاز/همنیاز و ضوابط فارغ‌التحصیلی دانشگاه شریف.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'en' ? '140 Total Graduation Credits' : 'مجموع ۱۴۰ واحد فارغ‌التحصیلی'}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Clock className="w-4 h-4" />
              <span>{lang === 'en' ? 'Max 8 Regular Terms' : 'سقف مجاز سنوات: ۸ ترم'}</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Award className="w-4 h-4" />
              <span>{lang === 'en' ? 'Min Cumulative GPA: 12.00' : 'حداقل معدل کل فارغ‌التحصیلی: ۱۲.۰۰'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', titleFa: 'همه قوانین', titleEn: 'All Rules', icon: Scale },
          { id: 'credits', titleFa: 'سقف و کف واحدها', titleEn: 'Credit Limits', icon: Clock },
          { id: 'probation', titleFa: 'مشروطی و افت تحصیلی', titleEn: 'Probation & Dismissal', icon: ShieldAlert },
          { id: 'general', titleFa: 'گروه‌بندی دروس عمومی', titleEn: 'General Education Groups', icon: Layers },
          { id: 'prereqs', titleFa: 'پیش‌نیاز و همنیازها', titleEn: 'Prerequisites & Coreqs', icon: AlertOctagon },
          { id: 'equivalencies', titleFa: 'تطبیق و معادلسازی دروس', titleEn: 'Course Equivalencies', icon: Sparkles },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-2 whitespace-nowrap border ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{lang === 'en' ? tab.titleEn : tab.titleFa}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid of Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Credit Limits & Semester Load */}
        {(activeCategory === 'all' || activeCategory === 'credits') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Semester Credit Load Limits' : 'سقف و کف واحد انتخاب شده در هر ترم'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Minimum and maximum credit allowed based on GPA' : 'ضوابط حداقل و حداکثر تعداد واحد قابل اخذ بر اساس معدل'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  • {lang === 'en' ? 'Standard Load: 12 to 20 Credits' : 'حالت عادی: حداقل ۱۲ و حداکثر ۲۰ واحد'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Every student must take at least 12 credits per regular semester and no more than 20 credits.'
                    : 'دانشجو در هر نیمسال تحصیلی عادی موظف است حداقل ۱۲ و حداکثر ۲۰ واحد درسی اخذ نماید.'}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Honor Students (GPA ≥ 17.00): Up to 24 Credits' : 'دانشجویان ممتاز (معدل بالای ۱۷): تا ۲۴ واحد'}</span>
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'If the previous semester GPA is 17.00 or higher, the student may register for up to 24 credits.'
                    : 'دانشجویانی که معدل نیمسال قبل آن‌ها ۱۷ یا بالاتر باشد، می‌توانند در ترم بعد تا ۲۴ واحد درسی اخذ کنند.'}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Probationary Students (GPA < 12.00): Max 14 Credits' : 'دانشجویان مشروط (معدل زیر ۱۲): حداکثر ۱۴ واحد'}</span>
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Students on academic probation cannot register for more than 14 credits in the following semester.'
                    : 'دانشجویی که در یک نیمسال مشروط شده باشد، در ترم بعد مجاز به اخذ بیش از ۱۴ واحد درسی نمی‌باشد.'}
                </p>
              </div>

              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                <span className="font-bold text-indigo-800 dark:text-indigo-300 block">
                  • {lang === 'en' ? 'Final Term Exemption: Up to 24 Credits' : 'ترم آخر: تا ۲۴ واحد مجاز بدون توجه به معدل'}
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'In the final semester before graduation, if up to 24 credits remain, student can take all 24 credits.'
                    : 'اگر دانشجو برای فارغ‌التحصیلی حداکثر ۲۴ واحد باقی‌مانده داشته باشد، در ترم آخر می‌تواند تمامی ۲۴ واحد را اخذ نماید.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Probation & Academic Regulations */}
        {(activeCategory === 'all' || activeCategory === 'probation') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Probation & Dismissal Rules' : 'قوانین مشروطی و وضعیت تحصیلی'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Consequences of semester GPA below 12.00' : 'ضوابط معدل زیر ۱۲ و سقف مشروطی مجاز'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-1">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">
                  ⚠️ {lang === 'en' ? 'Probation Threshold: Semester GPA < 12.00' : 'تعریف مشروطی: معدل ترم کمتر از ۱۲.۰۰'}
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'If a student obtains a semester GPA below 12.00, they are placed on academic probation.'
                    : 'چنانچه میانگین نمرات دانشجو در هر نیمسال تحصیلی کمتر از ۱۲ باشد، در آن نیمسال مشروط محسوب می‌شود.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  • {lang === 'en' ? 'Max Probation Limit: 3 Consecutive or 4 Total' : 'سقف مجاز مشروطی: ۳ ترم متوالی یا ۴ ترم متناوب'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Students who are probated for 3 consecutive semesters or 4 non-consecutive semesters are subject to academic dismissal unless granted commission extension.'
                    : 'حداکثر مشروطی مجاز در مقطع کارشناسی ۳ نیمسال متوالی یا ۴ نیمسال متناوب است. در صورت فراتر رفتن، پرونده به کمیسیون موارد خاص ارجاع می‌شود.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  • {lang === 'en' ? 'Minimum Passing Grade per Course: 10 out of 20' : 'حداقل نمره‌ی قبولی هر درس: ۱۰ از ۲۰'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'The minimum grade required to pass any course is 10. Failed courses must be retaken.'
                    : 'حداقل نمره‌ی قبولی در هر درس ۱۰ می‌باشد. در صورت اخذ نمره‌ی زیر ۱۰، درس افتاده و باید مجدداً اخذ شود.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. General Education Groups (دروس عمومی) */}
        {(activeCategory === 'all' || activeCategory === 'general') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'en' ? 'General Education Requirements Breakdown (20 Credits Total)' : 'دستورالعمل و گروه‌بندی دروس عمومی (۲۰ واحد کامل)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en'
                      ? '6 compulsory core courses + 1 course from each of the 5 general subject categories'
                      : '۶ درس الزامی ثابت + انتخاب ۱ درس از هر یک از ۵ گروه موضوعی عمومی'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800">
                20 Credits
              </span>
            </div>

            {/* Mandatory Fixed Courses */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'en' ? '1. Mandatory Fixed Core Courses (10 Credits):' : '۱. دروس الزامی ثابت عمومی (۱۰ واحد):'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '31119 - General Persian' : '31119 - فارسی عمومی'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '3 Credits (Persian Literature)' : '۳ واحد (آشنایی با ادبیات فارسی)'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '31123 - General English' : '31123 - زبان خارجی عمومی'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '3 Credits (General English)' : '۳ واحد (General English)'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '30003 - Physical Education' : '30003 - تربیت بدنی'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '1 Credit' : '۱ واحد'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '30004 - Physical Education 2' : '30004 - ورزش ۱'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '1 Credit (Pre: PE 1)' : '۱ واحد (پیش‌نیاز: تربیت بدنی)'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '37514 - Family & Population' : '37514 - دانش خانواده و جمعیت'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '2 Credits' : '۲ واحد'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white block">{lang === 'en' ? '37445 - Islamic Thought 1' : '37445 - اندیشه اسلامی ۱'}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'en' ? '2 Credits' : '۲ واحد'}</span>
                </div>
              </div>
            </div>

            {/* 5 Selective Groups */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>{lang === 'en' ? '2. Selective Subject Groups (Select 1 course from EACH group - 10 Credits total):' : '۲. گروه‌های پنج‌گانه انتخابی (اختیار ۱ درس از هر گروه - ۱۰ واحد مجموعاً):'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{lang === 'en' ? 'Group 1: Theoretical Foundations of Islam' : 'گروه ۱: مبانی نظری اسلام'}</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li>37446 - {lang === 'en' ? 'Islamic Thought 2 (Pre: Thought 1)' : 'اندیشه اسلامی ۲ (پیش‌نیاز: اندیشه ۱)'}</li>
                    <li>37447 - {lang === 'en' ? 'Human in Islam' : 'انسان در اسلام'}</li>
                    <li>37448 - {lang === 'en' ? 'Social & Political Rights in Islam' : 'حقوق اجتماعی و سیاسی در اسلام'}</li>
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{lang === 'en' ? 'Group 2: Ethics & Islamic Training' : 'گروه ۲: اخلاق و تربیت اسلامی'}</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li>37123 - {lang === 'en' ? 'Islamic Ethics' : 'اخلاق اسلامی'}</li>
                    <li>37126 - {lang === 'en' ? 'Philosophy of Ethics' : 'فلسفه اخلاق'}</li>
                    <li>37127 - {lang === 'en' ? 'Life Regulations (Applied Ethics)' : 'آیین زندگی (اخلاق کاربردی)'}</li>
                    <li>37128 - {lang === 'en' ? 'Practical Mysticism in Islam' : 'عرفان عملی در اسلام'}</li>
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{lang === 'en' ? 'Group 3: Islamic Revolution & Roots' : 'گروه ۳: انقلاب اسلامی و ریشه‌ها'}</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li>37626 - {lang === 'en' ? 'Islamic Revolution of Iran' : 'انقلاب اسلامی ایران'}</li>
                    <li>37627 - {lang === 'en' ? 'Constitutional Law' : 'آشنایی با قانون اساسی'}</li>
                    <li>37628 - {lang === 'en' ? 'Political Thought of Imam Khomeini' : 'اندیشه سیاسی امام خمینی'}</li>
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{lang === 'en' ? 'Group 4: History & Islamic Civilization' : 'گروه ۴: تاریخ و تمدن اسلامی'}</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li>37618 - {lang === 'en' ? 'History of Islamic Culture & Civ.' : 'تاریخ فرهنگ و تمدن اسلام'}</li>
                    <li>37634 - {lang === 'en' ? 'Sacred Defense Studies' : 'آشنایی با دفاع مقدس'}</li>
                    <li>37620 - {lang === 'en' ? 'Analytical History of Early Islam' : 'تاریخ تحلیلی صدر اسلام'}</li>
                    <li>37612 - {lang === 'en' ? 'History of Islam / Imamate' : 'تاریخ اسلام / تاریخ امامت'}</li>
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1 md:col-span-2">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 block">{lang === 'en' ? 'Group 5: Islamic Texts & Quran' : 'گروه ۵: آشنایی با متون اسلامی و قرآن'}</span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li>37489 - {lang === 'en' ? 'Thematic Quranic Exegesis' : 'تفسیر موضوعی قرآن'}</li>
                    <li>37490 - {lang === 'en' ? 'Thematic Nahj al-Balagha' : 'تفسیر موضوعی نهج‌البلاغه'}</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 4. Prerequisite & Corequisite Rules */}
        {(activeCategory === 'all' || activeCategory === 'prereqs') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Prerequisite & Corequisite Enforcement' : 'قوانین پیش‌نیاز و هم‌نیاز درسی'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Chain dependencies and concurrent registration' : 'توالی دروس و ضوابط اخذ همزمان'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  • {lang === 'en' ? 'Prerequisites' : 'پیش‌نیاز:'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Must be passed (grade >= 10) in a prior semester before taking the course.'
                    : 'درسی که باید حتماً در ترم‌های قبلی با نمره ۱۰ یا بالاتر پاس شده باشد تا درس بعدی قابل اخذ گردد.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  • {lang === 'en' ? 'Corequisites' : 'هم‌نیاز:'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Can be taken concurrently in the same semester or passed in a prior semester.'
                    : 'درسی که می‌توان آن را همزمان در همان ترم یا قبل‌تر اخذ نمود (مثلاً آزمایشگاه هم‌نیاز با درس نظری).'}
                </p>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  • {lang === 'en' ? 'Prerequisite Waiver Rule (Failing once)' : 'قوانین رفع پیش‌نیاز:'}
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'If a student fails a prerequisite course once, they can take it concurrently with the dependent course in a subsequent semester.'
                    : 'در صورتی که دانشجو در یک درس پیش‌نیاز شرکت نموده و آن را رد شود (افتاده باشد)، می‌تواند در ترم بعد آن درس را همراه با درس بعدی به صورت هم‌نیاز اخذ نماید.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Course Equivalencies */}
        {(activeCategory === 'all' || activeCategory === 'equivalencies') && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'en' ? 'Course Equivalencies & Alternatives' : 'جدول تطبیق و دروس جایگزین'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Official equivalent course choices' : 'دروس معادل که به جای یکدیگر قابل اخذ هستند'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  1. {lang === 'en' ? 'Linear Algebra (40282) ↔ Engineering Math (22035)' : 'جبر خطی (۴۰۲۸۲) ↔ ریاضی مهندسی (۲۲۰۳۵)'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Engineering Mathematics (22035) can be taken as an authorized replacement for Linear Algebra (40282).'
                    : 'دانشجویان می‌توانند درس ریاضی مهندسی (۲۲۰۳۵) را به جای جبر خطی (۴۰۲۸۲) اخذ و پاس نمایند.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  2. {lang === 'en' ? 'Web Programming (40419) ↔ Mobile Programming (40429)' : 'برنامه‌سازی وب (۴۰۴۱۹) ↔ برنامه‌سازی موبایل (۴۰۴۲۹)'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'These two courses are equivalent electives, fulfilling the same elective credit requirement.'
                    : 'این دو درس با یکدیگر معادل بوده و اخذ یکی از آن‌ها نیاز به گذراندن دیگری را مرتفع می‌کند.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  3. {lang === 'en' ? 'Object-Oriented Design (40484) ↔ Agile Software Dev (40475)' : 'طراحی شیء‌گرای سیستم‌ها (۴۰۴۸۴) ↔ ایجاد چابک نرم‌افزار (۴۰۴۷۵)'}
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'en'
                    ? 'Agile Software Development can be counted in place of Object-Oriented System Design.'
                    : 'درس ایجاد چابک نرم‌افزار با درس طراحی شیء‌گرا قابل تطبیق و معادل‌سازی می‌باشد.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Official Footnote / Source Reference */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-950 dark:text-indigo-200">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {lang === 'en' ? 'Official Reference Links:' : 'مراجع و مستندات رسمی آیین‌نامه:'}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] pt-1">
            <a
              href="https://docs.ce.sharif.edu/programs/bs-ce"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-300 font-semibold underline hover:text-indigo-800"
            >
              • {lang === 'en' ? 'Sharif CE Curriculum Docs' : 'مستندات چارت مهندسی کامپیوتر شریف'}
            </a>
            <a
              href="https://docs.ce.sharif.edu/programs/bs-general"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-300 font-semibold underline hover:text-indigo-800"
            >
              • {lang === 'en' ? 'General Education Guidelines' : 'دستورالعمل دروس عمومی دانشکده'}
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { Github, Mail, Send, Sparkles, CheckSquare, Info } from 'lucide-react';

interface AboutViewProps {
  lang: 'fa' | 'en';
}

export const AboutView: React.FC<AboutViewProps> = ({ lang }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-2">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {lang === 'en' ? 'About Project' : 'درباره پروژه'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'en' ? 'Computer Engineering Course & Curriculum Planner' : 'سامانه برنامه‌ریزی دروس و چارت مهندسی کامپیوتر'}
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {lang === 'en'
            ? 'This is a lightweight tool designed to streamline term planning and course tracking for Computer Engineering students based on the 1400+ curriculum. Course titles and specifications may be subject to future institutional updates.'
            : 'این ابزار برای راحت‌تر کردن برنامه‌ریزی ترم‌های دانشجویان مهندسی کامپیوتر بر اساس چارت مصوب ورودی‌های ۱۴۰۰ به بعد ساخته شده است. توجه داشته باشید که ممکن است عناوین و مشخصات برخی درس‌ها در آیین‌نامه‌ها تغییر کند.'}
        </p>

        {/* AI Coding Badge */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            {lang === 'en'
              ? 'This project was entirely coded using Artificial Intelligence (AI).'
              : 'این پروژه تماماً با AI کدزنی و توسعه داده شده است.'}
          </span>
        </div>
      </div>

      {/* TO-DO Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3>{lang === 'en' ? 'Project TO-DO' : 'TO-DO'}</h3>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-indigo-500 font-bold">•</span>
            <span>
              {lang === 'en'
                ? 'Expand and adapt this platform for other academic majors.'
                : 'می‌توانیم این پروژه را برای بقیه رشته‌ها نیز توسعه دهیم.'}
            </span>
          </li>
        </ul>
      </div>

      {/* Contact & Links */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {lang === 'en' ? 'Contact & Feedback' : 'ارتباط و پیشنهادات'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {lang === 'en'
              ? 'If you encounter any bugs, have feature requests for other academic majors, or have any other feedback, feel free to reach out via the contacts below:'
              : 'اگر خواستید باگ را گزارش دهید، یا اگر پیشنهاد توسعه برای بقیه رشته‌ها یا هر نوع پیشنهاد دیگری داشتید، خوشحال می‌شوم از راه‌های ارتباطی زیر اطلاع دهید:'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Telegram */}
          <a
            href="https://t.me/arumakan0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">{lang === 'en' ? 'Telegram' : 'تلگرام'}</div>
              <div className="text-slate-500 dir-ltr text-[11px]">@arumakan0</div>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:ar1umak1an@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition group"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-xs overflow-hidden">
              <div className="font-semibold">{lang === 'en' ? 'Email' : 'ایمیل'}</div>
              <div className="text-slate-500 dir-ltr text-[11px] truncate">ar1umak1an@gmail.com</div>
            </div>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/arumakanGIT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition group"
          >
            <div className="p-2 rounded-lg bg-slate-900/10 dark:bg-slate-100/10 text-slate-900 dark:text-slate-100 group-hover:scale-105 transition-transform">
              <Github className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-semibold">{lang === 'en' ? 'GitHub' : 'گیتهاب'}</div>
              <div className="text-slate-500 dir-ltr text-[11px]">arumakanGIT</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, Copy, MessageCircle, Share2, Twitter, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReferralCard: React.FC = () => {
  const { currentCustomer, settings, language, t, triggerToast } = useApp();
  const [copied, setCopied] = useState(false);
  const isAr = language === 'ar';

  if (!currentCustomer) return null;

  const referralCode = currentCustomer.referralCode;
  const inviteLink = `${window.location.origin}?ref=${referralCode}`;
  const shareText = isAr
    ? `☕ انضم معي لبرنامج ولاء ${settings.shopNameAr} واجمع أختام القهوة لتحصل على مشروبات مجانية! استخدم رمز دعوتي: ${referralCode}`
    : `☕ Join me at ${settings.shopNameEn} Loyalty Club, collect coffee stamps & get free drinks! Use my referral code: ${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    triggerToast(t('linkCopied'));
    setTimeout(() => setCopied(false), 3000);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + inviteLink)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(inviteLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {t('referralTitle')}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t('referralRewardPerFriend', { stamps: settings.referralRewardStamps || 2 })}
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
        {t('referralDesc')}
      </p>

      {/* Code Box */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
            {t('yourReferralCode')}
          </span>
          <span className="text-base font-mono font-extrabold text-amber-600 dark:text-amber-400">
            {referralCode}
          </span>
        </div>

        <button
          type="button"
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-bold hover:opacity-90 transition active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? (isAr ? 'تم النسخ' : 'Copied!') : t('copyLink')}</span>
        </button>
      </div>

      {/* Social Media Sharing Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t('shareViaWhatsapp')}</span>
        </button>

        <button
          type="button"
          onClick={shareTwitter}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-xs active:scale-95"
        >
          <Twitter className="w-4 h-4" />
          <span>{t('shareViaTwitter')}</span>
        </button>
      </div>

      {/* Referral Count stats */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
        <span>{t('totalReferred')}:</span>
        <span className="font-bold text-stone-900 dark:text-stone-100">
          {currentCustomer.referralCount || 0} {isAr ? 'صديق' : 'friends'}
        </span>
      </div>
    </div>
  );
};

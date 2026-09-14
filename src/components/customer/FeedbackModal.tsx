import React, { useState } from 'react';
import { Coffee, MessageSquare, Sparkles, Star, ThumbsUp, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { currentCustomer, submitFeedback, settings, language, t } = useApp();
  const [quality, setQuality] = useState(5);
  const [service, setService] = useState(5);
  const [ambiance, setAmbiance] = useState(5);
  const [speed, setSpeed] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isAr = language === 'ar';

  if (!isOpen || !currentCustomer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(currentCustomer.id, { quality, service, ambiance, speed }, comment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 text-cyan-400 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-cyan-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ThumbsUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'شكراً لمشاركتنا رأيك!' : 'Thank you for your feedback!'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {t('feedbackThanks', { points: settings.surveyRewardPoints || 25 })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t('feedbackTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('feedbackSubtitle', { points: settings.surveyRewardPoints || 25 })}
                </p>
              </div>
            </div>

            {/* Rating criteria */}
            <div className="space-y-3.5 my-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{t('qualityRating')}</span>
                {renderStars(quality, setQuality)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{t('serviceRating')}</span>
                {renderStars(service, setService)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{t('ambianceRating')}</span>
                {renderStars(ambiance, setAmbiance)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{t('speedRating')}</span>
                {renderStars(speed, setSpeed)}
              </div>
            </div>

            {/* Feedback textarea */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('comments')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('commentsPlaceholder')}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('submitFeedback')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

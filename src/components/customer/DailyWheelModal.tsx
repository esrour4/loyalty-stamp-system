import React, { useState } from 'react';
import { Award, Coffee, Gift, RotateCcw, Smile, Sparkles, Trophy, X } from 'lucide-react';
import { useApp, DEFAULT_WHEEL_SECTORS } from '../../context/AppContext';
import { WheelSector } from '../../types';

interface DailyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyWheelModal: React.FC<DailyWheelModalProps> = ({ isOpen, onClose }) => {
  const { currentCustomer, spinWheel, language, t, settings } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinOutcome, setSpinOutcome] = useState<{
    prize: string;
    isWinning: boolean;
    remainingSpins: number;
  } | null>(null);

  const isAr = language === 'ar';

  if (!isOpen || !currentCustomer) return null;

  const wheelConfig = settings.wheel || { enabled: true, spinsPerDay: 1, sectors: DEFAULT_WHEEL_SECTORS };
  const sectors: WheelSector[] =
    wheelConfig.sectors && wheelConfig.sectors.length > 0
      ? wheelConfig.sectors
      : DEFAULT_WHEEL_SECTORS;

  const todayStr = new Date().toISOString().split('T')[0];
  const maxSpins = wheelConfig.spinsPerDay || 1;
  const spinsUsedToday =
    currentCustomer.lastSpinDate === todayStr ? (currentCustomer.spinsCountToday || 0) : 0;
  const spinsLeft = Math.max(0, maxSpins - spinsUsedToday);
  const isOutOfSpins = spinsLeft <= 0;

  const handleSpin = () => {
    if (spinning || isOutOfSpins || !wheelConfig.enabled) return;

    // Call spinWheel to determine the result
    const result = spinWheel(currentCustomer.id);
    if (!result.success && result.error) {
      return;
    }

    setSpinning(true);
    setSpinOutcome(null);

    // Calculate exact target angle for the chosen sector
    const numSectors = sectors.length;
    const sliceAngle = 360 / numSectors;
    const chosenIndex = result.sectorIndex;
    const midAngle = (chosenIndex + 0.5) * sliceAngle;

    // Pointer is at Top (270 degrees in standard Cartesian SVG)
    const targetMod = (270 - midAngle) % 360;
    const normalizedTarget = (targetMod + 360) % 360;
    const currentMod = rotation % 360;
    const delta = (normalizedTarget - currentMod + 360) % 360;
    const fullSpins = 360 * 5; // 5 full rotations for suspense
    const nextRotation = rotation + fullSpins + delta;

    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      setSpinOutcome({
        prize: result.prize,
        isWinning: result.isWinning,
        remainingSpins: result.remainingSpinsToday,
      });
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 text-white shadow-2xl text-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition disabled:opacity-30 z-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-400 text-xs font-bold mb-2 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('spinWheelTitle')}</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">
            {isAr ? 'عجلة الحظ ومكافآت القهوة' : 'Daily Fortune Coffee Wheel'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? `لديك ${maxSpins} ${maxSpins === 1 ? 'محاولة' : 'محاولات'} يومياً للفوز بجوائز فورية وكوبونات!`
              : `You have ${maxSpins} ${maxSpins === 1 ? 'spin' : 'spins'} per day for instant rewards & coupons!`}
          </p>

          {/* Spins badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <span>
              {isAr
                ? `المحاولات المتبقية اليوم: ${spinsLeft} من ${maxSpins}`
                : `Spins Remaining Today: ${spinsLeft} / ${maxSpins}`}
            </span>
          </div>
        </div>

        {/* Wheel Graphic Container */}
        <div className="relative w-64 h-64 mx-auto my-5 flex items-center justify-center">
          {/* Wheel Pointer Indicator */}
          <div className="absolute -top-3 z-30 transform -translate-x-1/2 left-1/2">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full shadow-2xl transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? '4.2s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.12, 0.95, 0.18, 1)',
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full rounded-full">
              <g transform="translate(100, 100)">
                {sectors.map((sector, i) => {
                  const numSectors = sectors.length;
                  const angle = 360 / numSectors;
                  const startAngle = (i * angle * Math.PI) / 180;
                  const endAngle = ((i + 1) * angle * Math.PI) / 180;
                  const x1 = 98 * Math.cos(startAngle);
                  const y1 = 98 * Math.sin(startAngle);
                  const x2 = 98 * Math.cos(endAngle);
                  const y2 = 98 * Math.sin(endAngle);

                  const midAngleRad = (i * angle + angle / 2) * (Math.PI / 180);
                  const textX = 58 * Math.cos(midAngleRad);
                  const textY = 58 * Math.sin(midAngleRad);

                  return (
                    <g key={sector.id || i}>
                      <path
                        d={`M 0 0 L ${x1} ${y1} A 98 98 0 0 1 ${x2} ${y2} Z`}
                        fill={sector.color || '#78350f'}
                        stroke="#1c130e"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize={numSectors > 8 ? '6' : '7'}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${i * angle + angle / 2}, ${textX}, ${textY})`}
                      >
                        {isAr ? sector.labelAr : sector.labelEn}
                      </text>
                    </g>
                  );
                })}
                {/* Center Core */}
                <circle r="22" fill="#1c130e" stroke="#fbbf24" strokeWidth="3" />
                <circle r="8" fill="#fbbf24" />
              </g>
            </svg>
          </div>
        </div>

        {/* Spin Outcome Feedback Box */}
        {spinOutcome && (
          <div
            className={`p-4 rounded-2xl mb-4 animate-in fade-in zoom-in duration-300 border text-center ${
              spinOutcome.isWinning
                ? 'bg-indigo-500/20 border-indigo-400/60 text-amber-100'
                : 'bg-slate-800/90 border-slate-600 text-slate-200'
            }`}
          >
            {spinOutcome.isWinning ? (
              <>
                <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-1 animate-bounce" />
                <p className="text-sm font-bold text-cyan-300">{t('spinWonTitle')}</p>
                <p className="text-base font-extrabold text-white mt-0.5">{spinOutcome.prize}</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  {isAr ? 'تمت إضافة الجائزة والكوبون إلى محفظتك بنجاح!' : 'Prize & Coupon added to your wallet!'}
                </p>
              </>
            ) : (
              <>
                <Coffee className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-slate-100">
                  {isAr ? 'حظ أوفر المرة القادمة!' : 'Better Luck Next Time!'}
                </p>
                <p className="text-xs text-cyan-300 font-semibold mt-0.5">{spinOutcome.prize}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isAr
                    ? 'شكراً لزيارتك! استمتع بفنجان قهوتك اليوم وتفضل بزيارتنا غداً ☕'
                    : 'Thank you for visiting! Enjoy your fresh cup of coffee today ☕'}
                </p>
              </>
            )}
          </div>
        )}

        {/* Action Controls */}
        {!wheelConfig.enabled ? (
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-xs">
            <p>{isAr ? 'عجلة الحظ غير مفعّلة حالياً من قبل إدارة المقهى.' : 'The Fortune Wheel is currently inactive.'}</p>
          </div>
        ) : isOutOfSpins && !spinning ? (
          <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-slate-400 text-xs space-y-1">
            <RotateCcw className="w-4 h-4 mx-auto text-slate-500" />
            <p className="font-semibold text-slate-300">
              {isAr ? 'استنفدت جميع محاولات التدوير لليوم' : 'All spins used for today'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? `لديك ${maxSpins} ${maxSpins === 1 ? 'محاولة' : 'محاولات'} كل يوم. ننتظرك غداً لمزيد من الجوائز!`
                : `Next ${maxSpins} spins will reset tomorrow. See you then!`}
            </p>
          </div>
        ) : (
          <button
            type="button"
            id="spin-wheel-action-btn"
            onClick={handleSpin}
            disabled={spinning}
            className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-amber-500 hover:to-amber-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
            <span>
              {spinning
                ? t('spinning')
                : spinOutcome && spinsLeft > 0
                ? (isAr ? `تدوير مجدداً (متبقي ${spinsLeft})` : `Spin Again (${spinsLeft} left)`)
                : t('spinBtn')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

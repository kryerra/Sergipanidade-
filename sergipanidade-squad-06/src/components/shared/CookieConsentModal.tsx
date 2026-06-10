import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { Switch } from '@/components/ui/switch';
import { translations } from '@/constants/translations';
import { CookiePreferences } from '@/services/cache.service';

interface CookieConsentModalProps {
  isOpen: boolean;
  language: 'pt' | 'en' | 'es' | 'sp';
  defaultPreferences?: CookiePreferences | null;
  onSave: (consent: CookiePreferences) => void;
  onAcceptAll: () => void;
}

export function CookieConsentModal({
  isOpen,
  language,
  defaultPreferences,
  onSave,
  onAcceptAll,
}: CookieConsentModalProps) {
  const [performance, setPerformance] = useState(defaultPreferences?.performance ?? false);
  const [analytics, setAnalytics] = useState(defaultPreferences?.analytics ?? false);
  const t = translations[language];

  useEffect(() => {
    if (!isOpen) return;
    setPerformance(defaultPreferences?.performance ?? false);
    setAnalytics(defaultPreferences?.analytics ?? false);
  }, [defaultPreferences, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start gap-4">
          <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#0D7377]" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-semibold text-[#111111]">{t.cookieModalTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-[#4A4A4A]">{t.cookieModalDescription}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[#111111]">{t.cookieRequiredLabel}</p>
                <p className="mt-2 text-sm text-[#555555]">{t.cookieRequiredInfo}</p>
              </div>
              <span className="inline-flex h-9 items-center justify-center rounded-full bg-[#0D7377] px-3 text-xs font-semibold text-white">
                {t.cookieRequiredOn}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#111111]">{t.cookiePerformanceLabel}</p>
                <p className="mt-2 text-sm text-[#555555]">{t.cookiePerformanceInfo}</p>
              </div>
              <Switch checked={performance} onCheckedChange={(value) => setPerformance(!!value)} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[#111111]">{t.cookieAnalyticsLabel}</p>
                <p className="mt-2 text-sm text-[#555555]">{t.cookieAnalyticsInfo}</p>
              </div>
              <Switch checked={analytics} onCheckedChange={(value) => setAnalytics(!!value)} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton
            fullWidth
            onClick={() => {
              setPerformance(false);
              setAnalytics(false);
              onSave({ required: true, performance: false, analytics: false });
            }}
          >
            {t.cookieModalOnlyRequired}
          </SecondaryButton>
          <SecondaryButton
            fullWidth
            onClick={() => onSave({ required: true, performance, analytics })}
          >
            {t.cookieModalSave}
          </SecondaryButton>
          <PrimaryButton
            fullWidth
            onClick={() => {
              setPerformance(true);
              setAnalytics(true);
              onAcceptAll();
            }}
          >
            {t.cookieModalAcceptAll}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

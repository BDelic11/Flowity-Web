"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CalendarDays,
  MessageCircle,
  Scissors,
  Boxes,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";

type Slide = {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descKey: string;
};

const SLIDES: Slide[] = [
  { icon: Sparkles,     titleKey: "onboarding.welcome.title",  descKey: "onboarding.welcome.desc"  },
  { icon: CalendarDays, titleKey: "onboarding.calendar.title", descKey: "onboarding.calendar.desc" },
  { icon: MessageCircle,titleKey: "onboarding.whatsapp.title", descKey: "onboarding.whatsapp.desc" },
  { icon: Scissors,     titleKey: "onboarding.services.title", descKey: "onboarding.services.desc" },
  { icon: Boxes,        titleKey: "onboarding.products.title", descKey: "onboarding.products.desc" },
  { icon: Rocket,       titleKey: "onboarding.ready.title",    descKey: "onboarding.ready.desc"    },
];

const STORAGE_KEY = "flowity:onboarding-completed";

export function shouldShowOnboarding(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const completed: string[] = JSON.parse(raw);
    return !completed.includes(userId);
  } catch {
    return true;
  }
}

export function markOnboardingCompleted(userId: string | undefined) {
  if (!userId || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const completed: string[] = raw ? JSON.parse(raw) : [];
    if (!completed.includes(userId)) {
      completed.push(userId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  } catch {
    // ignore
  }
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function OnboardingDialog({ open, onClose }: Props) {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const Icon = slide.icon;

  function handleNext() {
    if (isLast) onClose();
    else setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[520px] overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{t(slide.titleKey)}</DialogTitle>
        <DialogDescription className="sr-only">{t(slide.descKey)}</DialogDescription>

        <div className="relative flex h-24 items-center justify-center border-b bg-muted/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {t("onboarding.skip")}
          </button>
        </div>

        <div className="px-8 pb-7 pt-7">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t(slide.titleKey)}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-foreground/80">
            {t(slide.descKey)}
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {SLIDES.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("onboarding.back")}
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} / {SLIDES.length}
            </span>

            <Button onClick={handleNext} size="sm">
              {isLast ? t("onboarding.done") : t("onboarding.next")}
              {!isLast && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

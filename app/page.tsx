"use client";
import { useState, useEffect, useRef } from "react";
import { analyzeReport } from "@/app/actions/analyze-report";
import { Header } from "@/components/header";
import { UploadArea } from "@/components/upload-area";
import { ResultsDashboard } from "@/components/results-dashboard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { type AnalysisResult } from "@/lib/types";

// Messages shown at different time thresholds (seconds remaining)
const LOADING_STAGES: { threshold: number; message: string; sub: string }[] = [
  {
    threshold: 60,
    message: "Sending report to AI...",
    sub: "Uploading your PDF for analysis",
  },
  {
    threshold: 45,
    message: "Reading biomarker data...",
    sub: "Extracting values and reference ranges",
  },
  {
    threshold: 30,
    message: "Translating & standardizing...",
    sub: "Converting Spanish terms to English",
  },
  {
    threshold: 15,
    message: "Classifying results...",
    sub: "Comparing values against reference ranges",
  },
  { threshold: 8, message: "Almost done...", sub: "Finalizing your report" },
  {
    threshold: 0,
    message: "Taking a bit longer than usual...",
    sub: "Hang tight, AI is still working",
  },
];

const TOTAL_SECONDS = 60;

function useLoadingTimer(isLoading: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setSecondsLeft(TOTAL_SECONDS);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSecondsLeft(TOTAL_SECONDS);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  const stage =
    LOADING_STAGES.find((s) => secondsLeft > s.threshold) ??
    LOADING_STAGES[LOADING_STAGES.length - 1];

  const progress = Math.max(
    0,
    Math.min(100, ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100),
  );

  return { secondsLeft, stage, progress };
}

function LoadingCard({
  secondsLeft,
  stage,
  progress,
}: ReturnType<typeof useLoadingTimer>) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5 animate-in fade-in slide-in-from-bottom-2">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {stage.message}
          </p>
          <p className="text-xs text-muted-foreground">{stage.sub}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {secondsLeft}
          </span>
          <p className="text-[10px] text-muted-foreground leading-tight">
            sec left
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex items-center justify-between px-0.5">
        {LOADING_STAGES.slice(0, -1).map((s, i) => {
          const passed =
            TOTAL_SECONDS - secondsLeft >= TOTAL_SECONDS - s.threshold;
          return (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                passed ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          );
        })}
      </div>

      {/* Pulse indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        AI is processing your report
      </div>
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerData = useLoadingTimer(isLoading);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeReport(formData);
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const safeMessage =
        msg === "Please upload a valid PDF file."
          ? msg
          : "Analysis failed. Please try again or check your file.";
      setError(safeMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
            Lab Report Analyzer
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base px-2">
            Upload your lab report PDF. We extract biomarkers, standardize names
            & units, and classify each result as optimal, normal, or out of
            range.
          </p>
        </div>

        {/* Upload */}
        <UploadArea onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Loading */}
        {isLoading && <LoadingCard {...timerData} />}

        {/* Error */}
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Fallback notice */}
        {result?.fallbackNote && (
          <Alert
            variant="warning"
            className="animate-in fade-in slide-in-from-top-2"
          >
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>{result.fallbackNote}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && <ResultsDashboard result={result} />}

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
          <p>
            Results are for informational purposes only and do not replace
            medical advice.
          </p>
        </footer>
      </main>
    </div>
  );
}

"use client";

import { FlaskConical } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">
              LabReport AI
            </h1>
            <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
              Biomarker extraction & classification
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

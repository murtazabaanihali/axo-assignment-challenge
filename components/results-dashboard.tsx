"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Hand,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AnalysisResult, type Biomarker } from "@/lib/types";

function StatusBadge({ status }: { status: Biomarker["classification"] }) {
  const variants: Record<
    string,
    "success" | "warning" | "destructive" | "secondary"
  > = {
    optimal: "success",
    normal: "secondary",
    "out-of-range": "destructive",
    unclassified: "secondary",
  };

  return (
    <Badge variant={variants[status] ?? "secondary"} className="capitalize">
      {status.replace("-", " ")}
    </Badge>
  );
}

function ReferenceDisplay({
  min,
  max,
}: {
  min: number | null;
  max: number | null;
}) {
  if (min !== null && max !== null)
    return (
      <span>
        {min} – {max}
      </span>
    );
  if (min !== null) return <span>&gt; {min}</span>;
  if (max !== null) return <span>&lt; {max}</span>;
  return <span className="text-muted-foreground">—</span>;
}

export function ResultsDashboard({ result }: { result: AnalysisResult }) {
  const grouped = useMemo(() => {
    const groups: Record<string, Biomarker[]> = {};
    for (const b of result.biomarkers) {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    }
    return groups;
  }, [result]);

  const summary = useMemo(() => {
    const counts = {
      optimal: 0,
      normal: 0,
      "out-of-range": 0,
      unclassified: 0,
    };
    for (const b of result.biomarkers) {
      counts[b.classification]++;
    }
    return counts;
  }, [result]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Extraction method banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Badge
          variant={result.extractionMethod === "ai" ? "default" : "secondary"}
          className="flex items-center gap-1.5"
        >
          {result.extractionMethod === "ai" ? (
            <>
              <Cpu className="w-3 h-3" />
              AI Extracted
            </>
          ) : (
            <>
              <Hand className="w-3 h-3" />
              Manually Extracted
            </>
          )}
        </Badge>
        {result.fallbackNote && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {result.fallbackNote}
          </p>
        )}
      </div>

      {/* Patient Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-semibold text-foreground">
                {result.patient.age} years
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Sex</p>
              <p className="font-semibold text-foreground capitalize">
                {result.patient.sex}
              </p>
            </div>
            {result.patient.dateOfBirth && (
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p className="font-semibold text-foreground">
                  {result.patient.dateOfBirth}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Optimal
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {summary.optimal}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 opacity-80" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Normal
              </p>
              <p className="text-2xl font-bold text-foreground">
                {summary.normal}
              </p>
            </div>
            <Activity className="w-8 h-8 text-muted-foreground opacity-80" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Out of Range
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {summary["out-of-range"]}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Category Tables */}
      {Object.entries(grouped).map(([category, biomarkers]) => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
              {category}
              <Badge variant="outline" className="ml-auto text-xs font-normal">
                {biomarkers.length} markers
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%] min-w-[140px]">
                    Biomarker
                  </TableHead>
                  <TableHead className="min-w-[100px]">Value</TableHead>
                  <TableHead className="min-w-[120px]">
                    Reference Range
                  </TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biomarkers.map((b, i) => (
                  <TableRow
                    key={i}
                    className={
                      b.classification === "out-of-range"
                        ? "bg-red-50/40 dark:bg-red-950/20"
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground">
                          {b.standardName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {b.rawName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-foreground">
                        {b.value} {b.unit}
                      </span>
                      {b.notes && (
                        <span className="block text-xs text-amber-600 dark:text-amber-400">
                          {b.notes}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <ReferenceDisplay
                        min={b.referenceMin}
                        max={b.referenceMax}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.classification} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

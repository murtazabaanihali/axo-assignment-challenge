"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadAreaProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export function UploadArea({ onSubmit, isLoading }: UploadAreaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected?.type === "application/pdf") {
      setFile(selected);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);
    onSubmit(formData);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-colors
            ${isDragging ? "border-primary bg-muted" : "border-border bg-card"}
            ${file ? "bg-muted" : ""}
          `}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-xs mx-auto">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop your lab report PDF here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse — up to 10 MB
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="w-full h-11 text-sm font-medium"
        >
          {isLoading ? "Analyzing report..." : "Analyze Report"}
        </Button>
      </CardContent>
    </Card>
  );
}

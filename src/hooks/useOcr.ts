"use client";

import { useState } from "react";
import { analyzeOcrFile } from "@/lib/ocr.api";
import { OcrEntityType } from "@/types/ocr";

export function useOcr<T = Record<string, unknown>>() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const analyze = async (entityType: OcrEntityType) => {
        if (!file) {
            setError("Aucun fichier sélectionné");
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await analyzeOcrFile<T>(file, entityType);
            setResult(response);

            return response;
        } catch (err: any) {
            setError(err?.message || "Erreur OCR");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setLoading(false);
    };

    return {
        file,
        setFile,
        loading,
        result,
        error,
        analyze,
        reset,
    };
}
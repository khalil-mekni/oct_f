"use client";

import { useEffect } from "react";
import { useOcr } from "@/hooks/useOcr";
import { OcrEntityType } from "@/types/ocr";

type Props<T = Record<string, unknown>> = {
    open: boolean;
    onClose: () => void;
    entityType: OcrEntityType;
    onUseData: (data: Partial<T>, rawText: string) => void;
};

export default function OcrUploadModal<T = Record<string, unknown>>({
    open,
    onClose,
    entityType,
    onUseData,
}: Props<T>) {
    const { file, setFile, loading, result, error, analyze, reset } = useOcr<T>();

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open]);

    if (!open) return null;

    const handleAnalyze = async () => {
        await analyze(entityType);
    };

    const handleUseData = () => {
        if (!result) return;
        onUseData(result.mapped_data || {}, result.raw_text || "");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Analyse OCR</h2>
                    <button
                        onClick={onClose}
                        type="button"
                        className="rounded-md border px-3 py-1 text-sm"
                    >
                        Fermer
                    </button>
                </div>

                <div className="space-y-4">
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full rounded-md border p-2"
                    />

                    <button
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        type="button"
                        className="rounded-xl border px-4 py-2 font-medium disabled:opacity-50"
                    >
                        {loading ? "Analyse..." : "Analyser"}
                    </button>

                    {error && (
                        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            
                            <div>
                                <p className="mb-2 text-sm font-medium">Texte OCR brut</p>
                                <textarea
                                    readOnly
                                    value={result.raw_text || ""}
                                    className="h-48 w-full rounded-md border p-3 text-sm"
                                />
                            </div>

                            <button
                                onClick={handleUseData}
                                type="button"
                                className="rounded-xl border px-4 py-2 font-medium"
                            >
                                Utiliser ces données
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
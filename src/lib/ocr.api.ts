import { OcrAnalyzeResponse, OcrEntityType } from "@/types/ocr";

const OCR_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/ocr/analyze`
  : "http://localhost:8000/api/ocr/analyze";

export async function analyzeOcrFile<T = Record<string, unknown>>(
  file: File,
  entityType: OcrEntityType = "generic"
): Promise<OcrAnalyzeResponse<T>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity_type", entityType);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const response = await fetch(OCR_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`OCR ${response.status}: ${raw}`);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`La réponse OCR n'est pas du JSON: ${raw}`);
  }

  return JSON.parse(raw);
}
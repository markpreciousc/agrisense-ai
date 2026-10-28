"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, HeartPulse, AlertTriangle } from "lucide-react";
import { classifyImage } from "../lib/classifier";
import { estimateSeverity } from "../lib/severity";
import { getTreatmentAdvice } from "../lib/treatmentAdvice";
import { SymptomMatch } from "../lib/symptomMatcher";
import { saveDiagnosis } from "../lib/history";
import { syncPending } from "../lib/sync";

interface ResultsScreenProps {
  onBack: () => void;
  imageUrl: string | null;
  voiceMatches?: SymptomMatch[] | null;
  voiceTranscript?: string | null;
  selectedCrop?: string;
}

interface Prediction {
  className: string;
  crop: string;
  disease: string;
  isHealthy: boolean;
  confidence: number;
}

interface ClassificationResult extends Prediction {
  top3: Prediction[];
  cropMass: number;
  uncertain: boolean;
}

const matchLabel = (c: number) =>
  c >= 0.85 ? "Strong match" : c >= 0.6 ? "Likely match" : "Weak match";

export default function ResultsScreen({
  onBack,
  imageUrl,
  voiceMatches,
  voiceTranscript,
  selectedCrop,
}: ResultsScreenProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [severity, setSeverity] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!imageUrl || !imgRef.current) return;
    const img = imgRef.current;
    const runAnalysis = async () => {
      try {
        if (!img.complete)
          await new Promise((resolve) => {
            img.onload = resolve;
          });
        const classification = await classifyImage(img, selectedCrop);
        setResult(classification);
        let sev: number | null = null;
        if (!classification.isHealthy && !classification.uncertain) {
          const severityResult = await estimateSeverity(img);
          sev = severityResult.severityPercent;
          setSeverity(sev);
        }
        setStatus("done");

        // Bookkeeping must never break the diagnosis screen, so it gets its own try/catch
        try {
          await saveDiagnosis({
            crop: classification.crop,
            disease: classification.disease,
            isHealthy: classification.isHealthy,
            confidence: classification.confidence,
            severity: sev,
            selectedCrop: selectedCrop ?? null,
            uncertain: classification.uncertain,
          });
          syncPending();
        } catch (e) {
          console.error("Could not save diagnosis", e);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };
    runAnalysis();
  }, [imageUrl, selectedCrop]);

  if (!imageUrl && voiceMatches) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        {voiceTranscript && (
          <p className="text-sm text-gray-500 italic mb-4">
            "{voiceTranscript}"
          </p>
        )}
        {voiceMatches.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">
            Couldn't match that description to a known disease. A photo will
            give a much more reliable answer.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              Possible matches based on your description — not a confirmed
              diagnosis
            </p>
            <div className="space-y-2 mb-4">
              {voiceMatches.map((m, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">
                    {m.crop} — {m.isHealthy ? "healthy" : m.disease}
                  </p>
                  {m.matchedKeywords.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Matched: {m.matchedKeywords.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <button
          onClick={onBack}
          className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-medium hover:bg-gray-800"
        >
          Take a photo for a confirmed diagnosis
        </button>
      </div>
    );
  }

  const treatment =
    result && !result.uncertain
      ? getTreatmentAdvice(result.className, severity)
      : null;
  const others = result
    ? result.uncertain
      ? result.top3
      : result.top3.slice(1).filter((p) => p.confidence > 0.05)
    : [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {imageUrl && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Captured leaf"
          className="w-full h-40 object-cover rounded-lg mb-4"
          crossOrigin="anonymous"
        />
      )}

      {status === "loading" && (
        <p className="text-sm text-gray-500 text-center py-4">
          Analyzing photo...
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 text-center py-4">
          Couldn't analyze this photo. Try again.
        </p>
      )}

      {status === "done" && result && (
        <>
          {result.uncertain && (
            <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs rounded-md p-2.5 mb-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                {selectedCrop && result.cropMass < 0.2
                  ? `This doesn't look like a ${selectedCrop.replace(/_/g, " ")} leaf to the model. Try a closer, well-lit photo of a single leaf.`
                  : "Not sure about this one. Try a closer, well-lit photo of a single leaf."}
              </span>
            </div>
          )}
          <p className="text-base font-medium text-gray-900">
            {result.uncertain
              ? "Not sure about this one"
              : `${result.crop} — ${result.isHealthy ? "healthy" : result.disease}`}
          </p>
          <span
            className={`inline-block text-xs px-2.5 py-1 rounded-md mt-1 mb-3 ${result.uncertain ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"}`}
          >
            {result.uncertain
              ? "Low confidence"
              : matchLabel(result.confidence)}
          </span>

          {others.length > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              {result.uncertain ? "Closest matches" : "Also possible"}:{" "}
              {others
                .map(
                  (p) => `${p.crop} — ${p.isHealthy ? "healthy" : p.disease}`,
                )
                .join(", ")}
            </p>
          )}

          {!result.isHealthy && severity !== null && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Severity</span>
                <span>{Math.round(severity)}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${Math.round(severity)}%` }}
                />
              </div>
            </div>
          )}

          {treatment && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <HeartPulse size={15} />
                Treatment
              </p>
              {treatment.steps.map((step, i) => (
                <p key={i} className="text-sm text-gray-500">
                  {step}
                </p>
              ))}
              {treatment.severeNote && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-xs rounded-md p-2 mt-3">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{treatment.severeNote}</span>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            AI suggestion, not a confirmed diagnosis. Check with a local
            agricultural extension officer before treating.
          </p>
        </>
      )}
    </div>
  );
}

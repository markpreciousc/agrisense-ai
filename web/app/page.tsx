"use client";

import { useState, useEffect } from "react";
import CaptureScreen from "../components/CaptureScreen";
import ResultsScreen from "../components/ResultsScreen";
import { matchSymptoms, SymptomMatch } from "../lib/symptomMatcher";
import { syncPending } from "../lib/sync";

type View = "capture" | "results";

export default function Home() {
  const [view, setView] = useState<View>("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [voiceMatches, setVoiceMatches] = useState<SymptomMatch[] | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    syncPending(); // on app start
    window.addEventListener("online", syncPending); // and whenever the connection returns
    return () => window.removeEventListener("online", syncPending);
  }, []);

  const handleCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setVoiceMatches(null);
    setVoiceTranscript(null);
    setView("results");
  };

  const handleVoiceTranscript = (text: string) => {
    setVoiceTranscript(text);
    setVoiceMatches(matchSymptoms(text));
    setCapturedImage(null);
    setView("results");
  };

  const handleBack = () => setView("capture");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {view === "capture" ? (
          <CaptureScreen
            onCapture={handleCapture}
            onVoiceTranscript={handleVoiceTranscript}
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
          />
        ) : (
          <ResultsScreen
            onBack={handleBack}
            imageUrl={capturedImage}
            voiceMatches={voiceMatches}
            voiceTranscript={voiceTranscript}
            selectedCrop={selectedCrop}
          />
        )}
      </div>
    </main>
  );
}

"use client";

import { useRef } from "react";
import { Camera, WifiOff } from "lucide-react";
import VoiceInput from "./VoiceInput";
import { CROPS } from "../lib/classifier";

interface CaptureScreenProps {
  onCapture: (imageUrl: string) => void;
  onVoiceTranscript: (text: string) => void;
  selectedCrop?: string;
  onSelectCrop: (crop?: string) => void;
}

// 'Corn_(maize)' -> 'Corn', 'Pepper,_bell' -> 'Pepper, bell'
const cropLabel = (crop: string) =>
  crop.replace(/_/g, " ").replace(/\s*\(.*\)/, "");

export default function CaptureScreen({
  onCapture,
  onVoiceTranscript,
  selectedCrop,
  onSelectCrop,
}: CaptureScreenProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onCapture(URL.createObjectURL(file));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg font-medium text-gray-900">AgriSense AI</span>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />
      <p className="text-xs text-gray-500 mb-2">
        Which crop is it? (helps accuracy)
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => onSelectCrop(undefined)}
          className={`rounded-full border px-3 py-1 text-xs ${!selectedCrop ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700"}`}
        >
          Auto-detect
        </button>
        {CROPS.map((crop) => (
          <button
            key={crop}
            onClick={() => onSelectCrop(crop)}
            className={`rounded-full border px-3 py-1 text-xs ${selectedCrop === crop ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700"}`}
          >
            {cropLabel(crop)}
          </button>
        ))}
      </div>
      <button
        onClick={() => galleryInputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center mb-4"
      >
        <Camera className="mx-auto text-gray-400" size={32} />
        <p className="text-sm font-medium text-gray-900 mt-3">
          Take a photo of the leaf
        </p>
        <p className="text-sm text-gray-400 mt-1">Or choose from gallery</p>
      </button>

      <button
        onClick={() => cameraInputRef.current?.click()}
        className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-900 mb-2 hover:bg-gray-50"
      >
        <Camera className="inline mr-2" size={16} />
        Open camera
      </button>

      <VoiceInput onTranscript={onVoiceTranscript} />

      <p className="text-xs text-gray-400 text-center mt-6 flex items-center justify-center gap-1">
        <WifiOff size={13} />
        Works fully offline
      </p>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { transcribeAudio, decodeTo16k } from "../lib/whisper";

const DEBUG = false;

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [status, setStatus] = useState<
    "idle" | "recording" | "transcribing" | "error"
  >("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        try {
          setStatus("transcribing");
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

          stream.getTracks().forEach((t) => t.stop());

          // --- DEBUG START (remove after voice is fixed) ---
          if (DEBUG) {
            setDebugUrl((old) => {
              if (old) URL.revokeObjectURL(old);
              return URL.createObjectURL(audioBlob);
            });

            const pcm = await decodeTo16k(audioBlob);
            let peak = 0;
            let sumSq = 0;
            for (const s of pcm) {
              peak = Math.max(peak, Math.abs(s));
              sumSq += s * s;
            }
            console.log("VOICE DEBUG", {
              seconds: pcm.length / 16000,
              peak,
              rms: Math.sqrt(sumSq / pcm.length),
            });

            setDebugInfo(
              `${(pcm.length / 16000).toFixed(1)}s  peak ${peak.toFixed(2)}  rms ${Math.sqrt(sumSq / pcm.length).toFixed(3)}`,
            );

            const dbgCtx = new AudioContext({ sampleRate: 16000 });
            await dbgCtx.resume();
            const dbgBuf = dbgCtx.createBuffer(1, pcm.length, 16000);
            dbgBuf.copyToChannel(new Float32Array(pcm), 0);
            const dbgSrc = dbgCtx.createBufferSource();
            dbgSrc.buffer = dbgBuf;
            dbgSrc.connect(dbgCtx.destination);
            dbgSrc.start();
          }
          // --- DEBUG END ---
          const text = await transcribeAudio(audioBlob);
          onTranscript(text);
          setStatus("idle");
        } catch (err) {
          console.error(err);
          setStatus("error");
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus("recording");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <div>
      <button
        onClick={status === "recording" ? stopRecording : startRecording}
        disabled={status === "transcribing"}
        className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
      >
        {status === "recording" ? (
          <>
            <Square size={16} className="text-red-500" fill="currentColor" />
            Stop recording
          </>
        ) : status === "transcribing" ? (
          "Transcribing..."
        ) : (
          <>
            <Mic size={16} />
            Ask by voice
          </>
        )}
      </button>

      {debugUrl && <audio controls src={debugUrl} className="w-full mt-2" />}
      {debugInfo && (
        <p className="text-xs text-gray-500 text-center mt-1">{debugInfo}</p>
      )}

      {status === "error" && (
        <p className="text-xs text-red-600 text-center mt-2">
          Voice input isn't available on this device — try describing it while
          taking a photo instead.
        </p>
      )}
    </div>
  );
}

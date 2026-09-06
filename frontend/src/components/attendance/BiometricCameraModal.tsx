"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  User,
  Sparkles,
  Lock,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { verifyBiometricPhoto } from "@/lib/attendanceService";

interface BiometricCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (photoDataUrl: string, score: number) => void;
}

export default function BiometricCameraModal({
  isOpen,
  onClose,
  onSuccess,
}: BiometricCameraModalProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    matched: boolean;
    score: number;
    reason?: string;
    faceDetected: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Start webcam when modal opens
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment.");
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setCameraError(
        err?.message?.includes("Permission") || err?.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access in browser settings, or use photo upload."
          : "Webcam hardware not detected. Please upload a clear live photo to verify identity."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    stopCamera();
    setCapturedPhoto(dataUrl);
    runVerification(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCamera();
      setCapturedPhoto(dataUrl);
      runVerification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const runVerification = async (photoDataUrl: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    // Give visual animation feel
    await new Promise((r) => setTimeout(r, 900));

    const result = await verifyBiometricPhoto(photoDataUrl, user?.avatar || null);
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setVerificationResult(null);
    startCamera();
  };

  const handleConfirmCheckIn = async () => {
    if (!capturedPhoto || !verificationResult || !verificationResult.matched) return;
    setSubmitting(true);
    try {
      await onSuccess(capturedPhoto, verificationResult.score);
      onClose();
    } catch (err) {
      console.error("Check-in submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0F2557] to-[#16367c] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4A843] text-slate-950 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                Biometric Photo Identity Check-In
                <span className="text-[9px] bg-[#D4A843] text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                  Mandatory
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Face verification against official profile photo for employee attendance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Employee Target Identity Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <Avatar name={user?.displayName || "User"} size="md" className="border-2 border-[#D4A843]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Verifying Identity For:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                  {user?.displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">ID: {user?.employeeId} • {user?.email}</p>
              </div>
            </div>
            <Badge variant="gold" className="text-[10px]">
              Profile Photo Registered
            </Badge>
          </div>

          {/* Camera Stream / Captured Photo Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {!capturedPhoto ? (
              <>
                {/* Live Video Preview */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // Mirror camera preview
                />

                {/* Facial Alignment Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-[#D4A843]/80 animate-pulse flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,168,67,0.3)]">
                    <span className="text-[10px] font-bold text-[#E8C976] bg-slate-950/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Align Face in Oval
                    </span>
                  </div>
                </div>

                {/* Fallback Camera Error Banner */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                    <p className="font-bold text-slate-200 text-xs mb-1">Webcam Access Issue</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mb-4 leading-relaxed">{cameraError}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={startCamera}
                        className="bg-[#0F2557] hover:bg-[#16367c] text-white text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Try Again
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" /> Upload Live Photo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Captured Photo Review Viewport */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={capturedPhoto}
                  alt="Captured check-in"
                  className="w-full h-full object-cover"
                />

                {/* Verification Scanning Laser Animation */}
                {isVerifying && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ y: -80 }}
                      animate={{ y: 80 }}
                      transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-[#D4A843] to-transparent shadow-[0_0_15px_#D4A843]"
                    />
                    <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-[#D4A843]/50 text-white font-bold text-xs mt-3 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                      Analyzing Biometric Face Geometry...
                    </div>
                  </div>
                )}
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Verification Results Panel */}
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                verificationResult.matched
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {verificationResult.matched ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    {verificationResult.matched ? "Identity Verified ✓" : "Verification Rejected ✕"}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        verificationResult.matched
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {verificationResult.score}% Match
                    </span>
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    {verificationResult.reason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hidden File Input for fallback upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              {!capturedPhoto ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Upload Live Snapshot
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={submitting}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Retake Photo
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                disabled={submitting}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
              >
                Cancel
              </button>

              {!capturedPhoto ? (
                <Button
                  type="button"
                  onClick={handleCapture}
                  disabled={!!cameraError}
                  className="bg-gradient-to-r from-[#D4A843] to-[#E8C976] text-slate-950 font-bold text-xs shadow-md hover:brightness-105 px-5 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" /> Capture Photo & Verify
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={!verificationResult?.matched || isVerifying || submitting}
                  className={`font-bold text-xs px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all ${
                    verificationResult?.matched
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Marking Attendance...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Check In Today
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


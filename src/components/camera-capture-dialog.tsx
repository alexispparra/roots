
"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CameraCaptureDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (dataUrl: string) => void;
}

export function CameraCaptureDialog({ isOpen, onOpenChange, onCapture }: CameraCaptureDialogProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      let mediaStream: MediaStream | null = null;
      try {
        // Prefer the rear camera for mobile convenience
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
      } catch (error) {
        console.warn("Rear camera not available, trying any camera.", error);
        try {
          // Fallback to any available camera if the rear one fails
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (fallbackError) {
          console.error("Error accessing any camera:", fallbackError);
          setHasPermission(false);
          toast({
            variant: "destructive",
            title: "Acceso a la cámara denegado",
            description: "Por favor, habilita el permiso de la cámara en tu navegador.",
          });
          return;
        }
      }
      
      if (mediaStream) {
        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure the video plays once the stream is attached
          videoRef.current.play().catch(err => console.error("Video play failed:", err));
        }
        setHasPermission(true);
      }
    };

    if (isOpen) {
      setupCamera();
    } else {
      cleanupCamera();
    }

    return () => {
      cleanupCamera();
    };
  }, [isOpen, cleanupCamera, toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        onCapture(dataUrl);
        onOpenChange(false);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tomar Foto</DialogTitle>
          <DialogDescription>
            Apunta con la cámara al comprobante y presiona capturar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {hasPermission ? (
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-md bg-muted"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cámara no disponible</AlertTitle>
              <AlertDescription>
                No se pudo acceder a la cámara. Revisa los permisos de tu navegador.
              </AlertDescription>
            </Alert>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleCapture} disabled={!hasPermission}>
              <Camera className="mr-2 h-4 w-4" />
              Capturar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

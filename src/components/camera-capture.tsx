
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Camera, RefreshCcw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface CameraCaptureProps {
    onPhotoTaken: (file: File) => void;
}

export function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        const getCameraPermission = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast({
                    variant: 'destructive',
                    title: 'Camera Not Supported',
                    description: 'Your browser does not support camera access.',
                });
                setHasCameraPermission(false);
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setHasCameraPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                });
            }
        };

        getCameraPermission();
        
        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }

    }, [toast]);

    const takePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            if(context){
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);
            }
        }
    };
    
    const retakePicture = () => {
        setCapturedImage(null);
    }

    const usePicture = async () => {
        if (capturedImage) {
           const response = await fetch(capturedImage);
           const blob = await response.blob();
           const file = new File([blob], "receipt-capture.png", { type: "image/png" });
           onPhotoTaken(file);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative">
               {hasCameraPermission === null && (
                    <div className="flex items-center justify-center h-full">Requesting camera access...</div>
               )}
               {hasCameraPermission === false && (
                    <div className="p-4">
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permissions.
                            </AlertDescription>
                        </Alert>
                    </div>
               )}
               {hasCameraPermission && (
                  <>
                     <video
                        ref={videoRef}
                        className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
                        autoPlay
                        playsInline
                        muted
                     />
                     {capturedImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capturedImage} alt="Captured receipt" className="w-full h-full object-contain"/>
                     )}
                  </>
               )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-4">
                {!capturedImage ? (
                    <Button onClick={takePicture} disabled={!hasCameraPermission}>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Picture
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={retakePicture}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Retake
                        </Button>
                         <Button onClick={usePicture}>
                            <Check className="mr-2 h-4 w-4" />
                            Use Photo
                        </Button>
                    </>
                )}

            </div>
        </div>
    );
}

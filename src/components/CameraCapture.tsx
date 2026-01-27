import { useState, useRef, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Loader2, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    trigger?: React.ReactNode;
}

export function CameraCapture({ onCapture, trigger }: CameraCaptureProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        setIsStarting(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera. Please ensure you have given permission and are using HTTPS.");
            setIsOpen(false);
        } finally {
            setIsStarting(false);
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            stopCamera();
            setCapturedImage(null);
        }
        setIsOpen(open);
        if (open) {
            startCamera();
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Set canvas size to match video resolution
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw current frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            // Convert dataUrl to File
            const byteString = atob(capturedImage.split(',')[1]);
            const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            onCapture(file);
            setIsOpen(false);
            setCapturedImage(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Take Photo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-slate-900 border-none shadow-2xl">
                <DialogHeader className="p-4 bg-white">
                    <DialogTitle className="flex items-center gap-2 text-slate-900">
                        <Camera className="h-5 w-5 text-indigo-600" />
                        Camera Capture
                    </DialogTitle>
                </DialogHeader>
                
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    {!capturedImage ? (
                        <>
                            {isStarting ? (
                                <div className="flex flex-col items-center gap-3 text-white">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                                    <span className="text-sm font-medium animate-pulse">Initializing Camera...</span>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            )}
                            
                            {/* Camera Overlay */}
                            {!isStarting && (
                                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
                            )}

                            {/* Controls */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                                <div className="bg-slate-900/40 backdrop-blur-md p-3 rounded-full flex items-center gap-6 border border-white/10">
                                    <Button 
                                        type="button"
                                        onClick={capturePhoto}
                                        className="rounded-full w-16 h-16 p-0 bg-white border-4 border-slate-400 hover:bg-slate-100 shadow-2xl active:scale-95 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-red-600 shadow-inner" />
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <img src={capturedImage} className="w-full h-full object-contain" alt="Captured" />
                            
                            {/* Preview Controls */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                                <Button 
                                    onClick={retakePhoto} 
                                    variant="secondary" 
                                    className="gap-2 h-12 px-6 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-xl"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Retake
                                </Button>
                                <Button 
                                    onClick={confirmPhoto} 
                                    className="gap-2 h-12 px-6 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-black font-bold shadow-xl shadow-yellow-500/20"
                                >
                                    <Check className="h-5 w-5" />
                                    Use Photo
                                </Button>
                            </div>
                        </>
                    )}
                    
                    {/* Close Button Mobile */}
                    <button 
                        onClick={() => handleOpenChange(false)}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-4 bg-slate-900 text-white/50 text-[10px] text-center uppercase tracking-widest font-bold">
                    {capturedImage ? 'Photo Preview' : 'Live Camera Feed'}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

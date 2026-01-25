import { useState, useCallback } from 'react';
import { Upload, X, FileIcon, ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { uploadFile, UploadResult } from '../lib/api';

interface FileUploadProps {
    onUploadComplete?: (result: UploadResult) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
}

interface UploadedFileInfo {
    file: File;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    progress: number;
    result?: UploadResult;
    error?: string;
}

export function FileUpload({
    onUploadComplete,
    onUploadError,
    accept = 'image/*,.pdf,.doc,.docx',
    maxSize = 10,
    className = '',
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFileInfo[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback(async (fileList: FileList | File[]) => {
        const newFiles = Array.from(fileList);
        const validFiles: UploadedFileInfo[] = [];

        for (const file of newFiles) {
            if (file.size > maxSize * 1024 * 1024) {
                onUploadError?.(`File ${file.name} exceeds ${maxSize}MB limit`);
                continue;
            }
            validFiles.push({
                file,
                status: 'pending',
                progress: 0,
            });
        }

        setFiles(prev => [...prev, ...validFiles]);

        // Upload each file
        for (const fileInfo of validFiles) {
            setFiles(prev =>
                prev.map(f =>
                    f.file === fileInfo.file ? { ...f, status: 'uploading' } : f
                )
            );

            try {
                const result = await uploadFile(fileInfo.file);
                setFiles(prev =>
                    prev.map(f =>
                        f.file === fileInfo.file
                            ? { ...f, status: 'complete', progress: 100, result }
                            : f
                    )
                );
                onUploadComplete?.(result);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                setFiles(prev =>
                    prev.map(f =>
                        f.file === fileInfo.file
                            ? { ...f, status: 'error', error: errorMessage }
                            : f
                    )
                );
                onUploadError?.(errorMessage);
            }
        }
    }, [maxSize, onUploadComplete, onUploadError]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeFile = useCallback((file: File) => {
        setFiles(prev => prev.filter(f => f.file !== file));
    }, []);

    const isImageFile = (file: File) => file.type.startsWith('image/');

    return (
        <div className={`${className}`}>
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging
                        ? 'border-[#718096] bg-[#718096]/10'
                        : 'border-[#D5D9D9] hover:border-[#718096]'
                    }
        `}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <Upload className="h-10 w-10 mx-auto mb-4 text-[#718096]" />
                <p className="text-lg mb-2">Drag and drop files here</p>
                <p className="text-sm text-[#565959] mb-4">
                    or click to browse (max {maxSize}MB per file)
                </p>
                <Button type="button" variant="outline" className="pointer-events-none">
                    Select Files
                </Button>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((fileInfo, index) => (
                        <div
                            key={`${fileInfo.file.name}-${index}`}
                            className="flex items-center gap-3 p-3 bg-[#F7F8F8] rounded-lg"
                        >
                            {/* Icon */}
                            {isImageFile(fileInfo.file) ? (
                                <ImageIcon className="h-8 w-8 text-[#718096]" />
                            ) : (
                                <FileIcon className="h-8 w-8 text-[#718096]" />
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{fileInfo.file.name}</p>
                                <p className="text-xs text-[#565959]">
                                    {(fileInfo.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {fileInfo.status === 'complete' && fileInfo.result && (
                                    <p className="text-xs text-green-600 truncate">
                                        {fileInfo.result.url}
                                    </p>
                                )}
                                {fileInfo.status === 'error' && (
                                    <p className="text-xs text-red-500">{fileInfo.error}</p>
                                )}
                            </div>

                            {/* Status */}
                            {fileInfo.status === 'uploading' && (
                                <Loader2 className="h-5 w-5 animate-spin text-[#718096]" />
                            )}
                            {fileInfo.status === 'complete' && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            )}

                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(fileInfo.file);
                                }}
                                className="p-1 hover:bg-[#D5D9D9] rounded"
                            >
                                <X className="h-4 w-4 text-[#565959]" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

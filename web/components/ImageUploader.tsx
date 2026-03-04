"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
    onImageSelected: (file: File) => void;
    disabled?: boolean;
}

export default function ImageUploader({
    onImageSelected,
    disabled = false,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setFileName(file.name);
            setPreview(URL.createObjectURL(file));
            onImageSelected(file);
        },
        [onImageSelected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 1,
        disabled,
    });

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        setFileName("");
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative group cursor-pointer rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out overflow-hidden
          ${isDragActive
                        ? "border-violet-500 bg-violet-500/10 scale-[1.02]"
                        : preview
                            ? "border-foreground/20 bg-foreground/5"
                            : "border-foreground/10 bg-foreground/3 hover:border-foreground/25 hover:bg-foreground/6"
                    }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
            >
                <input {...getInputProps()} />

                {preview ? (
                    /* ── Image preview ─────────────────────────────────────── */
                    <div className="relative aspect-square max-h-[360px] flex items-center justify-center p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain rounded-lg"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm
                         border border-border text-foreground/70 hover:text-foreground hover:bg-background
                         transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-xs text-foreground/50 truncate bg-background/70 backdrop-blur-sm rounded-md px-3 py-1.5">
                                {fileName}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ── Drop zone placeholder ─────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
                        <div
                            className={`
                p-4 rounded-2xl transition-all duration-300
                ${isDragActive
                                    ? "bg-violet-500/20 text-violet-400"
                                    : "bg-foreground/6 text-foreground/40 group-hover:text-foreground/60"
                                }
              `}
                        >
                            {isDragActive ? (
                                <ImageIcon className="w-8 h-8" />
                            ) : (
                                <Upload className="w-8 h-8" />
                            )}
                        </div>

                        <div className="text-center space-y-1.5">
                            <p className="text-sm font-medium text-foreground/70">
                                {isDragActive
                                    ? "Drop your image here"
                                    : "Drag & drop your 2D image"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, or WebP — up to 16 MB
                            </p>
                        </div>

                        {!isDragActive && (
                            <span className="text-xs text-foreground/30 px-3 py-1 rounded-full border border-foreground/10">
                                or click to browse
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

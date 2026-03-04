"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
    isVisible: boolean;
}

const STAGES = [
    { label: "Uploading image…", duration: 2000, target: 15 },
    { label: "Analyzing geometry…", duration: 4000, target: 35 },
    { label: "Generating 3D mesh…", duration: 10000, target: 70 },
    { label: "Optimizing model…", duration: 6000, target: 90 },
    { label: "Finalizing…", duration: 3000, target: 98 },
];

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
    const [progress, setProgress] = useState(0);
    const [stageIndex, setStageIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            setStageIndex(0);
            return;
        }

        let currentStage = 0;
        let currentProgress = 0;

        const advance = () => {
            if (currentStage >= STAGES.length) return;

            const stage = STAGES[currentStage];
            const increment = (stage.target - currentProgress) / (stage.duration / 100);

            const interval = setInterval(() => {
                currentProgress = Math.min(currentProgress + increment, stage.target);
                setProgress(Math.round(currentProgress));

                if (currentProgress >= stage.target) {
                    clearInterval(interval);
                    currentStage++;
                    setStageIndex(currentStage);
                    if (currentStage < STAGES.length) {
                        setTimeout(advance, 300);
                    }
                }
            }, 100);

            return interval;
        };

        const interval = advance();
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const currentLabel =
        stageIndex < STAGES.length
            ? STAGES[stageIndex].label
            : "Almost there…";

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-2xl">
            <div className="flex flex-col items-center gap-6 px-8 py-10 max-w-xs w-full">
                {/* Spinner */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
                    <Loader2 className="w-10 h-10 text-violet-400 animate-spin relative" />
                </div>

                {/* Stage label */}
                <p className="text-sm font-medium text-foreground/80 text-center">
                    {currentLabel}
                </p>

                {/* Progress bar */}
                <div className="w-full space-y-2">
                    <Progress
                        value={progress}
                        className="h-1.5 bg-foreground/10 [&>div]:bg-linear-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500 [&>div]:transition-all [&>div]:duration-300"
                    />
                    <p className="text-xs text-muted-foreground text-center">{progress}%</p>
                </div>
            </div>
        </div>
    );
}

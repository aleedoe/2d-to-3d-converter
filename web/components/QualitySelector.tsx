"use client";

import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Layers, Box, Gem, type LucideIcon } from "lucide-react";

export type Quality = "low" | "mid" | "high";

interface QualitySelectorProps {
    value: Quality;
    onChange: (value: Quality) => void;
    disabled?: boolean;
}

const options: {
    value: Quality;
    label: string;
    subtitle: string;
    icon: LucideIcon;
}[] = [
        {
            value: "low",
            label: "Low",
            subtitle: "~2K faces",
            icon: Layers,
        },
        {
            value: "mid",
            label: "Mid",
            subtitle: "~5K faces",
            icon: Box,
        },
        {
            value: "high",
            label: "High",
            subtitle: "~15K faces",
            icon: Gem,
        },
    ];

export default function QualitySelector({
    value,
    onChange,
    disabled = false,
}: QualitySelectorProps) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Quality / Poly Count
            </p>

            <ToggleGroup
                type="single"
                value={value}
                onValueChange={(v) => {
                    if (v) onChange(v as Quality);
                }}
                disabled={disabled}
                className="grid grid-cols-3 gap-2 w-full"
            >
                {options.map(({ value: val, label, subtitle, icon: Icon }) => (
                    <ToggleGroupItem
                        key={val}
                        value={val}
                        className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl
                       border border-border bg-foreground/2
                       data-[state=on]:border-violet-500/60
                       data-[state=on]:bg-violet-500/10
                       data-[state=on]:shadow-[0_0_12px_-3px_rgba(139,92,246,0.3)]
                       hover:bg-foreground/4
                       transition-all duration-200 h-auto"
                    >
                        <Icon className="w-4 h-4 opacity-50" />
                        <span className="text-xs font-semibold text-foreground/80">{label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                            {subtitle}
                        </span>
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
    );
}

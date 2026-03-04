"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => { };

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                aria-label="Toggle theme"
            >
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 w-9 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-300" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300" />
            )}
        </Button>
    );
}

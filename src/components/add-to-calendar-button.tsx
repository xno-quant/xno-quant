
"use client";

import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { Event } from "@/lib/events";
import { generateEventCalendarUrl } from "@/lib/calendar";
import Link from "next/link";

interface AddToCalendarButtonProps {
    event: Event;
    variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
}

export default function AddToCalendarButton({
    event,
    variant = "outline",
    size = "default",
    className = "",
    showIcon = true
}: AddToCalendarButtonProps) {
    if (event.isPast || !event.enableCalendar) {
        return null;
    }

    return (
        <Button
            variant={variant}
            size={size}
            asChild
            className={`shadow-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground ${className}`}
        >
            <Link
                href={generateEventCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
            >
                {showIcon && <CalendarPlus className="w-4 h-4 mr-2" />}
                Thêm vào lịch
            </Link>
        </Button>
    );
}

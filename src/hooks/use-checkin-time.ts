"use client";

import { useState, useEffect } from 'react';
import { Event } from '@/lib/events';
import { addMinutes } from 'date-fns';

export interface EventTimeStates {
    isBeforeEvent: boolean;
    isCheckinTime: boolean;
    isEventOngoing: boolean;
    isAfterEvent: boolean;
    showCalendarButton: boolean;
}

export function useEventTimeStates(event: Event): EventTimeStates {
    const [states, setStates] = useState<EventTimeStates>({
        isBeforeEvent: false,
        isCheckinTime: false,
        isEventOngoing: false,
        isAfterEvent: false,
        showCalendarButton: false,
    });

    useEffect(() => {
        const checkEventStates = () => {
            const now = new Date();
            const eventStart = new Date(event.date);
            const duration = event.duration || 120; // Default 2 hours
            const eventEnd = addMinutes(eventStart, duration);

            // Time windows
            const oneHourBefore = new Date(eventStart.getTime() - (60 * 60 * 1000));

            const isBeforeEvent = now < eventStart;
            const isEventOngoing = now >= eventStart && now <= eventEnd;
            const isAfterEvent = now > eventEnd;

            // Check-in window: 1 hour before until event ends
            const isCheckinTime = now >= oneHourBefore && now <= eventEnd;

            // Calendar button: only show before event starts
            const showCalendarButton = isBeforeEvent && (event.enableCalendar === true);

            setStates({
                isBeforeEvent,
                isCheckinTime,
                isEventOngoing,
                isAfterEvent,
                showCalendarButton,
            });
        };

        // Check immediately
        checkEventStates();

        // Check every minute
        const interval = setInterval(checkEventStates, 60000);

        return () => clearInterval(interval);
    }, [event.date, event.duration, event.enableCalendar]);

    return states;
}

// Backward compatibility
export function useCheckinTimeWindow(event: Event): boolean {
    const { isCheckinTime } = useEventTimeStates(event);
    return isCheckinTime;
}
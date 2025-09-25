"use client";

import { useState, useEffect } from 'react';

interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEventToday: boolean;
    isEventStarted: boolean;
    showCountdown: boolean;
}

export function useCountdown(eventDate: string): CountdownTime {
    const [countdown, setCountdown] = useState<CountdownTime>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isEventToday: false,
        isEventStarted: false,
        showCountdown: false,
    });

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const event = new Date(eventDate);
            const diffMs = event.getTime() - now.getTime();

            // Check if event has started
            const isEventStarted = diffMs <= 0;

            // Check if event is today
            const isEventToday = now.toDateString() === event.toDateString();

            // Show countdown within 3 days before event
            const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
            const showCountdown = diffMs <= threeDaysMs && diffMs > 0;

            if (diffMs > 0) {
                const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
                const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
                const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);

                setCountdown({
                    days,
                    hours,
                    minutes,
                    seconds,
                    isEventToday,
                    isEventStarted,
                    showCountdown,
                });
            } else {
                setCountdown({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isEventToday,
                    isEventStarted,
                    showCountdown: false,
                });
            }
        };

        // Update immediately
        updateCountdown();

        // Update every second
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [eventDate]);

    return countdown;
}
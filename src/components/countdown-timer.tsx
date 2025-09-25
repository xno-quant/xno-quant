"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
    eventDate: string;
}

export default function CountdownTimer({ eventDate }: CountdownTimerProps) {
    const countdown = useCountdown(eventDate);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    if (!countdown.showCountdown) {
        return null;
    }

    const TimeUnit = ({ value, label, isLarge = false }: { value: number; label: string; isLarge?: boolean }) => (
        <div className={`flex flex-col items-center ${isLarge ? 'mx-3 md:mx-6' : 'mx-2 md:mx-4'} transform transition-all duration-300 hover:scale-110`}>
            <div className={`
        ${isLarge ? 'w-16 h-16 md:w-24 md:h-24' : 'w-12 h-12 md:w-16 md:h-16'}
        bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm 
        border-2 border-primary/40 rounded-xl 
        flex items-center justify-center mb-2
        shadow-lg shadow-primary/30
        relative overflow-hidden
        group
      `}>
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                <span className={`
          font-bold font-mono text-white relative z-10
          ${isLarge ? 'text-xl md:text-4xl' : 'text-lg md:text-2xl'}
          drop-shadow-lg
        `}>
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className={`
        text-primary font-semibold uppercase tracking-wider
        ${isLarge ? 'text-sm md:text-base' : 'text-xs md:text-sm'}
        drop-shadow-sm
      `}>
                {label}
            </span>
        </div>
    );

    return (
        <div className="mb-8">
            <div className="text-center mb-6">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/40 rounded-full mb-4 shadow-lg shadow-primary/20">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping mr-3"></div>
                    <span className="text-primary font-bold text-sm md:text-base uppercase tracking-wide">
                        {countdown.isEventToday ? '🔥 Sự kiện bắt đầu sau' : '⏰ Sự kiện sắp diễn ra'}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center">
                {countdown.isEventToday ? (
                    // Show only hours on event day
                    <TimeUnit value={countdown.hours} label="Giờ" isLarge={true} />
                ) : (
                    // Show days, hours, minutes, seconds before event day
                    <>
                        {countdown.days > 0 && <TimeUnit value={countdown.days} label="Ngày" />}
                        <TimeUnit value={countdown.hours} label="Giờ" />
                        <TimeUnit value={countdown.minutes} label="Phút" />
                        <TimeUnit value={countdown.seconds} label="Giây" />
                    </>
                )}
            </div>

            {countdown.isEventToday && (
                <div className="text-center mt-6">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/30 rounded-lg border border-primary/40 shadow-lg">
                        <p className="text-white text-sm md:text-base font-semibold animate-pulse">
                            ✨ Sự kiện đang diễn ra hôm nay!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
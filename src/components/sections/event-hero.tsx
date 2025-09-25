
"use client";

import Link from "next/link";
import type { Event } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Sparkles, Mouse, Video, Users, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { useEventTimeStates } from "@/hooks/use-checkin-time";
import CountdownTimer from "@/components/countdown-timer";
import AddToCalendarButton from "@/components/add-to-calendar-button";

const EventHero = ({ event }: { event: Event }) => {
  const heroImage = event.image || "https://images.unsplash.com/photo-1640459958548-56c1c6717a40?q=80&w=1470&auto=format&fit=crop";
  const eventStates = useEventTimeStates(event);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt={event.title}
          fill
          className="object-cover"
          data-ai-hint="nền công nghệ trừu tượng"
          priority
        />
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      <div className="container relative z-10 text-center text-white">
        {!event.isPast && (
          <Badge variant="secondary" className="mb-4 text-sm font-semibold">
            {event.format === 'Online' ? <Video className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
            {event.type} {event.format}
          </Badge>
        )}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
          {event.title}
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-200 mb-8">
          {event.tagline}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-300" />
            <span className="font-medium">{event.formattedDate}</span>
          </div>
          {event.format === 'Offline' && (
            <>
              <div className="hidden sm:block w-px h-6 bg-slate-500"></div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-300" />
                <Link href="#location" className="font-medium hover:underline">
                  {event.location}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Countdown Timer - only show before event starts */}
        {eventStates.isBeforeEvent && <CountdownTimer eventDate={event.date} />}

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild size="lg" className={eventStates.isCheckinTime ? 'animate-pulse shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90' : eventStates.isAfterEvent ? 'bg-primary hover:bg-primary/90' : ''}>
            <Link href={eventStates.isCheckinTime ? '/checkin' : eventStates.isAfterEvent ? '#feedback-section' : '#form'}>
              {eventStates.isAfterEvent ? (
                'Gửi phản hồi'
              ) : eventStates.isCheckinTime ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Check-in sự kiện
                </>
              ) : (
                'Đăng ký ngay'
              )}
            </Link>
          </Button>

          {/* Add to Calendar Button - only show before event starts */}
          {eventStates.showCalendarButton && (
            <AddToCalendarButton event={event} size="lg" />
          )}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-bounce text-white">
          <Mouse className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
};

export default EventHero;

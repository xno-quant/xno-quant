

import EventHero from '@/components/sections/event-hero';
import EventAbout from '@/components/sections/event-about';
import EventSpeakers from '@/components/sections/event-speakers';
import EventSchedule from '@/components/sections/event-schedule';
import RegistrationForm from '@/components/sections/registration-form';
import FeedbackForm from '@/components/sections/feedback-form';
import EventLocation from '@/components/sections/event-location';
import { getLatestEvent, getPastSpeakers } from '@/lib/events';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default async function Home() {
  const latestEvent = await getLatestEvent();
  const pastSpeakers = await getPastSpeakers();

  if (!latestEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Chào mừng đến với XNO Quant</h1>
          <p className="text-muted-foreground mt-4">Hiện tại chưa có sự kiện nào sắp diễn ra. Vui lòng quay lại sau!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <EventHero event={latestEvent} />
      <EventAbout event={latestEvent} />
      <EventSpeakers event={latestEvent} pastSpeakers={pastSpeakers} />
      <EventSchedule event={latestEvent} />
      {latestEvent.isPast ? (
        <FeedbackForm eventId={latestEvent.id} />
      ) : (
        <>
          <RegistrationForm event={latestEvent} />
          {latestEvent.format === 'Offline' && <EventLocation event={latestEvent} />}
        </>
      )}
    </>
  );
}

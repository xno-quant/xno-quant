

import EventHero from '@/components/sections/event-hero';
import EventAbout from '@/components/sections/event-about';
import EventSpeakers from '@/components/sections/event-speakers';
import EventSchedule from '@/components/sections/event-schedule';
import RegistrationForm from '@/components/sections/registration-form';
import FeedbackForm from '@/components/sections/feedback-form';
import EventRecap from '@/components/sections/event-recap';
import EventGallery from '@/components/sections/event-gallery';
import EventLocation from '@/components/sections/event-location';
import { getEventById, getAllEventIds } from '@/lib/events';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export async function generateStaticParams() {
  return getAllEventIds();
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEventById(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <EventHero event={event} />
      <EventAbout event={event} />
      <EventSpeakers event={event} />
      <EventSchedule event={event} />
      {event.isPast && <EventRecap event={event} />}
      {event.isPast && <EventGallery event={event} />}
      {event.isPast ? (
        <FeedbackForm eventId={event.id} />
      ) : (
        <>
          <RegistrationForm />
          {event.format === 'Offline' && <EventLocation event={event} />}
        </>
      )}
    </>
  );
}

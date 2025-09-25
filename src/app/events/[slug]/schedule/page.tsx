import { getEventById, getAllEventIds } from '@/lib/events';
import { notFound } from 'next/navigation';
import { Clock } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return getAllEventIds();
}

export default async function EventSchedulePage({ params }: { params: { slug: string } }) {
  const event = await getEventById(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <section id="schedule" className="container py-12 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Lịch trình sự kiện</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Lên kế hoạch cho ngày của bạn tại {event.title} với chương trình chi tiết của chúng tôi.
        </p>
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-6 md:left-24 h-full w-0.5 bg-border -translate-x-1/2"></div>
        {event.schedule.map((item, index) => (
          <div key={index} className="relative flex items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground absolute left-6 md:left-24 -translate-x-1/2 ring-8 ring-card">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-16 md:ml-48 w-full">
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                  <p className="font-semibold text-primary mb-1">{item.time}</p>
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button asChild>
          <Link href={`/events/${event.id}`}>Quay lại sự kiện</Link>
        </Button>
      </div>
    </section>
  );
}

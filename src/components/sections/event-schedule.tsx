import type { Event } from "@/lib/events";
import { Clock } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const EventSchedule = ({ event }: { event: Event }) => {
  return (
    <section id="schedule" className="bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Lịch trình sự kiện</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Một ngày đầy ắp kiến thức, kết nối và khám phá. Lên kế hoạch cho ngày của bạn với chương trình chi tiết của chúng tôi.
          </p>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 md:left-24 h-full w-0.5 bg-border -translate-x-1/2"></div>
          {event.schedule.slice(0, 4).map((item, index) => (
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
        {event.schedule.length > 4 && (
            <div className="text-center mt-8">
                <Button asChild>
                    <Link href={`/events/${event.id}/schedule`}>Xem toàn bộ lịch trình</Link>
                </Button>
            </div>
        )}
      </div>
    </section>
  );
};

export default EventSchedule;

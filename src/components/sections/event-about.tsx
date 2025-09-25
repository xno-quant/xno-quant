import Image from "next/image";
import type { Event } from "@/lib/events";

const EventAbout = ({ event }: { event: Event }) => {
  const displayImage = event.aboutImage || event.image;
  return (
    <section id="about" className="bg-card">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Về sự kiện</h2>
          <div
            className="text-muted-foreground text-lg prose"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
          <Image
            src={displayImage}
            alt={event.title}
            fill
            className="object-cover"
            data-ai-hint="hội nghị công nghệ"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default EventAbout;

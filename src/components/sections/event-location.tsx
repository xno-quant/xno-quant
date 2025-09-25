
import type { Event } from "@/lib/events";
import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EventLocation = ({ event }: { event: Event }) => {
  // Only render this component for Offline events that have a map link
  if (event.format !== 'Offline' || !event.mapLink) {
    return null;
  }

  // Ensure the link is a proper embed link
  const isEmbedLink = event.mapLink.includes('/embed');

  return (
    <section id="location" className="bg-card">
      <div className="container text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Địa điểm tổ chức</h2>
          <div className="flex items-start gap-3 text-lg text-muted-foreground max-w-2xl">
            <MapPin className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          <Button asChild size="lg" className="mt-4">
            <Link href={isEmbedLink ? event.mapLink.replace('/embed', '/maps') : event.mapLink} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-5 w-5" />
              Chỉ đường đến sự kiện
            </Link>
          </Button>
        </div>
        {isEmbedLink ? (
            <div className="relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
                <iframe
                    src={event.mapLink}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ đến ${event.location}`}
                    className="absolute inset-0"
                ></iframe>
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">Link bản đồ không hợp lệ để nhúng. Vui lòng sử dụng link "Embed a map" từ Google Maps.</p>
        )}

      </div>
    </section>
  );
};

export default EventLocation;

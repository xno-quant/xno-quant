import Link from "next/link";
import { getAllEvents } from "@/lib/events";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default async function EventsPage() {
  const allEvents = await getAllEvents();

  return (
    <div className="bg-muted/40 py-12 pt-24">
      <section className="container">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline">Tất cả sự kiện</h1>
          <p className="text-lg text-muted-foreground mt-2">Duyệt qua các sự kiện đã và sắp diễn ra của chúng tôi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allEvents.map((event) => {
            const displayImage = event.isPast && event.imageAfter ? event.imageAfter : event.image;
            return (
              <Card key={event.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image src={displayImage} alt={event.title} fill className="object-cover" data-ai-hint="ảnh sự kiện" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">{event.formattedDate}</p>
                    {event.isPast ? (
                      <Badge variant="outline">Đã diễn ra</Badge>
                    ) : (
                      <Badge>Sắp diễn ra</Badge>
                    )}
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-sm text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: event.description }} />
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>
                      Xem chi tiết
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  );
}

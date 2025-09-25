import type { Event } from "@/lib/events";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EventRecap = ({ event }: { event: Event }) => {
  if (!event.recap) {
    return null;
  }

  return (
    <section id="recap" className="bg-background">
      <div className="container max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary"/>
              Tổng kết sự kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-lg text-muted-foreground max-w-none"
              dangerouslySetInnerHTML={{ __html: event.recap }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EventRecap;
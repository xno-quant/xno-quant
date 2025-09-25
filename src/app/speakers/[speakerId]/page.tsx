import { getSpeakerWithEvents, getAllSpeakerIds, Event } from '@/lib/events';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Linkedin, Briefcase, BrainCircuit, Quote, GraduationCap, Github, Calendar, MapPin, Globe } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export async function generateStaticParams() {
  return getAllSpeakerIds();
}

const EventCard = ({ event }: { event: Event }) => {
    const displayImage = event.isPast && event.imageAfter ? event.imageAfter : event.image;
    return (
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <Link href={`/events/${event.id}`} className="flex flex-col h-full">
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
                    <CardTitle className='text-xl'>{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.tagline}</p>
                </CardContent>
            </Link>
        </Card>
    );
}

export default async function SpeakerProfilePage({ params }: { params: { speakerId: string } }) {
  const speaker = await getSpeakerWithEvents(params.speakerId);

  if (!speaker) {
    notFound();
  }

  return (
    <div className="bg-muted/40 pt-24">
      <section className="container py-12 md:py-20">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="md:col-span-1 flex flex-col items-center text-center md:sticky md:top-24">
            <Avatar className="w-48 h-48 mb-6 border-4 border-background ring-4 ring-primary">
              <AvatarImage src={speaker.avatar} alt={speaker.name} className="object-cover" data-ai-hint="chân dung chuyên nghiệp" />
              <AvatarFallback>{speaker.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold font-headline">{speaker.name}</h1>
            <p className="text-lg text-primary font-medium">{speaker.title}</p>
             <p className="text-sm text-muted-foreground mt-2 px-4">{speaker.summary}</p>
            <div className="flex gap-4 mt-4">
               {speaker.socials?.website && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={speaker.socials.website} target="_blank">
                    <Globe className="w-5 h-5" />
                    <span className="sr-only">Website</span>
                  </Link>
                </Button>
              )}
              {speaker.socials?.googleScholar && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={speaker.socials.googleScholar} target="_blank">
                    <GraduationCap className="w-5 h-5" />
                    <span className="sr-only">Google Scholar</span>
                  </Link>
                </Button>
              )}
               {speaker.socials?.github && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={speaker.socials.github} target="_blank">
                    <Github className="w-5 h-5" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
              )}
              {speaker.socials?.linkedin && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href={speaker.socials.linkedin} target="_blank">
                    <Linkedin className="w-5 h-5" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </Button>
              )}
            </div>
            <div className="mt-8 w-full flex flex-col gap-2">
                 <Button asChild className='w-full'>
                    <Link href={`/speakers`}>Tất cả diễn giả</Link>
                </Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 font-headline">Về {speaker.name}</h2>
                <div className="prose prose-lg text-muted-foreground max-w-none" dangerouslySetInnerHTML={{ __html: speaker.bio }} />
                 {speaker.quote && (
                  <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
                    <Quote className="w-6 h-6 text-primary/50 mb-2" />
                    {speaker.quote}
                  </blockquote>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 font-headline flex items-center gap-3"><BrainCircuit className="w-7 h-7 text-primary"/> Lĩnh vực chuyên môn</h2>
                <div className="flex flex-wrap gap-2">
                  {speaker.expertise.map((item) => (
                    <Badge key={item} variant="secondary" className="text-sm">{item}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-8 font-headline flex items-center gap-3"><Briefcase className="w-7 h-7 text-primary"/> Kinh nghiệm nổi bật</h2>
                <div className="relative pl-4 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-border">
                  {speaker.experience.map((item, index) => (
                     <div key={index} className="relative pl-8 mb-8">
                      <div className="absolute left-0 top-1.5 flex items-center">
                        <div className="z-10 w-4 h-4 rounded-full bg-primary ring-4 ring-card -translate-x-[calc(50%+1px)]"></div>
                      </div>
                      <p className="font-semibold text-primary">{item.year}</p>
                      <h3 className="font-bold text-xl mt-1">{item.role}</h3>
                      <p className="text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {speaker.events && speaker.events.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3"><Calendar className="w-7 h-7 text-primary"/> Các sự kiện tham gia</CardTitle>
                        <CardDescription>Các workshop và buổi chia sẻ mà {speaker.name} đã và sẽ góp mặt tại XNO Quant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {speaker.events.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </CardContent>
                </Card>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}

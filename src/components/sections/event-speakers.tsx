
import Image from "next/image";
import type { Event, Speaker } from "@/lib/events";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, ChevronRight, GraduationCap, Github, Linkedin, Globe, Briefcase } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const EventSpeakers = ({ event, pastSpeakers }: { event: Event, pastSpeakers?: Speaker[] }) => {
  const numSpeakers = event.speakers.length;

  return (
    <section id="speakers">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Gặp gỡ các diễn giả</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Học hỏi trực tiếp từ các chuyên gia và nhà lãnh đạo đầu ngành.
            </p>
        </div>

        <div className={cn(
          "flex flex-wrap justify-center gap-10",
          numSpeakers > 1 ? "items-stretch" : "items-start"
        )}>
          {event.speakers.map((speaker) => (
             <div key={speaker.id} className={cn(
                "bg-card border rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col",
                "w-full",
                numSpeakers === 1 ? "max-w-4xl" : "md:w-[calc(50%-2.5rem)] lg:w-[calc(50%-2.5rem)] max-w-xl",
             )}>
                 <div className="grid md:grid-cols-3 flex-grow">
                     <div className="md:col-span-1 p-6 flex flex-col items-center text-center bg-muted/50">
                        {speaker.companyLogo && (
                          <div className="relative h-12 w-24 mb-4">
                            <Image
                              src={speaker.companyLogo}
                              alt={`${speaker.name}'s company logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="relative w-36 h-36 rounded-full overflow-hidden mb-4 ring-4 ring-background">
                            <Image src={speaker.avatar} alt={speaker.name} fill className="object-cover" data-ai-hint="chân dung chuyên nghiệp"/>
                        </div>
                        <h3 className="text-xl font-bold">{speaker.name}</h3>
                        <p className="text-primary font-medium text-sm">{speaker.title}</p>
                        <div className="flex gap-2 mt-3">
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
                     </div>
                     <div className="md:col-span-2 p-6 flex flex-col">
                        <div className="flex-grow">
                          {numSpeakers === 1 ? (
                            <div
                              className="text-muted-foreground mb-6 prose prose-base max-w-none"
                              dangerouslySetInnerHTML={{ __html: speaker.bio }}
                            />
                          ) : (
                            <p className="text-muted-foreground mb-6 line-clamp-4">{speaker.summary}</p>
                          )}

                          <div className="space-y-4 mb-6">
                              <h4 className="font-semibold text-sm flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />Kinh nghiệm nổi bật</h4>
                              <div className="pl-6 text-sm text-muted-foreground">
                                  {speaker.experience.slice(0, 3).map((exp, index) => (
                                      <div key={index} className="mb-2">
                                          <p className="font-medium text-foreground">{exp.role}</p>
                                          <p>{exp.description}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                        </div>

                         <div className="flex flex-wrap gap-2 mb-4">
                            {speaker.expertise.slice(0, 3).map((item) => (
                                <Badge key={item} variant="secondary">{item}</Badge>
                            ))}
                         </div>
                        <Button asChild className="mt-auto">
                            <Link href={`/speakers/${speaker.id}`}>
                                Xem hồ sơ chi tiết <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                     </div>
                 </div>
            </div>
          ))}
        </div>
        
        {pastSpeakers && pastSpeakers.length > 0 && (
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold tracking-tight mb-4 font-headline">Các diễn giả tiêu biểu từ sự kiện trước</h3>
            <p className="text-muted-foreground text-md mb-10 max-w-xl mx-auto">
              Chúng tôi tự hào đã quy tụ được những chuyên gia hàng đầu trong các sự kiện đã diễn ra.
            </p>
             <TooltipProvider>
              <div className="flex flex-wrap justify-center gap-6">
                {pastSpeakers.map((speaker) => (
                  <Tooltip key={speaker.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                       <Link href={`/speakers/${speaker.id}`} className="group">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md transition-all duration-300 hover:scale-110">
                          <Image src={speaker.avatar} alt={speaker.name} fill className="object-cover" />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{speaker.name}</p>
                      <p className="text-sm text-muted-foreground">{speaker.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            <div className="mt-12">
                <Link href="/speakers" className="inline-flex items-center text-primary font-semibold hover:underline">
                    Xem tất cả diễn giả
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default EventSpeakers;


"use client";

import { useState } from "react";
import type { Event } from "@/lib/events";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn, Presentation, Video, Expand, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EventMaterials = ({ event }: { event: Event }) => {
  const { user, signInWithGoogle } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Only show this section if:
  // 1. The event is in the past.
  // 2. The event has either a slide or a video URL.
  if (!event.isPast || (!event.slideUrl && !event.videoUrl)) {
    return null;
  }

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId;
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1];
    } else {
      return null; // Not a valid YouTube URL
    }
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const videoEmbedUrl = event.videoUrl ? getYoutubeEmbedUrl(event.videoUrl) : null;

  return (
    <section id="materials" className="bg-muted/40">
      <div className="container max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <Presentation className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Tài liệu sự kiện</CardTitle>
            <CardDescription>
              {user
                ? "Cảm ơn bạn đã quan tâm! Dưới đây là slide và video ghi hình của buổi workshop."
                : "Đăng nhập để truy cập slide và video ghi hình của buổi workshop."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <Tabs defaultValue={videoEmbedUrl ? "video" : "slides"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {videoEmbedUrl && <TabsTrigger value="video"><Video className="mr-2" />Video ghi hình</TabsTrigger>}
                  {event.slideUrl && <TabsTrigger value="slides"><Presentation className="mr-2" />Slide trình bày</TabsTrigger>}
                </TabsList>
                {event.slideUrl && (
                  <TabsContent value="slides">
                    <div className="relative">
                      <div className="aspect-video w-full mt-4 rounded-lg overflow-hidden border">
                        <iframe src={event.slideUrl} className="w-full h-full" title="Event Slides"></iframe>
                      </div>
                      <Button
                        onClick={() => setIsFullscreen(true)}
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-2 right-2 z-10 bg-black/70 text-white hover:bg-black/90"
                      >
                        <Expand className="w-4 h-4 mr-1" />
                        Toàn màn hình
                      </Button>
                    </div>
                  </TabsContent>
                )}
                {videoEmbedUrl && (
                  <TabsContent value="video">
                    <div className="aspect-video w-full mt-4 rounded-lg overflow-hidden border">
                      <iframe
                        src={videoEmbedUrl}
                        className="w-full h-full"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen>
                      </iframe>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="flex items-center text-destructive font-semibold">
                  <Lock className="w-5 h-5 mr-2" />
                  <span>Nội dung dành riêng cho thành viên</span>
                </div>
                <Button onClick={signInWithGoogle} size="lg">
                  <LogIn className="mr-2" />
                  Đăng nhập để xem
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full p-4">
            <Button
              onClick={() => setIsFullscreen(false)}
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 z-60 bg-red-600 text-white hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Đóng
            </Button>
            <div className="w-full h-full rounded-lg overflow-hidden">
              <iframe
                src={event.slideUrl}
                className="w-full h-full"
                title="Event Slides Fullscreen"
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventMaterials;

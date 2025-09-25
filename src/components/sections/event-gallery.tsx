
"use client";

import Image from "next/image";
import type { Event } from "@/lib/events";
import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera } from "lucide-react";

const EventGallery = ({ event }: { event: Event }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!event.gallery || event.gallery.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline flex items-center justify-center gap-3">
            <Camera className="w-8 h-8"/>
            Khoảnh khắc sự kiện
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cùng nhìn lại những hình ảnh đáng nhớ từ workshop.
          </p>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {event.gallery.map((image, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div 
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`Ảnh sự kiện ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="ảnh workshop"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 border-0">
              <DialogTitle className="sr-only">Xem ảnh sự kiện</DialogTitle>
              <div className="relative aspect-video">
                {selectedImage && (
                    <Image 
                        src={selectedImage}
                        alt="Selected event image"
                        fill
                        className="object-contain"
                        data-ai-hint="ảnh workshop"
                    />
                )}
              </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default EventGallery;

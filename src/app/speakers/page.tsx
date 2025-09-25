import { getAllSpeakers } from '@/lib/events';
import Image from "next/image";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function AllSpeakersPage() {
  const allSpeakers = await getAllSpeakers();

  return (
    <section id="speakers" className="container py-12 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline">Gặp gỡ các diễn giả</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Học hỏi trực tiếp từ các chuyên gia và nhà lãnh đạo đầu ngành đã hợp tác với XNO Quant.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {allSpeakers.map((speaker) => (
           <Link key={speaker.id} href={`/speakers/${speaker.id}`} className="group block w-full max-w-[280px]">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ring-4 ring-background">
                 <Image src={speaker.avatar} alt={speaker.name} fill className="object-cover" data-ai-hint="chân dung chuyên nghiệp"/>
              </div>
              <h3 className="text-xl font-bold">{speaker.name}</h3>
              <p className="text-primary font-medium">{speaker.title}</p>
              <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Xem hồ sơ <ArrowRight className="w-4 h-4" />
                </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

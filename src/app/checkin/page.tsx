
import { getTodaysEvents } from "@/lib/events";
import CheckinClient from "./checkin-client";
import { QrCode } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CheckinPage() {
    // Fetch events happening today on the server
    const todaysEvents = await getTodaysEvents();
    
    return (
        <div className="container min-h-[80vh] flex flex-col items-center justify-center py-12">
            <div className="text-center mb-8">
                 <div className="inline-block p-4 bg-primary/10 text-primary rounded-full mb-4">
                    <QrCode className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight font-headline">Check-in sự kiện</h1>
                <p className="text-lg text-muted-foreground mt-2">Xác nhận tham dự để chúng tôi biết bạn đã ở đây!</p>
            </div>
            <CheckinClient todaysEvents={todaysEvents} />
        </div>
    );
}

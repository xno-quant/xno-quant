import { Event } from './events';
import { format, addMinutes } from 'date-fns';

interface GoogleCalendarParams {
    title: string;
    details: string;
    location: string;
    startDate: Date;
    endDate: Date;
    reminders?: string; // Format: "24h,2h" for 1 day and 2 hours before
}

export function createGoogleCalendarUrl(params: GoogleCalendarParams): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatGoogleDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const searchParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: params.title,
        details: params.details,
        location: params.location,
        dates: `${formatGoogleDate(params.startDate)}/${formatGoogleDate(params.endDate)}`,
        // Add reminders: 24h = 1440 minutes, 2h = 120 minutes
        rem1: '1440', // 24 hours before (in minutes)
        rem2: '120',  // 2 hours before (in minutes)
    });

    return `${baseUrl}?${searchParams.toString()}`;
}

export function generateEventCalendarUrl(event: Event): string {
    const startDate = new Date(event.date);
    const duration = event.duration || 120; // Default 2 hours
    const endDate = addMinutes(startDate, duration);

    const details = `${event.tagline}

📅 Sự kiện: ${event.title}
📍 Địa điểm: ${event.location}
🕐 Thời gian: ${format(startDate, 'dd/MM/yyyy HH:mm')} - ${format(endDate, 'HH:mm')}

Lịch trình:
${event.schedule.map(item => `• ${item.time} - ${item.title}`).join('\n')}

Đăng ký tại: ${typeof window !== 'undefined' ? window.location.origin : 'https://xnoquant.com'}

---
🔔 Nhắc nhở được đặt:
• 1 ngày trước sự kiện
• 2 giờ trước sự kiện`;

    return createGoogleCalendarUrl({
        title: `[XNO Quant] ${event.title}`,
        details,
        location: event.location,
        startDate,
        endDate,
    });
}
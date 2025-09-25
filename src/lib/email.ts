
'use server';
import fs from 'fs/promises';
import path from 'path';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "hello@xnoquant.vn";
const SENDER_NAME = "XNO Quant Events";

// Log để debug email configuration
console.log("Email configuration:", {
    BREVO_API_KEY: BREVO_API_KEY ? "SET" : "NOT SET",
    SENDER_EMAIL: SENDER_EMAIL,
    SENDER_NAME: SENDER_NAME
});

interface EmailRecipient {
    email: string;
    name: string;
}

interface ConfirmationEmailPayload {
    to: EmailRecipient;
    eventName: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    eventDuration?: number;
    calendarUrl?: string;
}

async function getEmailTemplate(): Promise<string> {
    try {
        // Sử dụng URL public thay vì đọc file local
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
            ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
            : 'http://localhost:3000';
        const templateUrl = `${baseUrl}/template/registration-confirmation.html`;

        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`);
        }

        const template = await response.text();
        return template;
    } catch (error) {
        console.error("Error fetching email template:", error);
        // Fallback to a simple HTML template
        return `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px;">
                <div style="text-align: center; padding: 20px; background: #7B61FF; color: white; border-radius: 8px 8px 0 0;">
                    <h1>Đăng ký thành công!</h1>
                </div>
                <div style="padding: 20px;">
                    <h2 style="color: #1FAD8E;">Chào {{name}},</h2>
                    <p>🎉 Chúc mừng! Bạn đã đăng ký thành công sự kiện <strong>{{eventTitle}}</strong>.</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1FAD8E;">
                        <p><strong>📅 Thời gian:</strong> {{eventDate}} lúc {{eventTime}}</p>
                        <p><strong>📍 Địa điểm:</strong> {{eventLocation}}</p>
                        <p><strong>⏱️ Thời lượng:</strong> {{eventDuration}} phút</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{{calendarUrl}}" style="display: inline-block; background: #1FAD8E; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">📅 Thêm vào lịch Google</a>
                    </div>
                    <p>Theo dõi cộng đồng XNO Quant: <a href="https://xnoquant.vn" style="color: #1FAD8E;">xnoquant.vn</a></p>
                    <br>
                    <p>Trân trọng,<br><strong style="color: #1FAD8E;">Đội ngũ XNO Quant</strong></p>
                </div>
                <div style="text-align: center; padding: 15px; background: #333; color: white; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px;">© {{year}} XNO Quant. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

export async function sendRegistrationConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {
    if (!BREVO_API_KEY) {
        console.warn("BREVO_API_KEY is not set. Skipping sending email.");
        return;
    }

    let htmlContent = await getEmailTemplate();
    htmlContent = htmlContent.replace(/{{name}}/g, payload.to.name)
        .replace(/{{eventTitle}}/g, payload.eventName)
        .replace(/{{eventDate}}/g, payload.eventDate || 'Chưa xác định')
        .replace(/{{eventTime}}/g, payload.eventTime || 'Chưa xác định')
        .replace(/{{eventLocation}}/g, payload.eventLocation || 'Chưa xác định')
        .replace(/{{eventDuration}}/g, payload.eventDuration?.toString() || '120')
        .replace(/{{calendarUrl}}/g, payload.calendarUrl || '#')
        .replace(/{{year}}/g, new Date().getFullYear().toString());

    const emailPayload = {
        sender: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
        },
        to: [
            {
                email: payload.to.email,
                name: payload.to.name,
            },
        ],
        subject: `[Xác nhận] Đăng ký thành công sự kiện: ${payload.eventName}`,
        htmlContent: htmlContent,
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY,
            },
            body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Failed to send email: ${response.status} ${JSON.stringify(errorBody)}`);
        }

        console.log(`Confirmation email sent successfully to ${payload.to.email}`);

    } catch (error) {
        console.error("Error sending confirmation email via Brevo:", error);
        // We don't re-throw the error to avoid failing the whole registration process
        // just because the email failed to send.
    }
}

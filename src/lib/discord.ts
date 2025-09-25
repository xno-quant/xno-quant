
'use server';

type DiscordPayload = {
    content?: string;
    embeds?: Array<{
        title?: string;
        description?: string;
        color?: number;
        fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
        }>;
        footer?: {
            text: string;
        };
        timestamp?: string;
    }>;
};

export async function sendDiscordNotification(payload: DiscordPayload) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn("DISCORD_WEBHOOK_URL is not set. Skipping notification.");
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...payload,
                username: "XNO Event Bot",
                avatar_url: "https://xno.vn/_next/image?url=%2Flogo.png&w=256&q=75",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lỗi gửi thông báo Discord: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error("Lỗi mạng khi gửi thông báo Discord:", error);
    }
}

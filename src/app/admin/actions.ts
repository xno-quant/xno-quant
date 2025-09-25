
'use server';

import { verifyIdToken, isAdmin } from "@/lib/firebase/server-app";
import { z } from "zod";

const actionSchema = z.object({
    idToken: z.string().min(1, "Yêu cầu xác thực."),
    eventId: z.string().min(1, "Vui lòng chọn sự kiện."),
});

// Mock data - in a real app, this would come from a database
const mockRegistrations: any = {
    'giao-dich-thuat-toan-tu-nghien-cuu-den-thuc-tien': [
        { name: 'Nguyễn Văn A', email: 'a@example.com', phone: '0901234567', currentJob: 'Developer', question: 'Làm sao để backtest hiệu quả?' },
        { name: 'Trần Thị B', email: 'b@example.com', phone: '0907654321', currentJob: 'Student', question: 'Python có thư viện nào hay cho quant trading?' },
    ],
    'ai-ml-du-bao-bien-dong': [
        { name: 'Lê Văn C', email: 'c@example.com', phone: '0988112233', currentJob: 'Data Scientist', question: 'Mô hình nào phù hợp cho dự báo biến động?' },
    ],
};

const mockFeedbacks: any = {
    'quant-trading-backtesting-ung-dung-ml': [
        { rating: 5, feedback: 'Nội dung rất hay và thực tế!', futureTopic: 'Deep Learning for trading' },
        { rating: 4, feedback: 'Diễn giả nhiệt tình, địa điểm hơi nhỏ.', futureTopic: 'Thêm về quản lý rủi ro' },
    ],
};

async function verifyAdmin(idToken: string) {
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (!isAdmin(decodedToken.email)) {
            throw new Error("Không có quyền truy cập.");
        }
        return decodedToken;
    } catch (error) {
        console.error("Lỗi xác thực admin:", error);
        throw new Error("Xác thực không thành công.");
    }
}


export async function getRegistrations(prevState: any, formData: FormData) {
    try {
        const validatedFields = actionSchema.safeParse(Object.fromEntries(formData));

        if (!validatedFields.success) {
            return { type: "error", message: "Dữ liệu không hợp lệ." };
        }
        
        await verifyAdmin(validatedFields.data.idToken);

        const data = mockRegistrations[validatedFields.data.eventId] || [];
        
        return { type: "success", dataType: "registrations", data };

    } catch (e: any) {
        return { type: "error", message: e.message || "Đã xảy ra lỗi không mong muốn." };
    }
}

export async function getFeedback(prevState: any, formData: FormData) {
    try {
        const validatedFields = actionSchema.safeParse(Object.fromEntries(formData));

        if (!validatedFields.success) {
            return { type: "error", message: "Dữ liệu không hợp lệ." };
        }
        
        await verifyAdmin(validatedFields.data.idToken);

        const data = mockFeedbacks[validatedFields.data.eventId] || [];

        return { type: "success", dataType: "feedback", data };

    } catch (e: any) {
        return { type: "error", message: e.message || "Đã xảy ra lỗi không mong muốn." };
    }
}


"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifyIdToken, db } from "@/lib/firebase/server-app";
import { sendDiscordNotification } from "@/lib/discord";
import type { Event } from "@/lib/events";
import { getEventById, getLatestEvent } from "@/lib/events";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
import { generateEventContent } from "@/ai/flows/generate-event-content";
import { generateEventCalendarUrl } from "@/lib/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Vietnamese phone number regex: handles 10-digit numbers starting with 0, or +84 followed by 9 digits.
const vnPhoneNumberRegex = /^(0[35789][0-9]{8}|(\+84)[35789][0-9]{8})$/;

// Registration Form Action
const registrationSchema = z.object({
  idToken: z.string().min(1, "Yêu cầu xác thực."),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().regex(vnPhoneNumberRegex, "Số điện thoại không hợp lệ. Vui lòng sử dụng định dạng 10 số (VD: 09xxxxxxxx) hoặc có mã vùng +84 (VD: +849xxxxxxxx)."),
  currentJob: z.string().optional(),
  question: z.string().optional(),
  eventId: z.string().optional(), // Added to know which event is being registered for
});

export async function registerForEvent(prevState: any, formData: FormData) {
  try {
    const validatedFields = registrationSchema.safeParse({
      idToken: formData.get("idToken"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      currentJob: formData.get("currentJob"),
      question: formData.get("question"),
      eventId: formData.get('eventId')
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        message: "Dữ liệu biểu mẫu không hợp lệ.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(validatedFields.data.idToken);
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      return {
        type: "error" as const,
        message: "Xác thực không thành công. Vui lòng đăng nhập lại.",
      };
    }

    let event: Event | undefined;
    const eventIdSlug = validatedFields.data.eventId;

    if (eventIdSlug === 'homepage-event') {
      event = await getLatestEvent();
    } else if (eventIdSlug) {
      event = await getEventById(eventIdSlug);
    }

    // Save to Firestore
    const registrationData = {
      uid: decodedToken.uid,
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      phone: validatedFields.data.phone,
      currentJob: validatedFields.data.currentJob,
      question: validatedFields.data.question,
      eventId: event?.id,
      eventTitle: event?.title,
      registrationTime: new Date().toISOString(),
      createdAt: new Date(),
    };

    console.log("Đăng ký mới:", registrationData);

    // Save to Firestore if available
    if (db) {
      try {
        await db.collection('registrations').add(registrationData);
        console.log("Đã lưu đăng ký vào Firestore");
      } catch (firestoreError) {
        console.error("Lỗi lưu vào Firestore:", firestoreError);
        // Continue with the process even if Firestore fails
      }
    } else {
      console.warn("Firestore không khả dụng - chạy ở chế độ static mode");
    }

    // Send Discord Notification
    await sendDiscordNotification({
      embeds: [{
        title: `📝 Đăng ký mới cho sự kiện: ${event?.title || 'Chưa xác định'}`,
        color: 0x5865F2, // Discord brand color
        fields: [
          { name: 'Họ và tên', value: registrationData.name, inline: true },
          { name: 'Email', value: registrationData.email || 'Không có', inline: true },
          { name: 'Số điện thoại', value: registrationData.phone, inline: true },
          { name: 'Công việc', value: registrationData.currentJob || 'Chưa cung cấp', inline: false },
          { name: 'Câu hỏi', value: registrationData.question || 'Không có', inline: false },
          { name: 'Thời gian sự kiện', value: event?.formattedDate || 'Chưa xác định', inline: true },
          { name: 'Thời gian đăng ký', value: new Date().toLocaleString('vi-VN'), inline: true },
        ],
        timestamp: new Date().toISOString(),
      }]
    });

    // Send Confirmation Email
    if (registrationData.email && event) {
      const eventDateTime = new Date(event.date);
      const calendarUrl = event.enableCalendar ? generateEventCalendarUrl(event) : '#';

      await sendRegistrationConfirmationEmail({
        to: {
          email: registrationData.email,
          name: registrationData.name,
        },
        eventName: event.title,
        eventDate: format(eventDateTime, 'EEEE, dd MMMM yyyy', { locale: vi }),
        eventTime: format(eventDateTime, 'HH:mm'),
        eventLocation: event.location,
        eventDuration: event.duration || 120,
        calendarUrl: calendarUrl,
      });
    }

    revalidatePath("/");
    revalidatePath(`/events/${eventIdSlug}`);


    return {
      type: "success" as const,
      message: "Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
    };
  } catch (e) {
    console.error("Lỗi máy chủ:", e);
    // Also send error to discord
    await sendDiscordNotification({
      content: `🚨 **Lỗi khi xử lý đăng ký:**\n\`\`\`${(e as Error).message}\`\`\``
    });
    return {
      type: "error" as const,
      message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
    };
  }
}

// Feedback Form Action
const feedbackSchema = z.object({
  eventId: z.string(),
  rating: z.string().min(1, "Vui lòng chọn một đánh giá."),
  feedback: z.string().optional(),
  futureTopic: z.string().optional(),
  // Detailed feedback fields
  rating_organization: z.string().optional(),
  feedback_organization: z.string().optional(),
  rating_content: z.string().optional(),
  feedback_content: z.string().optional(),
  rating_speaker: z.string().optional(),
  feedback_speaker: z.string().optional(),
});

export async function submitFeedback(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData);

    const isDetailed = formData.get('detailed_mode') === 'true';

    let schema = feedbackSchema;

    // In detailed mode, some optional fields in the base schema might become required.
    const detailedSchema = feedbackSchema.extend({
      // Rating is already required in base schema
      rating_organization: z.string().min(1, "Vui lòng đánh giá công tác tổ chức."),
      rating_content: z.string().min(1, "Vui lòng đánh giá nội dung chương trình."),
      rating_speaker: z.string().min(1, "Vui lòng đánh giá diễn giả."),
    });

    const validationSchema = isDetailed ? detailedSchema : feedbackSchema;

    const validatedFields = validationSchema.safeParse(data);

    if (!validatedFields.success) {
      console.error(validatedFields.error.flatten().fieldErrors);
      return {
        type: "error" as const,
        message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường được yêu cầu.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const feedbackData = {
      ...validatedFields.data,
      isDetailed: isDetailed,
      submittedAt: new Date().toISOString(),
      createdAt: new Date(),
    };

    console.log("Phản hồi mới:", feedbackData);

    // Save to Firestore if available
    if (db) {
      try {
        await db.collection('feedbacks').add(feedbackData);
        console.log("Đã lưu phản hồi vào Firestore");
      } catch (firestoreError) {
        console.error("Lỗi lưu feedback vào Firestore:", firestoreError);
        // Continue with the process even if Firestore fails
      }
    } else {
      console.warn("Firestore không khả dụng - chạy ở chế độ static mode");
    }

    // Send Discord Notification
    const event = await getEventById(feedbackData.eventId);
    const description = isDetailed
      ? `
**Tổ chức:** ${feedbackData.rating_organization}⭐ - *${feedbackData.feedback_organization || "Không có ghi chú"}*
**Nội dung:** ${feedbackData.rating_content}⭐ - *${feedbackData.feedback_content || "Không có ghi chú"}*
**Diễn giả:** ${feedbackData.rating_speaker}⭐ - *${feedbackData.feedback_speaker || "Không có ghi chú"}*
            `
      : feedbackData.feedback || 'Không có góp ý chi tiết.';

    await sendDiscordNotification({
      embeds: [{
        title: `⭐ Góp ý mới cho sự kiện: ${event?.title || feedbackData.eventId}`,
        description: description,
        color: 0xFEE75C, // Yellow color
        fields: [
          { name: 'Đánh giá chung', value: `${feedbackData.rating} sao`, inline: true },
          { name: 'Đề xuất chủ đề', value: feedbackData.futureTopic || 'Không có', inline: false },
        ],
        timestamp: new Date().toISOString(),
      }]
    });

    revalidatePath(`/events/${feedbackData.eventId}`);

    return {
      type: "success" as const,
      message: "Cảm ơn bạn đã gửi phản hồi!",
    };
  } catch (e) {
    console.error(e);
    // Also send error to discord
    await sendDiscordNotification({
      content: `🚨 **Lỗi khi xử lý feedback:**\n\`\`\`${(e as Error).message}\`\`\``
    });
    return {
      type: "error" as const,
      message: "Đã xảy ra lỗi không mong muốn khi gửi phản hồi.",
    };
  }
}

const generateContentSchema = z.object({
  eventName: z.string().min(1, "Tên sự kiện không được để trống"),
  eventTopic: z.string().min(1, "Chủ đề sự kiện không được để trống"),
});

export async function generateContentAction(prevState: any, formData: FormData) {
  const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';
  if (isStaticMode) {
    return { type: 'error', message: 'Tính năng AI bị vô hiệu hóa ở chế độ tĩnh.' };
  }

  try {
    const validatedFields = generateContentSchema.safeParse({
      eventName: formData.get("eventName"),
      eventTopic: formData.get("eventTopic"),
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        message: "Dữ liệu không hợp lệ.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const result = await generateEventContent(validatedFields.data);

    return {
      type: "success" as const,
      message: "Nội dung đã được tạo thành công.",
      data: result,
    };
  } catch (e) {
    console.error("Lỗi tạo nội dung AI:", e);
    return {
      type: "error" as const,
      message: "Đã xảy ra lỗi khi tạo nội dung. Vui lòng thử lại.",
    };
  }
}

// Check-in Form Action
const checkinSchema = z.object({
  idToken: z.string().min(1, "Yêu cầu xác thực."),
  eventId: z.string().min(1, "Vui lòng chọn một sự kiện để check-in."),
});

export async function checkinForEvent(prevState: any, formData: FormData) {
  try {
    const validatedFields = checkinSchema.safeParse({
      idToken: formData.get("idToken"),
      eventId: formData.get("eventId"),
    });

    if (!validatedFields.success) {
      return {
        type: "error" as const,
        message: "Dữ liệu không hợp lệ.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(validatedFields.data.idToken);
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      return {
        type: "error" as const,
        message: "Xác thực không thành công. Vui lòng đăng nhập lại.",
      };
    }

    const event = await getEventById(validatedFields.data.eventId);
    if (!event) {
      return { type: "error" as const, message: "Không tìm thấy sự kiện." };
    }

    // "Save" to database
    const checkinData = {
      uid: decodedToken.uid,
      userName: (decodedToken as any).name || decodedToken.email?.split('@')[0] || 'Unknown User',
      userEmail: decodedToken.email,
      eventId: event.id,
      eventName: event.title,
      checkinTime: new Date().toISOString(),
    };
    console.log("Check-in mới:", checkinData);

    // Save to Firestore if available
    if (db) {
      try {
        await db.collection('checkins').add({
          ...checkinData,
          createdAt: new Date(),
        });
        console.log("Đã lưu check-in vào Firestore");
      } catch (firestoreError) {
        console.error("Lỗi lưu check-in vào Firestore:", firestoreError);
        // Continue with the process even if Firestore fails
      }
    } else {
      console.warn("Firestore không khả dụng - chạy ở chế độ static mode");
    }

    // Send Discord Notification
    await sendDiscordNotification({
      embeds: [{
        title: `✅ Check-in thành công: ${event.title}`,
        color: 0x57F287, // Green color
        fields: [
          { name: 'Họ và tên', value: checkinData.userName || 'Không có', inline: true },
          { name: 'Email', value: checkinData.userEmail || 'Không có', inline: true },
          { name: 'Thời gian check-in', value: new Date(checkinData.checkinTime).toLocaleString('vi-VN'), inline: false },
        ],
        timestamp: new Date().toISOString(),
      }]
    });

    revalidatePath("/checkin");

    return {
      type: "success" as const,
      message: `Check-in thành công cho sự kiện ${event.title}!`,
    };
  } catch (e) {
    console.error("Lỗi máy chủ khi check-in:", e);
    await sendDiscordNotification({
      content: `🚨 **Lỗi khi xử lý check-in:**\n\`\`\`${(e as Error).message}\`\`\``
    });
    return {
      type: "error" as const,
      message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
    };
  }
}

# XNO Quant Event Workshop

## Kiến trúc dự án
Website được xây dựng trên nền tảng **Next.js** (App Router) kết hợp với **Firebase** (Firestore, Auth), **Brevo** (email), **Discord** (thông báo) và quản lý nội dung động bằng **Markdown**.

- **Next.js**: Xử lý routing, UI, logic động, server actions.
- **Firebase Firestore**: Lưu trữ dữ liệu đăng ký, check-in, phản hồi sự kiện.
- **Firebase Auth**: Xác thực người dùng qua Google.
- **Brevo**: Gửi email xác nhận đăng ký, thông báo sự kiện.
- **Discord Webhook**: Gửi thông báo đăng ký/feedback về kênh thông báo của admin.
- **Tailwind CSS + shadcn/ui**: Giao diện hiện đại, tuân thủ brand color.
- **Markdown**: Quản lý nội dung sự kiện và diễn giả dễ dàng, không cần CMS.

## Quản lý dữ liệu sự kiện & diễn giả bằng Markdown

Toàn bộ thông tin về sự kiện và diễn giả được lưu trong thư mục `content/` dưới dạng file markdown (`.md`).

- `content/events/`: Mỗi file là một sự kiện, chứa metadata (frontmatter) và nội dung chi tiết.
- `content/speakers/`: Mỗi file là một diễn giả, chứa thông tin cá nhân, kinh nghiệm, mạng xã hội.

Khi build, Next.js sẽ tự động đọc các file này, phân tích frontmatter và render ra giao diện. Việc thêm/sửa/xóa sự kiện hoặc diễn giả chỉ cần chỉnh sửa file markdown, không cần thao tác với database hay CMS.

Ví dụ file sự kiện:
```markdown
---
title: "Workshop AI & Quant Trading"
date: "2025-10-01 09:00"
duration: 120
location: "RMIT University"
enableCalendar: true
image: "/images/workshop-1-hinh-1.jpg"
---
Nội dung chi tiết về sự kiện...
```

Ví dụ file diễn giả:
```markdown
---
name: "ThS. Ngô Hiền Dương"
title: "Chuyên gia AI trong Đầu tư Định lượng"
avatar: "/images/speaker-ngo-hien-duong.jpg"
companyLogo: "/logo/xno-logo.svg"
summary: "Một đoạn tóm tắt ngắn gọn về diễn giả."
bio: "Tiểu sử chi tiết..."
expertise:
	- "AI/Machine Learning"
	- "Lập Mô hình Tài chính"
socials:
	linkedin: "https://www.linkedin.com/in/..."
---
```

> Xem chi tiết cấu trúc và hướng dẫn thêm/sửa nội dung tại [docs/GUIDE.md](docs/GUIDE.md#muc-3).

# II. Setup Guide

## 1. Tổng quan
Website sự kiện XNO Quant sử dụng Next.js, Firebase, Brevo, Discord, và Markdown cho nội dung động. Để phát triển hoặc triển khai, hãy làm theo các bước sau.

## 2. Các bước setup cho developer

### 2.1. Clone & Cài đặt dependencies
```bash
git clone <repo-url>
cd xnoquant-workshop-event-nextjs
npm install
```

### 2.2. Thiết lập biến môi trường
Tạo file `.env` ở thư mục gốc. Tham khảo chi tiết tại [docs/GUIDE.md](docs/GUIDE.md) mục "Thiết lập biến môi trường".

### 2.3. Kích hoạt Firestore & Deploy Security Rules
1. Vào Firebase Console > Firestore Database > Create database
2. Chọn "Start in production mode" để bảo mật
3. Đảm bảo đã bật Firestore API ([hướng dẫn chi tiết](docs/GUIDE.md#muc-4.3))
4. Deploy rules:
	```bash
	npm install -g firebase-tools
	firebase login
	firebase init firestore # nếu chưa có firebase.json
	firebase deploy --only firestore:rules
	```
5. File rules mẫu: `firestore.rules` (đã có sẵn)

### 2.4. Cấu hình Brevo để gửi email tự động
1. Đăng ký tài khoản tại https://www.brevo.com/
2. Lấy API key và thêm vào `.env`
3. Truy cập [Brevo Authorized IPs](https://app.brevo.com/security/authorised_ips) và thêm IP của server (Netlify, Vercel, VPS...)
	- Để lấy IP, kiểm tra log lỗi gửi mail (xem mục dưới)
	- Nếu không muốn giới hạn IP, có thể tắt "Restrict access by IP" trong Brevo
4. Đảm bảo email gửi đi đã được verify trong Brevo

### 2.5. Kiểm tra log lỗi gửi mail
Nếu email không gửi được, kiểm tra log tại:
https://app.netlify.com/projects/quant-events/logs/functions/___netlify-server-handler
Tìm lỗi liên quan đến "Brevo IP authorization" hoặc "Unauthorized IP" để lấy IP và thêm vào whitelist.

### 2.6. Tham khảo tài liệu chi tiết
Toàn bộ logic, cấu hình, và hướng dẫn chi tiết đã được ghi lại tại [docs/GUIDE.md](docs/GUIDE.md). Bao gồm:
- Cấu trúc thư mục
- Cách thêm/sửa nội dung sự kiện, diễn giả
- Logic CTA động, countdown, Google Calendar
- Cấu hình Firestore, Brevo, Discord
- Email template, brand colors

## 3. Email Marketing Scripts

Dự án có hệ thống script gửi email marketing hàng loạt cho danh sách khách hàng:

### 3.1. Chuẩn bị dữ liệu
- Tạo file `/data/email-list.json` với danh sách email (xem format tại `/data/README.md`)
- Chia thành 3 nhóm: `past-attendee`, `registered-only`, `new-prospect`
- Mỗi user có thể có `customText` riêng

### 3.2. Chạy script marketing
```bash
# Cập nhật thông tin sự kiện trong scripts/send-marketing-emails.js
node scripts/send-marketing-emails.js
```

### 3.3. Template emails
- `past-attendee-invite.html`: Khách cũ đã tham gia workshop trước
- `registered-only-invite.html`: Khách đã đăng ký nhưng chưa tham gia
- `new-prospect-invite.html`: Khách mới hoàn toàn

> Chi tiết sử dụng scripts xem tại [scripts/README.md](scripts/README.md)

## 4. Một số lưu ý
- Khi deploy lên môi trường production, kiểm tra lại biến môi trường và security rules
- Đảm bảo IP server đã được thêm vào Brevo nếu dùng email tự động
- Nếu dùng chế độ static (`NEXT_PUBLIC_STATIC_MODE=true`), các tính năng backend sẽ bị vô hiệu hóa
- File `/data/` đã được ignore trong Git để bảo vệ thông tin khách hàng

---
Mọi thắc mắc hoặc lỗi phát sinh, vui lòng xem log, kiểm tra lại các bước trên hoặc liên hệ admin qua Discord.

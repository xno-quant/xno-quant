# Cấu trúc dữ liệu cho Email Marketing

## Format CSV (khuyên dùng)
File: `/data/email-list.csv`

```csv
email,name,userType,customText
user1@example.com,"Nguyễn Văn A",past-attendee,"Cảm ơn bạn đã tham gia Workshop 1 & 2!"
user2@example.com,"Trần Thị B",registered-only,"Đây là cơ hội tuyệt vời để tham gia!"
user3@example.com,"Lê Văn C",new-prospect,"Chào mừng bạn đến với cộng đồng XNO Quant!"
```

## Format JSON (vẫn hỗ trợ)
File: `/data/email-list.json`

```json
[
  {
    "email": "user@example.com",
    "name": "Tên đầy đủ", 
    "userType": "past-attendee|registered-only|new-prospect",
    "customText": "Nội dung tùy chỉnh theo ngữ cảnh người dùng"
  }
]
```

## Các loại userType

### past-attendee
- **Mô tả**: Khách đã tham gia sự kiện 1 và/hoặc 2 trước đây
- **Template**: `past-attendee-invite.html`
- **Tone**: Thân thiện, cảm ơn sự tham gia trước, mời tiếp tục hành trình

### registered-only  
- **Mô tả**: Khách đã từng đăng ký nhưng chưa tham gia sự kiện nào
- **Template**: `registered-only-invite.html`
- **Tone**: Khuyến khích, nhấn mạnh cơ hội không nên bỏ lỡ

### new-prospect
- **Mô tả**: Khách mới hoàn toàn, XNO có email nhưng chưa tương tác
- **Template**: `new-prospect-invite.html`  
- **Tone**: Giới thiệu, xây dựng niềm tin, tạo ấn tượng đầu tiên

## Trường customText
- Nội dung cá nhân hóa cho từng người dùng
- Có thể chứa lý do mời, thành tích trước đây, hoặc lời nhắn đặc biệt
- Sẽ được chèn vào template tại vị trí `{{customText}}`

## Hướng dẫn sử dụng từng bước với ví dụ cụ thể

### 1. Chuẩn bị file dữ liệu CSV

Tạo file `/data/email-list.csv` với nội dung ví dụ:
```csv
email,name,userType,customText
user1@example.com,"Nguyễn Văn A",past-attendee,"Cảm ơn bạn đã tham gia Workshop 1 & 2!"
user2@example.com,"Trần Thị B",registered-only,"Đây là cơ hội tuyệt vời để tham gia!"
user3@example.com,"Lê Văn C",new-prospect,"Chào mừng bạn đến với cộng đồng XNO Quant!"
```

### 2. Chuẩn bị thông tin sự kiện

Chỉnh sửa file markdown sự kiện, ví dụ: `content/events/3-ai-ml-du-bao-bien-dong.md` với YAML frontmatter như sau:
```yaml
---
title: "Workshop AI & Machine Learning trong Đầu tư Định lượng"
date: "25/10/2025"
time: "09:00"
location: "RMIT University, Quận 7, TP.HCM"
duration: "120"
url: "https://xnoquant.vn"
registrationUrl: "https://xnoquant.vn/register"
calendarUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Workshop%20AI%20%26%20ML%20XNO%20Quant"
---
```

### 3. Kiểm tra cấu hình Brevo

Đảm bảo file `.env` có các biến sau:
```
BREVO_API_KEY=your-api-key
NEXT_PUBLIC_BREVO_FROM_EMAIL=hello@xnoquant.vn
NEXT_PUBLIC_BREVO_FROM_NAME=XNO Quant
```

### 4. Chạy script gửi email

Từ thư mục gốc dự án, chạy:
```
node scripts/send-marketing-emails.js
```

Nếu không tìm thấy file CSV, script sẽ hỏi bạn nhập đường dẫn file dữ liệu.

### 5. Kiểm tra kết quả

Script sẽ hiển thị tiến độ gửi, thống kê theo loại user, tỷ lệ thành công và các lỗi (nếu có).

## Lưu ý bảo mật
- File `/data/` đã được ignore trong .gitignore
- Không commit dữ liệu khách hàng lên git
- Sao lưu dữ liệu ở nơi an toàn trước khi chạy script
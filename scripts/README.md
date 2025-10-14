# Email Marketing Scripts

Thư mục này chứa các script để gửi email marketing hàng loạt cho danh sách khách hàng của XNO Quant.

## Cấu trúc file

```
/scripts
├── send-marketing-emails.js    # Script chính gửi email marketing
└── README.md                   # Hướng dẫn này

/data
├── email-list.csv             # Danh sách email thực tế (được ignore)
└── README.md                  # Hướng dẫn cấu trúc dữ liệu

/public/template
├── past-attendee-invite.html     # Template cho khách cũ
├── registered-only-invite.html   # Template cho khách đã đăng ký
├── new-prospect-invite.html      # Template cho khách mới
└── registration-confirmation.html # Template xác nhận đăng ký
```

## Hướng dẫn sử dụng

### 1. Chuẩn bị dữ liệu

Tạo file `/data/email-list.csv` với format:

**CSV Format:**
```csv
email,name,userType,customText
user@example.com,"Tên người dùng",past-attendee,"Nội dung tùy chỉnh"
```

**Các loại userType:**
- `past-attendee`: Khách đã tham gia workshop 1 & 2
- `registered-only`: Khách đã đăng ký nhưng chưa tham gia
- `new-prospect`: Khách hoàn toàn mới

### 2. Cấu hình thông tin sự kiện

Thông tin sự kiện sẽ được tự động lấy từ file markdown (YAML frontmatter) bạn khai báo ở đầu file script, ví dụ:

```js
const EVENT_MARKDOWN_PATH = path.join(__dirname, '..', 'content', 'events', '3-ai-ml-du-bao-bien-dong.md');
```

Các trường cần có trong frontmatter:
```yaml
---
title: "Tên sự kiện mới"
date: "DD/MM/YYYY"
time: "HH:MM"
location: "Địa điểm tổ chức"
duration: "Số phút"
url: "Link sự kiện"
registrationUrl: "Link đăng ký"
calendarUrl: "Link Google Calendar"
---
```

### 3. Kiểm tra cấu hình Brevo

Đảm bảo các biến môi trường được thiết lập trong `.env`:

```bash
BREVO_API_KEY=your-api-key
NEXT_PUBLIC_BREVO_FROM_EMAIL=hello@xnoquant.vn
NEXT_PUBLIC_BREVO_FROM_NAME=XNO Quant
```

### 4. Chạy script

```bash
# Từ thư mục gốc của dự án
node scripts/send-marketing-emails.js
```

Nếu không tìm thấy file CSV, script sẽ hỏi bạn nhập đường dẫn file CSV dữ liệu.

### 5. Monitoring kết quả

Script sẽ hiển thị:
- ✅ Tiến độ gửi email từng người
- 📊 Thống kê theo loại user
- ❌ Danh sách lỗi (nếu có)
- 📈 Tỷ lệ thành công

## Ví dụ output

```
🚀 Starting email marketing campaign...

📊 Found 150 recipients
📈 Recipients by type:
   past-attendee: 75 users
   registered-only: 45 users  
   new-prospect: 30 users

[1/150] Processing: Nguyễn Văn A (email@example.com) - past-attendee
   ✅ Sent successfully (ID: 12345)

...

📊 Campaign Summary:
✅ Successfully sent: 148
❌ Failed: 2
📈 Success rate: 98.7%
🎉 Campaign completed!
```

## Tính năng

### Rate Limiting
- Tự động delay 1 giây giữa mỗi email để tránh bị Brevo block
- Có thể điều chỉnh trong code nếu cần

### Template tự động
- Tự động chọn template phù hợp theo `userType`
- Subject line được tùy chỉnh theo từng nhóm
- Hỗ trợ custom text cho từng người dùng

### Error Handling
- Tiếp tục gửi nếu có email lỗi
- Log chi tiết lỗi để debug
- Báo cáo tổng kết cuối campaign

### Data Validation
- Kiểm tra format JSON
- Validate required fields
- Kiểm tra template tồn tại

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: 
- File `/data/` đã được ignore trong Git
- Không bao giờ commit dữ liệu khách hàng
- Backup dữ liệu trước khi chạy script
- Test với ít email trước khi chạy hàng loạt

## Troubleshooting

### Lỗi thường gặp:

1. **"BREVO_API_KEY not found"**
   - Kiểm tra file `.env` có đúng key không

2. **"Email list not found"**  
   - Tạo file `/data/email-list.csv`
   - Đảm bảo đường dẫn đúng hoặc nhập khi được hỏi

3. **"Brevo API error: 401"**
   - API key sai hoặc hết hạn
   - Kiểm tra authorized IPs trong Brevo

4. **"Template not found"**
   - Kiểm tra file template có tồn tại trong `/public/template/`

### Test trước khi chạy:

```bash
# Test với 1-2 email cá nhân trước
# Tạo file test-list.csv với 2 email của bạn
# Chạy và kiểm tra email nhận được
```
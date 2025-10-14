# Hướng dẫn sử dụng và phát triển dự án

Chào mừng bạn đến với dự án website sự kiện của XNO Quant! Tài liệu này sẽ hướng dẫn bạn về cấu trúc dự án, cách hoạt động và cách để thêm/sửa nội dung một cách dễ dàng.

## 1. Tổng quan cấu trúc thư mục

Dự án được xây dựng trên nền tảng Next.js (sử dụng App Router). Dưới đây là các thư mục quan trọng bạn cần biết:

-   `src/app`: Chứa các trang (routes) chính của ứng dụng.
    -   `page.tsx`: Trang chủ.
    -   `events/[slug]/page.tsx`: Trang chi tiết của một sự kiện.
    -   `speakers/[speakerId]/page.tsx`: Trang thông tin chi tiết của một diễn giả.
    -   `layout.tsx`: Layout chung của toàn bộ trang web (chứa Header, Footer).
    -   `globals.css`: File CSS toàn cục, nơi định nghĩa các biến màu cho theme (light/dark).
    -   `actions.ts`: Chứa các "Server Actions" để xử lý logic backend như gửi form.

-   `src/components`: Chứa các React component có thể tái sử dụng.
    -   `ui`: Các component giao diện cơ bản từ `shadcn/ui` (ví dụ: `Button`, `Card`, `Input`).
    -   `sections`: Các component lớn, tương ứng với các phần của một trang (ví dụ: `event-hero`, `registration-form`, `feedback-form`).

-   `src/context`: Chứa các React Context, ví dụ như `auth-context.tsx` để quản lý trạng thái đăng nhập.

-   `src/lib`: Chứa các hàm logic, tiện ích.
    -   `events.ts`: Chứa các hàm để đọc và xử lý dữ liệu từ các file Markdown (lấy danh sách sự kiện, thông tin diễn giả, v.v.).
    -   `firebase`: Chứa các file cấu hình và khởi tạo Firebase cho client và server.
    -   `discord.ts`: Chứa hàm gửi thông báo đến Discord qua webhook.
    -   `utils.ts`: Các hàm tiện ích chung (ví dụ: `cn` để kết hợp class của Tailwind CSS).

-   `content`: **Nơi quan trọng nhất để quản lý nội dung.** Tất cả thông tin về sự kiện và diễn giả đều được lưu ở đây dưới dạng file Markdown (`.md`).
    -   `events`: Chứa các file markdown cho mỗi sự kiện.
    -   `speakers`: Chứa các file markdown cho mỗi diễn giả.

-   `public`: Chứa các tài sản tĩnh như hình ảnh, logo.
    - `images`: Nơi lưu trữ ảnh đại diện của diễn giả, ảnh sự kiện...

## 2. Logic hoạt động

1.  **Nguồn dữ liệu**: Toàn bộ nội dung động của trang web (thông tin sự kiện, diễn giả) được quản lý thông qua các file Markdown trong thư mục `content`.
2.  **Đọc dữ liệu**: Khi build ứng dụng, Next.js sẽ dùng các hàm trong `src/lib/events.ts` để đọc tất cả các file Markdown, phân tích cú pháp "frontmatter" (phần metadata ở đầu mỗi file) và nội dung chính. Thư viện `gray-matter` được dùng cho việc này.
3.  **Xử lý và hiển thị**: Dữ liệu sau khi đọc sẽ được xử lý (ví dụ: định dạng ngày tháng, kiểm tra sự kiện đã qua hay chưa) và truyền vào các component trong `src/app` để hiển thị ra giao diện người dùng. Nội dung Markdown được chuyển thành HTML bằng `remark` và `remark-html`.
4.  **Xác thực người dùng**: Ứng dụng sử dụng **Firebase Authentication** để quản lý việc đăng nhập của người dùng qua tài khoản Google. Trạng thái đăng nhập được quản lý toàn cục nhờ `AuthContext`.
5.  **Tương tác**: Người dùng tương tác với trang web thông qua các form (đăng ký, gửi phản hồi). Các form này sử dụng **Server Actions** (`src/app/actions.ts`) để xử lý dữ liệu một cách an toàn phía server mà không cần tạo API endpoint riêng. Dữ liệu từ form đăng ký sẽ được xác thực token người dùng trước khi xử lý. Khi có dữ liệu mới, một thông báo sẽ được gửi đến kênh Discord đã cấu hình.

## 3. Hướng dẫn soạn thảo nội dung

Để thêm hoặc sửa nội dung, bạn chỉ cần làm việc với các file trong thư mục `content`.

### 3.1. Thêm/sửa thông tin Diễn giả

-   **Vị trí**: `content/speakers/`
-   **Tên file**: Đặt tên file theo định dạng `ten-khong-dau.md`. Tên file này sẽ chính là `speakerId` trên URL. Ví dụ: `ngo-hien-duong.md`.
-   **Cấu trúc file**:

```markdown
---
name: "ThS. Ngô Hiền Dương"
title: "Chuyên gia AI trong Đầu tư Định lượng"
avatar: "/images/speaker-ngo-hien-duong.jpg" # Đường dẫn đến ảnh đại diện trong thư mục /public
companyLogo: "/logo/xno-logo.svg" # (Tùy chọn) Đường dẫn đến logo công ty trong /public
position: 3 # (Tùy chọn) Thứ tự hiển thị trên trang đội ngũ cố vấn
summary: "Một đoạn tóm tắt ngắn gọn về diễn giả (hiển thị trên trang chi tiết sự kiện và trang giới thiệu)."
bio: "Tiểu sử chi tiết của diễn giả. Bạn có thể sử dụng cú pháp Markdown ở đây."
expertise:
  - "AI/Machine Learning"
  - "Generative AI & Reinforcement Learning"
  - "Lập Mô hình Tài chính"
experience:
  - year: "Hiện tại"
    role: "Product Owner"
    description: "Vietnam Invest Tech"
  - year: "Kinh nghiệm"
    role: "Data Scientist & Quant Researcher"
    description: "Worldquant Associate, IRD Việt Nam..."
# quote: "Một câu trích dẫn hay của diễn giả (tùy chọn)"
socials: # (Tùy chọn)
  linkedin: "https://www.linkedin.com/in/..."
  github: "https://github.com/..."
  googleScholar: "https://scholar.google.com/citations?user=..."
  website: "https://vnstocks.com/..."
---
```

### 3.2. Thêm/sửa thông tin Sự kiện

-   **Vị trí**: `content/events/`
-   **Tên file**: Đặt tên file theo định dạng `so-thu-tu-ten-su-kien.md`. Số thứ tự giúp sắp xếp các sự kiện. Ví dụ: `3-ai-ml-du-bao-bien-dong.md`.
-   **Cấu trúc file**:

Phần nằm giữa hai dấu `---` được gọi là **Frontmatter**. Phần bên dưới là nội dung mô tả chi tiết của sự kiện.

```markdown
---
# --- THÔNG TIN BẮT BUỘC ---
title: "Ứng dụng AI trong dự báo biến động" # Tên sự kiện
tagline: "Khám phá cách AI và Machine Learning mở ra hướng đi mới..." # Dòng mô tả ngắn gọn
date: "2025-09-27 09:30" # Ngày giờ diễn ra, định dạng YYYY-MM-DD HH:MM
location: "X Building, 23 Đường số 53, An Phú, TP. Thủ Đức" # Địa điểm
image: "https://images.unsplash.com/..." # Ảnh bìa chính của sự kiện (hero banner)
order: 3 # Số thứ tự của sự kiện, số lớn hơn sẽ được ưu tiên hiển thị
speakers:
  - "ha-xuan-son" # Danh sách ID của diễn giả (tên file trong content/speakers)
schedule:
  - time: "09:30"
    title: "Giới thiệu: AI/Deep Learning trong dự báo thị trường"
    description: "Hiểu cách AI/Deep Learning vượt trội giúp dự báo thị trường..."
  - time: "09:50"
    title: "Kỹ thuật chọn lọc dữ liệu và chỉ báo"
    description: "Ứng dụng các kỹ thuật để tăng độ chính xác..."

# --- THÔNG TIN TÙY CHỌN ---
aboutImage: "https://images.unsplash.com/..." # Ảnh cho mục "Về sự kiện". Nếu bỏ trống, sẽ dùng ảnh `image` ở trên.
mapLink: "https://www.google.com/maps/embed?pb=..." # Link nhúng Google Maps. Lấy từ Google Maps > Share > Embed a map.
imageAfter: "/images/workshop-1-duong-speaker.jpg" # Ảnh hiển thị sau khi sự kiện kết thúc
recap: "Workshop **Giao Dịch Thuật Toán** đã diễn ra thành công tốt đẹp..." # Đoạn tóm tắt sự kiện (hiển thị sau khi sự kiện kết thúc)
gallery: # Danh sách ảnh kỷ niệm (hiển thị sau khi sự kiện kết thúc)
  - "/images/gallery-1.jpg"
  - "/images/gallery-2.jpg"
---

Đây là phần mô tả chi tiết về sự kiện (hiển thị trong mục "Về sự kiện").

Bạn có thể viết nội dung dài, sử dụng các cú pháp của **Markdown** như in đậm, in nghiêng, danh sách, v.v.
```

**Lưu ý quan trọng**: Sau khi thêm hoặc sửa đổi các file Markdown, bạn cần build lại dự án để thấy được thay đổi trên trang web production. Tuy nhiên, trong môi trường phát triển (development), Next.js sẽ tự động cập nhật ngay lập tức.

## 4. Cấu hình Firebase & Quản trị viên (Admin)

Dự án sử dụng Firebase để xác thực người dùng và quản lý quyền hạn. Việc cấu hình được thực hiện thông qua các biến môi trường trong file `.env`.

### 4.1. Thiết lập biến môi trường (`.env`)

Tạo một file tên là `.env` ở thư mục gốc của dự án với nội dung sau:

```
# --- Firebase Admin SDK (Yêu cầu cho chế độ Full-stack) ---
# Mã base64 của file JSON service account key từ Firebase Console
FIREBASE_SERVICE_ACCOUNT_BASE64=

# --- Quản trị viên ---
# Biến này chứa danh sách các email sẽ có quyền admin để truy cập các tính năng đặc biệt (ví dụ: trang /admin).
# Các email phải được phân cách bởi dấu phẩy, không có khoảng trắng.
# Ví dụ: admin1@example.com,admin2@example.com
FIREBASE_ADMIN_EMAILS=

# --- Discord Webhook ---
# URL của webhook để gửi thông báo về kênh Discord
DISCORD_WEBHOOK_URL=

# --- Brevo (Sendinblue) API Key ---
# API key để gửi email xác nhận
BREVO_API_KEY=

# --- Chế độ Development ---
# Đặt là "true" để bỏ qua yêu cầu đăng nhập admin, giúp dễ dàng gỡ lỗi các trang admin
# Cả hai biến phải được đặt để chế độ dev hoạt động đồng bộ ở cả client và server
DEV_MODE_NO_ADMIN_ENFORCE=false
NEXT_PUBLIC_DEV_MODE_NO_ADMIN_ENFORCE=false

# --- Chế độ Static (Không cần backend) ---
# Đặt là "true" để vô hiệu hóa các tính năng yêu cầu backend (Admin, AI Content)
# Hữu ích khi triển khai lên các nền tảng hosting tĩnh như Vercel/Netlify
NEXT_PUBLIC_STATIC_MODE=false
```

-   **`FIREBASE_SERVICE_ACCOUNT_BASE64`**:
    -   Đây là chuỗi thông tin xác thực cho Firebase Admin SDK, được mã hóa dưới dạng Base64. **Chỉ cần thiết khi chạy ở chế độ full-stack (`NEXT_PUBLIC_STATIC_MODE=false`).**
    -   **Bước 1: Lấy Service Account Key từ Firebase**
        1.  Truy cập [Firebase Console](https://console.firebase.google.com/).
        2.  Chọn dự án của bạn.
        3.  Đi đến **Project settings** (biểu tượng bánh răng) > **Service accounts**.
        4.  Nhấn nút **"Generate new private key"**. Một file JSON sẽ được tải về máy tính của bạn.
    -   **Bước 2: Mã hóa file JSON sang Base64**
        -   Mở file JSON vừa tải về, sao chép toàn bộ nội dung của nó.
        -   Trong macos mở Terminal chạy lệnh
        -   **Lệnh trên macOS/Linux:** `base64 -i [tên-file-json].json`
        -   Sao chép chuỗi Base64 đã được mã hóa.
    -   **Bước 3: Dán vào file `.env`**
        -   Dán chuỗi Base64 vừa sao chép vào sau `FIREBASE_SERVICE_ACCOUNT_BASE64=`.

-   **`FIREBASE_ADMIN_EMAILS`**:
    -   Đây là danh sách các địa chỉ email của người dùng sẽ có quyền quản trị viên.
    -   Nhập các email, phân cách nhau bởi dấu phẩy, không có khoảng trắng.
    -   Ví dụ: `admin1@example.com,admin2@example.com`

-   **`DISCORD_WEBHOOK_URL`**:
    -   Dán URL của Discord Webhook vào đây.
    -   Cách lấy Webhook URL:
        1.  Trong Discord, vào **Server Settings** > **Integrations** > **Webhooks**.
        2.  Nhấn **New Webhook**.
        3.  Đặt tên và chọn kênh.
        4.  Nhấn **Copy Webhook URL**.
            
- **`BREVO_API_KEY`**:
    - Lấy API key từ tài khoản Brevo (Sendinblue) của bạn.
    - Truy cập **SMTP & API** trong tài khoản Brevo để tạo hoặc lấy API key.

-   **`DEV_MODE_NO_ADMIN_ENFORCE`** và **`NEXT_PUBLIC_DEV_MODE_NO_ADMIN_ENFORCE`**:
    -   Đặt cả hai biến này thành `true` khi phát triển để tạm thời bỏ qua các yêu cầu đăng nhập admin. Điều này giúp bạn truy cập các trang như `/admin` mà không cần đăng nhập bằng tài khoản admin.
    -   **Quan trọng:** Nhớ đặt lại thành `false` hoặc xóa các biến này trước khi triển khai lên môi trường production.

- **`NEXT_PUBLIC_STATIC_MODE`**:
    - Đặt thành `true` nếu bạn muốn triển khai trang web lên một nền tảng hosting tĩnh (Vercel, Netlify) mà không cần cấu hình backend (Firebase Admin SDK).
    - Khi bật chế độ này, các tính năng như trang Admin và trang tạo nội dung AI sẽ bị vô hiệu hóa để tránh lỗi build.

### 4.2. Quyền Quản trị viên (Admin)

-   Bất kỳ người dùng nào đăng nhập bằng tài khoản Google có email nằm trong danh sách `FIREBASE_ADMIN_EMAILS` sẽ được coi là quản trị viên.
-   Quyền admin được dùng để truy cập vào các trang hoặc tính năng đặc biệt, ví dụ như trang "Tạo sự kiện" (`/create`) hoặc trang quản trị (`/admin`).
-   Trong chế độ development (`DEV_MODE_NO_ADMIN_ENFORCE=true`), tất cả người dùng (kể cả chưa đăng nhập) đều được coi là admin để thuận tiện cho việc gỡ lỗi.
- Trong chế độ tĩnh (`NEXT_PUBLIC_STATIC_MODE=true`), các tính năng admin sẽ bị vô hiệu hóa.

### 4.3. Cấu hình Firestore (Database)

Để lưu dữ liệu vào Firestore khi `NEXT_PUBLIC_STATIC_MODE=false`, cần enable Firestore API:

1. **Bật Firestore API trong Firebase Console:**
   - Truy cập: [Google Cloud Console](https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=studio-7032562866-2698c)
   - Click "Enable" để bật Cloud Firestore API
   - Đợi vài phút để API được kích hoạt

2. **Tạo Firestore Database:**
   - Trong Firebase Console, vào "Firestore Database"
   - Click "Create database"
   - Chọn chế độ "Start in test mode" (hoặc "Start in production mode" nếu muốn bảo mật cao hơn)
   - Chọn region gần nhất (ví dụ: `asia-southeast1`)

3. **Cấu hình Security Rules:**
   - File `firestore.rules` đã được tạo sẵn với các quy tắc bảo mật
   - Deploy rules bằng Firebase CLI:
     ```bash
     # Cài đặt Firebase CLI (nếu chưa có)
     npm install -g firebase-tools
     
     # Đăng nhập Firebase
     firebase login
     
     # Initialize project (nếu chưa có firebase.json)
     firebase init firestore
     
     # Deploy rules
     firebase deploy --only firestore:rules
     ```

4. **Cấu trúc Collections được tạo tự động:**
   - `registrations`: Thông tin đăng ký sự kiện
   - `feedbacks`: Phản hồi từ người tham gia
   - `checkins`: Lịch sử check-in tại sự kiện

5. **Quyền truy cập:**
   - Firebase Admin SDK có quyền ghi/đọc tất cả collections
   - Admin user (mrt) có thể xem tất cả dữ liệu
   - User thường chỉ có thể đọc/ghi dữ liệu của mình khi đã đăng nhập

### 4.4. Cấu hình Brevo Email

Để email xác nhận hoạt động, cần cấu hình IP authorization:

1. **Thêm IP vào Whitelist:**
   - Truy cập: [Brevo Security Settings](https://app.brevo.com/security/authorised_ips)
   - Thêm IP hiện tại của server (xem trong error log)
   - Ví dụ: `115.79.138.34`, `45.122.246.92`

2. **Hoặc vô hiệu hóa IP restriction:**
   - Trong Brevo Dashboard → Security → Authorized IPs
   - Bỏ check "Restrict access by IP"

3. **Verify Sender Email:**
   - Đảm bảo email `hello@xnoquant.vn` đã được verify trong Brevo
   - Hoặc authenticate domain `xnoquant.vn`

**Lưu ý:** Email template mới bao gồm:
- Thông tin sự kiện chi tiết (ngày, giờ, địa điểm, thời lượng)
- Link Google Calendar tự động
- Liên kết đến các kênh cộng đồng (Website, Facebook, LinkedIn, Zalo)
- Thiết kế responsive và brand colors

## 5. Logic CTA (Call-to-Action) và các tùy chọn trên trang sự kiện

Trang chi tiết sự kiện (event detail page) có các logic động cho các nút CTA và các tùy chọn, giúp tối ưu trải nghiệm người dùng theo từng trạng thái thời gian của sự kiện. Dưới đây là mô tả chi tiết:

### 5.1. Các trạng thái thời gian của sự kiện

Logic được xác định dựa trên các mốc thời gian sau (dùng hook `useEventTimeStates`):
- **isBeforeEvent**: Trước khi sự kiện bắt đầu
- **isCheckinTime**: Từ 1 giờ trước khi bắt đầu đến khi sự kiện kết thúc (eventEnd = eventStart + duration)
- **isEventOngoing**: Đang diễn ra (eventStart → eventEnd)
- **isAfterEvent**: Sau khi sự kiện kết thúc
- **showCalendarButton**: Chỉ hiển thị trước khi sự kiện bắt đầu và nếu `enableCalendar: true`

### 5.2. Logic hiển thị nút CTA

| Trạng thái thời gian     | Nút CTA chính    | Hành động khi bấm             | Màu sắc         |
| ------------------------ | ---------------- | ----------------------------- | --------------- |
| Trước sự kiện            | Đăng ký ngay     | Scroll tới form đăng ký       | Primary         |
| 1h trước → hết sự kiện   | Check-in sự kiện | Điều hướng tới trang check-in | Primary (pulse) |
| Sau khi sự kiện kết thúc | Gửi phản hồi     | Scroll tới form phản hồi      | Primary         |

- **Màu sắc**: Tất cả các nút CTA đều sử dụng màu xanh primary (`#1FAD8E` - Neo Green) theo brand guideline, kể cả dạng fill hay outline.
- **Hiệu ứng**: Nút check-in có hiệu ứng pulse để thu hút sự chú ý trong thời gian check-in.

### 5.3. Countdown Timer
- Chỉ hiển thị trước khi sự kiện bắt đầu (`isBeforeEvent`)
- Sử dụng màu primary, hiệu ứng gradient và animation
- Tự động ẩn khi sự kiện bắt đầu

### 5.4. Nút "Thêm vào lịch" (Google Calendar)
- Chỉ hiển thị trước khi sự kiện bắt đầu và nếu frontmatter có `enableCalendar: true`
- Sử dụng variant outline với border và text màu primary
- Tự động tạo link Google Calendar với thông tin sự kiện và nhắc nhở tự động (1 tuần, 1 ngày, 30 phút trước)

### 5.5. Các tùy chọn khác
- **Hình ảnh sau sự kiện**: Nếu frontmatter có `imageAfter`, sẽ hiển thị thay cho ảnh hero sau khi sự kiện kết thúc
- **Recap & Gallery**: Nếu có trường `recap` và `gallery`, sẽ hiển thị phần tổng kết và album ảnh sau sự kiện
- **Form đăng ký/Check-in/Phản hồi**: Tự động hiển thị đúng form theo trạng thái thời gian

### 5.6. Cách cấu hình trong Markdown

Thêm/sửa các trường sau trong file sự kiện:
```yaml
---
title: "Tên sự kiện"
tagline: "Mô tả ngắn"
date: "YYYY-MM-DD HH:mm"
duration: 120 # số phút
location: "Địa điểm"
enableCalendar: true # bật nút thêm vào lịch
image: "..."
imageAfter: "..." # ảnh sau sự kiện
recap: "..." # tổng kết
gallery:
  - "..."
---
```

### 5.7. Tóm tắt luồng UI
- Trước sự kiện: Đăng ký + Thêm vào lịch + Countdown
- Đến thời gian check-in: Nút check-in nổi bật
- Sau sự kiện: Gửi phản hồi + Recap + Gallery

> **Lưu ý:** Logic CTA và các tùy chọn này giúp trang sự kiện luôn phù hợp với trạng thái thực tế, tăng tương tác và trải nghiệm người dùng.

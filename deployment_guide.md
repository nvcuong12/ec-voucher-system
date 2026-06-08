# Hướng Dẫn Deploy Dự Án Lên Internet (Cách 1)

Cách này sẽ chia dự án của bạn làm 3 phần để đưa lên các dịch vụ chuyên nghiệp, miễn phí và tự động hoá cao nhất.

## Bước 1: Đưa Code Lên GitHub
Để các dịch vụ có thể tự động lấy code của bạn, bạn cần đẩy dự án này lên GitHub.

1. Đăng ký tài khoản tại [GitHub](https://github.com/).
2. Tạo một Repository (kho lưu trữ) mới.
3. Mở Terminal (Command Prompt / PowerShell / Git Bash) tại thư mục `d:\EC\voucher-system` của bạn và chạy các lệnh:
```bash
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin <Link-GitHub-Của-Bạn>
git push -u origin main
```
> [!TIP]
> Bạn nhớ đảm bảo trong file `.gitignore` đã liệt kê `node_modules` và `.env` để không đẩy file rác/nhạy cảm lên mạng nhé.

---

## Bước 2: Khởi Tạo Cơ Sở Dữ Liệu (Database)

Chúng ta sẽ dùng **Supabase** (hoặc **Neon.tech**) để tạo database PostgreSQL miễn phí trên mạng.

1. Truy cập [Supabase.com](https://supabase.com/) và đăng nhập bằng tài khoản GitHub.
2. Bấm **New Project**, đặt tên (ví dụ: `voucher-db`), tạo mật khẩu cho Database (nhớ lưu lại mật khẩu này).
3. Đợi vài phút để Supabase tạo Database.
4. Khi tạo xong, vào phần **Project Settings** (biểu tượng bánh răng) -> **Database**.
5. Kéo xuống phần **Connection string** (chọn tab **URI**). Bạn sẽ thấy một đường link dạng:
   `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   *(Thay `[YOUR-PASSWORD]` bằng mật khẩu bạn đã tạo ở bước 2).* => **Đây là `DATABASE_URL` của bạn, hãy copy lại.**
6. **Tạo bảng dữ liệu:**
   - Ở thanh menu bên trái của Supabase, chọn phần **SQL Editor**.
   - Mở code của bạn, copy toàn bộ nội dung file `backend/src/config/init.sql` dán vào SQL Editor và chạy (Run).
   - Tương tự, copy nội dung file `backend/src/config/seed-data.sql` dán vào và chạy để tạo dữ liệu mẫu.

---

## Bước 3: Deploy Backend (Node.js/Express) lên Render

1. Truy cập [Render.com](https://render.com/) và đăng nhập bằng GitHub.
2. Bấm **New +** ở góc trên cùng bên phải -> Chọn **Web Service**.
3. Chọn **Build and deploy from a Git repository**, sau đó kết nối và chọn Repository GitHub của bạn.
4. Điền các thông số như sau:
   - **Name:** Tên tuỳ ý (ví dụ: `voucher-backend-api`).
   - **Root Directory:** Gõ vào `backend` *(Rất quan trọng, vì code backend của bạn nằm trong thư mục này)*.
   - **Environment:** `Node`.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Kéo xuống phần **Environment Variables**, bấm **Add Environment Variable** và thêm các biến dựa theo `docker-compose.yml` của bạn:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Dán cái chuỗi bạn đã copy ở Bước 2.
   - `JWT_SECRET` = Nhập một chuỗi ký tự ngẫu nhiên tuỳ ý (ví dụ: `mot_chuoi_bi_mat_rat_kho_doan`).
   - `VNPAY_TMN_CODE` = Tương tự như trong `.env` local của bạn.
   - `VNPAY_HASH_SECRET` = Tương tự như trong `.env` local.
   - `VNPAY_URL` = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
   *(Tạm thời chưa thiết lập `FRONTEND_URL` và `VNPAY_RETURN_URL`, ta sẽ quay lại sau).*
6. Bấm **Create Web Service**. Đợi khoảng 2-5 phút để Render build và chạy ứng dụng.
7. Khi thành công, góc trên bên trái sẽ hiện trạng thái "Live" cùng với một đường link (Ví dụ: `https://voucher-backend-api.onrender.com`). **Hãy copy đường link này!**

---

## Bước 4: Deploy Frontend (React) lên Vercel

1. Truy cập [Vercel.com](https://vercel.com/) và đăng nhập bằng GitHub.
2. Bấm **Add New...** -> **Project**.
3. Chọn Repository GitHub dự án của bạn và bấm **Import**.
4. Cấu hình Project:
   - **Project Name:** Tên tuỳ ý (ví dụ: `voucher-system-frontend`).
   - **Framework Preset:** Đảm bảo nó chọn là `Create React App`.
   - **Root Directory:** Bấm nút **Edit**, chọn thư mục `frontend`.
5. Mở phần **Environment Variables** ra, thêm 2 biến:
   - Name: `REACT_APP_API_URL`
   - Value: `https://voucher-backend-api.onrender.com/api` *(Thay bằng đường link Backend lấy từ Render ở cuối Bước 3 + `/api`)*.
6. Bấm **Deploy**. Chờ khoảng 1-2 phút.
7. Sau khi Deploy thành công, Vercel sẽ cho bạn một tên miền trang web Frontend, ví dụ: `https://voucher-system-frontend.vercel.app`. **Đây chính là link website chính thức của bạn!**

---

## Bước 5: Cập Nhật Lại URL Ở Backend

Vì lúc nãy ở Bước 3 ta chưa có tên miền của Frontend, nên tính năng CORS hoặc VNPAY Return ở Backend sẽ bị lỗi. Giờ ta sửa lại:

1. Quay lại trang quản lý Web Service Backend trên **Render**.
2. Chọn menu **Environment** bên tay trái.
3. Thêm 2 biến môi trường mới:
   - `FRONTEND_URL` = `https://voucher-system-frontend.vercel.app` *(Link Vercel ở Bước 4, nhớ **không** có dấu gạch chéo `/` ở cuối)*.
   - `VNPAY_RETURN_URL` = `https://voucher-system-frontend.vercel.app/payment/vnpay-return`
4. Bấm **Save Changes**. Render sẽ tự động deploy lại Backend. Đợi báo "Live" là xong.

🎉 **Chúc mừng!** Website của bạn đã chính thức được chạy trên mạng Internet và bất cứ ai cũng có thể truy cập được thông qua tên miền từ Vercel.

> [!WARNING]
> Trên gói miễn phí của Render, nếu website không có ai truy cập trong khoảng 15 phút, nó sẽ chuyển sang chế độ "ngủ" (Spin down). Khi có người vào lại web, sẽ mất khoảng 30s-1 phút để Backend thức dậy. Đừng lo lắng nếu API gọi hơi lâu trong lần đầu tiên nhé!

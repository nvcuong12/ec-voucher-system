# 🎬 KỊCH BẢN DEMO VIDEO — PHẦN QUẢN TRỊ VIÊN
## Hệ thống VoucherHub — Đồ án Thương mại Điện tử

> **Người trình bày:** Thành viên phụ trách Admin  
> **Vị trí trong video nhóm:** Sau phần Khách hàng và Đối tác  
> **Thời lượng ước tính phần này:** ~10–12 phút  
> **Phong cách:** Tự nhiên, lịch sự — xưng "chúng em / nhóm em"

---

## ⚙️ Chuẩn bị trước khi quay

| Mục | Thông tin |
|-----|-----------|
| URL Admin | `http://localhost:3000/admin` |
| Tài khoản Admin | `admin@vouchersystem.com` / `password123` |
| Trình duyệt | Chrome — ẩn bookmark bar, tắt extension |
| Màn hình | 1920×1080, zoom 100% |

---

## 🎬 PHẦN MỞ ĐẦU — Giới thiệu hệ thống & Yêu cầu nghiệp vụ tổng thể *(~2 phút)*

> *Phần này trình bày trước khi bắt đầu demo bất kỳ tính năng nào. Có thể chiếu slide sơ đồ tổng thể hoặc màn hình trang chủ của hệ thống.*

---

### 🎙️ Lời thoại — Giới thiệu hệ thống

> *"Kính chào thầy/cô. Nhóm em xin phép trình bày demo hệ thống VoucherHub — một nền tảng thương mại điện tử chuyên về mua bán voucher ưu đãi, kết nối ba nhóm đối tượng chính: Khách hàng, Đối tác kinh doanh và Quản trị viên.*
>
> *Trong video này, nhóm em chia làm ba phần: Bạn [Tên] đã trình bày phần Khách hàng, bạn [Tên] trình bày phần Đối tác, và em sẽ phụ trách phần Quản trị viên.*
>
> *Trước khi vào demo chi tiết, em xin sơ lược qua bảy yêu cầu nghiệp vụ mức tổng thể mà hệ thống VoucherHub phải đáp ứng."*

---

### 🎙️ Lời thoại — 7 Yêu cầu nghiệp vụ tổng thể

> *"Yêu cầu đầu tiên, **BR-01 — Quản lý tài khoản người dùng**: Hệ thống cho phép đăng ký, đăng nhập và quản lý hồ sơ theo từng vai trò — Khách hàng, Đối tác và Quản trị viên. Phần này đã được các bạn demo ở phần trước.*
>
> *Thứ hai, **BR-02 — Quản lý danh mục và nội dung voucher**: Hệ thống hỗ trợ tạo, phân loại và hiển thị voucher theo điều kiện kinh doanh. Đây là nghiệp vụ phối hợp giữa Đối tác tạo voucher và Quản trị viên phê duyệt.*
>
> *Thứ ba, **BR-03 — Mua hàng trực tuyến**: Khách hàng chọn voucher, thêm vào giỏ hàng, tạo đơn và thanh toán. Các bạn đã trình bày luồng này.*
>
> *Thứ tư, **BR-04 — Phát hành và quản lý voucher code**: Sau khi đơn hàng được thanh toán, hệ thống tự động sinh mã voucher điện tử duy nhất và theo dõi vòng đời sử dụng của từng mã.*
>
> *Thứ năm, **BR-05 — Kiểm tra và xác thực voucher**: Đối tác tra cứu và xác nhận mã voucher khi khách hàng sử dụng tại chi nhánh — phần bạn [Tên] đã trình bày.*
>
> *Thứ sáu, **BR-06 — Kiểm duyệt và giám sát hệ thống**: Đây là trọng tâm phần em sẽ demo — Quản trị viên duyệt đối tác, duyệt voucher, quản lý đơn hàng và giám sát toàn bộ hoạt động.*
>
> *Và cuối cùng, **BR-07 — Báo cáo và phân tích**: Quản trị viên xem dashboard tổng quan về doanh thu, đơn hàng, voucher và hiệu suất của từng đối tác.*
>
> *Như vậy, phần em trình bày tập trung vào BR-06 và BR-07 — vai trò kiểm soát trung tâm của Quản trị viên trong hệ thống."*

### 🖱️ Thao tác trong phần này
| Bước | Hành động |
|------|-----------|
| 1 | Chiếu slide/màn hình trang chủ hoặc sơ đồ tổng thể hệ thống |
| 2 | Khi đọc BR-01, BR-03, BR-05 → chỉ vào "phần các bạn đã trình bày" |
| 3 | Khi đọc BR-06, BR-07 → nhấn mạnh "đây là phần em sẽ demo" |
| 4 | Chuyển trình duyệt sang tab `/admin` để bắt đầu demo |

---

## ─── CHUYỂN SANG DEMO ADMIN ───

### 🎙️ Lời thoại — Chuyển cảnh
> *"Bây giờ em xin vào thẳng phần demo. Em sẽ đăng nhập bằng tài khoản Quản trị viên và lần lượt trình bày bảy chức năng Admin tương ứng với yêu cầu BR-ADM-01 đến BR-ADM-07."*

---

## 📋 CẢNH 1 — Dashboard Tổng Quan (BR-ADM-06) *(~1 phút 15 giây)*

### 🎙️ Lời thoại
> *"Đây là trang Dashboard — màn hình đầu tiên Admin nhìn thấy sau khi đăng nhập. Thay vì phải vào từng mục để kiểm tra, Admin có thể nắm bắt toàn bộ tình hình hệ thống chỉ trong một màn hình duy nhất.*
>
> *Phía trên là sáu thẻ thống kê: tổng người dùng, số voucher đã duyệt, doanh thu, mã đã phát hành, đối tác đang hoạt động và tổng đơn hàng. Tất cả số liệu được lấy trực tiếp từ database theo thời gian thực.*
>
> *Bên dưới là hai biểu đồ: biểu đồ cột thể hiện doanh thu theo từng ngày trong 7 ngày gần nhất — thầy/cô thấy khi di chuột vào từng cột, tooltip hiện ra con số cụ thể. Biểu đồ tròn bên cạnh phân bổ trạng thái voucher: đã duyệt, chờ duyệt và bị từ chối.*
>
> *Cuối trang là Top Voucher bán chạy và nhật ký hoạt động gần nhất để Admin nắm bắt nhanh mà không cần thao tác thêm."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Mở `http://localhost:3000/admin` — trang login hiện |
| 2 | Nhập `admin@vouchersystem.com` / `password123` → **Đăng nhập** |
| 3 | Di chuột lần lượt qua 6 stat card, dừng ~2 giây mỗi card |
| 4 | Hover từng cột biểu đồ doanh thu → tooltip hiện số tiền |
| 5 | Chỉ vào biểu đồ tròn, đọc legend 3 màu |
| 6 | Cuộn xuống xem Top Voucher và nhật ký gần đây |

### ✅ Kết quả mong đợi
- Dashboard hiển thị số liệu thực từ database
- Biểu đồ cột và tròn tooltip hoạt động khi hover

---

## 📋 CẢNH 2 — Quản lý Người Dùng (BR-ADM-01) *(~1 phút 20 giây)*

### 🎙️ Lời thoại
> *"Tab Người dùng tương ứng với BR-ADM-01. Ở đây Admin quản lý toàn bộ tài khoản trong hệ thống.*
>
> *Nhóm em bổ sung thanh tìm kiếm lọc realtime theo tên, email hoặc số điện thoại — thầy/cô thấy khi gõ 'Võ Phương Linh', danh sách thu hẹp ngay mà không cần bấm nút tìm kiếm.*
>
> *Click 'Chi tiết' để xem đầy đủ hồ sơ: họ tên, email, số điện thoại, vai trò và ngày đăng ký.*
>
> *Khi Admin thực hiện khóa tài khoản, hệ thống yêu cầu xác nhận qua popup trước khi thực thi — đây là thiết kế bắt buộc vì khóa tài khoản ảnh hưởng trực tiếp đến người dùng. Sau khi xác nhận, badge chuyển sang 'Bị khóa' và toast thông báo xanh xuất hiện ở góc màn hình."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Người dùng** |
| 2 | Gõ `"Võ Phương Linh"` → danh sách filter realtime |
| 3 | Click **Chi tiết** → đọc thông tin modal → đóng |
| 4 | Click **Khóa** → confirm dialog → **Khóa tài khoản** |
| 5 | Badge đỏ "Bị khóa" + toast xanh xuất hiện |
| 6 | *(Tùy chọn)* Lọc theo Role = **PARTNER** để thấy filter role |

### ✅ Kết quả mong đợi
- Search realtime đúng người dùng
- Modal chi tiết đầy đủ thông tin
- Confirm dialog + badge + toast cập nhật ngay

---

## 📋 CẢNH 3 — Quản lý & Duyệt Đối Tác (BR-ADM-02) *(~1 phút 45 giây)*

### 🎙️ Lời thoại
> *"Đây là luồng duyệt đối tác — BR-ADM-02. Khi một doanh nghiệp đăng ký muốn bán voucher, hồ sơ của họ sẽ vào hàng chờ duyệt. Admin xem xét thông tin pháp lý, người đại diện và mã giấy phép kinh doanh trước khi quyết định.*
>
> *Chúng em click 'Phê duyệt' trên đối tác 'Pending Studio' — confirm dialog yêu cầu xác nhận, sau đó badge chuyển ngay sang 'Đã duyệt'. Đối tác được duyệt có thể bắt đầu tạo và gửi voucher lên hệ thống.*
>
> *Trường hợp từ chối — điểm thiết kế quan trọng là hệ thống bắt buộc Admin phải nhập lý do. Nút xác nhận bị vô hiệu hóa hoàn toàn khi ô lý do còn trống — điều này đảm bảo đối tác luôn nhận được phản hồi cụ thể thay vì chỉ bị từ chối mà không biết lý do.*
>
> *Ngoài ra, Admin còn có thể xem chi nhánh của từng đối tác và bật/tắt từng chi nhánh độc lập khi cần thiết."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Đối tác** |
| 2 | Tìm **"Pending Studio"** (badge vàng) — đọc thông tin |
| 3 | Click **Phê duyệt** → confirm → xác nhận → badge xanh + toast |
| 4 | Click **Từ chối** trên một đối tác PENDING khác |
| 5 | Để trống lý do — **chỉ vào nút bị disabled** |
| 6 | Nhập: `"Hồ sơ chưa đầy đủ, vui lòng bổ sung giấy phép kinh doanh hợp lệ."` |
| 7 | Click **Xác nhận từ chối** → confirm → toast |
| 8 | Tìm đối tác APPROVED → click **Tạm khóa** → confirm → xác nhận |
| 9 | Click **Chi nhánh** → xem danh sách → toggle một chi nhánh |

### ✅ Kết quả mong đợi
- Duyệt: badge xanh "Đã duyệt"
- Từ chối: nút disabled khi trống lý do
- Tạm khóa / chi nhánh: confirm dialog đúng

---

## 📋 CẢNH 4 — Duyệt & Kiểm Soát Voucher (BR-ADM-03) *(~1 phút 30 giây)*

### 🎙️ Lời thoại
> *"BR-ADM-03 — Duyệt voucher. Trước khi bất kỳ voucher nào xuất hiện trước mắt khách hàng, Admin phải xem xét và phê duyệt — đây là bước kiểm soát chất lượng nội dung của toàn nền tảng.*
>
> *Chúng em mở chi tiết voucher 'Cafe Sáng 5 Ly' của Sunrise Eats: thầy/cô thấy đầy đủ hình ảnh, giá gốc, giá bán, phần trăm giảm, số lượng và điều kiện sử dụng. Sau khi xem xét, Admin bấm duyệt — confirm dialog → xác nhận. Voucher xuất hiện ngay trên trang chủ khách hàng.*
>
> *Trường hợp từ chối cũng yêu cầu nhập lý do, tương tự như duyệt đối tác.*
>
> *Trong tab Voucher Hệ Thống, Admin có thể tạm ngưng bán bất kỳ voucher đang hoạt động nào — ví dụ khi phát hiện thông tin không chính xác. Voucher bị tạm ngưng sẽ ẩn khỏi trang khách hàng ngay lập tức."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Duyệt voucher** — xem badge số lượng chờ |
| 2 | Click **Xem chi tiết** → voucher "Cafe Sáng 5 Ly" → đọc thông tin |
| 3 | Click **Duyệt voucher** → confirm → xác nhận → toast |
| 4 | Click **Từ chối** trên voucher khác → nhập lý do → xác nhận |
| 5 | Click tab **Voucher HT** → filter **Đã duyệt** |
| 6 | Click **Tạm ngưng bán** → confirm (warning) → badge xám + toast |

### ✅ Kết quả mong đợi
- Voucher duyệt biến khỏi queue, chuyển sang Voucher HT
- Từ chối lưu lý do, hiển thị trong chi tiết voucher
- Tạm ngưng: badge xám, ẩn khỏi trang khách hàng

---

## 📋 CẢNH 5 — Quản lý Đơn Hàng (BR-ADM-04) *(~1 phút 15 giây)*

### 🎙️ Lời thoại
> *"BR-ADM-04 — Quản lý Đơn hàng. Khi khách hàng gặp sự cố hoặc yêu cầu hoàn tiền, Admin là người xử lý can thiệp trực tiếp.*
>
> *Nhóm em bổ sung filter nhanh theo trạng thái — click 'Đã thanh toán' để chỉ xem đơn hàng đã thanh toán thành công. Thông tin đơn hiển thị đầy đủ: tên khách, email, danh sách voucher đã mua và tổng tiền.*
>
> *Thao tác ghi nhận hoàn tiền yêu cầu confirm trước — popup hiện rõ số tiền và tên khách để Admin kiểm tra lần cuối. Đây là thiết kế quan trọng cho thao tác có tính tài chính — tránh thực hiện nhầm.*
>
> *Tương tự, hủy đơn hàng cũng đi qua bước xác nhận bắt buộc."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Đơn hàng** |
| 2 | Click filter **Đã thanh toán** → đọc thông tin một đơn |
| 3 | Click **Ghi nhận hoàn tiền** → confirm → **Xác nhận hoàn tiền** |
| 4 | Badge "Hoàn tiền" (xanh dương) + toast |
| 5 | Click filter **Chờ thanh toán** → **Hủy đơn hàng** → confirm → xác nhận |
| 6 | Click filter **Tất cả** để thấy toàn bộ trạng thái |

### ✅ Kết quả mong đợi
- Filter theo trạng thái hoạt động đúng
- Confirm dialog trước cả Hủy và Hoàn tiền
- Badge + toast cập nhật ngay sau xác nhận

---

## 📋 CẢNH 6 — Quản lý Nội Dung CMS (BR-ADM-05) *(~1 phút)*

### 🎙️ Lời thoại
> *"BR-ADM-05 — Quản lý Nội dung. Admin kiểm soát hoàn toàn những gì hiển thị trên trang chủ mà không cần can thiệp vào code: danh mục voucher, banner slider, trang chính sách và popup thông báo.*
>
> *Chúng em thêm danh mục 'Ẩm thực cao cấp' — toast xuất hiện xác nhận thành công và danh mục xuất hiện ngay trong danh sách.*
>
> *Với banner, Admin chỉnh sửa rồi click 'Lưu thay đổi' — hệ thống hiện confirm dialog trước khi ghi đè — bởi vì banner đang hiển thị trực tiếp cho hàng nghìn khách hàng, cần tránh lưu nhầm.*
>
> *Tab Popup cho phép thiết lập chiến dịch thông báo theo khung thời gian: Admin đặt thời gian bắt đầu và kết thúc, hệ thống tự động kích hoạt và ẩn popup đúng lịch."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Nội dung** — sub-tab Danh mục |
| 2 | Nhập `"Ẩm thực cao cấp"` → **Thêm mới** → toast xanh |
| 3 | Sửa tên một danh mục có sẵn → **Lưu thay đổi** → confirm → toast |
| 4 | Click sub-tab **Banners** → sửa tiêu đề → **Lưu thay đổi** → confirm |
| 5 | Click sub-tab **Popups** → giới thiệu tính năng thời gian bắt đầu/kết thúc |

### ✅ Kết quả mong đợi
- Create: toast + item xuất hiện ngay
- Update: confirm dialog trước mọi lần lưu

---

## 📋 CẢNH 7 — Nhật Ký Hệ Thống (BR-ADM-07) *(~1 phút)*

### 🎙️ Lời thoại
> *"Chức năng cuối cùng — Nhật ký hệ thống, tương ứng BR-ADM-07 — là nền tảng đảm bảo tính minh bạch và truy vết của toàn hệ thống.*
>
> *Thầy/cô thấy toàn bộ thao tác em vừa thực hiện trong video — duyệt đối tác, phê duyệt voucher, khóa người dùng, hoàn tiền đơn hàng — đều được ghi lại đầy đủ và tự động. Mỗi bản ghi có: loại hành động, đối tượng bị tác động kèm ID cụ thể, email của Admin thực hiện và địa chỉ IP.*
>
> *Chúng em bổ sung tính năng lọc — gõ 'APPROVE' để chỉ xem các log phê duyệt, hoặc chọn từ dropdown để lọc theo một loại hành động cụ thể.*
>
> *Điểm quan trọng là mọi hành động của Admin đều có dấu vết — không thể thực hiện thao tác ẩn danh. Đây là yếu tố cần thiết trong bất kỳ hệ thống thương mại điện tử nào có tính bảo mật cao."*

### 🖱️ Thao tác chi tiết
| Bước | Hành động |
|------|-----------|
| 1 | Click tab **Nhật ký** |
| 2 | Chỉ vào các log từ thao tác vừa demo (các cảnh 1–6) |
| 3 | Mở một log: đọc action badge, entity, ID, email Admin, IP |
| 4 | Gõ `"APPROVE"` → danh sách filter |
| 5 | Xóa → gõ `"admin@vouchersystem.com"` → lọc theo người thực hiện |
| 6 | Chọn dropdown một action cụ thể |
| 7 | Click **Xóa bộ lọc** → danh sách đầy đủ |

### ✅ Kết quả mong đợi
- Tất cả thao tác từ cảnh 1–6 có trong nhật ký
- Filter realtime hoạt động mượt
- Hiển thị đầy đủ: action, entity, IP, người thực hiện, thời gian

---

## 🎬 KẾT PHẦN ADMIN *(~20 giây)*

### 🎙️ Lời thoại
> *"Như vậy là em đã demo xong bảy chức năng của Quản trị viên trong hệ thống VoucherHub, tương ứng đầy đủ với các yêu cầu BR-ADM-01 đến BR-ADM-07.*
>
> *Điểm nhóm em muốn nhấn mạnh trong thiết kế phần Admin là: tất cả thao tác có tính rủi ro đều được bảo vệ bằng popup xác nhận bắt buộc, kết quả được phản hồi ngay qua toast notification, và toàn bộ hành động được ghi lại trong nhật ký hệ thống — đảm bảo tính an toàn, minh bạch và truy vết được.*
>
> *Em xin hết phần Quản trị viên. Xin mời thầy/cô và các bạn có câu hỏi hoặc nhận xét ạ."*

---

## 📌 Ghi chú kỹ thuật

| Tình huống | Cách xử lý |
|-----------|------------|
| Không có đối tác PENDING | Vào pgAdmin: `UPDATE partners SET status='PENDING' WHERE business_name='Green Spa';` |
| Không có voucher chờ duyệt | Seed tự động đã có sẵn; hoặc đăng nhập partner tạo voucher mới |
| Toast không hiện | Refresh trang — đảm bảo hot-reload đã nhận file mới |
| Confirm dialog không đóng | Click vùng nền xám bên ngoài hoặc nút ✕ |
| Video bị giật | Tắt tab không dùng, giảm zoom OBS xuống |

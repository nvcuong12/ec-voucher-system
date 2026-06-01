# Yêu cầu nghiệp vụ hệ thống

## 7.1 Yêu cầu nghiệp vụ mức tổng thể

| Mã yêu cầu | Tên yêu cầu | Mô tả nghiệp vụ | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **BR-01** | Quản lý tài khoản người dùng | Hệ thống phải cho phép đăng ký, đăng nhập, đổi mật khẩu, quên mật khẩu, cập nhật hồ sơ và quản lý phiên làm việc theo vai trò. | Cao |
| **BR-02** | Quản lý danh mục và nội dung voucher | Hệ thống phải cho phép tạo, phân loại, hiển thị, tạm ngưng và ngừng bán voucher theo điều kiện kinh doanh. | Cao |
| **BR-03** | Mua hàng trực tuyến | Hệ thống phải hỗ trợ chọn voucher, giỏ hàng, tạo đơn, thanh toán mô phỏng và xác nhận đơn hàng. | Cao |
| **BR-04** | Phát hành và quản lý voucher code | Hệ thống phải sinh mã voucher điện tử duy nhất cho từng giao dịch hợp lệ và theo dõi vòng đời sử dụng. | Cao |
| **BR-05** | Kiểm tra và xác thực voucher | Hệ thống phải hỗ trợ đối tác tra cứu, xác minh và xác nhận việc sử dụng voucher tại chi nhánh. | Cao |
| **BR-06** | Kiểm duyệt và giám sát hệ thống | Hệ thống phải cho phép quản trị viên duyệt đối tác, duyệt voucher, quản lý đơn hàng và giám sát hoạt động. | Cao |
| **BR-07** | Báo cáo và phân tích | Hệ thống phải cung cấp dashboard và báo cáo về doanh thu, đơn hàng, voucher bán ra, voucher đã dùng và hiệu suất đối tác. | Cao |

## 7.2 Yêu cầu nghiệp vụ cho khách hàng

| Mã yêu cầu | Tên yêu cầu | Mô tả nghiệp vụ | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **BR-CUS-01** | Đăng ký tài khoản | Khách hàng có thể đăng ký bằng email hoặc số điện thoại; hệ thống kiểm tra trùng lặp và xác thực mô phỏng. | Cao |
| **BR-CUS-02** | Đăng nhập và quản lý hồ sơ | Khách hàng có thể đăng nhập, đăng xuất, quên mật khẩu, đổi mật khẩu và cập nhật thông tin cá nhân. | Cao |
| **BR-CUS-03** | Tìm kiếm voucher | Khách hàng có thể tìm kiếm theo từ khóa và lọc theo danh mục, khu vực, giá, mức giảm, đối tác và trạng thái hiệu lực. | Cao |
| **BR-CUS-04** | Xem chi tiết voucher | Hệ thống hiển thị đầy đủ tên voucher, ảnh, giá gốc, giá bán, điều kiện áp dụng, thời hạn, số lượng còn lại, chi nhánh và chính sách hoàn hủy. | Cao |
| **BR-CUS-05** | Quản lý giỏ hàng | Khách hàng có thể thêm, cập nhật, xóa voucher trong giỏ và xem tổng tiền tạm tính. | Cao |
| **BR-CUS-06** | Tạo đơn hàng | Khách hàng có thể tạo đơn từ giỏ hàng, khai báo người mua hoặc người nhận quà tặng và chọn phương thức thanh toán mô phỏng. | Cao |
| **BR-CUS-07** | Nhận voucher đã mua | Sau thanh toán thành công, khách hàng xem được voucher code, QR mô phỏng, trạng thái sử dụng và lịch sử đơn hàng. | Cao |
| **BR-CUS-08** | Đánh giá và phản hồi | Khách hàng có thể đánh giá voucher đã mua hoặc đã sử dụng, chấm sao, bình luận và gửi phản hồi/khiếu nại. | Trung bình |

## 7.3 Yêu cầu nghiệp vụ cho đối tác

| Mã yêu cầu | Tên yêu cầu | Mô tả nghiệp vụ | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **BR-PAR-01** | Đăng ký và quản lý hồ sơ đối tác | Đối tác có thể đăng ký tài khoản doanh nghiệp, cập nhật thông tin pháp lý, người đại diện và danh sách chi nhánh. | Cao |
| **BR-PAR-02** | Tạo voucher | Đối tác có thể tạo mới voucher với các thông tin giá, mô tả, thời gian bán, thời gian sử dụng, chi nhánh áp dụng và số lượng phát hành. | Cao |
| **BR-PAR-03** | Gửi duyệt voucher | Đối tác có thể gửi voucher ở trạng thái chờ duyệt và theo dõi kết quả phê duyệt từ quản trị viên. | Cao |
| **BR-PAR-04** | Quản lý voucher | Đối tác có thể cập nhật voucher trước khi duyệt hoặc trong phạm vi được phép; xem số lượng bán, đã dùng, hết hạn. | Cao |
| **BR-PAR-05** | Kiểm tra voucher code | Đối tác hoặc nhân viên đối tác có thể nhập mã hoặc quét QR mô phỏng để kiểm tra tình trạng hợp lệ của voucher. | Cao |
| **BR-PAR-06** | Xác nhận sử dụng voucher | Đối tác có thể xác nhận voucher đã sử dụng khi thỏa điều kiện; hệ thống cập nhật nhật ký sử dụng và ngăn dùng lại. | Cao |
| **BR-PAR-07** | Báo cáo đối tác | Đối tác có thể xem doanh thu, số lượng phát hành, số lượng bán, tỷ lệ sử dụng và hiệu quả theo từng chương trình voucher. | Trung bình |

## 7.4 Yêu cầu nghiệp vụ cho quản trị viên

| Mã yêu cầu | Tên yêu cầu | Mô tả nghiệp vụ | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **BR-ADM-01** | Quản lý người dùng | Quản trị viên có thể xem, tra cứu, khóa/mở khóa tài khoản và phân quyền người dùng. | Cao |
| **BR-ADM-02** | Quản lý đối tác | Quản trị viên có thể duyệt hồ sơ đối tác, khóa/mở khóa đối tác và quản lý chi nhánh. | Cao |
| **BR-ADM-03** | Duyệt voucher | Quản trị viên có thể xem, duyệt, từ chối, thay đổi trạng thái hiển thị và kiểm soát vòng đời voucher. | Cao |
| **BR-ADM-04** | Quản lý đơn hàng | Quản trị viên có thể tra cứu đơn hàng, xử lý trạng thái thanh toán, hủy đơn và ghi nhận hoàn tiền mô phỏng. | Cao |
| **BR-ADM-05** | Quản lý nội dung | Quản trị viên có thể quản lý danh mục, banner, bài viết, popup và nội dung chính sách. | Trung bình |
| **BR-ADM-06** | Dashboard quản trị | Quản trị viên có thể xem tổng quan về người dùng, đối tác, voucher, đơn hàng, doanh thu và các chỉ số hiệu quả. | Cao |
| **BR-ADM-07** | Nhật ký hệ thống | Quản trị viên có thể tra cứu các thao tác quan trọng nhằm phục vụ kiểm tra và truy vết. | Trung bình |

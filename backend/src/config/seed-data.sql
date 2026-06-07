-- ================================================================
-- Voucher System – Comprehensive Seed Data v2
-- Runs after 01-init.sql on a fresh database
-- Tổng: 20 khách hàng, 20 đối tác, 114 voucher mới, 40 đơn hàng
-- ================================================================

-- ─── 1. Categories ───────────────────────────────────────────────
INSERT INTO categories (name) VALUES
  ('Ẩm thực'), ('Làm đẹp'), ('Sức khỏe'),
  ('Du lịch'),  ('Giải trí'),  ('Mua sắm')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. Banners ──────────────────────────────────────────────────
DELETE FROM banners;
INSERT INTO banners (title, image_url, link_url, sort_order, is_active) VALUES
  ('Ưu đãi cuối tuần',         'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80', '/vouchers?category=Ẩm thực',  1, TRUE),
  ('Mùa hè rực rỡ',            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80', '/vouchers?category=Du lịch',  2, TRUE),
  ('Khám phá phong cách sống', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80', '/vouchers?category=Làm đẹp', 3, TRUE),
  ('Flash Sale Tháng 6',       'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80', '/vouchers',                   4, TRUE),
  ('Gói Sức Khỏe Hè',          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80', '/vouchers?category=Sức khỏe',5, TRUE);

-- ─── 3. Content Pages ────────────────────────────────────────────
INSERT INTO content_pages (slug, title, content, is_active) VALUES
  ('gioi-thieu',          'Giới thiệu VoucherHub',
   'VoucherHub là nền tảng mua voucher giảm giá hàng đầu tại TP.HCM với hơn 1000 ưu đãi từ các đối tác uy tín trong nhiều lĩnh vực: Ẩm thực, Làm đẹp, Du lịch, Giải trí và Mua sắm.', TRUE),
  ('dieu-khoan-su-dung',  'Điều khoản sử dụng',
   'Người dùng cần tuân thủ điều khoản của từng voucher, hạn sử dụng và quy định của đối tác. VoucherHub không chịu trách nhiệm nếu voucher bị sử dụng sai điều kiện hoặc sau thời hạn.', TRUE),
  ('chinh-sach-bao-mat',  'Chính sách bảo mật',
   'Thông tin tài khoản được bảo vệ bằng JWT và bcrypt. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba nếu không có sự đồng ý của người dùng.', TRUE),
  ('huong-dan-su-dung',   'Hướng dẫn sử dụng',
   'Khách hàng xem voucher, thêm vào giỏ hàng, đặt hàng, thanh toán và nhận mã voucher. Xuất trình mã khi sử dụng tại chi nhánh đối tác áp dụng.', TRUE),
  ('chinh-sach-hoan-tien','Chính sách hoàn tiền',
   'Hoàn tiền trong 24h kể từ khi thanh toán nếu voucher chưa sử dụng và đơn hàng chưa được xử lý. Liên hệ support@voucherhub.vn để được hỗ trợ.', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title      = EXCLUDED.title,
  content    = EXCLUDED.content,
  updated_at = NOW();

INSERT INTO content_pages (slug, title, content, is_active) VALUES
  ('chinh-sach-hoan-huy', 'Chính sách hoàn/hủy',
   $$1. Phạm vi áp dụng
Chính sách này áp dụng cho các voucher được mua trên hệ thống VoucherHub. Việc hoàn/hủy được xử lý ở mức mô phỏng nhằm phục vụ quy trình nghiệp vụ của đồ án thương mại điện tử.

2. Điều kiện được hỗ trợ hoàn/hủy
Khách hàng có thể được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Đơn hàng chưa được thanh toán thành công.
- Voucher chưa được sử dụng và còn trong thời hạn hỗ trợ theo điều kiện chương trình.
- Đối tác từ chối áp dụng voucher không đúng với điều kiện đã công bố.
- Thông tin voucher hiển thị sai lệch nghiêm trọng so với điều kiện sử dụng thực tế.
- Hệ thống phát sinh lỗi khiến khách hàng không thể xem hoặc sử dụng mã voucher.

3. Trường hợp không hỗ trợ hoàn/hủy
Voucher có thể không được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Voucher đã được đối tác xác nhận sử dụng.
- Voucher đã hết hạn do khách hàng không sử dụng trong thời gian quy định.
- Khách hàng sử dụng voucher sai chi nhánh, sai điều kiện hoặc sai thời gian áp dụng.
- Khách hàng tự ý chia sẻ mã voucher cho người khác dẫn đến rủi ro sử dụng ngoài ý muốn.
- Voucher thuộc chương trình có ghi rõ không áp dụng hoàn/hủy.

4. Quy trình gửi yêu cầu hoàn/hủy hoặc khiếu nại
Khách hàng có thể gửi yêu cầu hỗ trợ từ mục "Voucher của tôi" hoặc "Khiếu nại". Khi gửi yêu cầu, khách hàng cần cung cấp lý do, mô tả vấn đề và chọn voucher/đơn hàng liên quan để quản trị viên kiểm tra.

5. Thời gian xử lý mô phỏng
Quản trị viên sẽ tiếp nhận, kiểm tra trạng thái đơn hàng, trạng thái voucher, lịch sử sử dụng và phản hồi của đối tác. Kết quả xử lý có thể là chấp nhận hoàn/hủy, từ chối yêu cầu hoặc yêu cầu bổ sung thông tin.

6. Lưu ý đối với voucher đã sử dụng, hết hạn hoặc sai chi nhánh
Voucher đã sử dụng, hết hạn, bị hủy hoặc không áp dụng đúng chi nhánh có thể không còn giá trị sử dụng. Khách hàng nên kiểm tra kỹ thời hạn, điều kiện áp dụng và chi nhánh trước khi đến sử dụng dịch vụ.

7. Trách nhiệm của các bên
Khách hàng có trách nhiệm bảo mật mã voucher và sử dụng đúng điều kiện. Đối tác có trách nhiệm xác thực voucher theo thông tin đã công bố. VoucherHub hỗ trợ ghi nhận, kiểm tra và xử lý yêu cầu ở mức mô phỏng trong phạm vi đồ án.$$,
   TRUE),
  ('chinh-sach-hoan-tien', 'Chính sách hoàn/hủy',
   $$1. Phạm vi áp dụng
Chính sách này áp dụng cho các voucher được mua trên hệ thống VoucherHub. Việc hoàn/hủy được xử lý ở mức mô phỏng nhằm phục vụ quy trình nghiệp vụ của đồ án thương mại điện tử.

2. Điều kiện được hỗ trợ hoàn/hủy
Khách hàng có thể được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Đơn hàng chưa được thanh toán thành công.
- Voucher chưa được sử dụng và còn trong thời hạn hỗ trợ theo điều kiện chương trình.
- Đối tác từ chối áp dụng voucher không đúng với điều kiện đã công bố.
- Thông tin voucher hiển thị sai lệch nghiêm trọng so với điều kiện sử dụng thực tế.
- Hệ thống phát sinh lỗi khiến khách hàng không thể xem hoặc sử dụng mã voucher.

3. Trường hợp không hỗ trợ hoàn/hủy
Voucher có thể không được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Voucher đã được đối tác xác nhận sử dụng.
- Voucher đã hết hạn do khách hàng không sử dụng trong thời gian quy định.
- Khách hàng sử dụng voucher sai chi nhánh, sai điều kiện hoặc sai thời gian áp dụng.
- Khách hàng tự ý chia sẻ mã voucher cho người khác dẫn đến rủi ro sử dụng ngoài ý muốn.
- Voucher thuộc chương trình có ghi rõ không áp dụng hoàn/hủy.

4. Quy trình gửi yêu cầu hoàn/hủy hoặc khiếu nại
Khách hàng có thể gửi yêu cầu hỗ trợ từ mục "Voucher của tôi" hoặc "Khiếu nại". Khi gửi yêu cầu, khách hàng cần cung cấp lý do, mô tả vấn đề và chọn voucher/đơn hàng liên quan để quản trị viên kiểm tra.

5. Thời gian xử lý mô phỏng
Quản trị viên sẽ tiếp nhận, kiểm tra trạng thái đơn hàng, trạng thái voucher, lịch sử sử dụng và phản hồi của đối tác. Kết quả xử lý có thể là chấp nhận hoàn/hủy, từ chối yêu cầu hoặc yêu cầu bổ sung thông tin.

6. Lưu ý đối với voucher đã sử dụng, hết hạn hoặc sai chi nhánh
Voucher đã sử dụng, hết hạn, bị hủy hoặc không áp dụng đúng chi nhánh có thể không còn giá trị sử dụng. Khách hàng nên kiểm tra kỹ thời hạn, điều kiện áp dụng và chi nhánh trước khi đến sử dụng dịch vụ.

7. Trách nhiệm của các bên
Khách hàng có trách nhiệm bảo mật mã voucher và sử dụng đúng điều kiện. Đối tác có trách nhiệm xác thực voucher theo thông tin đã công bố. VoucherHub hỗ trợ ghi nhận, kiểm tra và xử lý yêu cầu ở mức mô phỏng trong phạm vi đồ án.$$,
   TRUE),
  ('refund-policy', 'Chính sách hoàn/hủy',
   $$1. Phạm vi áp dụng
Chính sách này áp dụng cho các voucher được mua trên hệ thống VoucherHub. Việc hoàn/hủy được xử lý ở mức mô phỏng nhằm phục vụ quy trình nghiệp vụ của đồ án thương mại điện tử.

2. Điều kiện được hỗ trợ hoàn/hủy
Khách hàng có thể được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Đơn hàng chưa được thanh toán thành công.
- Voucher chưa được sử dụng và còn trong thời hạn hỗ trợ theo điều kiện chương trình.
- Đối tác từ chối áp dụng voucher không đúng với điều kiện đã công bố.
- Thông tin voucher hiển thị sai lệch nghiêm trọng so với điều kiện sử dụng thực tế.
- Hệ thống phát sinh lỗi khiến khách hàng không thể xem hoặc sử dụng mã voucher.

3. Trường hợp không hỗ trợ hoàn/hủy
Voucher có thể không được hỗ trợ hoàn/hủy trong các trường hợp sau:
- Voucher đã được đối tác xác nhận sử dụng.
- Voucher đã hết hạn do khách hàng không sử dụng trong thời gian quy định.
- Khách hàng sử dụng voucher sai chi nhánh, sai điều kiện hoặc sai thời gian áp dụng.
- Khách hàng tự ý chia sẻ mã voucher cho người khác dẫn đến rủi ro sử dụng ngoài ý muốn.
- Voucher thuộc chương trình có ghi rõ không áp dụng hoàn/hủy.

4. Quy trình gửi yêu cầu hoàn/hủy hoặc khiếu nại
Khách hàng có thể gửi yêu cầu hỗ trợ từ mục "Voucher của tôi" hoặc "Khiếu nại". Khi gửi yêu cầu, khách hàng cần cung cấp lý do, mô tả vấn đề và chọn voucher/đơn hàng liên quan để quản trị viên kiểm tra.

5. Thời gian xử lý mô phỏng
Quản trị viên sẽ tiếp nhận, kiểm tra trạng thái đơn hàng, trạng thái voucher, lịch sử sử dụng và phản hồi của đối tác. Kết quả xử lý có thể là chấp nhận hoàn/hủy, từ chối yêu cầu hoặc yêu cầu bổ sung thông tin.

6. Lưu ý đối với voucher đã sử dụng, hết hạn hoặc sai chi nhánh
Voucher đã sử dụng, hết hạn, bị hủy hoặc không áp dụng đúng chi nhánh có thể không còn giá trị sử dụng. Khách hàng nên kiểm tra kỹ thời hạn, điều kiện áp dụng và chi nhánh trước khi đến sử dụng dịch vụ.

7. Trách nhiệm của các bên
Khách hàng có trách nhiệm bảo mật mã voucher và sử dụng đúng điều kiện. Đối tác có trách nhiệm xác thực voucher theo thông tin đã công bố. VoucherHub hỗ trợ ghi nhận, kiểm tra và xử lý yêu cầu ở mức mô phỏng trong phạm vi đồ án.$$,
   TRUE),
  ('dieu-khoan-voucher', 'Điều khoản voucher',
   $$1. Hiệu lực của voucher
Voucher chỉ có hiệu lực sau khi đơn hàng được thanh toán thành công và hệ thống phát hành mã voucher tương ứng.

2. Phạm vi sử dụng
Mỗi voucher có thể áp dụng cho một hoặc nhiều chi nhánh cụ thể. Khách hàng cần kiểm tra kỹ chi nhánh áp dụng trước khi sử dụng.

3. Thời hạn sử dụng
Voucher chỉ được sử dụng trong thời gian hiệu lực được hiển thị trên chi tiết voucher. Sau thời hạn này, voucher có thể chuyển sang trạng thái hết hạn và không còn giá trị sử dụng.

4. Quy định về mã voucher/QR
Mã voucher là mã định danh duy nhất được phát hành cho từng giao dịch hợp lệ. QR trong hệ thống là QR mô phỏng, dùng để hỗ trợ quy trình xác thực trong phạm vi đồ án.

5. Quy định sử dụng một lần
Voucher đã được xác nhận sử dụng sẽ không thể sử dụng lại, trừ khi chương trình voucher có quy định nhiều lượt sử dụng. Khách hàng không nên chia sẻ mã voucher công khai để tránh phát sinh rủi ro.

6. Trường hợp voucher có thể bị từ chối
Đối tác có thể từ chối xác thực voucher nếu:
- Voucher đã hết hạn.
- Voucher đã được sử dụng.
- Voucher không áp dụng tại chi nhánh hiện tại.
- Voucher không đáp ứng điều kiện sử dụng.
- Voucher đã bị hủy, hoàn tiền hoặc tạm ngưng bởi hệ thống.

7. Trách nhiệm bảo mật mã voucher
Khách hàng chịu trách nhiệm bảo mật mã voucher/QR sau khi được phát hành. VoucherHub không khuyến khích chụp màn hình, đăng công khai hoặc gửi mã voucher cho người không liên quan.

8. Tranh chấp và khiếu nại
Nếu khách hàng cho rằng voucher bị từ chối không đúng, khách hàng có thể gửi khiếu nại để quản trị viên kiểm tra thông tin giao dịch, trạng thái voucher và phản hồi từ đối tác.$$,
   TRUE),
  ('dieu-khoan-su-dung', 'Điều khoản voucher',
   $$1. Hiệu lực của voucher
Voucher chỉ có hiệu lực sau khi đơn hàng được thanh toán thành công và hệ thống phát hành mã voucher tương ứng.

2. Phạm vi sử dụng
Mỗi voucher có thể áp dụng cho một hoặc nhiều chi nhánh cụ thể. Khách hàng cần kiểm tra kỹ chi nhánh áp dụng trước khi sử dụng.

3. Thời hạn sử dụng
Voucher chỉ được sử dụng trong thời gian hiệu lực được hiển thị trên chi tiết voucher. Sau thời hạn này, voucher có thể chuyển sang trạng thái hết hạn và không còn giá trị sử dụng.

4. Quy định về mã voucher/QR
Mã voucher là mã định danh duy nhất được phát hành cho từng giao dịch hợp lệ. QR trong hệ thống là QR mô phỏng, dùng để hỗ trợ quy trình xác thực trong phạm vi đồ án.

5. Quy định sử dụng một lần
Voucher đã được xác nhận sử dụng sẽ không thể sử dụng lại, trừ khi chương trình voucher có quy định nhiều lượt sử dụng. Khách hàng không nên chia sẻ mã voucher công khai để tránh phát sinh rủi ro.

6. Trường hợp voucher có thể bị từ chối
Đối tác có thể từ chối xác thực voucher nếu:
- Voucher đã hết hạn.
- Voucher đã được sử dụng.
- Voucher không áp dụng tại chi nhánh hiện tại.
- Voucher không đáp ứng điều kiện sử dụng.
- Voucher đã bị hủy, hoàn tiền hoặc tạm ngưng bởi hệ thống.

7. Trách nhiệm bảo mật mã voucher
Khách hàng chịu trách nhiệm bảo mật mã voucher/QR sau khi được phát hành. VoucherHub không khuyến khích chụp màn hình, đăng công khai hoặc gửi mã voucher cho người không liên quan.

8. Tranh chấp và khiếu nại
Nếu khách hàng cho rằng voucher bị từ chối không đúng, khách hàng có thể gửi khiếu nại để quản trị viên kiểm tra thông tin giao dịch, trạng thái voucher và phản hồi từ đối tác.$$,
   TRUE),
  ('voucher-terms', 'Điều khoản voucher',
   $$1. Hiệu lực của voucher
Voucher chỉ có hiệu lực sau khi đơn hàng được thanh toán thành công và hệ thống phát hành mã voucher tương ứng.

2. Phạm vi sử dụng
Mỗi voucher có thể áp dụng cho một hoặc nhiều chi nhánh cụ thể. Khách hàng cần kiểm tra kỹ chi nhánh áp dụng trước khi sử dụng.

3. Thời hạn sử dụng
Voucher chỉ được sử dụng trong thời gian hiệu lực được hiển thị trên chi tiết voucher. Sau thời hạn này, voucher có thể chuyển sang trạng thái hết hạn và không còn giá trị sử dụng.

4. Quy định về mã voucher/QR
Mã voucher là mã định danh duy nhất được phát hành cho từng giao dịch hợp lệ. QR trong hệ thống là QR mô phỏng, dùng để hỗ trợ quy trình xác thực trong phạm vi đồ án.

5. Quy định sử dụng một lần
Voucher đã được xác nhận sử dụng sẽ không thể sử dụng lại, trừ khi chương trình voucher có quy định nhiều lượt sử dụng. Khách hàng không nên chia sẻ mã voucher công khai để tránh phát sinh rủi ro.

6. Trường hợp voucher có thể bị từ chối
Đối tác có thể từ chối xác thực voucher nếu:
- Voucher đã hết hạn.
- Voucher đã được sử dụng.
- Voucher không áp dụng tại chi nhánh hiện tại.
- Voucher không đáp ứng điều kiện sử dụng.
- Voucher đã bị hủy, hoàn tiền hoặc tạm ngưng bởi hệ thống.

7. Trách nhiệm bảo mật mã voucher
Khách hàng chịu trách nhiệm bảo mật mã voucher/QR sau khi được phát hành. VoucherHub không khuyến khích chụp màn hình, đăng công khai hoặc gửi mã voucher cho người không liên quan.

8. Tranh chấp và khiếu nại
Nếu khách hàng cho rằng voucher bị từ chối không đúng, khách hàng có thể gửi khiếu nại để quản trị viên kiểm tra thông tin giao dịch, trạng thái voucher và phản hồi từ đối tác.$$,
   TRUE),
  ('huong-dan-su-dung', 'Hướng dẫn sử dụng voucher',
   $$1. Tìm kiếm voucher
Khách hàng có thể tìm kiếm voucher theo từ khóa, danh mục, khu vực, giá, mức giảm hoặc đối tác.

2. Xem chi tiết voucher
Trước khi mua, khách hàng cần kiểm tra kỹ giá bán, giá gốc, thời hạn sử dụng, điều kiện áp dụng, chi nhánh áp dụng và chính sách hoàn/hủy.

3. Thêm voucher vào giỏ hàng
Sau khi chọn voucher phù hợp, khách hàng bấm "Thêm vào giỏ hàng" và kiểm tra lại số lượng, giá tiền trước khi thanh toán.

4. Tạo đơn và thanh toán mô phỏng
Khách hàng tạo đơn hàng và chọn phương thức thanh toán mô phỏng. Sau khi đơn hàng được ghi nhận là đã thanh toán, hệ thống sẽ phát hành mã voucher.

5. Nhận mã voucher/QR
Khách hàng vào mục "Voucher của tôi" để xem mã voucher và QR mô phỏng. Mã voucher chỉ hiển thị sau khi đơn hàng đã thanh toán thành công.

6. Sử dụng tại chi nhánh
Khi đến chi nhánh áp dụng, khách hàng cung cấp mã voucher hoặc QR mô phỏng cho đối tác để kiểm tra.

7. Đối tác xác thực
Đối tác kiểm tra trạng thái voucher. Nếu voucher hợp lệ, đối tác xác nhận sử dụng và hệ thống chuyển voucher sang trạng thái "Đã sử dụng".

8. Theo dõi trạng thái
Khách hàng có thể theo dõi trạng thái voucher: Chưa sử dụng, Đã sử dụng, Hết hạn, Đã hủy hoặc Đã hoàn tiền.

9. Đánh giá hoặc khiếu nại
Sau khi sử dụng voucher, khách hàng có thể đánh giá trải nghiệm hoặc gửi khiếu nại nếu phát sinh vấn đề.$$,
   TRUE),
  ('usage-guide', 'Hướng dẫn sử dụng voucher',
   $$1. Tìm kiếm voucher
Khách hàng có thể tìm kiếm voucher theo từ khóa, danh mục, khu vực, giá, mức giảm hoặc đối tác.

2. Xem chi tiết voucher
Trước khi mua, khách hàng cần kiểm tra kỹ giá bán, giá gốc, thời hạn sử dụng, điều kiện áp dụng, chi nhánh áp dụng và chính sách hoàn/hủy.

3. Thêm voucher vào giỏ hàng
Sau khi chọn voucher phù hợp, khách hàng bấm "Thêm vào giỏ hàng" và kiểm tra lại số lượng, giá tiền trước khi thanh toán.

4. Tạo đơn và thanh toán mô phỏng
Khách hàng tạo đơn hàng và chọn phương thức thanh toán mô phỏng. Sau khi đơn hàng được ghi nhận là đã thanh toán, hệ thống sẽ phát hành mã voucher.

5. Nhận mã voucher/QR
Khách hàng vào mục "Voucher của tôi" để xem mã voucher và QR mô phỏng. Mã voucher chỉ hiển thị sau khi đơn hàng đã thanh toán thành công.

6. Sử dụng tại chi nhánh
Khi đến chi nhánh áp dụng, khách hàng cung cấp mã voucher hoặc QR mô phỏng cho đối tác để kiểm tra.

7. Đối tác xác thực
Đối tác kiểm tra trạng thái voucher. Nếu voucher hợp lệ, đối tác xác nhận sử dụng và hệ thống chuyển voucher sang trạng thái "Đã sử dụng".

8. Theo dõi trạng thái
Khách hàng có thể theo dõi trạng thái voucher: Chưa sử dụng, Đã sử dụng, Hết hạn, Đã hủy hoặc Đã hoàn tiền.

9. Đánh giá hoặc khiếu nại
Sau khi sử dụng voucher, khách hàng có thể đánh giá trải nghiệm hoặc gửi khiếu nại nếu phát sinh vấn đề.$$,
   TRUE)
ON CONFLICT (slug) DO UPDATE SET
  title      = EXCLUDED.title,
  content    = EXCLUDED.content,
  is_active  = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO popups (title, content, is_active, start_date, end_date)
SELECT
  'Flash Sale Demo',
  'VoucherHub đang có chương trình ưu đãi demo. Admin có thể sửa hoặc tắt popup này trong tab Nội dung > Popups.',
  TRUE,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (
  SELECT 1 FROM popups WHERE title = 'Flash Sale Demo'
);

-- ─── 4. Customers (20) ───────────────────────────────────────────
-- Mật khẩu chung: Customer@123
INSERT INTO users (email, password, full_name, phone, role) VALUES
  ('customer1@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Lê Minh Anh',       '0901000001', 'CUSTOMER'),
  ('customer2@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Trần Gia Huy',      '0901000002', 'CUSTOMER'),
  ('customer3@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Nguyễn Thanh Hà',   '0901000003', 'CUSTOMER'),
  ('customer4@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Nguyễn Tuấn Kiệt',  '0901000004', 'CUSTOMER'),
  ('customer5@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Võ Phương Linh',    '0901000005', 'CUSTOMER'),
  ('customer6@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Lê Quốc Bảo',      '0901000006', 'CUSTOMER'),
  ('customer7@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Đặng Thảo My',     '0901000007', 'CUSTOMER'),
  ('customer8@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Phạm Nhật Nam',    '0901000008', 'CUSTOMER'),
  ('customer9@vouchersystem.com',  '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Bùi Khánh Vy',     '0901000009', 'CUSTOMER'),
  ('customer10@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Trương Gia Bảo',   '0901000010', 'CUSTOMER'),
  ('customer11@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Hồ Minh Trang',    '0901000011', 'CUSTOMER'),
  ('customer12@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Dương Anh Khoa',   '0901000012', 'CUSTOMER'),
  ('customer13@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Lâm Ngọc Hân',     '0901000013', 'CUSTOMER'),
  ('customer14@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Đỗ Thành Long',    '0901000014', 'CUSTOMER'),
  ('customer15@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Phan Thanh Tâm',   '0901000015', 'CUSTOMER'),
  ('customer16@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Ngô Thị Hoa',      '0901000016', 'CUSTOMER'),
  ('customer17@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Vũ Đức Anh',       '0901000017', 'CUSTOMER'),
  ('customer18@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Mai Thị Lan',      '0901000018', 'CUSTOMER'),
  ('customer19@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Đinh Văn Hùng',    '0901000019', 'CUSTOMER'),
  ('customer20@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Trịnh Thị Hương',  '0901000020', 'CUSTOMER')
ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email;

-- ─── 5. Partner Users (19 approved + 1 pending + 1 suspended) ────
INSERT INTO users (email, password, full_name, phone, role) VALUES
  ('partner2@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Green Spa Manager',          '0902000001', 'PARTNER'),
  ('partner3@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Sunrise Eats Manager',       '0903000001', 'PARTNER'),
  ('partner4@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Lotus Beauty Manager',       '0904000001', 'PARTNER'),
  ('partner5@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'River Spa Manager',          '0905000001', 'PARTNER'),
  ('partner6@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Urban Eats Manager',         '0906000001', 'PARTNER'),
  ('partner7@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'FitLab Studio Manager',      '0907000001', 'PARTNER'),
  ('partner8@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Cozy Travel Manager',        '0908000001', 'PARTNER'),
  ('partner9@vouchersystem.com',          '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Moon Cinema Manager',        '0909000001', 'PARTNER'),
  ('partner10@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Market Mart Manager',        '0910000001', 'PARTNER'),
  ('partner11@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Hanoi Kitchen Manager',      '0911000001', 'PARTNER'),
  ('partner12@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Dragon Pho Manager',         '0912000001', 'PARTNER'),
  ('partner13@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Sky Fitness Manager',        '0913000001', 'PARTNER'),
  ('partner14@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Paradise Resort Manager',    '0914000001', 'PARTNER'),
  ('partner15@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Tech Cafe Manager',          '0915000001', 'PARTNER'),
  ('partner16@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Bamboo Spa Manager',         '0916000001', 'PARTNER'),
  ('partner17@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Golden Buffet Manager',      '0917000001', 'PARTNER'),
  ('partner18@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Fun Zone Manager',           '0918000001', 'PARTNER'),
  ('partner19@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Fashion Hub Manager',        '0919000001', 'PARTNER'),
  ('partner20@vouchersystem.com',         '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Nature Trek Manager',        '0920000001', 'PARTNER'),
  ('partner-pending@vouchersystem.com',   '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Pending Studio Manager',     '0921000001', 'PARTNER'),
  ('partner-suspended@vouchersystem.com', '$2a$12$i2bDyI/5uo22unsFUphB2eeTkXv8QyvSitbCpMmhIX0H.iF6Id6Tm', 'Old Brand Store Manager',    '0922000001', 'PARTNER')
ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email;

-- ─── 6. Partner Profiles ─────────────────────────────────────────
INSERT INTO partners (user_id, business_name, business_license, representative, address, status)
SELECT u.id, v.biz, v.lic, v.rep, v.addr, v.st::partner_status
FROM (VALUES
  ('partner2@vouchersystem.com',          'Green Spa',        'BL-002', 'Phạm Trâm',          'Quận 3, TP.HCM',       'APPROVED'),
  ('partner3@vouchersystem.com',          'Sunrise Eats',     'BL-003', 'Đỗ Hân',             'Quận 1, TP.HCM',       'APPROVED'),
  ('partner4@vouchersystem.com',          'Lotus Beauty',     'BL-004', 'Mai Hương',           'Quận 10, TP.HCM',      'APPROVED'),
  ('partner5@vouchersystem.com',          'River Spa',        'BL-005', 'Trần Bảo Ngọc',      'Quận 3, TP.HCM',       'APPROVED'),
  ('partner6@vouchersystem.com',          'Urban Eats',       'BL-006', 'Lê Gia Huy',         'Quận 7, TP.HCM',       'APPROVED'),
  ('partner7@vouchersystem.com',          'FitLab Studio',    'BL-007', 'Nguyễn Minh Khang',  'Thủ Đức, TP.HCM',      'APPROVED'),
  ('partner8@vouchersystem.com',          'Cozy Travel',      'BL-008', 'Phan Thu Hà',        'Quận 1, TP.HCM',       'APPROVED'),
  ('partner9@vouchersystem.com',          'Moon Cinema',      'BL-009', 'Đỗ Nhật Quang',      'Tân Bình, TP.HCM',     'APPROVED'),
  ('partner10@vouchersystem.com',         'Market Mart',      'BL-010', 'Phạm Quỳnh Anh',    'Gò Vấp, TP.HCM',        'APPROVED'),
  ('partner11@vouchersystem.com',         'Hanoi Kitchen',    'BL-011', 'Nguyễn Văn Hùng',   'Quận 5, TP.HCM',         'APPROVED'),
  ('partner12@vouchersystem.com',         'Dragon Pho',       'BL-012', 'Hoàng Minh Đức',    'Quận 11, TP.HCM',        'APPROVED'),
  ('partner13@vouchersystem.com',         'Sky Fitness',      'BL-013', 'Trần Thị Bích',      'Bình Thạnh, TP.HCM',   'APPROVED'),
  ('partner14@vouchersystem.com',         'Paradise Resort',  'BL-014', 'Lê Văn Tùng',        'Quận 2, TP.HCM',       'APPROVED'),
  ('partner15@vouchersystem.com',         'Tech Cafe',        'BL-015', 'Đinh Quốc Tuấn',    'Quận 9, TP.HCM',         'APPROVED'),
  ('partner16@vouchersystem.com',         'Bamboo Spa',       'BL-016', 'Vũ Thị Lan',         'Quận 4, TP.HCM',       'APPROVED'),
  ('partner17@vouchersystem.com',         'Golden Buffet',    'BL-017', 'Trương Hoàng Long',  'Quận 8, TP.HCM',       'APPROVED'),
  ('partner18@vouchersystem.com',         'Fun Zone',         'BL-018', 'Bùi Thị Ngọc',       'Quận 6, TP.HCM',       'APPROVED'),
  ('partner19@vouchersystem.com',         'Fashion Hub',      'BL-019', 'Phạm Thị Thu',       'Quận 1, TP.HCM',       'APPROVED'),
  ('partner20@vouchersystem.com',         'Nature Trek',      'BL-020', 'Cao Văn Minh',       'Quận 12, TP.HCM',      'APPROVED'),
  ('partner-pending@vouchersystem.com',   'Pending Studio',   'BL-021', 'Lâm Vy',             'Quận 7, TP.HCM',       'PENDING'),
  ('partner-suspended@vouchersystem.com', 'Old Brand Store',  'BL-022', 'Ngô Văn Tài',        'Quận 5, TP.HCM',       'SUSPENDED')
) AS v(email, biz, lic, rep, addr, st)
JOIN users u ON u.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE user_id = u.id);

-- ─── 7. Partner Branches (2 mỗi đối tác = 40 chi nhánh mới) ─────
INSERT INTO partner_branches (partner_id, name, address, phone)
SELECT p.id, b.bname, b.baddr, b.bphone
FROM (VALUES
  ('partner2@vouchersystem.com',  'Green Spa - Võ Văn Tần',            '88 Võ Văn Tần, Q3, TP.HCM',                   '0902000002'),
  ('partner2@vouchersystem.com',  'Green Spa - Phú Nhuận',             '15 Phan Đăng Lưu, Phú Nhuận, TP.HCM',         '0902000003'),
  ('partner3@vouchersystem.com',  'Sunrise Eats - Lê Lợi',             '24 Lê Lợi, Q1, TP.HCM',                       '0903000002'),
  ('partner3@vouchersystem.com',  'Sunrise Eats - Thủ Đức',            '09 Võ Văn Ngân, Thủ Đức, TP.HCM',             '0903000003'),
  ('partner4@vouchersystem.com',  'Lotus Beauty - CMT8',                '155 CMT8, Q10, TP.HCM',                        '0904000002'),
  ('partner4@vouchersystem.com',  'Lotus Beauty - Phú Nhuận',          '42 Phan Xích Long, Phú Nhuận, TP.HCM',        '0904000003'),
  ('partner5@vouchersystem.com',  'River Spa - Hai Bà Trưng',          '88 Hai Bà Trưng, Q3, TP.HCM',                 '0905000002'),
  ('partner5@vouchersystem.com',  'River Spa - Bình Thạnh',            '17 Nguyễn Gia Trí, Bình Thạnh, TP.HCM',      '0905000003'),
  ('partner6@vouchersystem.com',  'Urban Eats - Phú Mỹ Hưng',          '12 Nguyễn Lương Bằng, Q7, TP.HCM',           '0906000002'),
  ('partner6@vouchersystem.com',  'Urban Eats - Nguyễn Văn Linh',      '196 Nguyễn Văn Linh, Q7, TP.HCM',            '0906000003'),
  ('partner7@vouchersystem.com',  'FitLab Studio - Võ Văn Ngân',       '99 Võ Văn Ngân, Thủ Đức, TP.HCM',            '0907000002'),
  ('partner7@vouchersystem.com',  'FitLab Studio - Kha Vạn Cân',       '210 Kha Vạn Cân, Thủ Đức, TP.HCM',           '0907000003'),
  ('partner8@vouchersystem.com',  'Cozy Travel - Bến Thành',            '01 Lê Lai, Q1, TP.HCM',                       '0908000002'),
  ('partner8@vouchersystem.com',  'Cozy Travel - Nguyễn Huệ',          '22 Nguyễn Huệ, Q1, TP.HCM',                   '0908000003'),
  ('partner9@vouchersystem.com',  'Moon Cinema - Cộng Hòa',            '135 Cộng Hòa, Tân Bình, TP.HCM',             '0909000002'),
  ('partner9@vouchersystem.com',  'Moon Cinema - Trường Sơn',          '48 Trường Sơn, Tân Bình, TP.HCM',             '0909000003'),
  ('partner10@vouchersystem.com', 'Market Mart - Quang Trung',          '232 Quang Trung, Gò Vấp, TP.HCM',            '0910000002'),
  ('partner10@vouchersystem.com', 'Market Mart - Phan Văn Trị',         '88 Phan Văn Trị, Gò Vấp, TP.HCM',           '0910000003'),
  ('partner11@vouchersystem.com', 'Hanoi Kitchen - Trần Hưng Đạo',     '100 Trần Hưng Đạo, Q5, TP.HCM',              '0911000002'),
  ('partner11@vouchersystem.com', 'Hanoi Kitchen - Nguyễn Trãi',        '250 Nguyễn Trãi, Q5, TP.HCM',                '0911000003'),
  ('partner12@vouchersystem.com', 'Dragon Pho - Lý Thường Kiệt',       '33 Lý Thường Kiệt, Q11, TP.HCM',             '0912000002'),
  ('partner12@vouchersystem.com', 'Dragon Pho - Âu Cơ',                 '78 Âu Cơ, Q11, TP.HCM',                      '0912000003'),
  ('partner13@vouchersystem.com', 'Sky Fitness - Xô Viết Nghệ Tĩnh',  '55 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',  '0913000002'),
  ('partner13@vouchersystem.com', 'Sky Fitness - Đinh Bộ Lĩnh',        '123 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM',      '0913000003'),
  ('partner14@vouchersystem.com', 'Paradise Resort - Thảo Điền',       '10 Thảo Điền, Q2, TP.HCM',                   '0914000002'),
  ('partner14@vouchersystem.com', 'Paradise Resort - An Phú',           '5 An Phú, Q2, TP.HCM',                        '0914000003'),
  ('partner15@vouchersystem.com', 'Tech Cafe - Hiệp Phú',               '44 Hiệp Phú, Q9, TP.HCM',                    '0915000002'),
  ('partner15@vouchersystem.com', 'Tech Cafe - Long Thạnh Mỹ',          '120 Long Thạnh Mỹ, Q9, TP.HCM',              '0915000003'),
  ('partner16@vouchersystem.com', 'Bamboo Spa - Khánh Hội',             '28 Khánh Hội, Q4, TP.HCM',                   '0916000002'),
  ('partner16@vouchersystem.com', 'Bamboo Spa - Tôn Đản',               '64 Tôn Đản, Q4, TP.HCM',                     '0916000003'),
  ('partner17@vouchersystem.com', 'Golden Buffet - Phạm Thế Hiển',     '75 Phạm Thế Hiển, Q8, TP.HCM',               '0917000002'),
  ('partner17@vouchersystem.com', 'Golden Buffet - Tụng Châu',          '38 Tụng Châu, Q8, TP.HCM',                   '0917000003'),
  ('partner18@vouchersystem.com', 'Fun Zone - Lý Chiêu Hoàng',         '90 Lý Chiêu Hoàng, Q6, TP.HCM',              '0918000002'),
  ('partner18@vouchersystem.com', 'Fun Zone - Phú Lâm',                  '22 Bình Phú, Q6, TP.HCM',                    '0918000003'),
  ('partner19@vouchersystem.com', 'Fashion Hub - Đồng Khởi',            '15 Đồng Khởi, Q1, TP.HCM',                   '0919000002'),
  ('partner19@vouchersystem.com', 'Fashion Hub - Nam Kỳ Khởi Nghĩa',   '48 Nam Kỳ Khởi Nghĩa, Q1, TP.HCM',          '0919000003'),
  ('partner20@vouchersystem.com', 'Nature Trek - Nguyễn Ảnh Thủ',      '100 Nguyễn Ảnh Thủ, Q12, TP.HCM',           '0920000002'),
  ('partner20@vouchersystem.com', 'Nature Trek - Tân Chánh Hiệp',       '200 Tân Chánh Hiệp, Q12, TP.HCM',           '0920000003')
) AS b(email, bname, baddr, bphone)
JOIN users u ON u.email = b.email
JOIN partners p ON p.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM partner_branches pb WHERE pb.partner_id = p.id AND pb.name = b.bname
);

-- ─── 8. Vouchers (6 mỗi đối tác × 19 đối tác = 114 voucher mới) ─
-- Cộng với 6 voucher của Sunrise Coffee từ init.sql = 120 tổng
-- Dùng CTE để lấy partner_id, VALUES cho data voucher
-- Cột: (email_đối_tác, tên, mô_tả, danh_mục, giá_gốc, giá_bán, tồn_kho,
--       ngày_bắt_đầu_bán_từ_nay, ngày_kết_thúc_bán_từ_nay, ngày_hết_hạn_từ_nay,
--       điều_khoản, ảnh, trạng_thái)

WITH pids AS (
  SELECT u.email, p.id AS pid
  FROM users u JOIN partners p ON p.user_id = u.id
)
INSERT INTO vouchers (
  partner_id, name, description, category,
  original_price, sale_price, stock,
  sale_start, sale_end, valid_until,
  terms, image_url, status
)
SELECT
  pids.pid, v.vname, v.vdesc, v.vcat,
  v.vorig::NUMERIC(15,2), v.vsale::NUMERIC(15,2), v.vstk::INTEGER,
  NOW() - v.d_ago::INTEGER  * INTERVAL '1 day',
  NOW() + v.d_end::INTEGER  * INTERVAL '1 day',
  NOW() + v.d_val::INTEGER  * INTERVAL '1 day',
  v.vterms, v.vimg, v.vstatus::voucher_status
FROM (VALUES
  -- ── Green Spa (partner2) ── Làm đẹp / Sức khỏe
  ('partner2@vouchersystem.com','Body Massage 90 Phút',       'Massage body thư giãn toàn thân, giúp giảm đau cơ và phục hồi sức khỏe', 'Làm đẹp', 850000, 490000, 50, 2,40,80, 'Đặt lịch trước 1 ngày. Không áp dụng cuối tuần.',          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner2@vouchersystem.com','Facial Refresh 60 Phút',     'Chăm sóc da mặt chuyên sâu với công nghệ tiên tiến, phù hợp mọi loại da','Làm đẹp', 650000, 349000, 70, 1,35,90, 'Áp dụng tất cả ngày trong tuần.',                           'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner2@vouchersystem.com','Couple Spa Retreat',         'Gói spa đôi cao cấp dành cho 2 người, kết hợp massage và chăm sóc da',  'Sức khỏe',1300000,790000, 25, 1,50,90, 'Cần đặt hẹn trước 48 giờ.',                                 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner2@vouchersystem.com','Hot Stone Massage',          'Massage đá nóng tăng tuần hoàn máu, thư giãn sâu các nhóm cơ',         'Sức khỏe', 950000, 550000, 30, 3,30,70, 'Không dành cho người có bệnh tim mạch.',                    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner2@vouchersystem.com','Yoga Recovery Pack',         'Combo lớp yoga + xông hơi phục hồi sau tập luyện cường độ cao',         'Sức khỏe',1200000, 699000,  0,15, 0,10, 'Đã hết hàng.',                                              'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','SOLD_OUT'),
  ('partner2@vouchersystem.com','Spa Detox Full Day',         'Trải nghiệm spa trọn ngày: tắm thảo dược, massage, facial và snack',    'Làm đẹp',2500000,1490000, 15, 1,45,90, 'Tối đa 2 khách/ca. Đặt lịch trước 3 ngày.',                'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Sunrise Eats (partner3) ── Ẩm thực
  ('partner3@vouchersystem.com','Combo Breakfast Deluxe',     'Bữa sáng sang trọng cho 2 người kèm cà phê và nước trái cây tươi',     'Ẩm thực',  260000, 149000, 90, 1,25,60, 'Áp dụng khung giờ 7h-10h sáng.',                           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner3@vouchersystem.com','Cafe Sáng 5 Ly',             'Voucher cà phê sáng dành cho nhóm bạn, chọn thoải mái từ menu đặc sắc','Ẩm thực',  375000, 219000, 75, 1,30,60, 'Không đổi sang đồ ăn. Giá đã bao gồm VAT.',               'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  ('partner3@vouchersystem.com','Lunch Express',              'Suất ăn trưa nhanh tại văn phòng hoặc ăn tại chỗ trong 30 phút',       'Ẩm thực',  180000,  99000,150, 3,20,45, 'Áp dụng thứ 2 đến thứ 6.',                                  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','DRAFT'),
  ('partner3@vouchersystem.com','Americano Pass 10 Ly',       'Gói 10 ly Americano dùng dần trong 30 ngày, tiết kiệm và tiện lợi',    'Ẩm thực',  500000, 299000, 40,10,15,30, 'Không áp dụng mua mang đi sau 18h.',                        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner3@vouchersystem.com','Sunday Brunch for 2',        'Brunch cuối tuần phong cách Âu cho 2 người với set đầy đủ 4 món',      'Ẩm thực',  650000, 390000, 55, 2,28,60, 'Chỉ áp dụng thứ 7 & Chủ nhật.',                             'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner3@vouchersystem.com','Dinner Special 3 Người',     'Bữa tối đặc biệt cho 3 người: 5 món chính và 1 chai vang',            'Ẩm thực',  990000, 590000, 30, 1,30,45, 'Đặt bàn trước 2h. Không hoàn tiền.',                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Lotus Beauty (partner4) ── Làm đẹp
  ('partner4@vouchersystem.com','Gói Nail Art Premium',       'Nail art 2 tay + pedicure với sơn gel cao cấp, bền màu 3-4 tuần',      'Làm đẹp',  450000, 249000, 80, 2,35,70, 'Đặt lịch để được phục vụ đúng giờ.',                       'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner4@vouchersystem.com','Waxing Full Body',           'Triệt lông full body bằng sáp ấm, an toàn và không gây đau',           'Làm đẹp',  600000, 349000, 60, 1,40,80, 'Không áp dụng da nhạy cảm hoặc sau khi nhuộm tóc 48h.',   'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner4@vouchersystem.com','Làm Tóc Highlight',          'Highlight tóc với kỹ thuật balayage, kèm dưỡng tóc phục hồi',          'Làm đẹp', 1200000, 650000, 35, 2,35,60, 'Giá chưa bao gồm sản phẩm tóc cao cấp theo yêu cầu.',     'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner4@vouchersystem.com','Tẩy Tế Bào Chết + Dưỡng Da','Tẩy da chết toàn thân và đắp mặt nạ dưỡng ẩm chuyên sâu',            'Làm đẹp',  380000, 199000, 90, 1,30,60, 'Không áp dụng ngay sau khi làm waxing.',                   'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner4@vouchersystem.com','Micro-blading Lông Mày',     'Phun xăm vi điểm lông mày, giữ màu 1-2 năm, thiết kế theo khuôn mặt', 'Làm đẹp', 1500000, 890000, 20, 3,45,90, 'Cần tư vấn trước khi thực hiện. Không áp dụng da nhạy.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  ('partner4@vouchersystem.com','Dưỡng Trắng Toàn Thân',      'Liệu trình dưỡng trắng da 90 phút, hiệu quả ngay sau 1 lần',          'Làm đẹp',  750000, 420000, 45, 1,35,75, 'Tránh tiếp xúc ánh nắng sau khi thực hiện 24h.',          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── River Spa (partner5) ── Sức khỏe / Làm đẹp
  ('partner5@vouchersystem.com','Thai Massage 120 Phút',      'Massage Thái truyền thống 2 tiếng, giải phóng căng thẳng toàn thân',   'Sức khỏe',1100000, 620000, 40, 2,40,80, 'Mặc trang phục thoải mái. Không ăn no trước 1 giờ.',      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner5@vouchersystem.com','Tắm Thảo Dược + Massage',   'Tắm ngâm thảo dược 30 phút + massage toàn thân 60 phút',             'Sức khỏe',  750000, 420000, 50, 1,35,80, 'Không dành cho phụ nữ mang thai.',                         'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner5@vouchersystem.com','Body Scrub + Wrap',          'Tẩy tế bào chết toàn thân + quấn tảo biển dưỡng ẩm sâu',             'Sức khỏe',  680000, 380000, 45, 2,30,70, 'Hiệu quả tốt nhất khi thực hiện 2 lần/tháng.',            'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner5@vouchersystem.com','Foot Reflexology 60 Phút',   'Bấm huyệt bàn chân 60 phút, thư giãn và cải thiện lưu thông máu',    'Sức khỏe',  350000, 190000, 80, 1,25,60, 'Áp dụng tất cả ngày trong tuần.',                          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner5@vouchersystem.com','VIP Spa Day Package',        'Trọn gói spa VIP 5 tiếng với đầy đủ liệu pháp cao cấp và bữa nhẹ',   'Sức khỏe',2800000,1490000, 10, 1,40,90, 'Phục vụ theo đặt hẹn, tối đa 4 khách/ngày.',              'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner5@vouchersystem.com','Aromatherapy Massage 75p',   'Massage hương liệu trị liệu 75 phút với tinh dầu nhập khẩu',         'Làm đẹp',  820000, 460000, 35, 2,35,80, 'Chọn mùi hương yêu thích khi đặt lịch.',                  'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Urban Eats (partner6) ── Ẩm thực
  ('partner6@vouchersystem.com','BBQ Nướng 2 Người',          'Set BBQ nướng tại bàn cho 2 người với đủ loại thịt và rau củ tươi',   'Ẩm thực',  580000, 329000, 70, 2,35,70, 'Đặt bàn trước 1 giờ vào cuối tuần.',                       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner6@vouchersystem.com','Lẩu Thái Cho Nhóm 4',        'Lẩu Thái ngon chuẩn vị cho 4 người, kèm hải sản và rau cải đa dạng', 'Ẩm thực',  850000, 499000, 50, 1,30,60, 'Không áp dụng vào lễ, Tết. Đặt bàn trước để đảm bảo chỗ.','https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner6@vouchersystem.com','Cơm Trưa Văn Phòng',         'Suất cơm trưa văn phòng đa dạng món, giao tận nơi hoặc mang về',     'Ẩm thực',  120000,  69000,200, 1,20,45, 'Gọi trước 10h để đặt cơm trưa.',                           'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner6@vouchersystem.com','Pizza Premium 35cm',          'Pizza size lớn 35cm với đủ topping premium, đế giòn kiểu Ý',          'Ẩm thực',  350000, 199000, 80, 2,30,60, 'Áp dụng tất cả ngày, kể cả lễ.',                           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner6@vouchersystem.com','Set Sushi 20 Miếng',          '20 miếng sushi đa dạng: salmon, tuna, ebi với wasabi và gừng',       'Ẩm thực',  480000, 279000, 60, 1,25,50, 'Không áp dụng cùng combo khác.',                           'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner6@vouchersystem.com','Dimsum All-You-Can-Eat',      'Ăn dimsum không giới hạn 90 phút, hơn 30 loại dimsum truyền thống',   'Ẩm thực',  450000, 259000, 55, 2,30,60, 'Tối đa 90 phút/lượt. Không mang thức ăn thừa ra ngoài.',  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── FitLab Studio (partner7) ── Sức khỏe
  ('partner7@vouchersystem.com','Gói Gym 1 Tháng',            'Thẻ tập gym 1 tháng không giới hạn, đầy đủ thiết bị hiện đại',       'Sức khỏe',  800000, 450000, 60, 2,35,35, 'Không chuyển nhượng thẻ cho người khác.',                  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner7@vouchersystem.com','Yoga 10 Buổi',               'Gói 10 buổi yoga cơ bản, phù hợp mọi trình độ từ người mới bắt đầu', 'Sức khỏe', 1200000, 680000, 40, 2,30,60, 'Đăng ký lịch học trước 1 ngày.',                           'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner7@vouchersystem.com','Personal Training 5 Buổi',   '5 buổi tập PT 1-1 với HLV cá nhân, xây dựng giáo án riêng',          'Sức khỏe', 2000000,1190000, 20, 3,45,90, 'Buổi đầu tiên là buổi kiểm tra thể lực và tư vấn.',       'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner7@vouchersystem.com','Zumba Dance 8 Buổi',         '8 buổi học nhảy Zumba vui nhộn, giảm cân hiệu quả và năng động',     'Sức khỏe',  960000, 540000, 50, 1,30,60, 'Đăng ký nhóm để được giá tốt hơn.',                        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner7@vouchersystem.com','CrossFit Trial 3 Buổi',      '3 buổi trải nghiệm CrossFit với HLV chuyên nghiệp, cường độ cao',    'Sức khỏe',  600000, 329000, 35, 2,25,45, 'Yêu cầu sức khỏe tốt, không có chấn thương cơ xương.',    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner7@vouchersystem.com','Gói Gym 3 Tháng',            'Thẻ tập gym 3 tháng, tiết kiệm hơn mua từng tháng 30%',              'Sức khỏe', 2200000,1390000, 25, 1,30,90, 'Không hoàn tiền sau khi kích hoạt thẻ.',                   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  -- ── Cozy Travel (partner8) ── Du lịch
  ('partner8@vouchersystem.com','Tour Vũng Tàu 1 Ngày',       'Khám phá Vũng Tàu 1 ngày: tham quan, tắm biển, hải sản tươi sống',   'Du lịch',   950000, 590000, 50, 2,40,80, 'Bao gồm xe đưa đón và hướng dẫn viên.',                    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner8@vouchersystem.com','Tour Đà Lạt 3N2Đ',           'Du lịch Đà Lạt 3 ngày 2 đêm: tham quan thác, làng hoa và chợ đêm',  'Du lịch',  3500000,2290000, 30, 3,40,90, 'Giá chưa bao gồm vé máy bay. Đặt trước 5 ngày.',          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner8@vouchersystem.com','City Tour TP.HCM',            'Khám phá TP.HCM: Bến Thành, Nhà thờ Đức Bà, Dinh Độc Lập',          'Du lịch',   450000, 249000, 80, 1,30,60, 'Tour nửa ngày, bao gồm hướng dẫn viên tiếng Anh/Việt.',  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner8@vouchersystem.com','Tour Phú Quốc 4N3Đ',          '4 ngày 3 đêm Phú Quốc: lặn biển, câu mực đêm, safari thú',          'Du lịch',  7500000,4990000, 20, 2,50,90, 'Giá chưa bao gồm vé máy bay. Ăn uống 3 bữa/ngày.',       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner8@vouchersystem.com','Tour Hội An 4N3Đ',            '4 ngày 3 đêm phố cổ Hội An: làng gốm, làng rau Trà Quế',            'Du lịch',  5500000,3590000, 25, 1,45,90, 'Giá chưa bao gồm vé máy bay. Gồm ăn sáng và tối.',       'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner8@vouchersystem.com','Camping Núi Bà Đen',          'Cắm trại qua đêm dưới chân núi Bà Đen, ngắm bình minh trên cao',    'Du lịch',  1200000, 750000, 35, 2,35,70, 'Bao gồm lều, túi ngủ và bữa tối BBQ.',                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Moon Cinema (partner9) ── Giải trí
  ('partner9@vouchersystem.com','Vé Phim 2D',                  'Vé xem phim 2D tại cụm rạp Moon Cinema, không giới hạn suất chiếu',  'Giải trí',  150000,  89000,100, 2,25,50, 'Áp dụng cho tất cả các phim đang chiếu trừ phim đặc biệt.','https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner9@vouchersystem.com','Vé Phim 3D',                  'Vé xem phim 3D kèm kính 3D cao cấp tại Moon Cinema',                 'Giải trí',  220000, 129000, 80, 1,25,50, 'Kính 3D được vệ sinh sau mỗi suất chiếu.',                 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner9@vouchersystem.com','Combo Vé + Bắp + Nước',       'Vé 2D + bắp lớn + nước ngọt lớn, tiết kiệm hơn mua lẻ 40%',        'Giải trí',  350000, 199000, 90, 1,30,60, 'Không áp dụng cho vé IMAX hoặc phim đặc biệt.',           'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner9@vouchersystem.com','Vé IMAX',                     'Trải nghiệm màn hình IMAX khổng lồ với âm thanh vòm sống động',      'Giải trí',  280000, 169000, 60, 2,30,60, 'Số ghế giới hạn, đặt trước để chọn chỗ tốt.',             'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner9@vouchersystem.com','Family Pack 4 Vé',            'Combo 4 vé 2D cho gia đình, tiết kiệm 35% so với mua lẻ',            'Giải trí',  600000, 349000, 50, 2,30,60, 'Áp dụng 2 người lớn + 2 trẻ em dưới 12 tuổi.',           'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner9@vouchersystem.com','Date Night Combo',             'Gói đôi lãng mạn: 2 vé 3D + bắp + nước + chocolate',                 'Giải trí',  520000, 299000,  0,20, 0,10, 'Đã hết hàng.',                                              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80','SOLD_OUT'),
  -- ── Market Mart (partner10) ── Mua sắm
  ('partner10@vouchersystem.com','Voucher Mua Sắm 500k',       'Voucher trị giá 500.000đ áp dụng cho toàn bộ sản phẩm tại Market Mart','Mua sắm', 500000, 349000, 70, 2,35,70, 'Không áp dụng cùng chương trình khuyến mãi khác.',        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner10@vouchersystem.com','Voucher Siêu Thị 200k',      'Voucher 200k mua hàng tại siêu thị Market Mart, áp dụng mọi ngành',  'Mua sắm',  200000, 149000,100, 1,30,60, 'Mỗi tài khoản sử dụng tối đa 3 voucher/tháng.',           'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner10@vouchersystem.com','Voucher Thời Trang 300k',    'Voucher 300k cho khu vực thời trang và phụ kiện tại Market Mart',    'Mua sắm',  300000, 219000, 80, 1,30,60, 'Chỉ áp dụng khu vực thời trang tầng 2.',                  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner10@vouchersystem.com','Voucher Electronics 1000k',  'Voucher 1 triệu cho khu điện máy, áp dụng các mặt hàng điện tử',    'Mua sắm', 1000000, 749000, 30, 2,30,60, 'Tối thiểu hóa đơn 5 triệu mới được áp dụng.',            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  ('partner10@vouchersystem.com','Voucher Đồ Gia Dụng 400k',   'Voucher 400k khu đồ gia dụng, nội thất và dụng cụ bếp',              'Mua sắm',  400000, 279000, 55, 1,25,50, 'Áp dụng cho hóa đơn từ 2 triệu trở lên.',                 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner10@vouchersystem.com','Flash Sale Combo Tiết Kiệm', 'Combo 3 voucher siêu thị 100k, tiết kiệm tổng cộng 75k so với lẻ',  'Mua sắm',  375000, 249000, 40, 2,20,45, 'Dùng từng voucher 100k riêng lẻ, mỗi voucher 1 lần.',    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Hanoi Kitchen (partner11) ── Ẩm thực
  ('partner11@vouchersystem.com','Bún Bò Nam Bộ Combo',        'Bún bò xào kiểu Nam Bộ cho 2 người + 2 ly nước mía mát lạnh',        'Ẩm thực',  180000,  99000,100, 1,25,50, 'Phục vụ từ 10h đến 21h.',                                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner11@vouchersystem.com','Bánh Cuốn Hà Nội Set',       'Set bánh cuốn Hà Nội truyền thống 3 loại + chả lụa và nước chấm',   'Ẩm thực',  220000, 129000, 80, 2,30,60, 'Áp dụng buổi sáng đến 12h.',                               'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner11@vouchersystem.com','Phở Bắc Nóng Hổi',           'Phở bò/gà chuẩn vị Bắc, nước dùng hầm xương 12 tiếng thơm ngọt',   'Ẩm thực',  160000,  89000,120, 1,30,60, 'Phục vụ từ 6h sáng đến hết ngày.',                         'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner11@vouchersystem.com','Xôi Vịt Trọn Gói',           'Xôi vịt quay trọn gói cho 2 người kèm gỏi và canh',                 'Ẩm thực',  280000, 159000, 70, 1,25,50, 'Bán từ 6h sáng. Hết là hết!',                              'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner11@vouchersystem.com','Đặc Sản Miền Bắc 4 Người',   'Mâm cơm đặc sản miền Bắc cho 4 người: bún ốc, chả cá, bún thang',  'Ẩm thực',  850000, 490000, 35, 2,35,70, 'Đặt trước 2 giờ để bếp chuẩn bị kịp thời.',              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner11@vouchersystem.com','Bún Chả Hà Nội Set',         'Bún chả nướng than hoa chuẩn vị Hà Nội kèm nem cuốn',               'Ẩm thực',  240000, 139000, 60, 1,30,60, 'Thực hiện đặt hàng trước 30 phút.',                        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  -- ── Dragon Pho (partner12) ── Ẩm thực
  ('partner12@vouchersystem.com','Tô Phở Đặc Biệt + Nước',    'Phở bò đặc biệt tô lớn với đầy đủ gân, nạm, tái + 1 nước ngọt',    'Ẩm thực',  120000,  59000,150, 1,30,60, 'Áp dụng cả ngày, kể cả cuối tuần.',                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner12@vouchersystem.com','Combo Phở 2 Tô',             '2 tô phở cỡ vừa lựa chọn: gà, bò hoặc hải sản + 2 quẩy',           'Ẩm thực',  220000, 110000,100, 1,25,50, 'Hai người cùng dùng bữa.',                                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner12@vouchersystem.com','Gói Phở Nhà Hàng 4 Người',  'Phở nhà hàng cho 4 người: 4 tô đặc biệt + 4 quẩy + 4 nước',        'Ẩm thực',  700000, 390000, 45, 2,30,60, 'Phù hợp ăn gia đình hoặc nhóm bạn.',                       'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner12@vouchersystem.com','Hủ Tíu Nam Vang Đặc Biệt',  'Hủ tíu Nam Vang đặc biệt đầy đủ topping: thịt, tôm, gan, trứng',   'Ẩm thực',  150000,  85000,100, 1,25,50, 'Nước dùng hầm từ xương heo 8 tiếng.',                      'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner12@vouchersystem.com','Set Ăn Sáng Combo',          'Set ăn sáng: 1 tô phở nhỏ + bánh mì thịt + cà phê sữa đá',         'Ẩm thực',  190000,  99000,120, 1,25,50, 'Phục vụ từ 6h - 10h sáng.',                                 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner12@vouchersystem.com','Bò Kho Bánh Mì Set',         'Bò kho tô lớn chuẩn vị Sài Gòn + 2 ổ bánh mì giòn',               'Ẩm thực',  160000,  89000, 80, 2,30,60, 'Áp dụng cả ngày từ 7h - 21h.',                              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Sky Fitness (partner13) ── Sức khỏe
  ('partner13@vouchersystem.com','Thẻ Gym 3 Tháng',            'Thẻ tập gym không giới hạn 3 tháng tại Sky Fitness Bình Thạnh',     'Sức khỏe', 2400000,1490000, 25, 1,30,90, 'Không chuyển nhượng. Hết hạn không gia hạn.',              'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner13@vouchersystem.com','Lớp Yoga Nữ 15 Buổi',        'Yoga dành riêng cho nữ, lớp nhỏ tối đa 10 học viên',               'Sức khỏe', 1500000, 890000, 30, 2,35,90, 'Lịch học cố định thứ 2-4-6 sáng 7h hoặc chiều 5h.',      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner13@vouchersystem.com','Pilates Core 10 Buổi',        'Pilates cải thiện tư thế và cốt lõi, 10 buổi với HLV chuyên nghiệp','Sức khỏe', 1200000, 690000, 20, 2,35,80, 'Mặc đồ co giãn, không đi giày trong phòng tập.',          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner13@vouchersystem.com','Swimming Pass 1 Tháng',       'Thẻ bơi lội 1 tháng không giới hạn tại hồ bơi Sky Fitness',        'Sức khỏe',  600000, 360000, 50, 1,30,30, 'Mang theo thẻ hội viên và dép xỏ ngón khi vào hồ.',      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner13@vouchersystem.com','Spinning Class 8 Buổi',       '8 buổi đạp xe spinning cường độ cao, đốt calo tối đa',              'Sức khỏe',  800000, 460000, 40, 2,30,60, 'Mang khăn và chai nước riêng khi tập.',                   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner13@vouchersystem.com','Body Pump 6 Buổi',            '6 buổi lớp Body Pump tăng cơ toàn thân với tạ tay nhẹ',            'Sức khỏe',  720000, 420000, 35, 1,25,60, 'Mang giày thể thao chuyên dụng.',                          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  -- ── Paradise Resort (partner14) ── Du lịch
  ('partner14@vouchersystem.com','Staycation 1 Đêm Phòng Deluxe','Nghỉ 1 đêm phòng Deluxe view sông, bao gồm bữa sáng cho 2 người','Du lịch',  2500000,1590000, 20, 1,40,90, 'Check-in 14h, check-out 12h. Đặt trước ít nhất 2 ngày.',  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner14@vouchersystem.com','Pool Day Pass',               'Vé vào cửa hồ bơi vô cực cả ngày + 1 thức uống welcome',           'Du lịch',   600000, 350000, 60, 2,35,70, 'Áp dụng tất cả ngày. Không bao gồm đồ ăn.',               'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner14@vouchersystem.com','Spa + Dinner Package',        'Gói massage 60 phút + bữa tối 3 món tại nhà hàng Paradise',        'Du lịch',  1800000,1090000, 15, 1,35,80, 'Đặt trước 1 ngày. Chọn menu trước khi đến.',              'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner14@vouchersystem.com','Weekend Getaway 2N1Đ',        '2 ngày 1 đêm nghỉ dưỡng cuối tuần: phòng Deluxe + ăn sáng + spa',  'Du lịch',  3200000,1990000, 12, 2,45,90, 'Chỉ áp dụng thứ 6 - Chủ nhật. Đặt trước 3 ngày.',       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner14@vouchersystem.com','Romantic Sunset Dinner',      'Bữa tối lãng mạn ngắm hoàng hôn cho 2 người trên rooftop',         'Du lịch',  1200000, 750000, 20, 1,40,80, 'Bàn ưu tiên view đẹp nhất. Đặt trước 48 giờ.',           'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner14@vouchersystem.com','Kids Fun Day Package',        'Vé vui chơi trẻ em trọn ngày: bể bơi, khu vui chơi, bữa trưa',    'Du lịch',   800000, 490000, 40, 1,35,70, 'Dành cho trẻ từ 3-12 tuổi. Phụ huynh cần có mặt.',       'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Tech Cafe (partner15) ── Giải trí
  ('partner15@vouchersystem.com','Board Game 3 Giờ + Nước',    'Chơi board game không giới hạn 3 tiếng + 1 nước theo chọn',         'Giải trí',  280000, 159000, 80, 1,30,60, 'Hơn 200 loại board game đủ chủ đề.',                       'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner15@vouchersystem.com','PC Gaming 4 Giờ',            '4 giờ chơi game PC với máy tính cấu hình cao, màn hình 27 inch',    'Giải trí',  200000, 120000,100, 1,25,50, 'Máy có cài đầy đủ game Steam phổ biến.',                   'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner15@vouchersystem.com','VR Experience 1 Giờ',        'Trải nghiệm thực tế ảo VR 1 giờ với kính Oculus Quest 2 mới nhất',  'Giải trí',  250000, 149000, 50, 2,30,60, 'Không phù hợp với người say tàu xe hoặc động kinh.',      'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner15@vouchersystem.com','Monthly Gaming Pass',         'Thẻ tháng chơi game không giới hạn: PC + board game',               'Giải trí',  800000, 490000, 30, 2,35,35, 'Một thẻ cho 1 người, không share với người khác.',        'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner15@vouchersystem.com','LAN Party 10 Người',         'Sự kiện LAN party cho nhóm 10 người, 5 giờ gaming cùng nhau',       'Giải trí', 1500000, 890000, 10, 3,30,60, 'Đặt trước để đảm bảo đủ máy. Kèm đồ ăn nhẹ và nước.',  'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner15@vouchersystem.com','D&D Campaign Session',        'Buổi chơi nhập vai D&D có DM chuyên nghiệp, 4 giờ phiêu lưu',      'Giải trí',  600000, 380000, 20, 1,30,60, 'Không cần kinh nghiệm trước. DM sẽ hướng dẫn.',          'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','REJECTED'),
  -- ── Bamboo Spa (partner16) ── Làm đẹp / Sức khỏe
  ('partner16@vouchersystem.com','Bamboo Massage 90 Phút',     'Massage trúc tre 90 phút, kỹ thuật độc đáo giảm căng cơ hiệu quả',  'Làm đẹp',  750000, 430000, 40, 2,35,80, 'Không áp dụng cho thai kỳ và người bệnh ngoài da.',       'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner16@vouchersystem.com','Detox Herbal Bath',          'Tắm ngâm thảo dược detox với 12 loại thảo mộc quý hiếm',            'Sức khỏe',  650000, 380000, 35, 1,30,70, 'Ngâm 30 phút, không ăn no trước khi ngâm.',               'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner16@vouchersystem.com','Anti-Stress Body Treatment', 'Liệu pháp chống stress toàn thân 90 phút với tinh dầu trị liệu',    'Sức khỏe',  950000, 560000, 30, 2,35,80, 'Khuyến nghị 1 liệu trình/tháng để đạt hiệu quả tốt nhất.','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner16@vouchersystem.com','Glow Facial 75 Phút',        'Chăm sóc da mặt 75 phút giúp da sáng khỏe và căng mịn',            'Làm đẹp',  700000, 400000, 45, 1,35,80, 'Tránh trang điểm 2h sau liệu pháp.',                      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner16@vouchersystem.com','Full Day Spa Package',        'Spa trọn ngày 6 tiếng: thảo dược, massage, facial, nail và ăn nhẹ', 'Làm đẹp', 3500000,1990000, 10, 1,45,90, 'Tối đa 1 khách/ca. Đặt trước ít nhất 5 ngày.',            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner16@vouchersystem.com','Hot Spring Soak + Sauna',    'Ngâm suối khoáng nóng 45 phút + xông phòng sauna khô 30 phút',      'Sức khỏe',  580000, 320000, 50, 2,30,70, 'Không dành cho người huyết áp cao hoặc tim mạch.',        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  -- ── Golden Buffet (partner17) ── Ẩm thực
  ('partner17@vouchersystem.com','Buffet Hải Sản Weekend',     'Buffet hải sản cuối tuần không giới hạn 2 tiếng, 50+ món',          'Ẩm thực',  850000, 550000, 60, 2,35,70, 'Giờ phục vụ 11h-13h và 17h30-21h.',                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner17@vouchersystem.com','Buffet BBQ Thứ 7',           'Buffet nướng BBQ thứ 7 không giới hạn thịt nướng + rau + nước',     'Ẩm thực',  650000, 420000, 70, 2,35,70, 'Phục vụ từ 17h - 22h mỗi thứ 7.',                          'https://images.unsplash.com/photo-1542444459-db37a1f5d3b4?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner17@vouchersystem.com','Buffet Lẩu Không Giới Hạn', 'Lẩu thái / lẩu mắm không giới hạn 90 phút với hải sản tươi ngon', 'Ẩm thực',  499000, 299000, 80, 1,30,60, 'Tối đa 90 phút/bàn. Không gói thức ăn thừa.',             'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner17@vouchersystem.com','Business Lunch Buffet',      'Buffet trưa thương nhân đủ chất: 30+ món, nước uống, tráng miệng',  'Ẩm thực',  250000, 159000,100, 1,25,50, 'Phục vụ 11h - 14h từ thứ 2 đến thứ 6.',                  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner17@vouchersystem.com','Kids Eat Free + Adult Buffet','1 suất buffet người lớn kèm 1 trẻ em dưới 10 tuổi ăn miễn phí',   'Ẩm thực',  700000, 430000, 50, 1,30,60, 'Áp dụng 1 trẻ/1 người lớn. Trẻ em dưới 10 tuổi.',       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner17@vouchersystem.com','Tết Special Buffet',         'Buffet đặc biệt Tết với 60+ món truyền thống 3 miền Việt Nam',      'Ẩm thực', 1200000, 790000,  0,30, 0, 5, 'Đã hết hàng mùa Tết này. Hẹn gặp năm sau!',              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80','REJECTED'),
  -- ── Fun Zone (partner18) ── Giải trí
  ('partner18@vouchersystem.com','Bowling 3 Ván + Giày',       '3 ván bowling kèm giày cho 1 người, không giới hạn thời gian/ván',  'Giải trí',  250000, 149000, 80, 1,30,60, 'Giày bowling có sẵn size 36-46.',                          'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner18@vouchersystem.com','Billiards 3 Giờ',            '3 giờ chơi billiards tại bàn chuẩn quốc tế cho 2-4 người',          'Giải trí',  180000,  99000, 60, 1,25,50, 'Bàn 9 bi và 8 bi đều có sẵn.',                             'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner18@vouchersystem.com','Karaoke Phòng Nhỏ 3 Giờ',   'Phòng karaoke nhỏ (2-4 người) 3 giờ với màn hình 65 inch',          'Giải trí',  360000, 199000, 50, 1,30,60, 'Giá chưa bao gồm đồ uống. Đặt trước vào cuối tuần.',      'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner18@vouchersystem.com','Karaoke Phòng VIP 3 Giờ',   'Phòng karaoke VIP (6-10 người) 3 giờ với mini bar và sofa da',      'Giải trí',  600000, 350000, 30, 2,30,60, 'Đặt trước 1 ngày vào cuối tuần.',                          'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner18@vouchersystem.com','Fun Family Package',         'Gói gia đình: bowling 2 ván + karaoke 2h phòng nhỏ + nước uống',   'Giải trí',  800000, 480000, 30, 2,35,70, 'Phù hợp gia đình 4-6 người.',                              'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner18@vouchersystem.com','Arcade Game 2 Giờ',          '2 giờ chơi game arcade với thẻ nạp 100 lượt token trò chơi',        'Giải trí',  250000, 149000, 70, 1,30,60, 'Token không dùng hết trong ngày có thể dùng lần sau.',    'https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Fashion Hub (partner19) ── Mua sắm
  ('partner19@vouchersystem.com','Voucher Thời Trang 500k',    'Voucher 500k mua sắm thời trang tại Fashion Hub, áp dụng toàn bộ', 'Mua sắm',  500000, 349000, 60, 2,35,70, 'Không áp dụng cùng chương trình giảm giá khác.',          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner19@vouchersystem.com','Voucher Túi Xách 1000k',     'Voucher 1 triệu cho khu túi xách thời trang nữ và nam cao cấp',    'Mua sắm', 1000000, 699000, 40, 1,35,70, 'Áp dụng cho túi xách có giá niêm yết từ 2 triệu.',       'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner19@vouchersystem.com','Voucher Giày Sneaker',        'Voucher mua giày sneaker limited edition trị giá 800k',             'Mua sắm',  800000, 549000, 30, 2,30,60, 'Áp dụng các dòng sneaker chính hãng. Xem thêm điều kiện.','https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner19@vouchersystem.com','Outfit Styling Package',      'Tư vấn phong cách + mua sắm 1 bộ outfit hoàn chỉnh với stylist',   'Mua sắm', 2500000,1590000, 10, 3,35,70, 'Phiên stylist 2 giờ kèm mua sắm. Đặt lịch trước.',       'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner19@vouchersystem.com','Voucher Phụ Kiện 300k',       'Voucher 300k khu phụ kiện: thắt lưng, ví, kính mắt thời trang',   'Mua sắm',  300000, 199000, 70, 1,30,60, 'Áp dụng hóa đơn từ 600k trở lên.',                        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','PENDING_APPROVAL'),
  ('partner19@vouchersystem.com','Flash Sale Fashion Week',     'Voucher flash sale tuần lễ thời trang: giảm thêm 30% mọi đơn',     'Mua sắm', 1500000, 890000, 20, 1,14,30, 'Chỉ áp dụng trong 2 tuần flash sale. Số lượng có hạn.',  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  -- ── Nature Trek (partner20) ── Du lịch
  ('partner20@vouchersystem.com','Trekking Núi 1 Ngày',         'Trekking leo núi 1 ngày với HLV và trang thiết bị an toàn đầy đủ', 'Du lịch',   650000, 390000, 50, 2,35,70, 'Mặc quần áo thoải mái, mang giày leo núi.',               'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner20@vouchersystem.com','Cắm Trại Hoang Dã 2N1Đ',     'Cắm trại khám phá rừng núi 2 ngày 1 đêm với trải nghiệm wilderness','Du lịch',  1500000, 890000, 30, 2,35,70, 'Bao gồm lều, túi ngủ, đèn pin và bữa ăn cắm trại.',      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner20@vouchersystem.com','Chèo Kayak 3 Giờ',            '3 giờ chèo thuyền kayak trên sông, phù hợp cho người mới bắt đầu', 'Du lịch',   450000, 259000, 40, 1,30,60, 'Cung cấp áo phao và mái chèo. Biết bơi là lợi thế.',     'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner20@vouchersystem.com','Tour Rừng Tràm Trà Sư',       'Khám phá rừng tràm Trà Sư bằng thuyền, ngắm chim và sen nở',       'Du lịch',   800000, 480000, 45, 2,35,70, 'Mùa đẹp nhất tháng 9-11. Mặc áo chống muỗi.',            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner20@vouchersystem.com','Zipline + Vượt Thác',          'Trải nghiệm zipline 200m + vượt thác trong rừng nhiệt đới',         'Du lịch',   950000, 570000, 35, 2,35,70, 'Cân nặng tối đa 100kg. Cần sức khỏe tốt.',               'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80','APPROVED'),
  ('partner20@vouchersystem.com','Leo Núi Langbiang 2N1Đ',      'Chinh phục đỉnh Langbiang 2167m, 2 ngày 1 đêm cắm trại đỉnh núi',  'Du lịch',  2200000,1390000, 15, 3,40,80, 'Cần có sức khỏe tốt. Đi cùng hướng dẫn viên địa phương.','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80','APPROVED')
) AS v(pemail, vname, vdesc, vcat, vorig, vsale, vstk, d_ago, d_end, d_val, vterms, vimg, vstatus)
JOIN pids ON pids.email = v.pemail;

-- ─── 9. Voucher-Branch Mapping (tự động gán voucher → chi nhánh) ─
-- Gán tất cả voucher của đối tác vào tất cả chi nhánh đang hoạt động
INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT v.id, pb.id
FROM vouchers v
JOIN partner_branches pb ON pb.partner_id = v.partner_id AND pb.is_active = TRUE
ON CONFLICT DO NOTHING;

-- ─── 10. Orders (40 đơn hàng: 25 PAID, 8 PENDING, 5 CANCELLED, 2 REFUNDED) ──

-- ── 25 đơn PAID ──────────────────────────────────────────────────
INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,490000,'PAID'::order_status,'PAY-2026-0001','MOMO','Lê Minh Anh','0901000001','customer1@vouchersystem.com',NOW()-INTERVAL '10 days'
FROM users u WHERE u.email='customer1@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0001');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,349000,'PAID'::order_status,'PAY-2026-0002','VNPay','Trần Gia Huy','0901000002','customer2@vouchersystem.com',NOW()-INTERVAL '9 days'
FROM users u WHERE u.email='customer2@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0002');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,149000,'PAID'::order_status,'PAY-2026-0003','ZaloPay','Nguyễn Thanh Hà','0901000003','customer3@vouchersystem.com',NOW()-INTERVAL '8 days'
FROM users u WHERE u.email='customer3@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0003');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,299000,'PAID'::order_status,'PAY-2026-0004','MOMO','Nguyễn Tuấn Kiệt','0901000004','customer4@vouchersystem.com',NOW()-INTERVAL '7 days'
FROM users u WHERE u.email='customer4@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0004');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,249000,'PAID'::order_status,'PAY-2026-0005','BankTransfer','Võ Phương Linh','0901000005','customer5@vouchersystem.com',NOW()-INTERVAL '7 days'
FROM users u WHERE u.email='customer5@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0005');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,620000,'PAID'::order_status,'PAY-2026-0006','VNPay','Lê Quốc Bảo','0901000006','customer6@vouchersystem.com',NOW()-INTERVAL '6 days'
FROM users u WHERE u.email='customer6@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0006');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,329000,'PAID'::order_status,'PAY-2026-0007','MOMO','Đặng Thảo My','0901000007','customer7@vouchersystem.com',NOW()-INTERVAL '6 days'
FROM users u WHERE u.email='customer7@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0007');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,450000,'PAID'::order_status,'PAY-2026-0008','ZaloPay','Phạm Nhật Nam','0901000008','customer8@vouchersystem.com',NOW()-INTERVAL '5 days'
FROM users u WHERE u.email='customer8@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0008');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,590000,'PAID'::order_status,'PAY-2026-0009','BankTransfer','Bùi Khánh Vy','0901000009','customer9@vouchersystem.com',NOW()-INTERVAL '5 days'
FROM users u WHERE u.email='customer9@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0009');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,89000,'PAID'::order_status,'PAY-2026-0010','MOMO','Trương Gia Bảo','0901000010','customer10@vouchersystem.com',NOW()-INTERVAL '4 days'
FROM users u WHERE u.email='customer10@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0010');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,349000,'PAID'::order_status,'PAY-2026-0011','VNPay','Hồ Minh Trang','0901000011','customer11@vouchersystem.com',NOW()-INTERVAL '4 days'
FROM users u WHERE u.email='customer11@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0011');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,99000,'PAID'::order_status,'PAY-2026-0012','MOMO','Dương Anh Khoa','0901000012','customer12@vouchersystem.com',NOW()-INTERVAL '3 days'
FROM users u WHERE u.email='customer12@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0012');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,59000,'PAID'::order_status,'PAY-2026-0013','ZaloPay','Lâm Ngọc Hân','0901000013','customer13@vouchersystem.com',NOW()-INTERVAL '3 days'
FROM users u WHERE u.email='customer13@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0013');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,1490000,'PAID'::order_status,'PAY-2026-0014','BankTransfer','Đỗ Thành Long','0901000014','customer14@vouchersystem.com',NOW()-INTERVAL '2 days'
FROM users u WHERE u.email='customer14@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0014');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,1590000,'PAID'::order_status,'PAY-2026-0015','VNPay','Phan Thanh Tâm','0901000015','customer15@vouchersystem.com',NOW()-INTERVAL '2 days'
FROM users u WHERE u.email='customer15@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0015');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,159000,'PAID'::order_status,'PAY-2026-0016','MOMO','Ngô Thị Hoa','0901000016','customer16@vouchersystem.com',NOW()-INTERVAL '1 day'
FROM users u WHERE u.email='customer16@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0016');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,430000,'PAID'::order_status,'PAY-2026-0017','ZaloPay','Vũ Đức Anh','0901000017','customer17@vouchersystem.com',NOW()-INTERVAL '1 day'
FROM users u WHERE u.email='customer17@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0017');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,550000,'PAID'::order_status,'PAY-2026-0018','VNPay','Mai Thị Lan','0901000018','customer18@vouchersystem.com',NOW()-INTERVAL '1 day'
FROM users u WHERE u.email='customer18@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0018');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,149000,'PAID'::order_status,'PAY-2026-0019','MOMO','Đinh Văn Hùng','0901000019','customer19@vouchersystem.com',NOW()-INTERVAL '12 hours'
FROM users u WHERE u.email='customer19@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0019');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,349000,'PAID'::order_status,'PAY-2026-0020','BankTransfer','Trịnh Thị Hương','0901000020','customer20@vouchersystem.com',NOW()-INTERVAL '6 hours'
FROM users u WHERE u.email='customer20@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0020');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,390000,'PAID'::order_status,'PAY-2026-0021','VNPay','Lê Minh Anh','0901000001','customer1@vouchersystem.com',NOW()-INTERVAL '5 hours'
FROM users u WHERE u.email='customer1@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0021');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,499000,'PAID'::order_status,'PAY-2026-0022','MOMO','Trần Gia Huy','0901000002','customer2@vouchersystem.com',NOW()-INTERVAL '4 hours'
FROM users u WHERE u.email='customer2@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0022');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,2290000,'PAID'::order_status,'PAY-2026-0023','BankTransfer','Nguyễn Thanh Hà','0901000003','customer3@vouchersystem.com',NOW()-INTERVAL '3 hours'
FROM users u WHERE u.email='customer3@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0023');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,680000,'PAID'::order_status,'PAY-2026-0024','ZaloPay','Nguyễn Tuấn Kiệt','0901000004','customer4@vouchersystem.com',NOW()-INTERVAL '2 hours'
FROM users u WHERE u.email='customer4@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0024');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,1490000,'PAID'::order_status,'PAY-2026-0025','VNPay','Võ Phương Linh','0901000005','customer5@vouchersystem.com',NOW()-INTERVAL '1 hour'
FROM users u WHERE u.email='customer5@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0025');

-- ── 8 đơn PENDING ────────────────────────────────────────────────
INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,110000,'PENDING'::order_status,'PAY-2026-0026','MOMO','Lê Quốc Bảo','0901000006','customer6@vouchersystem.com'
FROM users u WHERE u.email='customer6@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0026');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,650000,'PENDING'::order_status,'PAY-2026-0027','VNPay','Đặng Thảo My','0901000007','customer7@vouchersystem.com'
FROM users u WHERE u.email='customer7@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0027');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,350000,'PENDING'::order_status,'PAY-2026-0028','ZaloPay','Phạm Nhật Nam','0901000008','customer8@vouchersystem.com'
FROM users u WHERE u.email='customer8@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0028');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,350000,'PENDING'::order_status,'PAY-2026-0029','MOMO','Bùi Khánh Vy','0901000009','customer9@vouchersystem.com'
FROM users u WHERE u.email='customer9@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0029');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,699000,'PENDING'::order_status,'PAY-2026-0030','BankTransfer','Trương Gia Bảo','0901000010','customer10@vouchersystem.com'
FROM users u WHERE u.email='customer10@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0030');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,890000,'PENDING'::order_status,'PAY-2026-0031','VNPay','Hồ Minh Trang','0901000011','customer11@vouchersystem.com'
FROM users u WHERE u.email='customer11@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0031');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,299000,'PENDING'::order_status,'PAY-2026-0032','MOMO','Dương Anh Khoa','0901000012','customer12@vouchersystem.com'
FROM users u WHERE u.email='customer12@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0032');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,120000,'PENDING'::order_status,'PAY-2026-0033','ZaloPay','Lâm Ngọc Hân','0901000013','customer13@vouchersystem.com'
FROM users u WHERE u.email='customer13@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0033');

-- ── 5 đơn CANCELLED ──────────────────────────────────────────────
INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,349000,'CANCELLED'::order_status,'PAY-2026-0034','VNPay','Đỗ Thành Long','0901000014','customer14@vouchersystem.com'
FROM users u WHERE u.email='customer14@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0034');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,4990000,'CANCELLED'::order_status,'PAY-2026-0035','BankTransfer','Phan Thanh Tâm','0901000015','customer15@vouchersystem.com'
FROM users u WHERE u.email='customer15@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0035');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,490000,'CANCELLED'::order_status,'PAY-2026-0036','MOMO','Ngô Thị Hoa','0901000016','customer16@vouchersystem.com'
FROM users u WHERE u.email='customer16@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0036');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,890000,'CANCELLED'::order_status,'PAY-2026-0037','ZaloPay','Vũ Đức Anh','0901000017','customer17@vouchersystem.com'
FROM users u WHERE u.email='customer17@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0037');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email)
SELECT u.id,420000,'CANCELLED'::order_status,'PAY-2026-0038','VNPay','Mai Thị Lan','0901000018','customer18@vouchersystem.com'
FROM users u WHERE u.email='customer18@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0038');

-- ── 2 đơn REFUNDED ───────────────────────────────────────────────
INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,149000,'REFUNDED'::order_status,'PAY-2026-0039','MOMO','Đinh Văn Hùng','0901000019','customer19@vouchersystem.com',NOW()-INTERVAL '15 days'
FROM users u WHERE u.email='customer19@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0039');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at)
SELECT u.id,490000,'REFUNDED'::order_status,'PAY-2026-0040','VNPay','Trịnh Thị Hương','0901000020','customer20@vouchersystem.com',NOW()-INTERVAL '14 days'
FROM users u WHERE u.email='customer20@vouchersystem.com' AND NOT EXISTS(SELECT 1 FROM orders WHERE payment_ref='PAY-2026-0040');

-- ─── 11. Order Items ──────────────────────────────────────────────
-- Gán voucher cho từng đơn hàng (join theo payment_ref và tên voucher)

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Body Massage 90 Phút'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner2@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0001' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Facial Refresh 60 Phút'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner2@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0002' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Combo Breakfast Deluxe'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner3@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0003' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Americano Pass 10 Ly'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner3@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0004' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Gói Nail Art Premium'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner4@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0005' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Thai Massage 120 Phút'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner5@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0006' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='BBQ Nướng 2 Người'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner6@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0007' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Gói Gym 1 Tháng'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner7@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0008' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Tour Vũng Tàu 1 Ngày'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner8@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0009' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Vé Phim 2D'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner9@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0010' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Voucher Mua Sắm 500k'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner10@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0011' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Bún Bò Nam Bộ Combo'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner11@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0012' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Tô Phở Đặc Biệt + Nước'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner12@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0013' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Thẻ Gym 3 Tháng'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner13@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0014' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Staycation 1 Đêm Phòng Deluxe'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner14@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0015' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Board Game 3 Giờ + Nước'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner15@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0016' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Bamboo Massage 90 Phút'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner16@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0017' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Buffet Hải Sản Weekend'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner17@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0018' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Bowling 3 Ván + Giày'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner18@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0019' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Voucher Thời Trang 500k'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner19@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0020' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Trekking Núi 1 Ngày'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner20@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0021' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Lẩu Thái Cho Nhóm 4'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner6@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0022' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Tour Đà Lạt 3N2Đ'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner8@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0023' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Yoga 10 Buổi'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner7@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0024' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='VIP Spa Day Package'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner5@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0025' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

-- Order items cho đơn PENDING
INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Combo Phở 2 Tô'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner12@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0026' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Làm Tóc Highlight'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner4@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0027' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Pool Day Pass'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner14@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0028' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Karaoke Phòng VIP 3 Giờ'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner18@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0029' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Voucher Túi Xách 1000k'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner19@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0030' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Cắm Trại Hoang Dã 2N1Đ'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner20@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0031' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Buffet Lẩu Không Giới Hạn'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner17@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0032' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='PC Gaming 4 Giờ'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner15@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0033' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

-- Order items cho đơn CANCELLED
INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Waxing Full Body'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner4@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0034' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Tour Phú Quốc 4N3Đ'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner8@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0035' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Monthly Gaming Pass'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner15@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0036' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Lớp Yoga Nữ 15 Buổi'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner13@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0037' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Buffet BBQ Thứ 7'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner17@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0038' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

-- Order items cho đơn REFUNDED
INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Voucher Siêu Thị 200k'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner10@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0039' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price FROM orders o JOIN vouchers v ON v.name='Body Massage 90 Phút'
  JOIN partners p ON p.id=v.partner_id JOIN users u ON u.id=p.user_id AND u.email='partner2@vouchersystem.com'
WHERE o.payment_ref='PAY-2026-0040' AND NOT EXISTS(SELECT 1 FROM order_items oi WHERE oi.order_id=o.id);

-- ─── 12. Issued Vouchers (27 mã: 25 PAID + 2 REFUNDED=CANCELLED) ─
-- Chỉ sinh mã sau khi thanh toán thành công (Business Rule RB-05)

-- Nhóm USED (12 mã - khách đã sử dụng)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0001', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '5 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '60 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0001' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0003', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '4 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '45 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0003' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0005', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '3 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '55 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0005' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0007', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '3 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '50 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0007' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0009', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '2 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '60 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0009' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0011', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '2 days',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '45 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0011' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0013', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '1 day',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '40 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0013' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0015', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '1 day',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '60 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0015' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0016', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '12 hours',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '45 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0016' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0018', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '6 hours',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '55 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0018' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0020', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '3 hours',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '50 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0020' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-0022', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'USED'::issued_voucher_status,
  NOW()-INTERVAL '2 hours',
  (SELECT pb.id FROM partner_branches pb WHERE pb.partner_id=v.partner_id ORDER BY pb.created_at LIMIT 1),
  NOW()+INTERVAL '45 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0022' ON CONFLICT (code) DO NOTHING;

-- Nhóm UNUSED (13 mã - chưa sử dụng)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0002', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '80 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0002' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0004', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '25 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0004' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0006', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '70 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0006' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0008', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '30 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0008' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0010', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '40 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0010' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0012', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '45 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0012' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0014', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '85 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0014' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0017', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '75 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0017' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0019', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '55 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0019' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0021', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '65 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0021' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0023', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '85 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0023' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0024', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '55 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0024' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0025', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW()+INTERVAL '85 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0025' ON CONFLICT (code) DO NOTHING;

-- 2 mã CANCELLED (đơn REFUNDED)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0026', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'CANCELLED'::issued_voucher_status, NOW()+INTERVAL '30 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0039' ON CONFLICT (code) DO NOTHING;

INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-0027', oi.id, oi.voucher_id, o.customer_id, v.partner_id, 'CANCELLED'::issued_voucher_status, NOW()+INTERVAL '60 days'
FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN vouchers v ON v.id=oi.voucher_id
WHERE o.payment_ref='PAY-2026-0040' ON CONFLICT (code) DO NOTHING;

-- ─── 13. Reviews (12 đánh giá cho voucher đã USED) ───────────────
INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'Dịch vụ massage tuyệt vời! Nhân viên chuyên nghiệp, không gian sạch sẽ và thư giãn. Sẽ quay lại lần sau.',
  'Cảm ơn bạn đã tin tưởng Green Spa! Chúng tôi rất vui khi bạn hài lòng với dịch vụ.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0001' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 4,
  'Bữa sáng ngon, phục vụ nhanh. Cà phê thơm và bánh mì giòn. Giá hợp lý so với chất lượng nhận được.',
  'Cảm ơn bạn! Chúng tôi sẽ cố gắng cải thiện để mang đến trải nghiệm 5 sao lần tới.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0003' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 4,
  'Nail art đẹp, làm nhanh và tỉ mỉ. Phòng sạch, nhân viên thân thiện. Sơn gel bền màu hơn mình nghĩ.',
  'Rất vui khi bạn hài lòng! Hẹn gặp lại bạn tại Lotus Beauty lần sau nhé.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0005' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'BBQ ngon xuất sắc! Thịt tươi, không gian nhà hàng đẹp. Nhân viên nhiệt tình hỗ trợ nướng thịt tận bàn.',
  'Cảm ơn bạn rất nhiều! Chúng tôi tự hào về chất lượng nguyên liệu tươi sống hàng ngày.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0007' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'Tour Vũng Tàu cực vui! Xe đưa đón đúng giờ, hướng dẫn viên nhiệt tình và hài hước. Hải sản tươi ngon.',
  'Cảm ơn bạn đã tham gia tour cùng Cozy Travel! Hẹn gặp bạn ở những chuyến đi tiếp theo.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0009' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 3,
  'Voucher dùng được nhưng thủ tục hơi phức tạp. Nhân viên phải kiểm tra lâu. Sản phẩm đa dạng.',
  'Chúng tôi xin lỗi vì trải nghiệm chưa tốt. Đang cải thiện quy trình kiểm tra voucher nhanh hơn.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0011' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 4,
  'Phở ngon, nước dùng đậm đà thơm ngọt. Tô lớn ăn no. Quán sạch sẽ, phục vụ nhanh vào buổi sáng.',
  'Cảm ơn bạn đã ủng hộ Dragon Pho! Nồi nước dùng hầm mỗi ngày 8 tiếng là bí quyết của chúng tôi.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0013' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'Phòng Deluxe view sông rất đẹp! Bữa sáng ngon và đa dạng. Staff thân thiện, check-in nhanh chóng.',
  'Chúng tôi rất vui khi bạn có kỳ nghỉ tuyệt vời tại Paradise Resort. Hẹn gặp bạn lần sau!'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0015' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 4,
  'Board game đa dạng, trên 200 loại đủ chủ đề. Không gian thoải mái, nước uống ngon. Thích hợp hẹn bạn bè.',
  'Cảm ơn bạn! Tech Cafe luôn cập nhật thêm board game mới mỗi tháng. Chờ bạn quay lại nhé!'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0016' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'Buffet hải sản ngon tuyệt! Tôm hùm, cua, sò điệp tươi sống. Giá voucher rất hời so với chất lượng.',
  'Cảm ơn bạn đã thưởng thức bữa buffet hải sản! Hải sản được nhập mới mỗi ngày từ biển về.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0018' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 3,
  'Voucher dùng ok nhưng mẫu mã không như mô tả. Nhân viên tư vấn nhiệt tình. Chất lượng vải trung bình.',
  'Cảm ơn phản hồi của bạn! Chúng tôi sẽ cập nhật hình ảnh thực tế hơn cho sản phẩm.'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0020' ON CONFLICT (issued_voucher_id) DO NOTHING;

INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 4,
  'Lẩu Thái cay vừa, nước dùng ngon và đậm đà. Hải sản tươi. Phục vụ hơi chậm vào cuối tuần.',
  'Cảm ơn bạn! Cuối tuần quán đông nên phục vụ chậm hơn. Hẹn bạn quay lại vào ngày thường nhé!'
FROM issued_vouchers iv WHERE iv.code='VCH-2026-0022' ON CONFLICT (issued_voucher_id) DO NOTHING;

-- ─── 14. System Logs (15 bản ghi nhật ký hệ thống) ───────────────
INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT id, 'LOGIN', 'users', id, '{"method":"email","role":"ADMIN"}'::jsonb, '192.168.1.100'
FROM users WHERE email='admin@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'APPROVE_PARTNER', 'partners', p.id, '{"action":"approve","business":"Green Spa"}'::jsonb, '192.168.1.100'
FROM users u JOIN partners p ON p.user_id=(SELECT id FROM users WHERE email='partner2@vouchersystem.com')
WHERE u.email='admin@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'APPROVE_PARTNER', 'partners', p.id, '{"action":"approve","business":"Sunrise Eats"}'::jsonb, '192.168.1.100'
FROM users u JOIN partners p ON p.user_id=(SELECT id FROM users WHERE email='partner3@vouchersystem.com')
WHERE u.email='admin@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'APPROVE_VOUCHER', 'vouchers', v.id, '{"action":"approve","voucher":"Body Massage 90 Phút"}'::jsonb, '192.168.1.100'
FROM users u CROSS JOIN vouchers v
WHERE u.email='admin@vouchersystem.com' AND v.name='Body Massage 90 Phút' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'APPROVE_VOUCHER', 'vouchers', v.id, '{"action":"approve","voucher":"Tour Vũng Tàu 1 Ngày"}'::jsonb, '192.168.1.100'
FROM users u CROSS JOIN vouchers v
WHERE u.email='admin@vouchersystem.com' AND v.name='Tour Vũng Tàu 1 Ngày' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT id, 'LOGIN', 'users', id, '{"method":"email","role":"PARTNER"}'::jsonb, '10.0.0.50'
FROM users WHERE email='partner2@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'CREATE_VOUCHER', 'vouchers', v.id, '{"name":"Body Massage 90 Phút","category":"Làm đẹp","price":490000}'::jsonb, '10.0.0.50'
FROM users u CROSS JOIN vouchers v
WHERE u.email='partner2@vouchersystem.com' AND v.name='Body Massage 90 Phút' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT id, 'LOGIN', 'users', id, '{"method":"email","role":"CUSTOMER"}'::jsonb, '203.0.113.10'
FROM users WHERE email='customer1@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'PLACE_ORDER', 'orders', o.id, '{"payment_ref":"PAY-2026-0001","amount":490000,"method":"MOMO"}'::jsonb, '203.0.113.10'
FROM users u JOIN orders o ON o.customer_id=u.id
WHERE u.email='customer1@vouchersystem.com' AND o.payment_ref='PAY-2026-0001' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'PAY_ORDER', 'orders', o.id, '{"payment_ref":"PAY-2026-0001","status":"PAID","code_issued":"VCH-2026-0001"}'::jsonb, '203.0.113.10'
FROM users u JOIN orders o ON o.customer_id=u.id
WHERE u.email='customer1@vouchersystem.com' AND o.payment_ref='PAY-2026-0001' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'SCAN_VOUCHER', 'issued_vouchers', iv.id, '{"code":"VCH-2026-0001","result":"VALID","action":"mark_used"}'::jsonb, '10.0.0.50'
FROM users u JOIN issued_vouchers iv ON iv.code='VCH-2026-0001'
WHERE u.email='partner2@vouchersystem.com' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'REGISTER_PARTNER', 'partners', p.id, '{"business_name":"Green Spa","license":"BL-002"}'::jsonb, '10.0.0.50'
FROM users u JOIN partners p ON p.user_id=u.id
WHERE u.email='partner2@vouchersystem.com';

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'SUSPEND_PARTNER', 'partners', p.id, '{"action":"suspend","reason":"Vi phạm điều khoản dịch vụ"}'::jsonb, '192.168.1.100'
FROM users u CROSS JOIN partners p
WHERE u.email='admin@vouchersystem.com'
  AND p.user_id=(SELECT id FROM users WHERE email='partner-suspended@vouchersystem.com') LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'REJECT_VOUCHER', 'vouchers', v.id, '{"reason":"Không đủ điều kiện phát hành","voucher":"D&D Campaign Session"}'::jsonb, '192.168.1.100'
FROM users u CROSS JOIN vouchers v
WHERE u.email='admin@vouchersystem.com' AND v.name='D&D Campaign Session' LIMIT 1;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'REFUND_ORDER', 'orders', o.id, '{"payment_ref":"PAY-2026-0039","amount":149000,"reason":"Khách yêu cầu hoàn tiền"}'::jsonb, '192.168.1.100'
FROM users u JOIN orders o ON o.payment_ref='PAY-2026-0039'
WHERE u.email='admin@vouchersystem.com' LIMIT 1;

-- Complaints demo data
INSERT INTO complaints (customer_id, voucher_id, issued_voucher_id, order_id, subject, message, status, admin_response, resolved_by, resolved_at)
SELECT iv.customer_id, iv.voucher_id, iv.id, oi.order_id,
  'Nhân viên kiểm tra mã hơi chậm',
  'Khách hàng đã xuất trình mã voucher nhưng chi nhánh cần nhiều thời gian để xác thực.',
  'IN_PROGRESS'::complaint_status,
  'Bộ phận hỗ trợ đã liên hệ đối tác để cải thiện quy trình scan voucher.',
  (SELECT id FROM users WHERE email='admin@vouchersystem.com'),
  NULL
FROM issued_vouchers iv
JOIN order_items oi ON oi.id = iv.order_item_id
WHERE iv.code='VCH-2026-0011'
ON CONFLICT DO NOTHING;

INSERT INTO complaints (customer_id, voucher_id, issued_voucher_id, order_id, subject, message, status, admin_response, resolved_by, resolved_at)
SELECT iv.customer_id, iv.voucher_id, iv.id, oi.order_id,
  'Cần hỗ trợ hoàn tiền voucher',
  'Khách hàng muốn hoàn tiền vì chưa sử dụng voucher và lịch hẹn bị hủy.',
  'RESOLVED'::complaint_status,
  'Yêu cầu đã được xử lý theo chính sách hoàn tiền demo.',
  (SELECT id FROM users WHERE email='admin@vouchersystem.com'),
  NOW() - INTERVAL '1 day'
FROM issued_vouchers iv
JOIN order_items oi ON oi.id = iv.order_item_id
WHERE iv.code='VCH-2026-0026'
ON CONFLICT DO NOTHING;

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT u.id, 'UPDATE_COMPLAINT_STATUS', 'complaint', c.id,
  jsonb_build_object('status', c.status, 'subject', c.subject),
  '192.168.1.100'
FROM users u CROSS JOIN complaints c
WHERE u.email='admin@vouchersystem.com'
LIMIT 2;

-- ================================================================
-- Admin demo supplemental data
-- Exact demo accounts and business states for final presentation.
-- Password hashes:
--   Admin@123, Customer@123, Partner@123
-- ================================================================

INSERT INTO categories (name, is_active) VALUES
  ('Giao duc', TRUE)
ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active, updated_at = NOW();

INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
  ('admin@voucherhub.vn', '$2a$12$OrLz6NO65poO9GzkFTppOehndshBOY5lEEZsbRlMlV0qt27pLNikO', 'VoucherHub Admin', '0988000000', 'ADMIN', TRUE),
  ('customer1@example.com', '$2a$12$2ejxZiPp3PnMx99/Hd7kLumwp0JSFy70N7PU5qP8xEU3bNvjFnoFa', 'Nguyen Minh Customer 1', '0988000001', 'CUSTOMER', TRUE),
  ('customer2@example.com', '$2a$12$2ejxZiPp3PnMx99/Hd7kLumwp0JSFy70N7PU5qP8xEU3bNvjFnoFa', 'Tran Anh Customer 2', '0988000002', 'CUSTOMER', TRUE),
  ('customer3@example.com', '$2a$12$2ejxZiPp3PnMx99/Hd7kLumwp0JSFy70N7PU5qP8xEU3bNvjFnoFa', 'Le Bao Customer 3', '0988000003', 'CUSTOMER', TRUE),
  ('customer4@example.com', '$2a$12$2ejxZiPp3PnMx99/Hd7kLumwp0JSFy70N7PU5qP8xEU3bNvjFnoFa', 'Pham Khoa Customer 4', '0988000004', 'CUSTOMER', FALSE),
  ('customer5@example.com', '$2a$12$2ejxZiPp3PnMx99/Hd7kLumwp0JSFy70N7PU5qP8xEU3bNvjFnoFa', 'Vo Linh Customer 5', '0988000005', 'CUSTOMER', TRUE),
  ('partner.food@example.com', '$2a$12$VYRZ3U3LOgYujcV1vKQ.MOWV4pd1ZPi/kkiE5wnB6YfokPQSDRPmO', 'Highlands Demo Manager', '0988010001', 'PARTNER', TRUE),
  ('partner.beauty@example.com', '$2a$12$VYRZ3U3LOgYujcV1vKQ.MOWV4pd1ZPi/kkiE5wnB6YfokPQSDRPmO', 'Saigon Beauty Manager', '0988010002', 'PARTNER', TRUE),
  ('partner.travel@example.com', '$2a$12$VYRZ3U3LOgYujcV1vKQ.MOWV4pd1ZPi/kkiE5wnB6YfokPQSDRPmO', 'Saigon Travel Manager', '0988010003', 'PARTNER', TRUE),
  ('partner.suspended@example.com', '$2a$12$VYRZ3U3LOgYujcV1vKQ.MOWV4pd1ZPi/kkiE5wnB6YfokPQSDRPmO', 'Paused Retail Manager', '0988010004', 'PARTNER', TRUE)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO partners (user_id, business_name, business_license, representative, address, status, rejection_reason)
SELECT u.id, p.business_name, p.business_license, p.representative, p.address, p.status::partner_status, p.rejection_reason
FROM (VALUES
  ('partner.food@example.com', 'Highlands Coffee Demo', 'TAX-HIGHLANDS-DEMO', 'Nguyen Hoang Nam', 'Quan 1, TP.HCM', 'APPROVED', NULL),
  ('partner.beauty@example.com', 'Saigon Beauty Spa', 'TAX-BEAUTY-DEMO', 'Tran My Duyen', 'Quan 7, TP.HCM', 'APPROVED', NULL),
  ('partner.travel@example.com', 'Saigon Local Travel', 'TAX-TRAVEL-DEMO', 'Le Quoc Khanh', 'Tan Binh, TP.HCM', 'PENDING', NULL),
  ('partner.suspended@example.com', 'Paused Fashion Store', 'TAX-SUSP-DEMO', 'Pham Thanh Hoa', 'Quan 5, TP.HCM', 'SUSPENDED', 'Tam ngung hop tac trong thoi gian doi soat')
) AS p(email, business_name, business_license, representative, address, status, rejection_reason)
JOIN users u ON u.email = p.email
WHERE NOT EXISTS (SELECT 1 FROM partners existing WHERE existing.user_id = u.id);

INSERT INTO partner_branches (partner_id, name, address, phone, is_active)
SELECT p.id, b.name, b.address, b.phone, b.is_active
FROM (VALUES
  ('partner.food@example.com', 'Highlands Demo - Nguyen Hue', '45 Nguyen Hue, Q1, TP.HCM', '0988110001', TRUE),
  ('partner.food@example.com', 'Highlands Demo - Vo Van Tan', '120 Vo Van Tan, Q3, TP.HCM', '0988110002', TRUE),
  ('partner.food@example.com', 'Highlands Demo - Thu Duc', '22 Vo Van Ngan, Thu Duc, TP.HCM', '0988110003', TRUE),
  ('partner.beauty@example.com', 'Saigon Beauty - Phu My Hung', '18 Nguyen Duc Canh, Q7, TP.HCM', '0988120001', TRUE),
  ('partner.beauty@example.com', 'Saigon Beauty - Binh Thanh', '90 Dien Bien Phu, Binh Thanh, TP.HCM', '0988120002', TRUE),
  ('partner.beauty@example.com', 'Saigon Beauty - District 3', '33 Cach Mang Thang 8, Q3, TP.HCM', '0988120003', FALSE),
  ('partner.travel@example.com', 'Saigon Travel - Ben Thanh', '2 Le Lai, Q1, TP.HCM', '0988130001', TRUE),
  ('partner.travel@example.com', 'Saigon Travel - Tan Binh', '48 Truong Son, Tan Binh, TP.HCM', '0988130002', TRUE),
  ('partner.suspended@example.com', 'Paused Fashion - Nguyen Trai', '220 Nguyen Trai, Q5, TP.HCM', '0988140001', FALSE)
) AS b(email, name, address, phone, is_active)
JOIN users u ON u.email = b.email
JOIN partners p ON p.user_id = u.id
WHERE NOT EXISTS (
  SELECT 1 FROM partner_branches existing
  WHERE existing.partner_id = p.id AND existing.name = b.name
);

WITH partner_ref AS (
  SELECT u.email, p.id AS partner_id
  FROM users u
  JOIN partners p ON p.user_id = u.id
),
voucher_seed AS (
  SELECT * FROM (VALUES
    ('partner.food@example.com', 'Highlands Coffee - Combo Freeze và bánh', 'Combo Freeze size L kèm bánh ngọt tại Highlands Demo.', 'Ẩm thực', 180000, 99000, 80, -2, 30, 60, 'Áp dụng tại các chi nhánh Highlands Demo. Không quy đổi tiền mặt.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.food@example.com', 'Phúc Long - Trà sữa signature size L', 'Voucher trà sữa signature size L cho 2 người.', 'Ẩm thực', 160000, 89000, 70, -1, 25, 45, 'Áp dụng từ 9h đến 21h mỗi ngày.', 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.food@example.com', 'KFC - Bucket gà rán gia đình', 'Bucket gà rán 6 miếng kèm khoai và nước.', 'Ẩm thực', 399000, 249000, 60, -3, 35, 60, 'Không áp dụng đồng thời với khuyến mãi khác.', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.food@example.com', 'Pizza 4Ps - Set pizza và pasta cao cấp', 'Set pizza, pasta và salad cho 2 người.', 'Ẩm thực', 750000, 499000, 35, -1, 40, 75, 'Cần đặt bàn trước 2 giờ.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.beauty@example.com', 'Spa thư giãn 90 phút', 'Massage body và chăm sóc da thư giãn 90 phút.', 'Làm đẹp', 900000, 499000, 45, -2, 45, 90, 'Đặt lịch trước 24h. Không áp dụng ngày lễ.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6a9f8c?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.food@example.com', 'Vé xem phim CGV cuối tuần', 'Vé 2D cuối tuần kèm bắp nước size vừa.', 'Giải trí', 220000, 129000, 90, -1, 20, 45, 'Áp dụng rạp demo đối tác, không áp dụng suất đặc biệt.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', 'APPROVED', NULL),
    ('partner.beauty@example.com', 'Gói chăm sóc da Luxury Pending', 'Gói chăm sóc da đang chờ admin duyệt.', 'Làm đẹp', 1200000, 699000, 30, -1, 30, 80, 'Cần xác minh nội dung trước khi bán.', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80', 'PENDING_APPROVAL', NULL),
    ('partner.food@example.com', 'Buffet lẩu Thái Pending', 'Voucher buffet lẩu Thái đang chờ duyệt.', 'Ẩm thực', 450000, 299000, 50, -1, 35, 70, 'Thông tin menu cần admin kiểm tra.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80', 'PENDING_APPROVAL', NULL),
    ('partner.beauty@example.com', 'Triệt lông công nghệ mới Pending', 'Voucher công nghệ mới cần duyệt nội dung.', 'Làm đẹp', 1500000, 799000, 20, -1, 30, 90, 'Cần bổ sung chứng nhận dịch vụ.', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80', 'PENDING_APPROVAL', NULL),
    ('partner.food@example.com', 'Set hải sản giá sốc Rejected', 'Voucher bị từ chối do mô tả không rõ.', 'Ẩm thực', 980000, 399000, 20, -5, 20, 40, 'Thông tin điều kiện chưa đầy đủ.', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80', 'REJECTED', 'Mô tả ưu đãi và điều kiện áp dụng chưa rõ ràng'),
    ('partner.beauty@example.com', 'Botox Flash Deal Rejected', 'Voucher bị từ chối do không phù hợp chính sách sàn.', 'Làm đẹp', 2500000, 990000, 10, -5, 20, 50, 'Cần chứng từ dịch vụ y tế.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', 'REJECTED', 'Dịch vụ cần giấy phép/chứng từ bổ sung'),
    ('partner.food@example.com', 'Coffee Pass Suspended', 'Voucher đang tạm ngưng bán để đối soát.', 'Ẩm thực', 500000, 299000, 10, -10, 10, 30, 'Tạm ngưng trong thời gian kiểm tra đối tác.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', 'SUSPENDED', NULL),
    ('partner.beauty@example.com', 'Gói gội đầu dưỡng sinh Suspended', 'Voucher tạm ngưng do lịch hẹn quá tải.', 'Làm đẹp', 350000, 199000, 12, -8, 15, 45, 'Chỉ mở lại khi partner cập nhật lịch trống.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80', 'SUSPENDED', NULL),
    ('partner.food@example.com', 'Combo bánh mì hè 2025 Expired', 'Voucher đã hết hạn bán.', 'Ẩm thực', 120000, 69000, 25, -90, -10, -1, 'Không còn hiệu lực.', 'https://images.unsplash.com/photo-1600628421060-939639517883?auto=format&fit=crop&w=1200&q=80', 'EXPIRED', NULL),
    ('partner.beauty@example.com', 'Spa detox tháng trước Expired', 'Voucher đã hết hạn sử dụng.', 'Làm đẹp', 1100000, 599000, 15, -120, -30, -5, 'Không thể sử dụng sau hạn.', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', 'EXPIRED', NULL),
    ('partner.travel@example.com', 'Tour Sài Gòn nửa ngày Pending Partner', 'Voucher của partner pending, dùng demo duyệt partner.', 'Du lịch', 650000, 399000, 40, -1, 45, 90, 'Chỉ bán sau khi partner được approve.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'PENDING_APPROVAL', NULL)
  ) AS s(email, name, description, category, original_price, sale_price, stock, sale_start_offset, sale_end_offset, valid_until_offset, terms, image_url, status, rejection_reason)
)
INSERT INTO vouchers (partner_id, name, description, category, original_price, sale_price, stock, sale_start, sale_end, valid_until, terms, image_url, status, rejection_reason)
SELECT pr.partner_id, vs.name, vs.description, vs.category,
       vs.original_price::NUMERIC(15,2), vs.sale_price::NUMERIC(15,2), vs.stock::INTEGER,
       NOW() + vs.sale_start_offset::INTEGER * INTERVAL '1 day',
       NOW() + vs.sale_end_offset::INTEGER * INTERVAL '1 day',
       NOW() + vs.valid_until_offset::INTEGER * INTERVAL '1 day',
       vs.terms, vs.image_url, vs.status::voucher_status, vs.rejection_reason
FROM voucher_seed vs
JOIN partner_ref pr ON pr.email = vs.email
WHERE NOT EXISTS (SELECT 1 FROM vouchers existing WHERE existing.name = vs.name);

INSERT INTO voucher_applicable_branches (voucher_id, branch_id)
SELECT v.id, b.id
FROM vouchers v
JOIN partners p ON p.id = v.partner_id
JOIN partner_branches b ON b.partner_id = p.id AND b.is_active = TRUE
WHERE v.name IN (
  'Highlands Coffee - Combo Freeze va banh',
  'Phuc Long - Tra sua signature size L',
  'KFC - Bucket ga ran gia dinh',
  'Pizza 4Ps - Set pizza va pasta cao cap',
  'Spa thu gian 90 phut',
  'Ve xem phim CGV cuoi tuan'
)
ON CONFLICT DO NOTHING;

-- Orders and issued vouchers for the exact customer demo accounts.
WITH paid_order AS (
  INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at, created_at, updated_at)
  SELECT u.id, v.sale_price, 'PAID'::order_status, 'DEMO-PAY-CUS1-UNUSED', 'MOMO_MOCK', u.full_name, u.phone, u.email, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
  FROM users u CROSS JOIN vouchers v
  WHERE u.email='customer1@example.com' AND v.name='Highlands Coffee - Combo Freeze va banh'
    AND NOT EXISTS (SELECT 1 FROM orders WHERE payment_ref='DEMO-PAY-CUS1-UNUSED')
  RETURNING id
),
order_ref AS (
  SELECT id FROM paid_order
  UNION ALL
  SELECT id FROM orders WHERE payment_ref='DEMO-PAY-CUS1-UNUSED'
),
item_insert AS (
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  SELECT o.id, v.id, 1, v.sale_price
  FROM order_ref o CROSS JOIN vouchers v
  WHERE v.name='Highlands Coffee - Combo Freeze va banh'
    AND NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-A8F2K9')
  RETURNING id, voucher_id, order_id
)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-A8F2K9', ii.id, ii.voucher_id, u.id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW() + INTERVAL '60 days'
FROM item_insert ii
JOIN vouchers v ON v.id = ii.voucher_id
JOIN users u ON u.email='customer1@example.com'
WHERE NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-A8F2K9');

WITH paid_order AS (
  INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at, created_at, updated_at)
  SELECT u.id, v.sale_price, 'PAID'::order_status, 'DEMO-PAY-CUS2-USED', 'VNPAY_MOCK', u.full_name, u.phone, u.email, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  FROM users u CROSS JOIN vouchers v
  WHERE u.email='customer2@example.com' AND v.name='Spa thu gian 90 phut'
    AND NOT EXISTS (SELECT 1 FROM orders WHERE payment_ref='DEMO-PAY-CUS2-USED')
  RETURNING id
),
order_ref AS (
  SELECT id FROM paid_order
  UNION ALL
  SELECT id FROM orders WHERE payment_ref='DEMO-PAY-CUS2-USED'
),
item_insert AS (
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  SELECT o.id, v.id, 1, v.sale_price
  FROM order_ref o CROSS JOIN vouchers v
  WHERE v.name='Spa thu gian 90 phut'
    AND NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-U7D3X2')
  RETURNING id, voucher_id, order_id
)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, used_at, used_at_branch, expires_at)
SELECT 'VCH-2026-U7D3X2', ii.id, ii.voucher_id, u.id, v.partner_id, 'USED'::issued_voucher_status, NOW() - INTERVAL '2 days',
       (SELECT b.id FROM partner_branches b WHERE b.partner_id = v.partner_id AND b.is_active = TRUE LIMIT 1),
       NOW() + INTERVAL '80 days'
FROM item_insert ii
JOIN vouchers v ON v.id = ii.voucher_id
JOIN users u ON u.email='customer2@example.com'
WHERE NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-U7D3X2');

WITH paid_order AS (
  INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, paid_at, created_at, updated_at)
  SELECT u.id, v.sale_price, 'PAID'::order_status, 'DEMO-PAY-CUS3-COMPLAINT', 'MOMO_MOCK', u.full_name, u.phone, u.email, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
  FROM users u CROSS JOIN vouchers v
  WHERE u.email='customer3@example.com' AND v.name='KFC - Bucket ga ran gia dinh'
    AND NOT EXISTS (SELECT 1 FROM orders WHERE payment_ref='DEMO-PAY-CUS3-COMPLAINT')
  RETURNING id
),
order_ref AS (
  SELECT id FROM paid_order
  UNION ALL
  SELECT id FROM orders WHERE payment_ref='DEMO-PAY-CUS3-COMPLAINT'
),
item_insert AS (
  INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
  SELECT o.id, v.id, 1, v.sale_price
  FROM order_ref o CROSS JOIN vouchers v
  WHERE v.name='KFC - Bucket ga ran gia dinh'
    AND NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-C3M1N8')
  RETURNING id, voucher_id, order_id
)
INSERT INTO issued_vouchers (code, order_item_id, voucher_id, customer_id, partner_id, status, expires_at)
SELECT 'VCH-2026-C3M1N8', ii.id, ii.voucher_id, u.id, v.partner_id, 'UNUSED'::issued_voucher_status, NOW() + INTERVAL '45 days'
FROM item_insert ii
JOIN vouchers v ON v.id = ii.voucher_id
JOIN users u ON u.email='customer3@example.com'
WHERE NOT EXISTS (SELECT 1 FROM issued_vouchers WHERE code='VCH-2026-C3M1N8');

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, created_at, updated_at)
SELECT u.id, v.sale_price, 'PENDING'::order_status, 'DEMO-PAY-CUS5-PENDING', 'COD_MOCK', u.full_name, u.phone, u.email, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM users u CROSS JOIN vouchers v
WHERE u.email='customer5@example.com' AND v.name='Phuc Long - Tra sua signature size L'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE payment_ref='DEMO-PAY-CUS5-PENDING');

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price
FROM orders o
JOIN vouchers v ON v.name='Phuc Long - Tra sua signature size L'
WHERE o.payment_ref='DEMO-PAY-CUS5-PENDING'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=o.id AND oi.voucher_id=v.id);

INSERT INTO orders (customer_id, total_amount, status, payment_ref, payment_method, recipient_name, recipient_phone, recipient_email, created_at, updated_at)
SELECT u.id, v.sale_price, 'CANCELLED'::order_status, 'DEMO-PAY-CUS5-CANCELLED', 'MOMO_MOCK', u.full_name, u.phone, u.email, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
FROM users u CROSS JOIN vouchers v
WHERE u.email='customer5@example.com' AND v.name='Ve xem phim CGV cuoi tuan'
  AND NOT EXISTS (SELECT 1 FROM orders WHERE payment_ref='DEMO-PAY-CUS5-CANCELLED');

INSERT INTO order_items (order_id, voucher_id, quantity, unit_price)
SELECT o.id, v.id, 1, v.sale_price
FROM orders o
JOIN vouchers v ON v.name='Ve xem phim CGV cuoi tuan'
WHERE o.payment_ref='DEMO-PAY-CUS5-CANCELLED'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id=o.id AND oi.voucher_id=v.id);

-- Reviews for exact demo customers.
INSERT INTO reviews (voucher_id, customer_id, issued_voucher_id, rating, comment, partner_reply)
SELECT iv.voucher_id, iv.customer_id, iv.id, 5,
  'Dich vu spa tot, nhan vien huong dan su dung voucher nhanh.',
  'Cam on anh/chi da trai nghiem dich vu cua Saigon Beauty Spa.'
FROM issued_vouchers iv
WHERE iv.code='VCH-2026-U7D3X2'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.issued_voucher_id = iv.id);

-- Complaints: 2 pending, 1 in progress, 2 resolved, 1 rejected.
INSERT INTO complaints (customer_id, voucher_id, issued_voucher_id, order_id, subject, message, status, admin_response, resolved_by, resolved_at)
SELECT iv.customer_id, iv.voucher_id, iv.id, oi.order_id,
  c.subject, c.message, c.status::complaint_status, c.admin_response,
  CASE WHEN c.status IN ('RESOLVED', 'REJECTED') THEN (SELECT id FROM users WHERE email='admin@voucherhub.vn') ELSE NULL END,
  CASE WHEN c.status IN ('RESOLVED', 'REJECTED') THEN NOW() - INTERVAL '1 day' ELSE NULL END
FROM issued_vouchers iv
JOIN order_items oi ON oi.id = iv.order_item_id
CROSS JOIN (VALUES
  ('VCH-2026-C3M1N8', 'Không dùng được voucher tại chi nhánh', 'Nhân viên báo chi nhánh chưa cập nhật chương trình khuyến mãi.', 'PENDING', NULL),
  ('VCH-2026-A8F2K9', 'Mã QR không quét được', 'Khách hàng cần hỗ trợ vì QR mock không được đối tác xác nhận ngay.', 'PENDING', NULL),
  ('VCH-2026-U7D3X2', 'Đối tác từ chối áp dụng khuyến mãi', 'Đối tác yêu cầu đặt lịch lại dù khách đã dùng điều kiện.', 'IN_PROGRESS', 'Bộ phận hỗ trợ đang liên hệ quản lý chi nhánh.'),
  ('VCH-2026-C3M1N8', 'Muốn hoàn tiền vì lịch hẹn bị hủy', 'Khách hàng muốn hoàn tiền do partner hủy lịch hẹn.', 'RESOLVED', 'Yêu cầu hoàn tiền mock đã được chấp nhận theo chính sách sàn.'),
  ('VCH-2026-A8F2K9', 'Thông tin điều kiện sử dụng chưa rõ', 'Khách hàng cần giải thích thêm về điều kiện đặt lịch trước.', 'RESOLVED', 'Đã cập nhật hướng dẫn và gửi lại chính sách sử dụng voucher.'),
  ('VCH-2026-U7D3X2', 'Yêu cầu hoàn tiền sau khi voucher đã dùng', 'Khách hàng yêu cầu hoàn tiền nhưng voucher đã được scan thành công.', 'REJECTED', 'Yêu cầu bị từ chối do voucher đã sử dụng thành công.')
) AS c(code, subject, message, status, admin_response)
WHERE iv.code = c.code
  AND NOT EXISTS (SELECT 1 FROM complaints existing WHERE existing.subject = c.subject);

INSERT INTO popups (title, content, is_active, start_date, end_date)
SELECT 'Khuyến mãi giờ vàng', 'Giảm đến 50% cho nhóm voucher ẩm thực và làm đẹp trong tuần demo.', TRUE, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM popups WHERE title='Khuyến mãi giờ vàng');

INSERT INTO popups (title, content, is_active, start_date, end_date)
SELECT 'Chương trình đã kết thúc', 'Popup hết hạn dùng để admin demo trạng thái inactive/expired.', FALSE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM popups WHERE title='Chương trình đã kết thúc');

INSERT INTO system_logs (user_id, action, entity, entity_id, details, ip_address)
SELECT admin.id, l.action, l.entity, l.entity_id, l.details::jsonb, '192.168.10.10'
FROM users admin
CROSS JOIN LATERAL (VALUES
  ('LOGIN_ADMIN', 'users', admin.id, '{"method":"email","result":"success"}'),
  ('APPROVE_PARTNER', 'partners', (SELECT p.id FROM partners p JOIN users u ON u.id=p.user_id WHERE u.email='partner.food@example.com'), '{"partner":"Highlands Coffee Demo"}'),
  ('SUSPEND_PARTNER', 'partners', (SELECT p.id FROM partners p JOIN users u ON u.id=p.user_id WHERE u.email='partner.suspended@example.com'), '{"reason":"đối soát demo"}'),
  ('APPROVE_VOUCHER', 'vouchers', (SELECT id FROM vouchers WHERE name='Highlands Coffee - Combo Freeze và bánh'), '{"status":"APPROVED"}'),
  ('REJECT_VOUCHER', 'vouchers', (SELECT id FROM vouchers WHERE name='Set hải sản giá sốc Rejected'), '{"reason":"mô tả chưa rõ"}'),
  ('SUSPEND_VOUCHER', 'vouchers', (SELECT id FROM vouchers WHERE name='Coffee Pass Suspended'), '{"reason":"tạm ngưng bán"}'),
  ('CANCEL_ORDER', 'orders', (SELECT id FROM orders WHERE payment_ref='DEMO-PAY-CUS5-CANCELLED'), '{"payment_ref":"DEMO-PAY-CUS5-CANCELLED"}'),
  ('UPDATE_COMPLAINT_STATUS', 'complaint', (SELECT id FROM complaints WHERE subject='Muốn hoàn tiền vì lịch hẹn bị hủy' LIMIT 1), '{"status":"RESOLVED"}'),
  ('UPDATE_CONTENT', 'content', (SELECT id FROM popups WHERE title='Khuyến mãi giờ vàng'), '{"type":"popup","operation":"create"}'),
  ('UPDATE_CATEGORY', 'content', (SELECT id FROM categories WHERE name='Giáo dục'), '{"type":"category","operation":"upsert"}')
) AS l(action, entity, entity_id, details)
WHERE admin.email='admin@voucherhub.vn'
  AND l.entity_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM system_logs s
    WHERE s.user_id = admin.id AND s.action = l.action AND s.entity_id = l.entity_id
  );

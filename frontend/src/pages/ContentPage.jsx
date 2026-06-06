import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContentPageRequest } from "../services/content.service";
import "./ContentPage.css";

const REFUND_POLICY_CONTENT = `1. Phạm vi áp dụng
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
Khách hàng có trách nhiệm bảo mật mã voucher và sử dụng đúng điều kiện. Đối tác có trách nhiệm xác thực voucher theo thông tin đã công bố. VoucherHub hỗ trợ ghi nhận, kiểm tra và xử lý yêu cầu ở mức mô phỏng trong phạm vi đồ án.`;

const VOUCHER_TERMS_CONTENT = `1. Hiệu lực của voucher
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
Nếu khách hàng cho rằng voucher bị từ chối không đúng, khách hàng có thể gửi khiếu nại để quản trị viên kiểm tra thông tin giao dịch, trạng thái voucher và phản hồi từ đối tác.`;

const USAGE_GUIDE_CONTENT = `1. Tìm kiếm voucher
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
Sau khi sử dụng voucher, khách hàng có thể đánh giá trải nghiệm hoặc gửi khiếu nại nếu phát sinh vấn đề.`;

const FALLBACK_PAGES = {
  "chinh-sach-hoan-huy": {
    title: "Chính sách hoàn/hủy",
    content: REFUND_POLICY_CONTENT,
  },
  "chinh-sach-hoan-tien": {
    title: "Chính sách hoàn/hủy",
    content: REFUND_POLICY_CONTENT,
  },
  "refund-policy": {
    title: "Chính sách hoàn/hủy",
    content: REFUND_POLICY_CONTENT,
  },
  "dieu-khoan-voucher": {
    title: "Điều khoản voucher",
    content: VOUCHER_TERMS_CONTENT,
  },
  "dieu-khoan-su-dung": {
    title: "Điều khoản voucher",
    content: VOUCHER_TERMS_CONTENT,
  },
  "voucher-terms": {
    title: "Điều khoản voucher",
    content: VOUCHER_TERMS_CONTENT,
  },
  "huong-dan-su-dung": {
    title: "Hướng dẫn sử dụng voucher",
    content: USAGE_GUIDE_CONTENT,
  },
  "usage-guide": {
    title: "Hướng dẫn sử dụng voucher",
    content: USAGE_GUIDE_CONTENT,
  },
};

const ContentPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    getContentPageRequest(slug)
      .then((data) => {
        if (isMounted) setPage(data);
      })
      .catch((err) => {
        if (isMounted) {
          const fallback = FALLBACK_PAGES[slug];
          if (fallback) {
            setPage({
              ...fallback,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setError("");
            return;
          }
          setError(err.response?.data?.error?.message || "Không tải được trang nội dung");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container content-page">
        <p>Đang tải nội dung...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container content-page">
        <div className="card content-card">
          <h1>Không tìm thấy nội dung</h1>
          <p className="text-muted">{error}</p>
          <Link className="btn btn-outline" to="/vouchers">Xem voucher</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container content-page">
      <article className="card content-card">
        <h1>{page.title}</h1>
        <p className="content-updated">
          Cập nhật: {new Date(page.updated_at || page.created_at).toLocaleString("vi-VN")}
        </p>
        <div className="content-body">{page.content}</div>
      </article>
    </div>
  );
};

export default ContentPage;

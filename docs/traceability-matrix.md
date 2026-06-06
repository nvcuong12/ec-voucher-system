# Traceability matrix BRD - Code - Test - Demo

Quy uoc trang thai: `Dat`, `Dat mot phan`, `Chua dat`, `Khong ap dung`.

| Ma yeu cau | Noi dung tom tat | Man hinh lien quan | API/backend lien quan | Bang DB lien quan | Test case lien quan | Trang thai |
| ---------- | ---------------- | ------------------ | --------------------- | ----------------- | ------------------- | ---------- |
| BR-01 | 3 role CUSTOMER/PARTNER/ADMIN | Login, Navbar, ProtectedRoute | `auth.routes`, `auth.middleware` | `users` | AUTH-AUTO-01..03, TC-AUTH-01 | Dat |
| BR-02 | Quan ly doi tac va chi nhanh | Partner dashboard, Admin partners | `partner.routes`, `admin.routes` | `partners`, `partner_branches` | TC-PAR-01, TC-ADM-01 | Dat |
| BR-03 | Mua voucher va tao don hang | Cart, Checkout/Orders | `order.routes`, `order.controller` | `orders`, `order_items` | TC-CUS-02 | Dat |
| BR-04 | Thanh toan mock va phat hanh voucher | Cart, My Vouchers | `order.controller` payment mock | `issued_vouchers`, `system_logs` | TC-CUS-02 | Dat |
| BR-05 | Su dung voucher tai chi nhanh | Partner scan | `partner.controller.scanVoucher` | `issued_vouchers`, `voucher_applicable_branches` | TC-PAR-02 | Dat |
| BR-06 | Quan tri he thong | Admin dashboard | `admin.controller` | nhieu bang | TC-ADM-01, TC-REP-01 | Dat |
| BR-07 | Bao cao/thong ke | Admin dashboard, Partner reports | `getDashboard`, `getPartnerDashboard` | `orders`, `issued_vouchers`, `vouchers` | TC-REP-01 | Dat |
| BR-CUS-01 | Dang ky/dang nhap customer | Register/Login | `auth.controller` | `users` | TC-AUTH-01 | Dat |
| BR-CUS-02 | Quan ly thong tin ca nhan | Profile | `user.controller` | `users` | Manual | Dat |
| BR-CUS-03 | Tim kiem/loc voucher | Home, Vouchers | `voucher.controller.list` | `vouchers`, `partners` | TC-CUS-01 | Dat |
| BR-CUS-04 | Xem chi tiet voucher/chinh sach | Voucher detail, `/pages/:slug` | `getVoucherById`, public content page | `vouchers`, `content_pages`, `partner_branches` | TC-CUS-01 | Dat |
| BR-CUS-05 | Gio hang | Cart | `CartContext` localStorage | local state | TC-CUS-01 | Dat |
| BR-CUS-06 | Dat hang/thanh toan mock | Cart/Orders | `order.controller` | `orders`, `order_items` | TC-CUS-02 | Dat |
| BR-CUS-07 | Nhan code/QR mock | My Vouchers | `user.getMyVouchers` | `issued_vouchers` | TC-CUS-02 | Dat |
| BR-CUS-08 | Review/complaint | Voucher detail, My Vouchers | `review.controller`, `user.createComplaint` | `reviews`, `complaints` | REV-AUTO-01..05, COM-AUTO-01..03 | Dat |
| BR-PAR-01 | Tao/cap nhat ho so doi tac | Partner dashboard | `partner.controller` | `partners`, `partner_branches` | TC-PAR-01 | Dat |
| BR-PAR-02 | Tao/sua voucher | Partner vouchers/form | `partner.voucher` APIs | `vouchers` | TC-PAR-01 | Dat |
| BR-PAR-03 | Gui voucher cho admin duyet | Partner vouchers | `submit voucher` | `vouchers` | TC-PAR-01 | Dat |
| BR-PAR-04 | Quan ly voucher cua doi tac | Partner vouchers | partner ownership queries | `vouchers` | Manual | Dat |
| BR-PAR-05 | Scan/use voucher | Partner scan | `scanVoucher` | `issued_vouchers` | TC-PAR-02 | Dat |
| BR-PAR-06 | Reply review dung owner | Partner/review action | `replyReview` | `reviews`, `vouchers` | REV-AUTO-03..05 | Dat |
| BR-PAR-07 | Bao cao doi tac | Partner reports | `getPartnerDashboard` | `orders`, `issued_vouchers` | TC-REP-01 | Dat |
| BR-ADM-01 | Quan ly user | Admin users | `admin.users` | `users` | Manual | Dat |
| BR-ADM-02 | Duyet partner | Admin partners | `updatePartnerApprovalStatus` | `partners` | TC-ADM-01 | Dat |
| BR-ADM-03 | Duyet voucher | Admin vouchers | `approveVoucher`, `rejectVoucher` | `vouchers` | TC-ADM-01 | Dat |
| BR-ADM-04 | Quan ly don hang/refund mock | Admin orders | `updateOrderStatus` | `orders`, `system_logs` | Manual | Dat mot phan: refund la mock, chua co gateway that |
| BR-ADM-05 | Quan ly category/banner/page/popup/policy | Admin content, Home popup, `/pages/:slug` | content/popup APIs | `categories`, `banners`, `content_pages`, `popups` | Manual popup demo | Dat |
| BR-ADM-06 | Dashboard KPI | Admin dashboard | `getDashboard` | `orders`, `vouchers`, `issued_vouchers` | TC-REP-01 | Dat |
| BR-ADM-07 | Audit log | Admin logs | `logAdminAction` | `system_logs` | TC-LOG-01, COM-AUTO-04 | Dat |
| RB-01 | Chi ban voucher APPROVED | Vouchers, Voucher detail | public voucher list/detail | `vouchers.status` | TC-CUS-01 | Dat |
| RB-02 | Voucher co sale/valid window | Voucher form/detail | voucher validation/query | `vouchers.sale_start/end`, `valid_until` | Manual | Dat |
| RB-03 | Gia VND/giam gia | Voucher cards/detail | frontend formatting | `vouchers.original_price/sale_price` | Manual | Dat |
| RB-04 | Quan ly stock | Cart/Order | order transaction | `vouchers.stock` | TC-CUS-02 | Dat |
| RB-05 | Payment mock moi phat hanh code | Cart/My Vouchers | payment mock | `orders`, `issued_vouchers` | TC-CUS-02 | Dat |
| RB-06 | Code voucher unique | My Vouchers | issued voucher generation | `issued_vouchers.code` | Manual | Dat |
| RB-07 | Scan dung partner | Partner scan | partner ownership check | `partners`, `vouchers` | TC-PAR-02 | Dat |
| RB-08 | Scan dung chi nhanh ap dung | Partner scan | branch applicability check | `voucher_applicable_branches` | TC-PAR-02 | Dat |
| RB-09 | Scan lai voucher da dung bi tu choi | Partner scan | status check | `issued_vouchers.status` | TC-PAR-02 | Dat |
| RB-10 | Review/reply ownership | Voucher detail, Partner reply | review controller | `reviews`, `issued_vouchers` | REV-AUTO-01..05 | Dat |
| RB-11 | Order lifecycle | Orders/Admin orders | order controller/admin | `orders.status` | TC-CUS-02 | Dat |
| RB-12 | Hanh dong quan trong co audit log | Admin logs | log insert | `system_logs` | TC-LOG-01, COM-AUTO-04 | Dat |
| RB-13 | Partner pending chua ban voucher | Partner/Admin flow | partner/voucher status checks | `partners.status`, `vouchers.status` | Manual | Dat |
| RB-14 | Chinh sach hoan/huy ro rang | Voucher detail, `/pages/chinh-sach-hoan-tien` | content page public API | `content_pages` | Manual | Dat |
| RB-15 | Sau thanh toan co issued voucher | My Vouchers | order payment mock | `issued_vouchers` | TC-CUS-02 | Dat |
| DR-01 | Du lieu user | Login/Profile/Admin users | auth/user/admin | `users` | TC-AUTH-01 | Dat |
| DR-02 | Du lieu partner/branch | Partner/Admin | partner/admin | `partners`, `partner_branches` | TC-PAR-01 | Dat |
| DR-03 | Du lieu voucher | Voucher screens | voucher/partner/admin | `vouchers` | TC-CUS-01 | Dat |
| DR-04 | Du lieu order/payment | Cart/Orders/Admin orders | order/admin | `orders`, `order_items` | TC-CUS-02 | Dat |
| DR-05 | Du lieu issued voucher | My Vouchers/Scan | user/partner | `issued_vouchers` | TC-PAR-02 | Dat |
| DR-06 | Du lieu review/complaint/log | Voucher detail/My Vouchers/Admin | review/user/admin | `reviews`, `complaints`, `system_logs` | REV/COM automated tests | Dat |
| NFR-01 | De chay/de cai dat | Setup guide | Docker/npm scripts | Docker/Postgres | Build/test commands | Dat |
| NFR-02 | Authorization/ownership | ProtectedRoute, middleware | auth/admin/partner/user controllers | all owner tables | AUTH/REV/COM automated tests | Dat |
| NFR-03 | Loi/validation ro | Forms/API errors | BusinessException + validation | n/a | COM-AUTO-01 | Dat mot phan: validation chua gom thanh middleware chung |
| NFR-04 | Responsive co ban | Customer/Partner/Admin pages | frontend CSS | n/a | Manual | Dat mot phan |
| NFR-05 | Hieu nang demo | Dashboard/list pages | paged/simple queries | indexes | Manual | Dat mot phan: chua co caching |
| NFR-06 | Auditability | Admin logs | system log writes | `system_logs` | TC-LOG-01 | Dat |
| KPI-01 | Hoan thanh flow mua voucher | Customer flow | order/payment | order tables | TC-CUS-01/02 | Dat |
| KPI-02 | Hoan thanh flow partner/admin | Partner/Admin flow | partner/admin APIs | partner/voucher tables | TC-PAR-01, TC-ADM-01 | Dat |
| KPI-03 | Ty le loi demo thap | All screens | validation/error states | n/a | Build/test | Dat mot phan |
| KPI-04 | Dashboard bao cao | Admin/Partner dashboard | dashboard APIs | order/issued tables | TC-REP-01 | Dat |
| KPI-05 | Tai lieu/kiem thu day du | Docs | n/a | n/a | Traceability/test/demo docs | Dat |
| AC-01 | Chay duoc ung dung | Home/Login | Docker/npm | all | Setup guide | Dat |
| AC-02 | Co day du role va flow | Customer/Partner/Admin | all role APIs | all core tables | Manual + automated | Dat |
| AC-03 | Co database va seed | n/a | init/seed SQL | all | reset DB guide | Dat |
| AC-04 | Co demo data | all demo screens | seed-data.sql | all | demo script | Dat |
| AC-05 | Thuyet trinh mapping BRD-code-test | Docs | n/a | n/a | this matrix | Dat |

## Muc chua lam/ngoai pham vi

- Payment gateway that: `Khong ap dung` voi do an hien tai, dang dung payment mock.
- SMS/email that: `Khong ap dung`, chua bat buoc cho demo.
- QR scanner camera that: `Khong ap dung`, hien dung QR/code mock.
- Mobile native, machine learning, ERP/CRM integration: `Khong ap dung`.

# Kich ban demo VoucherHub

## Demo nhanh 7 phut

| Thoi luong | Role/tai khoan | URL/man hinh | Hanh dong | Ket qua mong doi | Mapping | Xu ly nhanh neu loi |
| ---------- | -------------- | ------------ | --------- | ---------------- | ------- | ------------------- |
| 45s | ADMIN `admin@vouchersystem.com` / `Admin@123` | `/admin` | Mo dashboard, chi KPI user/partner/voucher/order/revenue/issued/log | Dashboard co so lieu seed, top voucher, revenue by day | BR-07, BR-ADM-06, KPI-04 | Neu so lieu trong, reset DB va seed lai |
| 60s | PARTNER `partner@vouchersystem.com` / `Customer@123` | `/partner/vouchers/new` | Tao voucher moi, nhap gia/stock/date/branch, gui duyet | Voucher o trang thai `PENDING_APPROVAL` | BR-PAR-02, BR-PAR-03 | Neu partner bi chan, dung account approved hoac admin approve partner |
| 45s | ADMIN | `/admin/vouchers` | Duyet voucher vua tao | Voucher thanh `APPROVED`, public ban duoc | BR-ADM-03, RB-01 | Neu khong thay voucher, refresh hoac vao tab Voucher dashboard |
| 75s | CUSTOMER `customer1@vouchersystem.com` / `Customer@123` | `/vouchers`, `/vouchers/:id` | Search bang navbar, xem detail, kiem tra dieu kien/han/branch/policy, them cart | Chi tiet ro, policy hien, cart co voucher | BR-CUS-03, BR-CUS-04, BR-CUS-05, RB-14 | Neu search khong ra, xoa query va chon voucher seed |
| 60s | CUSTOMER | `/cart`, `/orders`, `/my-vouchers` | Checkout va payment mock | Order `PAID`, code/QR mock xuat hien | BR-03, BR-04, BR-CUS-06, BR-CUS-07 | Neu stock het, chon voucher khac |
| 60s | PARTNER | `/partner/scan` | Chon dung branch, nhap code issued voucher | Voucher chuyen `USED`, scan lai bi tu choi | BR-05, RB-07, RB-08, RB-09 | Neu sai branch, mo detail xem branch ap dung |
| 75s | ADMIN | `/admin`, tab Logs | Xem report/log sau mua va scan | Log approve/scan/update hien voi details | BR-ADM-07, RB-12, NFR-06 | Neu log chua cap nhat, refresh tab Logs |

## Demo day du 12-15 phut

| Thoi luong | Role/tai khoan | URL/man hinh | Hanh dong | Ket qua mong doi | Mapping | Xu ly nhanh neu loi |
| ---------- | -------------- | ------------ | --------- | ---------------- | ------- | ------------------- |
| 60s | ADMIN | `/admin`, tab Noi dung > Popups | Tao popup khuyen mai, bat active, date trong hien luc | Popup duoc luu, co audit log | BR-ADM-05, RB-12 | Neu popup khong hien, kiem tra `is_active`, start/end date |
| 45s | CUSTOMER/Guest | `/` | Mo HomePage | Popup active hien, co nut dong | BR-ADM-05 | Neu da dong popup, mo tab an danh hoac clear sessionStorage |
| 60s | CUSTOMER/Guest | `/pages/chinh-sach-hoan-tien`, `/pages/huong-dan-su-dung` | Mo trang chinh sach tu menu | Noi dung lay tu `content_pages` | BR-CUS-04, RB-14 | Neu 404, reset DB de co seed content pages |
| 90s | PARTNER | `/partner/vouchers/new` | Tao voucher co dieu kien va branch | Voucher pending approval | BR-PAR-02, BR-PAR-03 | Dung account `partner@...` |
| 60s | ADMIN | `/admin/vouchers` | Approve/reject voucher | Co audit log approve/reject | BR-ADM-03, RB-12 | Refresh neu list chua cap nhat |
| 120s | CUSTOMER | `/vouchers`, `/cart`, `/my-vouchers` | Mua voucher, payment mock, nhan code | Order paid, issued voucher unused | BR-CUS-06, BR-CUS-07, RB-15 | Chon voucher stock > 0 |
| 90s | PARTNER | `/partner/scan` | Scan dung branch, sau do scan lai | Lan 1 thanh cong, lan 2 bi tu choi | BR-PAR-05, RB-09 | Dung code trong My Vouchers |
| 90s | CUSTOMER/PARTNER | `/vouchers/:id` | Customer review; partner reply review | Review co reply, partner khac bi 403 theo test | BR-CUS-08, BR-PAR-06, RB-10 | Neu review bi trung, chon issued voucher khac |
| 90s | CUSTOMER/ADMIN | `/my-vouchers`, `/admin` tab Khieu nai | Customer tao complaint; admin chuyen `IN_PROGRESS`/`RESOLVED` co response | Complaint co trang thai va response | DR-06, RB-12 | Khi resolve/reject phai nhap response |
| 60s | ADMIN | `/admin` tab Orders | Demo cancel/refund mock cho order | Order doi status, co log | BR-ADM-04 | Dung order seed neu khong muon tao moi |
| 60s | ADMIN/PARTNER | `/admin`, `/partner/reports` | Mo dashboard/report | Co KPI, top voucher, revenue by day | BR-07, BR-PAR-07, KPI-04 | Reset DB neu so lieu thieu |
| 60s | Presenter | `docs/traceability-matrix.md` | Mo matrix de giai thich BRD-code-test-demo | Giang vien thay mapping ro | AC-05, KPI-05 | Mo file local neu khong can UI |

## Checklist truoc khi demo

1. Chay `docker compose up --build` hoac chay rieng backend/frontend.
2. Neu schema popup moi chua co, reset DB bang `docker compose down -v --remove-orphans` roi up lai.
3. Chay `npm test --prefix backend -- --runInBand`.
4. Chay `npm run build --prefix frontend`.
5. Dang nhap thu 3 role: admin, customer1, partner.
6. Chuan bi san mot issued voucher code trong `/my-vouchers` de scan.
7. Mo san `docs/traceability-matrix.md` va `docs/security-review.md` cho phan hoi dap.

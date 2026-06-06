# Security/authorization review

Ngay review: 2026-06-05.

## Ket qua chinh

| Khu vuc | Kiem tra | Ket qua | Bang chung |
| ------- | -------- | ------- | ---------- |
| Admin routes | Tat ca route admin CRUD sau `router.use(authenticate, authorize("ADMIN"))` | Dat | `backend/src/routes/admin.routes.js` |
| Public content | Chi public popup active va content page active theo slug | Dat | `/admin/content/popups/active`, `/admin/content/pages/public/:slug` dat truoc admin guard |
| Partner routes | Yeu cau PARTNER guard va controller kiem partner profile/owner | Dat | `partner.routes`, `partner.controller` |
| Partner scan voucher | Kiem partner owner, branch owner, branch active, voucher applicable branch, issued status | Dat | `ensurePartnerBranch`, `ensureVoucherApplicableAtBranch` |
| Review reply | Partner chi reply review thuoc voucher cua minh | Dat | `review.controller.replyReview`, `REV-AUTO-03..05` |
| Complaint customer | Customer chi tao/xem complaint tren issued voucher cua minh | Dat | `user.controller.createComplaint`, `COM-AUTO-02` |
| Complaint admin | Admin update complaint, resolve/reject phai co response, ghi log | Dat | `admin.controller.updateComplaintStatus`, `COM-AUTO-04` |
| Public voucher data | Public list/detail khong tra password/token/system logs | Dat | voucher queries khong select password/token/log |
| Issued voucher code | Chi lay qua customer authenticated endpoint hoac partner scan co ownership | Dat | `user.getMyVouchers`, `partner.scanVoucher` |
| Audit log | Approve/reject/status/content/complaint/scan/reply ghi log | Dat | `system_logs`, `logAdminAction` |

## Rủi ro còn lại

| Rủi ro | Muc do | Ly do | Huong xu ly |
| ------ | ----- | ----- | ----------- |
| Validation chua gom thanh middleware chung | Trung binh | Nhieu controller validate inline, chua dong nhat field error | Co the tao middleware schema cho auth/voucher/order/complaint sau |
| Rate limit chua co | Trung binh | Login/search/public API chua gioi han request | Them `express-rate-limit` neu trien khai production |
| Payment la mock | Thap trong pham vi do an | Khong tich hop gateway that | Ghi ro trong demo va docs la mock |
| QR scanner la mock | Thap trong pham vi do an | Nhap code/QR mock thay camera scanner | Ghi ro trong demo, co the them scanner that sau |
| Popup/content public dung path `/api/admin/...` | Thap | Endpoint public duoc dat truoc guard nhung prefix admin de tan dung module content | Co the tach `/api/content` neu refactor sau |
| XSS noi dung content page | Trung binh | Hien noi dung text thuong, khong render HTML nen rui ro thap; neu sau nay cho HTML can sanitize | Duy tri text/plain hoac sanitize HTML |

## Checklist truoc khi nop

1. Chay `npm test --prefix backend -- --runInBand`.
2. Chay `npm run build --prefix frontend`.
3. Kiem tra route admin moi khong nam truoc guard, ngoai 2 route public content da chu y.
4. Kiem tra public API khong select `password`, token, `system_logs`.
5. Kiem tra partner scan va reply review bang account partner khac.
6. Kiem tra customer2 khong xem duoc order/voucher/complaint cua customer1.

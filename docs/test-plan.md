# Ke hoach kiem thu VoucherHub

## TC-AUTH-01 - Dang nhap theo role

- Muc tieu: xac minh auth va dieu huong role.
- Tien dieu kien: co tai khoan admin/customer/partner seed.
- Buoc: dang nhap tung tai khoan.
- Ket qua mong doi: admin vao `/admin`, partner vao `/partner`, customer vao trang public/my vouchers.
- Mapping: BR-01, AC-01, NFR-02.

## TC-CUS-01 - Customer tim va mua voucher

- Buoc: vao `/vouchers`, search bang `q`, loc category/gia, xem detail, them cart.
- Ket qua: voucher public chi gom `APPROVED`, cart co item.
- Mapping: BR-CUS-03, BR-CUS-04, BR-CUS-05, RB-01.

## TC-CUS-02 - Checkout va phat hanh code

- Buoc: tu cart tao order, thanh toan mock.
- Ket qua: order `PAID`, stock giam, issued voucher code duoc tao.
- Mapping: BR-03, BR-04, BR-CUS-06, BR-CUS-07, RB-05, RB-11, RB-15.

## TC-PAR-01 - Partner tao va gui duyet voucher

- Buoc: partner approved vao `/partner/vouchers/new`, nhap thong tin, chon branch, submit approval.
- Ket qua: voucher `PENDING_APPROVAL`.
- Mapping: BR-PAR-02, BR-PAR-03.

## TC-ADM-01 - Admin duyet partner/voucher

- Buoc: admin vao dashboard, duyet partner pending va voucher pending.
- Ket qua: partner/voucher thanh `APPROVED`, co audit log.
- Mapping: BR-ADM-02, BR-ADM-03, RB-12.

## TC-PAR-02 - Scan voucher dung/sai chi nhanh

- Buoc hop le: partner chon branch nam trong `voucher_applicable_branches`, scan code `UNUSED`.
- Ket qua: code thanh `USED`, co log `PARTNER_SCAN_VOUCHER`.
- Buoc sai: scan cung code tai branch khong ap dung.
- Ket qua: bi tu choi.
- Mapping: BR-05, BR-PAR-05, BR-PAR-06, RB-07, RB-08, RB-09.

## TC-REV-01 - Review va partner reply

- Buoc: customer review issued voucher cua minh; partner dung owner reply.
- Ket qua: review co rating/comment/partner_reply.
- Negative: partner khac reply review.
- Ket qua: 403.
- Mapping: BR-CUS-08, RB-10.

## TC-COM-01 - Complaint

- Buoc: customer vao My Vouchers, gui khieu nai cho issued voucher.
- Ket qua: complaint `PENDING`.
- Buoc: admin vao tab Khieu nai, chuyen `IN_PROGRESS`, sau do `RESOLVED` co response.
- Ket qua: customer thay trang thai va response.
- Mapping: BR-CUS-08, DR-06, RB-12.

## TC-REP-01 - Dashboard/report

- Buoc: admin xem dashboard; partner xem reports.
- Ket qua: co doanh thu, order, voucher ban ra, issued/used, top voucher.
- Mapping: BR-07, BR-PAR-07, BR-ADM-06, KPI-04.

## TC-LOG-01 - Audit log

- Buoc: approve voucher, refund order, scan voucher, update complaint.
- Ket qua: `/admin/logs` co action va details.
- Mapping: RB-12, NFR-06.

## Automated backend tests

Lenh chay:

```bash
npm test --prefix backend -- --runInBand
```

File test: `backend/src/controllers/__tests__/business-flows.test.js`.

| Test case | Muc tieu | Mapping |
| --------- | -------- | ------- |
| AUTH-AUTO-01 | Customer bi chan khi vao handler ADMIN | NFR-02, BR-ADM |
| AUTH-AUTO-02 | Partner bi chan khi vao handler ADMIN | NFR-02, BR-ADM |
| AUTH-AUTO-03 | Admin duoc qua role guard | NFR-02, BR-ADM |
| REV-AUTO-01 | Customer chi review issued voucher cua minh | BR-CUS-08, RB-10 |
| REV-AUTO-02 | Khong review trung issued voucher | BR-CUS-08, RB-10 |
| REV-AUTO-03 | Partner chua approved khong reply review | BR-PAR-06, NFR-02 |
| REV-AUTO-04 | Partner khong reply review cua partner khac | BR-PAR-06, RB-10 |
| REV-AUTO-05 | Partner reply hop le co ghi audit log | RB-12, NFR-06 |
| COM-AUTO-01 | Complaint thieu field bi 400 | DR-06, NFR-03 |
| COM-AUTO-02 | Customer khong complaint voucher khong so huu | DR-06, NFR-02 |
| COM-AUTO-03 | Customer tao complaint thanh cong | DR-06 |
| COM-AUTO-04 | Admin resolve/reject complaint phai co response va co log khi thanh cong | DR-06, RB-12 |

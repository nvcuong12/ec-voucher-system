# Checklist nghiem thu theo BRD

| Ma | Noi dung | Trang thai | Bang chung | Ghi chu |
| --- | --- | --- | --- | --- |
| BR-01 | Quan ly tai khoan va phien theo role | Dat | Auth API, `AuthContext`, `ProtectedRoute` | Reset password mock |
| BR-02 | Quan ly danh muc/noi dung voucher | Dat mot phan | Admin content categories/banners/pages | Popup chua lam |
| BR-03 | Mua hang truc tuyen | Dat | Cart, Orders API | Thanh toan mock |
| BR-04 | Phat hanh voucher code | Dat | `issued_vouchers`, My Vouchers | QR mock |
| BR-05 | Kiem tra/xac thuc voucher | Dat | Partner scan API/UI | Co check branch ap dung |
| BR-06 | Kiem duyet/giam sat | Dat | Admin dashboard, logs | |
| BR-07 | Bao cao/phan tich | Dat | Admin dashboard, partner reports | Chua co chart phuc tap |
| BR-CUS-01 | Dang ky email/phone | Dat | Auth register | |
| BR-CUS-02 | Login/profile/password | Dat | Auth/Profile pages | Forgot mock |
| BR-CUS-03 | Tim/loc voucher | Dat | Voucher list `q`, filters | |
| BR-CUS-04 | Chi tiet voucher | Dat | Voucher detail | Co policy co ban |
| BR-CUS-05 | Gio hang | Dat | Cart context/page | Persist localStorage |
| BR-CUS-06 | Tao don | Dat | Order API | |
| BR-CUS-07 | Nhan code/QR mock | Dat | My Vouchers | |
| BR-CUS-08 | Review/feedback/complaint | Dat | Reviews + complaints | Complaint module moi |
| BR-PAR-01 | Ho so doi tac/branch | Dat | Partner dashboard | |
| BR-PAR-02 | Tao voucher | Dat | Partner form | |
| BR-PAR-03 | Gui duyet voucher | Dat | Voucher status | |
| BR-PAR-04 | Quan ly voucher | Dat mot phan | Partner vouchers/reports | |
| BR-PAR-05 | Check code | Dat | Partner scan check | |
| BR-PAR-06 | Xac nhan su dung | Dat | Partner scan redeem | |
| BR-PAR-07 | Bao cao doi tac | Dat | Partner reports | |
| BR-ADM-01 | Quan ly user | Dat | Admin users | |
| BR-ADM-02 | Quan ly doi tac | Dat | Admin partners | |
| BR-ADM-03 | Duyet voucher | Dat | Admin vouchers | |
| BR-ADM-04 | Quan ly order/refund | Dat | Admin orders | |
| BR-ADM-05 | Quan ly noi dung | Dat mot phan | Category/banner/pages | Popup chua lam |
| BR-ADM-06 | Dashboard admin | Dat | Admin overview | |
| BR-ADM-07 | Nhat ky he thong | Dat | System logs | |
| RB-01..RB-15 | Quy tac nghiep vu voucher/order/code | Dat mot phan | Controllers + lifecycle doc | Can automated tests them |
| DR-01..DR-06 | Du lieu nghiep vu | Dat | DB schema + complaints | |
| NFR-01 | Hieu nang demo | Dat | Query co index co ban | |
| NFR-02 | Bao mat/phan quyen | Dat mot phan | JWT/bcrypt/role guard | Token localStorage |
| NFR-03 | On dinh | Dat mot phan | Error middleware | |
| NFR-04 | Mo rong | Dat mot phan | Module split | Chua migration framework |
| NFR-05 | De su dung/responsive | Dat mot phan | UI states co ban | Can test thuc te mobile |
| NFR-06 | Kiem toan | Dat | System logs | |
| KPI-01 | Flow mua den su dung | Dat | Demo script | |
| KPI-02 | Status nhat quan | Dat mot phan | Status lifecycle doc | |
| KPI-03 | Partner xac thuc voucher | Dat | Partner scan | |
| KPI-04 | Dashboard/report toi thieu | Dat | Admin/partner reports | |
| KPI-05 | Tai lieu hoc thuat | Dat | docs/*.md | |
| AC-01 | Du role chinh | Dat | Customer/Partner/Admin | |
| AC-02 | Du flow tao/duyet/mua/phat hanh/su dung | Dat | Demo script | |
| AC-03 | Status nhat quan | Dat mot phan | Status lifecycle | |
| AC-04 | Du lieu mau | Dat | `seed-data.sql` | |
| AC-05 | Lien he BRD va giai phap | Dat | Demo + acceptance docs | |

# Admin demo script

Tai khoan: `admin@voucherhub.vn` / `Admin@123`.

| Buoc | Man hinh/URL | Du lieu mau can chon | Ket qua mong doi | BRD lien quan |
| ---- | ------------ | -------------------- | ---------------- | ------------- |
| 1 | `/login` | Dang nhap admin | Dieu huong vao khu vuc admin | BR-01, BR-ADM-01 |
| 2 | `/admin` tab Tong quan | Xem KPI cards | Co users, partners, vouchers, orders, revenue, issued vouchers, top vouchers, revenue by day | BR-07, BR-ADM-06, KPI-04 |
| 3 | `/admin` tab Nguoi dung | `customer4@example.com` | Demo khoa/mo user inactive/active | BR-ADM-01, NFR-02 |
| 4 | `/admin` tab Doi tac | `partner.travel@example.com` | Duyet partner `PENDING` thanh `APPROVED` | BR-ADM-02 |
| 5 | `/admin` tab Doi tac | `partner.suspended@example.com` | Demo doi tac `SUSPENDED` | BR-ADM-02 |
| 6 | `/admin/vouchers` hoac tab Voucher | `Goi cham soc da Luxury Pending` | Duyet voucher pending | BR-ADM-03, RB-01 |
| 7 | `/admin/vouchers` hoac tab Voucher | `Set hai san gia soc Rejected` | Xem voucher rejected va rejection reason | BR-ADM-03 |
| 8 | `/admin` tab Orders | `DEMO-PAY-CUS5-PENDING` | Demo cancel order pending | BR-ADM-04, RB-11 |
| 9 | `/admin` tab Orders | order `PAID` tu seed | Demo refund mock neu UI cho phep | BR-ADM-04 |
| 10 | `/admin` tab Khieu nai | `Khong dung duoc voucher tai chi nhanh` | Complaint `PENDING`, admin cap nhat `IN_PROGRESS/RESOLVED` | DR-06, RB-12 |
| 11 | `/admin` tab Noi dung > Danh muc | `Giao duc` | Co category de sua/bat/tat | BR-ADM-05 |
| 12 | `/admin` tab Noi dung > Banners | Flash Sale/Spa/Du lich | Co banner de sua/bat/tat | BR-ADM-05 |
| 13 | `/admin` tab Noi dung > Trang chinh sach | `chinh-sach-hoan-tien`, `huong-dan-su-dung` | Admin cap nhat content page | BR-ADM-05, RB-14 |
| 14 | `/admin` tab Noi dung > Popups | `Khuyen mai gio vang`, `Chuong trinh da ket thuc` | Popup active va inactive/expired | BR-ADM-05 |
| 15 | `/admin` tab Nhat ky | `APPROVE_PARTNER`, `APPROVE_VOUCHER`, `UPDATE_COMPLAINT_STATUS`, `UPDATE_CONTENT` | Log co actor, entity, details, IP | RB-12, NFR-06 |

## Quick check truoc demo

1. Reset DB:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

2. Dang nhap admin `admin@voucherhub.vn`.
3. Neu dashboard trong, kiem tra backend log va dam bao `seed-data.sql` da chay sau `init.sql`.
4. Neu tab popup loi, reset DB de co bang `popups`.

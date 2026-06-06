# Vong doi trang thai he thong VoucherHub

Tai lieu nay tom tat cac trang thai chinh de demo KPI-02, AC-03 va cac rule RB-01 den RB-15.

## 1. User

| Trang thai | Y nghia | Xu ly |
| --- | --- | --- |
| `is_active = true` | Tai khoan dang hoat dong | Duoc dang nhap va dung token hop le |
| `is_active = false` | Tai khoan bi khoa | Backend chan dang nhap va token hien co |

Role hop le: `CUSTOMER`, `PARTNER`, `ADMIN`.

## 2. Partner

| Trang thai | Y nghia | Chuyen trang thai |
| --- | --- | --- |
| `PENDING` | Ho so doi tac cho admin duyet | `APPROVED` hoac `REJECTED` |
| `APPROVED` | Doi tac duoc tao voucher va scan voucher | `SUSPENDED` |
| `REJECTED` | Ho so bi tu choi | Can cap nhat/tao lai theo demo |
| `SUSPENDED` | Doi tac bi tam khoa | `APPROVED` khi admin mo lai |

Rule lien quan: BR-PAR-01, BR-ADM-02.

## 3. Voucher

| Trang thai | Y nghia | Rule |
| --- | --- | --- |
| `DRAFT` | Partner dang soan | Partner duoc sua |
| `PENDING_APPROVAL` | Cho admin duyet | Admin approve/reject |
| `APPROVED` | Duoc ban neu con thoi gian va stock | RB-01, RB-03, RB-04 |
| `REJECTED` | Bi tu choi | Partner duoc sua va gui lai |
| `SUSPENDED` | Admin tam dung | Khong ban/cong khai |
| `EXPIRED` | Het hieu luc nghiep vu | Khong ban |
| `SOLD_OUT` | Het so luong | Khong ban |

Gia ban phai nho hon gia goc: RB-02. Stock khong duoc am: RB-11, RB-15.

## 4. Order

| Trang thai | Y nghia | Chuyen trang thai |
| --- | --- | --- |
| `PENDING` | Don moi tao, chua thanh toan | `PAID` hoac `CANCELLED` |
| `PAID` | Thanh toan mock thanh cong | Phat hanh voucher code |
| `CANCELLED` | Don bi huy truoc thanh toan | Khong phat hanh code |
| `REFUNDED` | Don da thanh toan duoc hoan tien mock | Issued voucher lien quan bi `CANCELLED` |

Rule lien quan: RB-05, RB-13, RB-14.

## 5. Issued voucher

| Trang thai | Y nghia | Chuyen trang thai |
| --- | --- | --- |
| `UNUSED` | Code da phat hanh, chua dung | `USED`, `EXPIRED`, `CANCELLED` |
| `USED` | Da duoc partner scan/xac nhan | Khong duoc dung lai |
| `EXPIRED` | Het han su dung | Khong duoc dung |
| `CANCELLED` | Bi huy do refund/cancel | Khong duoc dung |

Partner chi scan code cua voucher thuoc partner va dung chi nhanh ap dung: RB-07, RB-08, RB-09.

## 6. Complaint

| Trang thai | Y nghia | Chuyen trang thai |
| --- | --- | --- |
| `PENDING` | Khach moi gui khieu nai | `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| `IN_PROGRESS` | Admin dang xu ly | `RESOLVED` hoac `REJECTED` |
| `RESOLVED` | Da xu ly va co phan hoi | Ket thuc |
| `REJECTED` | Tu choi xu ly va co ly do | Ket thuc |

Complaint phuc vu BR-CUS-08 va DR-06.

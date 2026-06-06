# Demo accounts

Tat ca password da duoc hash bang bcrypt trong seed SQL.

| Role | Email | Password | Du lieu co san de demo |
| ---- | ----- | -------- | ---------------------- |
| ADMIN | `admin@voucherhub.vn` | `Admin@123` | Dashboard, user/partner/voucher/order/complaint/content/popup/log |
| ADMIN cu | `admin@vouchersystem.com` | `Admin@123` | Account admin mac dinh tu `init.sql`, van dung duoc |
| CUSTOMER | `customer1@example.com` | `Customer@123` | Co order paid, issued voucher `UNUSED` code `VCH-2026-A8F2K9` |
| CUSTOMER | `customer2@example.com` | `Customer@123` | Co issued voucher `USED`, co review va partner reply |
| CUSTOMER | `customer3@example.com` | `Customer@123` | Co issued voucher va complaint demo |
| CUSTOMER | `customer4@example.com` | `Customer@123` | User inactive de admin demo khoa/mo tai khoan |
| CUSTOMER | `customer5@example.com` | `Customer@123` | Co order `PENDING` va `CANCELLED` |
| PARTNER | `partner.food@example.com` | `Partner@123` | Partner `APPROVED`, co voucher approved/pending/rejected/suspended/expired, co branch scan |
| PARTNER | `partner.beauty@example.com` | `Partner@123` | Partner `APPROVED`, co voucher approved/pending/rejected/suspended/expired |
| PARTNER | `partner.travel@example.com` | `Partner@123` | Partner `PENDING`, dung demo admin duyet partner |
| PARTNER | `partner.suspended@example.com` | `Partner@123` | Partner `SUSPENDED`, dung demo khoa/mo doi tac |

## Reset DB va seed lai

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

Neu can seed thu cong:

```bash
docker exec -i voucher_db psql -U voucheruser -d voucherdb < backend/src/config/init.sql
docker exec -i voucher_db psql -U voucheruser -d voucherdb < backend/src/config/seed-data.sql
```

## Du lieu admin nen thay sau seed

- Users: tren 10 user, co customer active/inactive, partner, admin.
- Partners: co `APPROVED`, `PENDING`, `SUSPENDED`.
- Vouchers: co `APPROVED`, `PENDING_APPROVAL`, `REJECTED`, `SUSPENDED`, `EXPIRED`, `SOLD_OUT`.
- Orders: co `PENDING`, `PAID`, `CANCELLED`, `REFUNDED` tu seed tong hop va demo accounts.
- Issued vouchers: co `UNUSED`, `USED`, `EXPIRED`, `CANCELLED`.
- Complaints: co `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`.
- Content: categories, banners, content pages, popup active va popup expired/inactive.
- Logs: nhieu action cho admin audit.

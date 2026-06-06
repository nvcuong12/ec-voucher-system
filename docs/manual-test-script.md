# Manual test script truoc demo

## Lenh chay

```bash
docker compose up --build
```

Backend: `http://localhost:5001`  
Frontend: `http://localhost:3000`

## Tai khoan demo

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@vouchersystem.com` | `Admin@123` |
| Customer | `customer@vouchersystem.com` | `Customer@123` |
| Customer seed | `customer1@vouchersystem.com` | `Customer@123` |
| Partner | `partner@vouchersystem.com` | `Customer@123` |
| Partner seed | `partner2@vouchersystem.com` | `Customer@123` |

## Checklist 20 phut

1. Login admin, mo dashboard, xem tong quan/top voucher/revenue/log.
2. Login partner, tao voucher moi va gui duyet.
3. Login admin, duyet voucher vua tao.
4. Login customer, search voucher bang navbar va filter.
5. Xem detail, them cart, checkout, pay mock.
6. Vao My Vouchers, kiem tra code va QR mock.
7. Login partner, vao scan, chon dung branch va scan code.
8. Customer tao review hoac complaint.
9. Admin vao tab Khieu nai, xu ly complaint.
10. Admin vao Logs, xac nhan co log quan trong.

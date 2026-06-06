# Huong dan cai dat va chay du an

## Yeu cau moi truong

- Docker Desktop.
- Node.js 20 neu chay rieng frontend/backend.
- PostgreSQL chi can khi khong dung Docker.

## Chay bang Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

URL:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- Health: `http://localhost:5001/health`

## Reset database seed

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

Neu can seed thu cong:

```bash
docker exec -i voucher_db psql -U voucheruser -d voucherdb < backend/src/config/init.sql
docker exec -i voucher_db psql -U voucheruser -d voucherdb < backend/src/config/seed-data.sql
```

## Chay rieng

```bash
npm install --prefix backend
npm install --prefix frontend
npm run dev --prefix backend
npm start --prefix frontend
```

## Build/test

```bash
npm run build --prefix frontend
npm test --prefix backend -- --runInBand
```

## Tai khoan demo

| Role | Email/Phone | Password | Muc dich demo |
| ---- | ----------- | -------- | ------------- |
| ADMIN | `admin@voucherhub.vn` | `Admin@123` | Dashboard, user, partner, voucher, order, complaint, content/popup, audit log |
| CUSTOMER 1 | `customer1@example.com` | `Customer@123` | Co order paid va issued voucher `UNUSED` |
| CUSTOMER 2 | `customer2@example.com` | `Customer@123` | Co issued voucher `USED`, review va partner reply |
| CUSTOMER 4 | `customer4@example.com` | `Customer@123` | Tai khoan inactive de admin demo khoa/mo |
| PARTNER FOOD | `partner.food@example.com` | `Partner@123` | Partner approved, co voucher va branch scan |
| PARTNER BEAUTY | `partner.beauty@example.com` | `Partner@123` | Partner approved, co voucher pending/rejected/suspended |
| PARTNER PENDING | `partner.travel@example.com` | `Partner@123` | Partner pending de admin duyet |

Xem day du tai `docs/demo-accounts.md`. Seed data bao gom partner `PENDING/APPROVED/SUSPENDED`, voucher `DRAFT/PENDING_APPROVAL/APPROVED/REJECTED/SUSPENDED/EXPIRED`, order `PENDING/PAID/CANCELLED/REFUNDED`, issued voucher `UNUSED/USED/EXPIRED/CANCELLED`, complaint `PENDING/IN_PROGRESS/RESOLVED/REJECTED`, popup active/expired va system logs.

## Loi thuong gap

- Thieu `react-icons`: chay `npm install --prefix frontend`.
- Port 3000/5001 bi trung: dung service dang chiem port hoac doi mapping Docker.
- DB khong cap nhat schema: chay reset database voi `docker compose down -v`.
- Backend khong ket noi DB: kiem tra `DATABASE_URL` va container `voucher_db`.

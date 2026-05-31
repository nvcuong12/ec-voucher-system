# Auth & Profile smoke tests (curl)

Defaults:
- Backend URL: http://localhost:5000
- Replace <PORT> if your server runs on a different port.

1) Register (happy path)
```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hoang.test+1@example.com","password":"P@ssw0rd1","full_name":"Hoang Test"}' | jq
```

2) Register (duplicate email)
```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hoang.test+1@example.com","password":"P@ssw0rd1","full_name":"Hoang Test"}' | jq
```

3) Login
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hoang.test+1@example.com","password":"P@ssw0rd1"}' | jq
```

4) Use returned token to call /me
```bash
TOKEN="<PASTE_TOKEN_HERE>"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/me | jq
```

5) Get profile
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users/profile | jq
```

6) Update profile
```bash
curl -s -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Hoang Updated","phone":"0901234567"}' | jq
```

Notes:
- The commands use `jq` to pretty-print JSON; install it or remove the `| jq` suffix.
- Expected behavior:
  - Register returns `{ token, user }` (201) or an error with standardized shape.
  - Login returns `{ token, user }` (200) or an error.
  - Protected endpoints return `401`/`403` as appropriate with `{ error: { code, message, traceId } }`.

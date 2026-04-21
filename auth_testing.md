# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session (MongoDB)
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'admin+test@poutrecs.com',
  name: 'Admin Test',
  picture: 'https://via.placeholder.com/150',
  is_admin: true,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Backend API (use REACT_APP_BACKEND_URL)
```
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer <session_token>"
curl -X GET "$API_URL/api/admin/stats" -H "Authorization: Bearer <session_token>"
curl -X GET "$API_URL/api/registrations" -H "Authorization: Bearer <session_token>"
curl -X GET "$API_URL/api/orders" -H "Authorization: Bearer <session_token>"
```

## Step 3: Browser
```
await page.context.add_cookies([{
  "name": "session_token", "value": "<session_token>",
  "domain": "<host>", "path": "/", "httpOnly": True, "secure": True, "sameSite": "None"
}])
await page.goto("<URL>/admin")
```

## Notes
- `ALLOW_ALL_ADMINS = True` in /app/backend/server.py (MVP) — any authenticated Google user can access admin
- Domain allowlist: ADMIN_ALLOWLIST set in /app/backend/server.py

# bcrypt Version Compatibility Issue - FIXED ✅

**Date:** November 5, 2025  
**Issue:** Login failing with "password cannot be longer than 72 bytes" error  
**Root Cause:** bcrypt 5.0.0 incompatible with passlib 1.7.4  
**Solution:** Downgrade bcrypt to 4.x

---

## The Problem

When trying to log in, users got this error:

```json
{
  "error": "Bad Request",
  "detail": "password cannot be longer than 72 bytes, truncate manually if necessary"
}
```

This was misleading because:

- The actual password ("password123") is only 11 bytes
- The password hashes were correct
- The issue was a **library version incompatibility**

---

## Root Cause

bcrypt 5.0.0 removed the `__about__` attribute that passlib 1.7.4 expects:

```python
# passlib trying to check bcrypt version:
version = _bcrypt.__about__.__version__
# AttributeError: module 'bcrypt' has no attribute '__about__'
```

This caused passlib to fail with a misleading error message about password length.

---

## The Fix

**Downgrade bcrypt to version 4.x:**

```bash
cd api
source venv/bin/activate
pip install "bcrypt<5.0.0"
```

**Update `requirements.txt`:**

```python
passlib[bcrypt]==1.7.4
bcrypt<5.0.0  # Must be <5.0.0 for passlib 1.7.4 compatibility
```

---

## Verification

After the fix, login works correctly:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@spendsense.com","password":"password123"}'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "operator": {
    "operator_id": "op_001",
    "name": "Jane Doe",
    "email": "jane.doe@spendsense.com",
    "role": "senior"
  }
}
```

✅ Login now works with all test accounts!

---

## Test Accounts

| Email                       | Password      | Role   |
| --------------------------- | ------------- | ------ |
| `jane.doe@spendsense.com`   | `password123` | Senior |
| `john.smith@spendsense.com` | `password123` | Junior |
| `admin@spendsense.com`      | `admin123`    | Admin  |

---

## Prevention

The `requirements.txt` has been updated with:

```
bcrypt<5.0.0  # Must be <5.0.0 for passlib 1.7.4 compatibility
```

This pins bcrypt to version 4.x and prevents this issue from happening again.

---

## Alternative Solutions

If this happens again in the future, you could also:

1. **Upgrade passlib** (if a newer version supports bcrypt 5.x)

   ```bash
   pip install passlib --upgrade
   ```

2. **Use bcrypt directly** instead of passlib (requires code changes)

   ```python
   import bcrypt
   bcrypt.checkpw(password.encode(), hash.encode())
   ```

3. **Pin both versions** in requirements.txt
   ```
   bcrypt==4.3.0
   passlib==1.7.4
   ```

---

## Related Files

- `/api/requirements.txt` - Updated with bcrypt version constraint
- `/api/auth.py` - Password verification uses passlib + bcrypt
- `/Docs/JWT_AUTHENTICATION_IMPLEMENTATION.md` - Main auth documentation

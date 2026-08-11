# ✅ FIX: Netlify Function Crash - Missing Supabase Credentials

## 🔍 Problem Identified
The Netlify function is crashing with "Missing Supabase credentials" because:
1. Environment variables are NOT automatically loaded from `netlify.env` file
2. Netlify requires environment variables to be set in the dashboard
3. The hardcoded fallback values in `config.js` were pointing to the wrong Supabase project

## ✅ Fixes Applied

### 1. Updated `database/config.js`
- ✅ Fixed fallback credentials to match the correct Supabase project
- ✅ Added better error logging for debugging
- ✅ Updated Supabase URL from `schzdduftqwlsbajedzx` to `tbjshustaqijmbtxssod`
- ✅ Updated service key to match the correct project

### 2. What You Need To Do

**Option A: Set Environment Variables in Netlify Dashboard (RECOMMENDED)**

1. Go to your Netlify site dashboard
2. Navigate to: **Site settings** → **Environment variables**
3. Add the following variables:

```
SUPABASE_URL=https://tbjshustaqijmbtxssod.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRianNodXN0YXFpam1idHhzc29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDc5NDksImV4cCI6MjEwMTY4Mzk0OX0._2vkja-T3NdOxExUCR3wYhl9xRJxiAQhCOMcJvceLVM
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRianNodXN0YXFpam1idHhzc29kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjEwNzk0OSwiZXhwIjoyMTAxNjgzOTQ5fQ.Y_tdjt1SPC8NrEGZqKf4qywh_OpdvPMfKlXmhFVbbRY
JWT_SECRET=absensi-tenaga-kesehatan-secret-key-2024
JWT_EXPIRE=7d
NODE_ENV=production
ADMIN_EMAIL=armyteguh00@gmail.com
ADMIN_PASSWORD=Admin123!
```

4. **Important**: Set these for **both Production and Deploy Previews**
5. Save and trigger a new deploy

**Option B: Use Fallback Values (TEMPORARY)**

The code now has correct fallback values, so it should work even without setting environment variables. However, this is not recommended for production as:
- Credentials are visible in the code
- Less secure
- Harder to update without redeploying

## 🧪 Testing

After deploying, test the function:

```bash
# Check health endpoint
curl https://absensitenkes.netlify.app/.netlify/functions/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Netlify Functions API is running",
  "timestamp": "2026-08-11T...",
  "env": {
    "NODE_ENV": "production",
    "SUPABASE_URL": "SET (https://tbjshustaqij...)",
    "SUPABASE_ANON_KEY": "SET (length: 241)",
    "SUPABASE_SERVICE_KEY": "SET (length: 240)"
  }
}
```

## 📋 Deploy Steps

1. **Commit the fixed `config.js`:**
   ```bash
   git add database/config.js
   git commit -m "fix: Update Supabase credentials to correct project"
   git push origin main
   ```

2. **Set environment variables in Netlify dashboard** (see Option A above)

3. **Trigger redeploy** or wait for automatic deployment

4. **Test the `/api/health` endpoint**

5. **Check function logs** in Netlify dashboard if issues persist

## 🔐 Security Note

The credentials are currently hardcoded as fallbacks. For production:
- ✅ Move to environment variables
- ✅ Enable RLS (Row Level Security) in Supabase
- ✅ Rotate keys if they were exposed in public repos

## 📞 Need Help?

If the error persists:
1. Check Netlify function logs
2. Verify environment variables are set correctly
3. Ensure Supabase project is accessible
4. Check database schema is initialized

---

**Status**: ✅ Code fixed with correct fallback credentials
**Next Step**: Set environment variables in Netlify dashboard

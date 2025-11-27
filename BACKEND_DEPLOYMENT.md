# 🚀 Quick Backend Deployment Guide - Railway

Your frontend is deployed on Vercel but **backend needs to be deployed separately**.

## **Step 1: Deploy Backend to Railway (5 minutes)**

### A. Go to Railway
- Visit https://railway.app
- Sign in with GitHub

### B. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Search and select `punam06/waste_management_db`
- Click "Deploy"

### C. Configure PHP Service
Railway auto-detects PHP. It will:
- Build your backend automatically
- Give you a public URL

### D. Get Your Backend URL
- In Railway dashboard, go to your project
- Find the service
- Copy the public URL (looks like: `https://waste-backend-prod.railway.app`)

---

## **Step 2: Add Database to Railway**

### A. Create MySQL Database
- In Railway, click "New"
- Select "MySQL"
- It will create a database automatically

### B. Get Database Credentials
Railway will show you:
```
Host: containers-us-west-xxx.railway.app
User: root
Password: xxxxx
Database: railway
Port: 3306
```

### C. Update Backend Config
Edit `backend/config/Database.php`:
```php
private $host = 'containers-us-west-xxx.railway.app';
private $user = 'root';
private $password = 'xxxxx';
private $database = 'railway';  // or wasteManagement after importing
private $port = 3306;
```

### D. Import Database Schema
```bash
mysql -h containers-us-west-xxx.railway.app -u root -p < create_waste_management_db.sql
```

---

## **Step 3: Update Frontend Environment**

Go to **Vercel Dashboard**:
1. Select your project
2. Settings → Environment Variables
3. Update `VITE_API_BASE_URL`:
   ```
   https://waste-backend-prod.railway.app
   ```
4. Save and Vercel auto-redeploys ✅

---

## **Step 4: Test Connection**

In browser console (F12):
```javascript
fetch('https://waste-backend-prod.railway.app/areas')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should return area data! ✅

---

## **Expected Result**

After these steps:
- ✅ Frontend works on Vercel
- ✅ Backend works on Railway
- ✅ Database connected to Railway
- ✅ Create/Edit/Delete functions working

**Your app will be fully functional!** 🎉

---

## **Alternative: Quick Heroku Setup**

If you prefer Heroku:
1. Create account at https://heroku.com
2. Install Heroku CLI: `brew tap heroku/brew && brew install heroku`
3. Login: `heroku login`
4. Create app: `heroku create your-app-name`
5. Push: `git push heroku main`
6. Add database: `heroku addons:create jawsdb:kitefin`
7. Get URL from dashboard

---

**Which backend option do you want to use? Railway is easiest!**

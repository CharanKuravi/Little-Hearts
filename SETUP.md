# 🚀 Quick Setup Guide

## ✅ Current Status

Your Blood Bank application is now **fully connected to MongoDB Atlas** and ready to use!

### What's Been Done

1. ✅ **MongoDB Atlas Connected** - Database URI configured in `server/.env`
2. ✅ **Database Seeded** - 12 demo users, 6 blood requests, and 5 donations created
3. ✅ **All Pages Converted to API** - Frontend now uses MongoDB instead of localStorage
4. ✅ **Loading States Added** - Smooth loading indicators on all pages
5. ✅ **Error Handling** - Proper error messages for failed API calls
6. ✅ **Servers Running** - Both backend and frontend are live

## 🌐 Access the Application

**Frontend:** http://localhost:5174  
**Backend API:** http://localhost:5000

## 🔑 Login Credentials

Use any of these demo accounts:

| Name | Phone | Password | Blood Type | City |
|------|-------|----------|------------|------|
| John Smith | +1234567890 | demo123 | O+ | New York |
| Emma Johnson | +1234567891 | demo123 | A+ | Los Angeles |
| Michael Brown | +1234567892 | demo123 | B+ | Chicago |
| Sarah Davis | +1234567893 | demo123 | AB+ | Houston |
| James Wilson | +1234567894 | demo123 | O- | Phoenix |
| Emily Martinez | +1234567895 | demo123 | A- | Philadelphia |
| David Anderson | +1234567896 | demo123 | B- | San Antonio |
| Olivia Taylor | +1234567897 | demo123 | AB- | San Diego |
| Daniel Thomas | +1234567898 | demo123 | O+ | Dallas |
| Sophia Moore | +1234567899 | demo123 | A+ | San Jose |
| Matthew Jackson | +1234567800 | demo123 | B+ | Austin |
| Isabella White | +1234567801 | demo123 | O- | Jacksonville |

## 🎯 Test the Features

### 1. Login
- Go to http://localhost:5174
- Click "Sign In"
- Use phone: `+1234567890` and password: `demo123`

### 2. Browse Donors
- Navigate to "Find Donors"
- Filter by blood type (e.g., O+)
- Filter by city (e.g., New York)
- Click "Contact Donor" to call

### 3. View Blood Requests
- Navigate to "Blood Requests"
- See all open requests
- Filter by blood type, urgency, or city
- Click "I Can Donate" to respond

### 4. Post a Request
- Click "Post a Request" button
- Fill in blood type, urgency, units needed
- Add hospital and city
- Submit to create a new request

### 5. Dashboard
- View your statistics
- See active requests
- Track your donations
- Manage your requests

## 🔄 Restart Servers

If you need to restart the servers:

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

## 🗄️ Re-seed Database

If you want to reset the database with fresh demo data:

```bash
cd server
npm run seed
```

This will:
- Clear all existing data
- Create 12 new demo users
- Create 6 blood requests
- Add sample donations and responses

## 📊 MongoDB Atlas Dashboard

You can view your data directly in MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Login with your credentials
3. Navigate to your cluster
4. Click "Browse Collections"
5. View the `bloodbank` database

## 🛠️ API Endpoints

All endpoints are available at `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

### Users
- `GET /users/donors` - Search donors
- `GET /users/stats` - Platform stats
- `GET /users/:id` - Get user by ID

### Blood Requests
- `GET /requests` - Get all requests
- `POST /requests` - Create request
- `GET /requests/:id` - Get request details
- `GET /requests/my` - Get my requests
- `POST /requests/:id/respond` - Respond to request
- `PUT /requests/:id` - Update request status

### Donations
- `POST /donations` - Record donation
- `GET /donations/my` - Get my donations
- `GET /donations/stats` - Donation stats

## 🎨 Design Features

The app uses authentic iOS/macOS design:
- **SF Pro fonts** (via Inter fallback)
- **Apple system colors** (#FF3B30 red, #007AFF blue, etc.)
- **Frosted glass effects** with backdrop blur
- **Smooth animations** (180ms transitions)
- **Exact Apple radius values** (6px, 10px, 13px, 16px, 20px, 28px)

## 🐛 Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" error:

**Windows:**
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

**Mac/Linux:**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Issues
- Check your internet connection
- Verify the MongoDB URI in `server/.env`
- Ensure your IP is whitelisted in MongoDB Atlas

### Frontend Not Loading
- Clear browser cache
- Check browser console for errors
- Ensure backend is running on port 5000

## 📝 Next Steps

1. **Customize the app** - Update colors, fonts, or layout
2. **Add features** - Implement notifications, chat, or maps
3. **Deploy** - Host on Vercel (frontend) and Railway/Render (backend)
4. **Secure** - Add rate limiting, input validation, and HTTPS

## 🎉 You're All Set!

Your Blood Bank application is fully functional and connected to MongoDB Atlas. Start exploring and testing all the features!

For more details, see the main [README.md](README.md) file.

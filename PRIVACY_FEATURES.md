# 🔒 Privacy & Connection System - Instagram-Style

## ✅ NEW FEATURES ADDED!

Your Blood Bank app now has **Instagram-style privacy** where users' personal information stays hidden until they accept connection requests!

---

## 🔐 Privacy Features

### What's Hidden by Default?

When viewing donors, the following information is **HIDDEN** until you connect:

- ❌ **Phone Number** - Cannot see or call
- ❌ **City/Location** - Shows "Location hidden"
- ❌ **Email Address** - Not visible
- ❌ **Aadhar Number** - Never shown to anyone

### What's Always Visible?

- ✅ **Name** - Public
- ✅ **Blood Type** - Public
- ✅ **Age** - Public
- ✅ **Total Donations** - Public
- ✅ **Bio** - Public
- ✅ **Availability Status** - Public

---

## 🤝 Connection Request System

### How It Works (Like Instagram)

1. **Browse Donors** → See public profiles
2. **Request to Connect** → Click "🤝 Request to Connect" button
3. **Wait for Approval** → Status shows "⏳ Request Pending"
4. **Get Accepted** → Now you can see phone & location
5. **Contact Donor** → Call button appears!

### User Flow

```
Donor A (Needs Blood)
    ↓
Views Donor B's Profile
    ↓
Sees: Name, Blood Type, Age, Bio
Hidden: Phone, City
    ↓
Clicks "Request to Connect"
    ↓
Donor B Gets Notification
    ↓
Donor B Accepts/Rejects
    ↓
If Accepted: Donor A can now see phone & call
```

---

## 📱 Where to Use

### 1. **Find Donors Page**

**Location:** http://localhost:5174/donors

**What You See:**
- List of all available donors
- Public info visible
- Phone & city hidden (shows "🔒 Phone hidden until connected")

**Actions:**
- **If Not Connected:** "🤝 Request to Connect" button (blue)
- **If Pending:** "⏳ Request Pending" badge (orange)
- **If Connected:** "📞 Contact Donor" button (red) + phone visible

### 2. **Connection Requests Page**

**Location:** http://localhost:5174/connections

**Two Tabs:**

#### Tab 1: Requests (Pending)
- Shows people who want to connect with you
- See their name, blood type, donations
- **Actions:**
  - ✅ **Accept** - Grant access to your phone & location
  - ❌ **Reject** - Deny the request

#### Tab 2: Connected
- Shows all your accepted connections
- See their full info (phone, city, email)
- **Actions:**
  - 📞 **Call** - Direct phone call
  - **Remove** - Disconnect

### 3. **Navbar Notification**

**Location:** Top right of navbar (when logged in)

- 👥 Icon with red badge showing pending count
- Click to go to Connections page
- Updates every 30 seconds automatically

---

## 🎯 Complete User Journey

### Scenario: You Need O+ Blood

1. **Login** to your account
2. **Go to "Find Donors"**
3. **Filter** by blood type: O+
4. **Browse** available donors
5. **See** public profiles (name, age, donations)
6. **Notice** phone is hidden: "🔒 Phone hidden until connected"
7. **Click** "🤝 Request to Connect" on a donor
8. **Wait** for them to accept (status shows "⏳ Request Pending")
9. **Get Notified** when they accept (badge in navbar)
10. **Go to Connections** page
11. **See** donor in "Connected" tab with full info
12. **Click** "📞 Call" to contact them
13. **Done!** You can now coordinate blood donation

---

## 🔒 Security & Privacy

### What's Protected?

1. **Phone Numbers** - Only visible to connected users
2. **Location/City** - Only visible to connected users
3. **Email** - Only visible to connected users
4. **Aadhar** - NEVER shown to anyone (stored securely)

### Who Can See What?

| Information | Public | Connected | Owner |
|-------------|--------|-----------|-------|
| Name | ✅ | ✅ | ✅ |
| Blood Type | ✅ | ✅ | ✅ |
| Age | ✅ | ✅ | ✅ |
| Bio | ✅ | ✅ | ✅ |
| Donations | ✅ | ✅ | ✅ |
| Phone | ❌ | ✅ | ✅ |
| City | ❌ | ✅ | ✅ |
| Email | ❌ | ✅ | ✅ |
| Aadhar | ❌ | ❌ | ✅ |

---

## 📋 Updated Registration

### New Required Fields

When registering, you now need:

1. **Name** - Full name (required)
2. **Phone** - Mobile number (required, unique, used for login)
3. **Aadhar** - 12-digit Aadhar number (required, unique, secure)
4. **Password** - Min 6 characters (required)
5. **Blood Type** - Select from dropdown (required)
6. **Role** - Donor/Recipient/Both (required)
7. **City** - Optional
8. **Age** - Optional (18-65)

### Aadhar Validation

- ✅ Must be exactly 12 digits
- ✅ Must be unique (no duplicates)
- ✅ Stored securely in database
- ✅ Never shown to other users
- ✅ Used for identity verification

---

## 🎨 UI Elements

### Connection Status Badges

**Not Connected:**
```
[🤝 Request to Connect] (Blue button)
🔒 Phone hidden until connected (Gray text)
```

**Pending:**
```
[⏳ Request Pending] (Orange badge)
```

**Connected:**
```
[🤝 Connected] (Blue badge)
[📞 Contact Donor] (Red button with phone)
```

### Navbar Notification

```
[👥] with red badge showing count
Example: [👥 3] means 3 pending requests
```

---

## 🔌 API Endpoints

### Connection Management

```bash
# Send connection request
POST /api/connections/request/:userId
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, status: "pending" }

# Accept/Reject request
PUT /api/connections/respond/:userId
Headers: { Authorization: "Bearer <token>" }
Body: { status: "accepted" | "rejected" }
Response: { success: true, status: "accepted" }

# Get pending requests
GET /api/connections/requests
Headers: { Authorization: "Bearer <token>" }
Response: [{ _id, user: {...}, createdAt }]

# Get connected users
GET /api/connections/list
Headers: { Authorization: "Bearer <token>" }
Response: [{ _id, name, phone, bloodType, city, ... }]

# Check connection status
GET /api/connections/status/:userId
Headers: { Authorization: "Bearer <token>" }
Response: { status: "pending" | "accepted" | null, isRequester: true }

# Remove connection
DELETE /api/connections/:userId
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, message: "Connection removed" }
```

### Updated Auth

```bash
# Register (now requires aadhar)
POST /api/auth/register
Body: {
  name: "John Doe",
  phone: "+919876543210",
  aadhar: "123456789012",
  password: "password123",
  bloodType: "O+",
  role: "donor",
  city: "Mumbai",
  age: 28
}
```

---

## 🧪 Test the Privacy System

### Test 1: View Hidden Info

1. **Logout** if logged in
2. **Go to** "Find Donors"
3. **Notice** phone numbers are NOT visible
4. **See** "🔒 Phone hidden until connected"
5. ✅ Privacy working!

### Test 2: Send Connection Request

1. **Login** as User A (+1234567890)
2. **Go to** "Find Donors"
3. **Click** "🤝 Request to Connect" on User B
4. **See** status change to "⏳ Request Pending"
5. ✅ Request sent!

### Test 3: Accept Request

1. **Logout** and **login** as User B (+1234567891)
2. **See** notification badge in navbar (👥 1)
3. **Click** notification → Go to Connections
4. **See** User A in "Requests" tab
5. **Click** "✅ Accept"
6. **See** User A move to "Connected" tab
7. **See** User A's phone number now visible
8. ✅ Connection accepted!

### Test 4: Call Connected User

1. **Still logged in** as User B
2. **In "Connected" tab**, find User A
3. **Click** "📞 Call" button
4. **Phone dialer** opens with User A's number
5. ✅ Can now contact!

### Test 5: Remove Connection

1. **Click** "Remove" on User A
2. **Confirm** removal
3. **User A** disappears from Connected list
4. **Go to** "Find Donors"
5. **Find** User A again
6. **See** phone is hidden again
7. ✅ Privacy restored!

---

## 📊 Database Schema

### User Model (Updated)

```javascript
{
  name: String,
  phone: String (unique),
  aadhar: String (unique, 12 digits),
  email: String,
  password: String (hashed),
  bloodType: String,
  role: String,
  city: String,
  age: Number,
  bio: String,
  isAvailable: Boolean,
  totalDonations: Number,
  lastDonated: Date,
  
  // NEW: Connections array
  connections: [{
    user: ObjectId (ref: User),
    status: String (pending/accepted/rejected),
    requestedBy: ObjectId (ref: User),
    createdAt: Date
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Summary

**YES! Privacy system fully implemented!**

### ✅ What's Working:

- Phone numbers hidden until connected
- City/location hidden until connected
- Connection request system (like Instagram)
- Accept/reject requests
- Notification badge in navbar
- Aadhar number required for registration
- Aadhar stored securely (never shown)
- Public profiles with limited info
- Full profiles for connected users
- Remove connections anytime

### 🎯 User Experience:

1. **Browse** donors safely (no personal info exposed)
2. **Request** to connect when you find a match
3. **Wait** for approval
4. **Get access** to phone & location when accepted
5. **Contact** donor directly
6. **Remove** connection anytime

---

**Status:** ✅ PRIVACY SYSTEM FULLY IMPLEMENTED  
**Style:** Instagram-like connection requests  
**Security:** Phone & location hidden until connected  
**Auth:** Aadhar number required for registration  

🎉 **Your Blood Bank app now has enterprise-level privacy protection!**

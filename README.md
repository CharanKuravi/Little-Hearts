# 🩸 LifeLink - Blood Bank Management Platform

A modern, full-stack blood bank management system built with the MERN stack, featuring iOS/macOS design language, Instagram-style privacy controls, and comprehensive admin monitoring.

![Blood Bank Platform](client/src/assets/hero.png)

## ✨ Features

### 🔐 Authentication & Privacy
- **Username-based login** (not phone numbers)
- Instagram-style connection request system
- Phone numbers and locations hidden until users connect
- Aadhar verification for identity
- JWT-based secure authentication

### 🩸 Blood Management
- **Donor Search** with filters (blood type, city, availability)
- **Blood Request System** with urgency levels (Critical, Urgent, Normal)
- Real-time donor-recipient matching
- Donation history tracking
- Request fulfillment tracking

### 🤝 Connection System
- Send connection requests to donors
- Accept/reject incoming requests
- View sent, received, and connected users
- Privacy-first: contact info revealed only after connection

### 🛡️ Admin Panel
- Real-time platform statistics
- User management (search, filter, delete)
- Blood request monitoring
- Activity logs (15+ action types tracked)
- Blood type distribution analytics
- Request urgency breakdown

### 🎨 Design
- **iOS/macOS Design Language**
  - SF Pro typography
  - Apple system colors
  - Frosted glass effects (blur + saturate)
  - Precise border radius values
  - Smooth animations
- **No Emojis** - Professional icons from Lucide React
- **Responsive** - Works on desktop, tablet, and mobile
- **Accessible** - WCAG compliant

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/churanikanth/Little-Hearts.git
   cd Little-Hearts
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/bloodbank
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

4. **Seed the database** (optional - adds demo data)
   ```bash
   cd server
   node seed.js
   ```

5. **Start the servers**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 🔑 Demo Credentials

After seeding the database, you can login with:

| Username | Password | Role |
|----------|----------|------|
| john | password123 | Donor |
| emma | password123 | Donor |
| michael | password123 | Donor |
| sarah | password123 | Donor |

To create an admin user, update a user in MongoDB:
```javascript
db.users.updateOne(
  { username: "john" },
  { $set: { role: "admin" } }
)
```

---

## 📁 Project Structure

```
Little-Hearts/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/           # Axios configuration
│   │   ├── components/    # Reusable UI components
│   │   │   ├── layout/    # Navbar, Footer
│   │   │   └── ui/        # Button, Card, Input, etc.
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── assets/        # Images, icons
│   └── package.json
│
├── server/                # Express + MongoDB backend
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── BloodRequest.js
│   │   ├── Donation.js
│   │   └── ActivityLog.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── requests.js
│   │   ├── donations.js
│   │   ├── connections.js
│   │   └── admin.js
│   ├── middleware/       # Auth, logging
│   ├── seed.js          # Database seeding
│   └── package.json
│
└── Documentation/        # Comprehensive guides
    ├── ADMIN_PANEL_GUIDE.md
    ├── USERNAME_LOGIN_UPDATE.md
    ├── EMOJI_REMOVAL_SUMMARY.md
    └── LATEST_UPDATES.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS Variables** - Theming

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### Users
- `GET /api/users/donors` - Get all donors (with filters)
- `GET /api/users/:id` - Get user by ID

### Blood Requests
- `GET /api/requests` - Get all requests (with filters)
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `POST /api/requests/:id/respond` - Respond to request

### Connections
- `POST /api/connections/request/:userId` - Send connection request
- `PUT /api/connections/respond/:userId` - Accept/reject request
- `GET /api/connections/requests` - Get pending requests
- `GET /api/connections/list` - Get connected users
- `GET /api/connections/status/:userId` - Check connection status
- `DELETE /api/connections/:userId` - Remove connection

### Admin (Protected)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/requests` - Request monitoring
- `GET /api/admin/logs` - Activity logs
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/requests/:id` - Delete request

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured for specific origin
- **Input Validation** - Mongoose schema validation
- **SQL Injection Prevention** - MongoDB parameterized queries
- **XSS Protection** - React's built-in escaping
- **Privacy Controls** - Data hidden until connection
- **Activity Logging** - Complete audit trail
- **Role-Based Access** - Admin-only routes

---

## 🎯 Key Features Explained

### Instagram-Style Privacy
- Phone numbers and cities are hidden by default
- Users must send connection requests
- Recipients can accept or reject
- Contact info revealed only after acceptance
- Similar to Instagram's follow request system

### Username Login
- Users login with username (not phone)
- Usernames are unique and case-insensitive
- 3-20 characters length
- More professional than phone-based login

### Admin Panel
- Real-time monitoring dashboard
- User and request management
- Activity logging (15+ action types)
- Blood type distribution charts
- Request urgency analytics
- IP address tracking

### macOS Design
- SF Pro font family
- Apple system colors (#FF3B30, #007AFF, etc.)
- Frosted glass navigation (blur + saturate)
- Precise border radius (8px, 10px, 12px, 14px)
- Subtle shadows and animations
- No emojis - professional icons only

---

## 📖 Documentation

Comprehensive guides available in the repository:

- **[ADMIN_PANEL_GUIDE.md](ADMIN_PANEL_GUIDE.md)** - Complete admin panel documentation
- **[USERNAME_LOGIN_UPDATE.md](USERNAME_LOGIN_UPDATE.md)** - Username authentication guide
- **[EMOJI_REMOVAL_SUMMARY.md](EMOJI_REMOVAL_SUMMARY.md)** - Design refinement details
- **[LATEST_UPDATES.md](LATEST_UPDATES.md)** - Recent changes and updates
- **[QUICK_ADMIN_SETUP.md](QUICK_ADMIN_SETUP.md)** - 5-minute admin setup
- **[PRIVACY_FEATURES.md](PRIVACY_FEATURES.md)** - Privacy system explained

---

## 🧪 Testing

### Manual Testing
1. Register a new user
2. Login with username
3. Search for donors
4. Send connection requests
5. Accept/reject requests
6. Create blood requests
7. Respond to requests
8. Test admin panel (after making user admin)

### Demo Data
Run `node server/seed.js` to populate database with:
- 12 demo donors
- 6 blood requests
- Various blood types and locations

---

## 🚧 Roadmap

### Planned Features
- [ ] Email notifications
- [ ] SMS alerts for urgent requests
- [ ] Blood donation appointment scheduling
- [ ] Donation certificates
- [ ] Donor badges and achievements
- [ ] Blood bank inventory management
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Real-time chat between donors and recipients
- [ ] Blood drive event management

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Churanikanth**
- GitHub: [@churanikanth](https://github.com/churanikanth)
- Repository: [Little-Hearts](https://github.com/churanikanth/Little-Hearts)

---

## 🙏 Acknowledgments

- Design inspired by Apple's iOS/macOS design language
- Icons from [Lucide React](https://lucide.dev)
- Built with [React](https://react.dev), [Express](https://expressjs.com), and [MongoDB](https://www.mongodb.com)

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation files
- Review the API documentation above

---

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Built with ❤️ for saving lives**

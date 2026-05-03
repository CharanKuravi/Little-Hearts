# 🩸 LifeLink - Blood Bank Platform

A modern, iOS/macOS-styled blood donation platform built with the MERN stack. Connect blood donors with recipients in need, featuring real-time matching, instant notifications, and a beautiful Apple-inspired interface.

## ✨ Features

- **🔐 User Authentication** - Secure JWT-based auth with role-based access (Donor/Recipient/Both)
- **🩸 Blood Request System** - Post urgent blood needs with priority levels (Critical/Urgent/Normal)
- **👥 Donor Search** - Find available donors by blood type and location
- **💬 Real-time Responses** - Donors can instantly respond to blood requests
- **📊 Dashboard** - Track your donations, requests, and responses
- **🎨 iOS/macOS Design** - Beautiful Apple-inspired UI with SF Pro fonts, frosted glass effects, and smooth animations
- **📱 Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **CSS3** - Custom Apple design system

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bloodbank
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   The server `.env` file is already configured with MongoDB Atlas:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://collegemail36_db_user:LxtwpwODqYDroYbe@cluster0.dtjioxu.mongodb.net/bloodbank?retryWrites=true&w=majority
   JWT_SECRET=bloodbank_secret_key_2024
   NODE_ENV=development
   ```

5. **Seed the database with demo data**
   ```bash
   cd server
   npm run seed
   ```

   This will create:
   - 12 demo donor accounts
   - 6 blood requests
   - Sample donations and responses

6. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

After seeding, you can login with any of these accounts:

| Name | Phone | Blood Type | City |
|------|-------|------------|------|
| John Smith | +1234567890 | O+ | New York |
| Emma Johnson | +1234567891 | A+ | Los Angeles |
| Michael Brown | +1234567892 | B+ | Chicago |
| Sarah Davis | +1234567893 | AB+ | Houston |
| James Wilson | +1234567894 | O- | Phoenix |

**Password for all demo accounts:** `demo123`

## 📁 Project Structure

```
bloodbank/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios configuration
│   │   ├── components/    # Reusable UI components
│   │   │   ├── layout/    # Layout components (Navbar, Footer)
│   │   │   └── ui/        # UI components (Button, Card, Input, etc.)
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── data/          # Demo data (deprecated - now uses MongoDB)
│   │   ├── store/         # LocalStorage store (deprecated - now uses MongoDB)
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles (Apple design system)
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express backend
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── BloodRequest.js
│   │   └── Donation.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── requests.js
│   │   └── donations.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js       # JWT authentication
│   ├── index.js          # Server entry point
│   ├── seed.js           # Database seeding script
│   ├── .env              # Environment variables
│   └── package.json
│
└── README.md
```

## 🎨 Design System

The app uses an authentic iOS/macOS design language:

- **Typography:** SF Pro Display/Text (via Inter fallback)
- **Colors:** Apple system colors (Red: #FF3B30, Blue: #007AFF, etc.)
- **Radius:** Exact Apple values (6px, 10px, 13px, 16px, 20px, 28px)
- **Shadows:** Subtle, layered shadows matching iOS
- **Effects:** Frosted glass with `backdrop-filter: blur(28px)`
- **Animations:** Smooth 180ms transitions, pulse, fade, scale effects

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Users
- `GET /api/users/donors` - Search donors (query: bloodType, city, page, limit)
- `GET /api/users/stats` - Platform statistics
- `GET /api/users/:id` - Get user by ID

### Blood Requests
- `GET /api/requests` - Get all requests (query: bloodType, urgency, city, status, page, limit)
- `POST /api/requests` - Create new request (protected)
- `GET /api/requests/:id` - Get request details
- `GET /api/requests/my` - Get my requests (protected)
- `POST /api/requests/:id/respond` - Respond to request (protected)
- `PUT /api/requests/:id` - Update request status (protected)

### Donations
- `POST /api/donations` - Record donation (protected)
- `GET /api/donations/my` - Get my donations (protected)
- `GET /api/donations/stats` - Donation statistics

## 🧪 Testing the Application

1. **Register a new account** or use demo credentials
2. **Browse donors** - Search by blood type and city
3. **Post a blood request** - Set urgency and location
4. **Respond to requests** - Help someone in need
5. **Track your activity** - View dashboard for stats

## 🔧 Development

### Frontend Development
```bash
cd client
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd server
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run seed     # Seed database with demo data
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL=<your-backend-url>`

### Backend (Heroku/Railway/Render)
1. Push the `server` folder
2. Set environment variables from `.env`
3. Run `npm run seed` once to populate data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for saving lives through technology.

## 🙏 Acknowledgments

- Apple Inc. for the beautiful design language
- The open-source community for amazing tools
- Blood donors worldwide for their life-saving contributions

---

**Note:** This is a demo application. For production use, implement additional security measures, error handling, and testing.

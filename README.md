# LifeLink — Blood Bank Platform

A full-stack blood bank management system built with the MERN stack. Donors and recipients connect through an Instagram-style privacy system — contact info stays hidden until both sides agree to connect.

---

## Stack

- **Frontend** — React 18, Vite, React Router, Axios, Lucide React
- **Backend** — Node.js, Express, MongoDB Atlas, Mongoose
- **Auth** — JWT + bcrypt
- **Design** — iOS/macOS design language (SF Pro, Apple system colors, frosted glass)

---

## Features

- Username-based login (not phone number)
- Donor search with blood type + city filters
- Blood request system with urgency levels (Critical / Urgent / Normal)
- Connection requests — phone and city hidden until accepted
- Aadhar verification on registration
- Dashboard for managing your requests and donations
- Admin panel — user management, request monitoring, activity logs
- Full CRUD on all entities

---

## Project Structure

```
Little-Hearts/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── api/              # Axios instance
│       ├── components/
│       │   ├── layout/       # Navbar, Footer
│       │   └── ui/           # Button, Card, Input, Modal, Toast, etc.
│       ├── context/          # AuthContext
│       ├── pages/            # All page components
│       └── main.jsx
│
├── server/                   # Express backend
│   ├── middleware/           # auth.js, logger.js
│   ├── models/               # User, BloodRequest, Donation, ActivityLog
│   ├── routes/               # auth, users, requests, donations, connections, admin
│   ├── seed.js               # Demo data
│   └── index.js
│
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/CharanKuravi/Little-Hearts.git
cd Little-Hearts
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/bloodbank
JWT_SECRET=your_secret_key
PORT=5000
```

### 4. Seed demo data (optional)

```bash
cd server && node seed.js
```

### 5. Run

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173**

---

## Demo Accounts

All use password `password123`

| Username | Blood Type | Role |
|----------|-----------|------|
| john | O+ | Donor |
| emma | A+ | Donor |
| michael | B+ | Donor |
| sarah | AB+ | Donor |

---

## Admin Panel

Update any user's role to `admin` in MongoDB:

```js
db.users.updateOne({ username: "john" }, { $set: { role: "admin" } })
```

Then login and access `/admin` from the profile dropdown.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login with username |
| GET | `/api/users/donors` | List donors |
| GET/POST | `/api/requests` | Blood requests |
| POST | `/api/connections/request/:id` | Send connection request |
| PUT | `/api/connections/respond/:id` | Accept / reject |
| GET | `/api/admin/stats` | Admin dashboard |

---

## License

MIT

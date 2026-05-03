# Admin Panel - Complete Guide

## Overview
The Admin Panel is a comprehensive monitoring and management system for the Blood Bank platform. It provides real-time insights, user management, request oversight, and detailed activity logging.

## Access

### Admin Login
Only users with `role: 'admin'` can access the admin panel.

**Access URL**: `http://localhost:5173/admin`

**Creating an Admin User**:
```javascript
// In MongoDB or via seed script
{
  name: "Admin User",
  phone: "1234567890",
  aadhar: "123456789012",
  email: "admin@lifelink.com",
  password: "admin123", // Will be hashed
  bloodType: "O+",
  role: "admin" // This is the key field
}
```

### Admin Panel Link
- Appears in user dropdown menu (top right) for admin users only
- Shows Shield icon with "Admin Panel" label
- Blue highlight on hover

## Features

### 1. Overview Tab (Dashboard)

#### Statistics Cards
- **Total Users**: All registered users
- **Active Donors**: Users with donor/both role
- **Recipients**: Users with recipient/both role
- **Blood Requests**: Total requests created
- **Active Requests**: Requests with status 'active'
- **Total Donations**: Completed donations
- **Connections**: Accepted user connections

#### Blood Type Distribution
- Visual bar chart showing user distribution by blood type
- Displays count and percentage for each type
- Sorted by count (highest first)

#### Request Urgency Breakdown
- Shows requests grouped by urgency level:
  - Critical (red badge)
  - Urgent (orange badge)
  - Normal (green badge)
- Displays count for each urgency level

#### Recent Activity Feed
- Last 10 activities across the platform
- Shows user name, action type, and timestamp
- Color-coded by action type:
  - Green: Registrations, connections accepted
  - Blue: Logins
  - Red: Deletions, rejections, admin actions
  - Orange: Request creation
  - Purple: Request responses

### 2. Users Tab

#### Features
- **Search**: By name, email, or phone number
- **Filter**: By role (donor, recipient, both)
- **Pagination**: 20 users per page

#### User Table Columns
- User (name + city)
- Contact (phone + email)
- Blood Type (badge)
- Role (donor/recipient/both)
- Joined Date
- Actions (Delete button)

#### User Management
- **Delete User**: Removes user and all associated data
  - Deletes user's blood requests
  - Deletes user's donations
  - Removes from all connections
  - Requires confirmation
  - Logs admin action

### 3. Requests Tab

#### Features
- **Filter**: By status, urgency, blood type
- **Pagination**: 20 requests per page

#### Request Cards Display
- Blood type badge
- Urgency badge
- Units needed
- Recipient name
- Hospital and city
- Number of donors responded
- Creation date
- Delete button

#### Request Management
- **Delete Request**: Permanently removes blood request
  - Requires confirmation
  - Logs admin action

### 4. Activity Logs Tab

#### Features
- **Real-time logging**: All platform activities
- **Pagination**: 50 logs per page
- **Auto-scroll**: Latest activities at top

#### Logged Actions
- `USER_REGISTER`: New user registration
- `USER_LOGIN`: User login
- `USER_LOGOUT`: User logout
- `USER_UPDATE`: Profile updates
- `USER_DELETE`: Account deletion
- `REQUEST_CREATE`: New blood request
- `REQUEST_UPDATE`: Request status change
- `REQUEST_DELETE`: Request deletion
- `REQUEST_RESPOND`: Donor response to request
- `DONATION_CREATE`: New donation recorded
- `DONATION_DELETE`: Donation removed
- `CONNECTION_REQUEST`: Connection request sent
- `CONNECTION_ACCEPT`: Connection accepted
- `CONNECTION_REJECT`: Connection rejected
- `CONNECTION_DELETE`: Connection removed
- `ADMIN_ACTION`: Admin panel actions

#### Log Details
- User name (or "System" for automated actions)
- Action type (formatted)
- Timestamp (full date and time)
- IP Address
- Color-coded indicator

## Backend Architecture

### Routes (`server/routes/admin.js`)

#### `GET /api/admin/stats`
Returns dashboard statistics including:
- Overview counts
- Blood type distribution
- Urgency breakdown
- Activity by day (last 7 days)
- Recent activity (last 10)

#### `GET /api/admin/users`
Query params:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term
- `role`: Filter by role
- `bloodType`: Filter by blood type

#### `GET /api/admin/requests`
Query params:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `urgency`: Filter by urgency
- `bloodType`: Filter by blood type

#### `GET /api/admin/logs`
Query params:
- `page`: Page number
- `limit`: Items per page (default: 50)
- `action`: Filter by action type
- `userId`: Filter by user

#### `PUT /api/admin/users/:id/status`
Update user active status (ban/unban)

#### `DELETE /api/admin/users/:id`
Delete user with cascading deletes

#### `DELETE /api/admin/requests/:id`
Delete blood request

### Models

#### ActivityLog Model (`server/models/ActivityLog.js`)
```javascript
{
  user: ObjectId (ref: User),
  action: String (enum),
  details: Mixed (flexible object),
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

**Indexes**:
- `timestamp` (descending)
- `user + timestamp`
- `action + timestamp`

### Middleware

#### Admin Authentication (`adminOnly`)
- Checks if user is authenticated
- Verifies user role is 'admin'
- Returns 403 if not authorized

#### Activity Logger (`server/middleware/logger.js`)
- Automatically logs successful operations
- Sanitizes sensitive data (passwords, aadhar)
- Captures IP address and user agent
- Non-blocking (async logging)

## Security Features

### Access Control
- Admin-only routes protected by middleware
- Role-based authorization
- JWT token validation

### Data Sanitization
- Passwords redacted in logs
- Aadhar numbers redacted in logs
- Sensitive fields filtered before logging

### Audit Trail
- All admin actions logged
- IP address tracking
- User agent tracking
- Timestamp for every action

## UI Design (macOS Style)

### Design System
- **Colors**: Apple system colors
- **Typography**: SF Pro font family
- **Borders**: Precise Apple radius values
- **Shadows**: Subtle, layered shadows
- **Blur**: Frosted glass effects (blur + saturate)

### Components
- **Stat Cards**: Icon + value + label
- **Tables**: Clean, minimal borders
- **Badges**: Pill-shaped with proper colors
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Rounded corners with subtle shadows

### No Emojis
All emojis replaced with proper Lucide React icons:
- Users, Shield, Activity, Droplets, AlertCircle
- TrendingUp, FileText, Search, Filter, Download
- Trash2, Ban, CheckCircle, XCircle, Clock

## Performance Optimizations

### Database
- Indexed queries for fast lookups
- Aggregation pipelines for statistics
- Pagination to limit data transfer

### Frontend
- Lazy loading of tabs
- Debounced search
- Optimistic UI updates
- Efficient re-renders

### Caching
- 30-second refresh for pending counts
- On-demand data fetching
- Minimal state management

## Testing Checklist

### Admin Access
- [ ] Admin user can access /admin route
- [ ] Non-admin users see "Access Denied"
- [ ] Admin link appears in navbar dropdown
- [ ] Admin link hidden for non-admin users

### Overview Tab
- [ ] All stat cards display correct counts
- [ ] Blood type chart renders properly
- [ ] Urgency breakdown shows all levels
- [ ] Recent activity updates in real-time

### Users Tab
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search by phone works
- [ ] Role filter works
- [ ] Pagination works
- [ ] Delete user works with confirmation
- [ ] Deleted user's data cascades

### Requests Tab
- [ ] All requests display
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Delete request works with confirmation

### Logs Tab
- [ ] All activities logged
- [ ] Logs display in reverse chronological order
- [ ] Pagination works
- [ ] Color coding correct
- [ ] IP addresses captured

## Future Enhancements

### Potential Features
1. **Export Data**: CSV/Excel export for reports
2. **Advanced Filters**: Date ranges, multiple filters
3. **Charts**: Line charts for trends over time
4. **Email Notifications**: Alert admins of critical events
5. **Bulk Actions**: Ban/delete multiple users
6. **User Impersonation**: View platform as specific user
7. **System Health**: Server metrics, database stats
8. **Backup/Restore**: Database backup functionality
9. **Audit Reports**: Generate compliance reports
10. **Real-time Dashboard**: WebSocket updates

### Analytics
- User growth trends
- Request fulfillment rates
- Donor response times
- Geographic distribution
- Peak usage times

## Troubleshooting

### Admin Panel Not Loading
1. Check user role in database: `db.users.findOne({ phone: "..." })`
2. Verify JWT token includes role
3. Check browser console for errors
4. Ensure admin routes registered in server

### Stats Not Updating
1. Check MongoDB connection
2. Verify aggregation queries
3. Check for database indexes
4. Review server logs for errors

### Logs Not Appearing
1. Verify ActivityLog model exists
2. Check middleware is applied to routes
3. Ensure database write permissions
4. Check for logging errors in console

## Best Practices

### Admin Operations
- Always confirm destructive actions
- Review logs regularly
- Monitor user activity patterns
- Keep admin credentials secure
- Use strong passwords
- Enable 2FA (future enhancement)

### Data Management
- Regular database backups
- Archive old logs periodically
- Monitor database size
- Optimize queries regularly

### Security
- Limit admin accounts
- Rotate admin passwords
- Monitor admin actions
- Review access logs
- Keep dependencies updated

## Support

For issues or questions:
1. Check server logs: `server/` directory
2. Check browser console
3. Review MongoDB logs
4. Check network tab for API errors
5. Verify environment variables

---

**Admin Panel Version**: 1.0.0  
**Last Updated**: 2026-05-03  
**Platform**: LifeLink Blood Bank

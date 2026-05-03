const mongoose = require('mongoose');
const User = require('./models/User');
const BloodRequest = require('./models/BloodRequest');
const Donation = require('./models/Donation');
require('dotenv').config();

const DEMO_DONORS = [
  { name: 'John Smith', username: 'john', phone: '+1234567890', aadhar: '123456789012', bloodType: 'O+', city: 'New York', age: 28, role: 'donor', totalDonations: 5 },
  { name: 'Emma Johnson', username: 'emma', phone: '+1234567891', aadhar: '123456789013', bloodType: 'A+', city: 'Los Angeles', age: 32, role: 'donor', totalDonations: 3 },
  { name: 'Michael Brown', username: 'michael', phone: '+1234567892', aadhar: '123456789014', bloodType: 'B+', city: 'Chicago', age: 25, role: 'donor', totalDonations: 7 },
  { name: 'Sarah Davis', username: 'sarah', phone: '+1234567893', aadhar: '123456789015', bloodType: 'AB+', city: 'Houston', age: 29, role: 'donor', totalDonations: 2 },
  { name: 'James Wilson', username: 'james', phone: '+1234567894', aadhar: '123456789016', bloodType: 'O-', city: 'Phoenix', age: 35, role: 'donor', totalDonations: 12 },
  { name: 'Emily Martinez', username: 'emily', phone: '+1234567895', aadhar: '123456789017', bloodType: 'A-', city: 'Philadelphia', age: 27, role: 'donor', totalDonations: 4 },
  { name: 'David Anderson', username: 'david', phone: '+1234567896', aadhar: '123456789018', bloodType: 'B-', city: 'San Antonio', age: 31, role: 'donor', totalDonations: 6 },
  { name: 'Olivia Taylor', username: 'olivia', phone: '+1234567897', aadhar: '123456789019', bloodType: 'AB-', city: 'San Diego', age: 26, role: 'donor', totalDonations: 1 },
  { name: 'Daniel Thomas', username: 'daniel', phone: '+1234567898', aadhar: '123456789020', bloodType: 'O+', city: 'Dallas', age: 33, role: 'donor', totalDonations: 8 },
  { name: 'Sophia Moore', username: 'sophia', phone: '+1234567899', aadhar: '123456789021', bloodType: 'A+', city: 'San Jose', age: 24, role: 'donor', totalDonations: 3 },
  { name: 'Matthew Jackson', username: 'matthew', phone: '+1234567800', aadhar: '123456789022', bloodType: 'B+', city: 'Austin', age: 30, role: 'donor', totalDonations: 5 },
  { name: 'Isabella White', username: 'isabella', phone: '+1234567801', aadhar: '123456789023', bloodType: 'O-', city: 'Jacksonville', age: 28, role: 'donor', totalDonations: 9 },
];

const DEMO_REQUESTS = [
  { bloodType: 'O+', urgency: 'critical', units: 2, hospital: 'City General Hospital', city: 'New York', description: 'Emergency surgery needed' },
  { bloodType: 'A-', urgency: 'urgent', units: 1, hospital: 'St. Mary Medical Center', city: 'Los Angeles', description: 'Cancer treatment' },
  { bloodType: 'B+', urgency: 'normal', units: 3, hospital: 'Memorial Hospital', city: 'Chicago', description: 'Scheduled operation' },
  { bloodType: 'AB+', urgency: 'urgent', units: 1, hospital: 'Houston Medical Center', city: 'Houston', description: 'Accident victim' },
  { bloodType: 'O-', urgency: 'critical', units: 4, hospital: 'Phoenix General', city: 'Phoenix', description: 'Multiple trauma patients' },
  { bloodType: 'A+', urgency: 'normal', units: 2, hospital: 'Philadelphia Hospital', city: 'Philadelphia', description: 'Routine transfusion' },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    await Donation.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating demo users...');
    const users = [];
    for (const donor of DEMO_DONORS) {
      const user = await User.create({
        ...donor,
        password: 'password123',
        email: `${donor.name.toLowerCase().replace(' ', '.')}@example.com`,
        bio: `Passionate blood donor from ${donor.city}. Happy to help save lives!`,
        isAvailable: true,
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} demo users`);

    // Create blood requests
    console.log('🩸 Creating demo blood requests...');
    const requests = [];
    for (let i = 0; i < DEMO_REQUESTS.length; i++) {
      const reqData = DEMO_REQUESTS[i];
      const recipient = users[i % users.length]; // Assign to different users
      
      const request = await BloodRequest.create({
        ...reqData,
        recipient: recipient._id,
        status: 'open',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      requests.push(request);
    }
    console.log(`✅ Created ${requests.length} demo blood requests`);

    // Add some responses to requests
    console.log('💬 Adding donor responses...');
    for (let i = 0; i < 3; i++) {
      const request = requests[i];
      const respondingDonors = users.slice(i * 2, i * 2 + 2);
      
      for (const donor of respondingDonors) {
        request.respondedDonors.push({
          donor: donor._id,
          respondedAt: new Date(),
          status: 'pending',
        });
      }
      
      if (request.respondedDonors.length > 0) {
        request.status = 'in-progress';
      }
      
      await request.save();
    }
    console.log('✅ Added donor responses');

    // Create some donations
    console.log('💉 Creating demo donations...');
    const donations = [];
    for (let i = 0; i < 5; i++) {
      const donor = users[i];
      const recipient = users[(i + 6) % users.length];
      
      const donation = await Donation.create({
        donor: donor._id,
        recipient: recipient._id,
        bloodType: donor.bloodType,
        units: Math.floor(Math.random() * 2) + 1,
        hospital: `Hospital ${i + 1}`,
        notes: 'Successful donation',
        donatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      });
      donations.push(donation);
    }
    console.log(`✅ Created ${donations.length} demo donations`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Login Credentials:');
    console.log('   Phone: +1234567890 (or any phone from the list)');
    console.log('   Password: demo123');
    console.log('\n👥 Demo Users:');
    users.slice(0, 5).forEach(u => {
      console.log(`   ${u.name} - ${u.phone} - ${u.bloodType} - ${u.city}`);
    });
    console.log('   ... and 7 more users\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();

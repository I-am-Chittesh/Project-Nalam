# 🏛️ Project Nalam - Citizen Service Portal

A modern, inclusive platform built for providing seamless access to government services through Aadhar based authentication and interactive digital workflows.
It ensures that all people regardless of their literacy, language, geographical situation get the same provisions from the government.
---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Services & Modules](#services--modules)
- [Design System](#design-system)
- [Setup & Installation](#setup--installation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Project Nalam is an innovative citizen-centric digital governance platform designed to streamline access to essential government services. The application features:

- **RFID-based identification** for seamless citizen authentication
- **Multi-service integration** supporting Jan Setu, Dhan Seva, and Sevai Jannal
- **Modern glassmorphic UI** with professional dark theme and accent colors
- **Real-time status tracking** for service requests and filings
- **AI-powered assistance** for citizen queries
- **Grievance portal** for complaint management

---

## ✨ Features

### Core Services

| Service | Description | Status | Accent Color |
|---------|-------------|--------|--------------|
| **Jan Setu** | Service requests & document management | ✅ Active | Teal (#2ee3bb) |
| **Dhan Seva** | Tax records & financial filings | ✅ Active | Orange (#ffac5e) |
| **Sevai Jannal** | Land records & property documents | ✅ Active | Red (#ff6b6b) |
| **Grievance Portal** | Complaint lodging & tracking | ✅ Active | Red (#ff6b6b) |
| **AI Interactive** | AI-powered citizen assistance | ✅ Active | Cyan (#2ee3bb) |

### Key Capabilities

- 🔐 **RFID-Based Authentication** - Automatic citizen identification via card scanning
- 📊 **Dashboard Overview** - Centralized hub showing all services at a glance
- 📝 **Service Requests** - Create and manage new service applications
- 💰 **Financial Records** - View tax filings and assessment history
- 🏠 **Land Management** - Access Patta and Chitta documents
- 📞 **Grievance Management** - Lodge and track complaints with real-time status
- 💬 **AI Assistance** - Interactive chatbot for citizen support
- 🔔 **Status Indicators** - Real-time sync and notification pills

---

## 🏗️ Architecture

```
Project-Nalam
├── client/                          # React Native + Expo application
│   ├── assets/                      # Images, fonts, design assets
│   │   └── bg.png                   # Blurred background image (26px blur)
│   ├── config/
│   │   └── dbClient.js             # Supabase configuration
│   ├── screens/                     # Screen components
│   │   ├── HomeScreen.js           # Landing page with AI Mode button
│   │   ├── DashboardScreen.js      # Main service hub
│   │   ├── ServiceUpdateScreen.js  # User metadata updates (Jan Setu)
│   │   ├── ServiceCreateScreen.js  # New service applications
│   │   ├── TaxationAndFilingsScreen.js  # Tax records (Dhan Seva)
│   │   ├── ServiceLandScreen.js    # Land records (Sevai Jannal)
│   │   ├── GrievancePortalScreen.js # Complaint management
│   │   ├── AIInteractiveScreen.js  # AI chatbot
│   │   └── Schemes.js              # Service schemes data
│   ├── App.js                       # Root navigation component
│   ├── index.js                     # Entry point
│   ├── app.json                     # Expo configuration
│   └── package.json                 # Dependencies
├── package.json                     # Root workspace configuration
└── node_modules/                    # Dependencies (auto-generated)
```

---

## 🛠️ Tech Stack

### Frontend
- **React Native** v0.81.5 - Cross-platform mobile framework
- **Expo** v54.0.29 - Development platform & distribution
- **React Navigation** v7.x - Navigation & routing
- **React** v19.1.0 - UI library

### Backend & Database
- **Supabase** v2.87.1 - PostgreSQL backend as a service
- **Supabase Auth** - User authentication & management
- **PostgreSQL** - Relational database

### Design & Styling
- **React Native StyleSheet** - Component styling
- **ImageBackground** - Blurred background effects
- **Glassmorphism** - Design pattern with translucent elements

---

## 📁 Project Structure

### Screen Components

#### **HomeScreen.js**
Landing page with RFID card scanner integration. Tap anywhere to access dashboard or click "AI Mode" button for chatbot.

#### **DashboardScreen.js**
Central hub displaying:
- Live clock with refresh button
- Status indicators (Online/Sync)
- Quick action cards (Active Requests, Pending Approvals, New Notices)
- Three service columns with department buttons
- Interactive notice modal

#### **ServiceUpdateScreen.js** (Jan Setu)
RFID-linked form for updating citizen metadata:
- Read-only fields (UID, Name)
- Editable fields (Age, Phone, Address)
- Supabase integration for profile updates

#### **ServiceCreateScreen.js** (Jan Setu)
Submit new service applications:
- Department selection dropdown
- Subject & detailed description inputs
- Service request submission with status tracking

#### **TaxationAndFilingsScreen.js** (Dhan Seva)
Tax record management with orange accent:
- Assessment year filing status
- Filing history with amounts due
- Document view capability

#### **ServiceLandScreen.js** (Sevai Jannal)
Land record & property document access with red accent:
- Patta number & survey data
- Property area information
- Patta & Chitta document viewing
- Status verification

#### **GrievancePortalScreen.js**
Complaint management system with red accent:
- Department-specific grievance filing
- Subject & detailed complaint forms
- Real-time tracking ID generation
- Secure submission via Supabase

#### **AIInteractiveScreen.js**
AI-powered citizen assistance with cyan accent:
- Real-time message interface
- Echo bot for offline deployment
- Full glassmorphic design integration
- Back navigation to dashboard

---

## 🎨 Design System

### Color Palette

```
Primary Colors:
├── Dark Base: #060F1E, #0A101C
├── Light Text: #F0F4FF, #E6F1FF, #D9E2F2
└── Glass Border: rgba(12, 21, 35, 0.42-0.50)

Service Accents:
├── Jan Setu (Teal): #2ee3bb
├── Dhan Seva (Orange): #ffac5e
├── Sevai Jannal (Red): #ff6b6b
└── AI Mode (Cyan): #2ee3bb

Glass Backgrounds:
├── Card: rgba(255, 255, 255, 0.10-0.22)
├── Scrim Overlay: rgba(6, 16, 30, 0.30)
└── Input/Button: rgba(255, 255, 255, 0.15-0.35)
```

### Typography

- **Headers**: FontSize 28-32, FontWeight 900, LetterSpacing 1-1.2
- **Labels**: FontSize 13-14, FontWeight 800-900, LetterSpacing 0.6-0.7
- **Body**: FontSize 15-16, FontWeight 600-700
- **Buttons**: FontSize 15-16, FontWeight 900, LetterSpacing 0.5-0.7

### Components

- **Glassmorphic Cards**: Translucent background (0.10-0.22 opacity) with dark borders
- **Input Fields**: 2px borders with color-coded tints (Blue, Teal, Red, Purple)
- **Buttons**: Accent-colored backgrounds with matching glowing shadows
- **Status Indicators**: Colored pills with appropriate opacity
- **Dividers**: Subtle accent-colored lines for visual separation

### Spacing

- **Compact Layout**: Consistent 12-18px margins between elements
- **Card Padding**: 16-24px for content areas
- **Button Padding**: 12-16px vertical, 14-28px horizontal
- **Section Spacing**: 12-20px between major sections

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** >= 16.x
- **npm** or **yarn** package manager
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **RFID Scanner** (for card identification)
- **Supabase Account** (free tier available at https://supabase.com)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Project-Nalam.git
   cd Project-Nalam
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anonymous key
   - Update `client/config/dbClient.js`:
   ```javascript
   import { createClient } from '@supabase/supabase-js';
   
   export const supabase = createClient(
     'YOUR_SUPABASE_URL',
     'YOUR_SUPABASE_ANON_KEY'
   );
   ```

4. **Create database tables** (SQL in Supabase dashboard)
   ```sql
   -- See Database Schema section below
   ```

5. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

6. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device

---

## 💾 Database Schema

### Tables

#### **app_main** (RFID Scan Log)
```sql
CREATE TABLE app_main (
  id BIGSERIAL PRIMARY KEY,
  uniqueid VARCHAR(255) NOT NULL,
  uid VARCHAR(255),
  name VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

#### **rfid_users** (Citizen Profiles)
```sql
CREATE TABLE rfid_users (
  id BIGSERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  age INTEGER,
  phone VARCHAR(20),
  address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **service_requests** (Jan Setu)
```sql
CREATE TABLE service_requests (
  id BIGSERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  service_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  requested_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **tax_records** (Dhan Seva)
```sql
CREATE TABLE tax_records (
  id BIGSERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  assessment_year INTEGER,
  status VARCHAR(50),
  amount_due DECIMAL(10, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **land_records** (Sevai Jannal)
```sql
CREATE TABLE land_records (
  id BIGSERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  village_name VARCHAR(255),
  patta_number VARCHAR(100),
  survey_number VARCHAR(100),
  area_sqft DECIMAL(10, 2),
  status VARCHAR(50),
  verified_date TIMESTAMPTZ
);
```

#### **grievances**
```sql
CREATE TABLE grievances (
  id BIGSERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  subject VARCHAR(255),
  details TEXT,
  status VARCHAR(50) DEFAULT 'New',
  lodged_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `client/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Supabase Security

1. **Enable Row Level Security (RLS)** for all tables
2. **Create policies** for authenticated users
3. **Set up real-time** subscriptions for status updates
4. **Enable backups** with 7-day retention
5. **Configure CORS** for your domain

---

## 📱 Usage Guide

### For Citizens

1. **Launch Application** → Tap anywhere on home screen to enter Dashboard
2. **Identify via RFID** → Automatic card scanning links your profile
3. **Browse Services** → Select Jan Setu, Dhan Seva, or Sevai Jannal from dashboard
4. **Manage Records** → Update metadata, view filings, access land documents
5. **Lodge Complaints** → Submit grievances through grievance portal
6. **Get Assistance** → Click "AI Mode" button for AI-powered support

### For Administrators

1. Monitor service requests in real-time via Supabase
2. Update grievance status and provide resolutions
3. Manage tax & land record database
4. Generate compliance reports
5. Configure service-specific parameters

---

## 🎓 Development Guide

### Adding a New Service Screen

1. **Create component** in `screens/` directory:
   ```javascript
   import { ImageBackground, View, Text } from 'react-native';
   
   export default function NewServiceScreen({ navigation }) {
     return (
       <ImageBackground source={require('../assets/bg.png')} blurRadius={26}>
         <View style={styles.scrim}>
           {/* Your content here */}
         </View>
       </ImageBackground>
     );
   }
   ```

2. **Apply design system**:
   - Use consistent color palette
   - Choose accent color from service
   - Follow typography guidelines
   - Maintain spacing consistency

3. **Integrate Supabase**:
   ```javascript
   const { data, error } = await supabase
     .from('table_name')
     .select('*')
     .eq('user_uid', userUid);
   ```

4. **Add navigation** in `App.js`:
   ```javascript
   <Stack.Screen name="NewService" component={NewServiceScreen} />
   ```

5. **Update DashboardScreen** with new button

### Styling Convention

```javascript
const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  scrim: { flex: 1, backgroundColor: 'rgba(6, 16, 30, 0.30)' },
  
  container: { flexGrow: 1, padding: 16 },
  
  header: { marginBottom: 20, alignItems: 'center', marginTop: 12 },
  title: { fontSize: 32, fontWeight: '900', color: '#F0F4FF' },
  
  card: { 
    backgroundColor: 'rgba(255,255,255,0.11)',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(12,21,35,0.50)',
  },
  
  button: {
    backgroundColor: 'rgba(ACCENT_R, ACCENT_G, ACCENT_B, 0.35)',
    borderColor: 'rgba(ACCENT_R, ACCENT_G, ACCENT_B, 0.50)',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  }
});
```

---

## 🚨 Troubleshooting

### Issue: "ConfigError: The expected package.json path does not exist"
**Solution**: 
```bash
mkdir node_modules
npm start
```

### Issue: Metro bundler hangs
**Solution**: 
```bash
npx expo start --clear
```

### Issue: Supabase connection fails
**Solution**: 
- Verify credentials in `dbClient.js`
- Check internet connectivity
- Ensure Supabase project is active

### Issue: RFID scanner not recognized
**Solution**: 
- Verify scanner is connected
- Ensure scanner is configured as keyboard input
- Check GPIO pins on ESP32-S3

### Issue: Styling looks different on device
**Solution**: 
- Clear app cache
- Force reload (Cmd+R on iOS, Cmd+M on Android)
- Check device theme settings

---

## 📈 Performance Optimization

- **Lazy loading** for navigation screens
- **Image compression** (bg.png optimized)
- **Debounced API** calls for search functionality
- **Cached user profiles** in local state
- **Optimized Supabase** queries with proper indexing
- **React.memo** for expensive components

---

## 🔐 Security Best Practices

- **Supabase RLS Policies** protect all data
- **Input validation** on all form fields
- **Secure RFID matching** via UID verification
- **HTTPS only** for API communication
- **JWT token** management via Supabase
- **Automatic logout** after inactivity
- **No sensitive data** in client logs

---

## 📞 Support & Contact

- **Documentation**: See project wiki
- **Issue Tracker**: GitHub Issues
- **Email Support**: iamchitteshd@gmail.com
- **Community Forum**: GitHub Discussions

---

## 📄 License

Project Nalam is licensed under the **MIT License** - see LICENSE file for details.

---

## 👥 Contributors

- **Chittesh D** - Technical Developement and Frontend Developement
- **S Maheshwar** - Research and Business Intelligence
- **Backend Team** - Backend Architect and AI Developer


---

## 🙏 Acknowledgments

Special thanks to:
- Supabase for excellent backend infrastructure
- Expo for seamless React Native development
- React Navigation for robust routing
- The open-source community for amazing libraries

---

**Made with ❤️ from CodeLanders for citizen empowerment through digital innovation**

*Last Updated: December 15, 2025*

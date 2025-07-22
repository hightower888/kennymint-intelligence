# Kennymint Intelligence System

## 🧠 Overview
Kennymint is a comprehensive intelligence system that integrates Firebase, Google Cloud Storage (GCS), and GitHub to provide a complete project management and deployment solution.

## 🚀 Project Details
- **Project Name**: kennymint
- **Project ID**: dan-gpt-460014
- **Project Number**: 130600555571

## 🔧 Technology Stack
- **Firebase**: Firestore database, Storage, Hosting
- **Google Cloud Storage**: File storage and backups
- **GitHub**: Version control and issue tracking
- **Node.js**: Backend server and API
- **Express**: Web server framework

## 📊 Dashboard Features
- Real-time activity monitoring
- System metrics tracking
- GitHub repository health
- GCS storage management
- Firebase integration status

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- Firebase CLI
- GitHub account with repository access

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/danielyoung/kennymint.git
   cd kennymint
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Update `.env` file with your GitHub token
   - Ensure Firebase project is properly configured

4. Start the dashboard:
   ```bash
   npm run web
   ```

### Firebase Setup
1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase:
   ```bash
   firebase init
   ```
   - Select Firestore, Storage, and Hosting
   - Use project ID: dan-gpt-460014

3. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## 📁 Project Structure
```
Kennymint/
├── dashboard-server.js      # Main dashboard server
├── database-manager.js      # Firebase/GCS integration
├── gcs-manager.js          # Google Cloud Storage manager
├── github-repo-manager.js  # GitHub repository manager
├── interactive-dashboard.html # Dashboard UI
├── public/                 # Firebase hosting files
├── backups/               # GCS backup storage
└── INTELLIGENCE/         # Intelligence system modules
```

## 🔄 API Endpoints
- `GET /api/dashboard` - Get dashboard data
- `GET /api/activity` - Get activity log
- `POST /api/activity` - Log activity
- `GET /api/metrics` - Get system metrics
- `POST /api/metrics` - Update metrics
- `GET /api/github` - Get GitHub info

## 🎯 Features
- ✅ Real-time dashboard
- ✅ Firebase Firestore integration
- ✅ GCS file storage and backups
- ✅ GitHub repository management
- ✅ Activity logging and monitoring
- ✅ System metrics tracking
- ✅ Modern UI/UX design

## 🔐 Security
- Firebase Authentication
- GCS IAM permissions
- GitHub token-based access
- Environment variable protection

## 📈 Monitoring
- Real-time activity feed
- System health metrics
- Repository health scoring
- Storage usage monitoring

## 🚀 Deployment
The system is designed to be deployed on Firebase Hosting with automatic scaling and CDN distribution.

## 📞 Support
For issues and questions, please create an issue in the GitHub repository.

---
*Powered by Kennymint Intelligence System*
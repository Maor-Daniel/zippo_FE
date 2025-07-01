# Easy Firebase Setup for Zolpo

## Quick Setup (3 steps):

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Click "Create a project"
- Enter project name (e.g., "zolpo-price-app")
- Enable Google Analytics (optional)

### 2. Get Configuration
- In Firebase Console, click the web icon (`</>`)
- Register your app with name "Zolpo Web App"
- Copy the config values that appear

### 3. Update Environment Variables
Create a `.env` file in your project root with:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Enable Firestore Database
- In Firebase Console, go to "Firestore Database"
- Click "Create database"
- Choose "Start in test mode" for now
- Select a location close to your users

That's it! Your app will automatically connect to Firebase and create the necessary collections when you start using it.

## Default Demo Mode
If you don't set up Firebase config, the app runs in demo mode with sample data for testing.
# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the ReceiptScan.ai application.

## Prerequisites

- A Google account
- Node.js 18+ installed
- Project dependencies installed (`npm install`)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `receiptscan-ai` (or your preferred name)
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the Web icon (</>) to add a web app
2. Enter an app nickname: `receiptscan-web`
3. (Optional) Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values

## Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
3. Enable **Google**:
   - Click "Google"
   - Toggle "Enable"
   - Select a support email for your project
   - Click "Save"

## Step 4: Configure Environment Variables

Update your `.env` file with the Firebase configuration values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Example:**
```env
VITE_FIREBASE_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstu
VITE_FIREBASE_AUTH_DOMAIN=receiptscan-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=receiptscan-ai
VITE_FIREBASE_STORAGE_BUCKET=receiptscan-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your development domain: `localhost`
3. Add your production domain when ready (e.g., `receiptscan.ai`)

## Step 6: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. Test the following features:
   - **Sign Up**: Create a new account with email/password
   - **Sign In**: Log in with your credentials
   - **Google Sign In**: Sign in with your Google account
   - **Protected Routes**: Try accessing `/profile` without being logged in
   - **Logout**: Sign out from the user menu
   - **Password Reset**: Request a password reset email

## Security Best Practices

### 1. Never Commit Firebase Credentials

The `.env` file containing your Firebase credentials should **NEVER** be committed to Git. It's already listed in `.gitignore`.

### 2. Use Environment-Specific Projects

Consider creating separate Firebase projects for:
- Development (`receiptscan-dev`)
- Staging (`receiptscan-staging`)
- Production (`receiptscan-prod`)

### 3. Configure Firebase Security Rules

Set up appropriate security rules in Firebase Console:

**Authentication**:
- Go to Authentication → Settings
- Configure password policies (minimum length, complexity)
- Enable email enumeration protection

## Authentication Features

### Email/Password Authentication
- User registration with display name
- Email/password login
- Password validation (minimum 6 characters)
- Email verification (can be enabled in Firebase Console)

### Google OAuth
- One-click sign in with Google account
- Automatic profile information retrieval
- No password management needed

### Password Reset
- Self-service password reset via email
- Secure token-based flow
- User-friendly success/error messages

### Protected Routes
- Automatic redirection to login for unauthenticated users
- Route state preservation (redirect back after login)
- Loading states during authentication check

### User Profile Management
- Display name updates
- View user information
- Account status display

### Session Management
- Persistent authentication across page refreshes
- Automatic token refresh
- Secure token storage via Firebase Auth SDK

## API Integration

The axios client is configured to automatically attach Firebase ID tokens to API requests:

```typescript
// src/lib/axios.ts
// Automatically adds Firebase token to all requests
config.headers.Authorization = `Bearer ${token}`;
```

Your backend API should:
1. Verify the Firebase ID token
2. Extract user information from the token
3. Use the Firebase Admin SDK for verification

**Example backend verification (Node.js):**
```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Middleware to verify token
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Make sure all Firebase environment variables are set correctly in `.env`

### Issue: "Firebase: Error (auth/popup-blocked)"
**Solution**: Browser is blocking popups. Allow popups for localhost or use redirect method instead

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to Authorized domains in Firebase Console

### Issue: Token not being sent to API
**Solution**: Check that the user is authenticated and firebase.auth().currentUser is not null

### Issue: "Module not found: Can't resolve 'firebase/auth'"
**Solution**: Run `npm install` to ensure Firebase SDK is properly installed

## Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase JavaScript SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check Firebase Console for any quota or billing issues
4. Review the Firebase Authentication logs in the Console

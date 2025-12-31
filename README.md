# ReceiptScan.ai Web Frontend

Modern web application for AI-powered receipt scanning and expense management built with React, TypeScript, and Vite.

## 🚀 Features

- ⚡️ **Vite 7** - Lightning-fast development and optimized builds
- ⚛️ **React 19** - Latest React features and performance improvements
- 📘 **TypeScript 5** - Type-safe development with latest TypeScript
- 🔐 **Firebase Authentication** - Secure email/password and Google OAuth sign-in
- 🎨 **Tailwind CSS 3** - Utility-first CSS with custom theme
- 🔄 **React Router v6** - Client-side routing with protected routes
- 🔍 **TanStack Query v5** - Powerful server state management
- 🐻 **Zustand** - Lightweight global state management
- 📡 **Axios** - Promise-based HTTP client with interceptors
- ✅ **ESLint & Prettier** - Code quality and formatting
- 🧩 **Common UI Components** - Button, Modal, Spinner, Toast

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/guilhermomg/receiptscan-web.git
cd receiptscan-web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env` as needed.

5. **Set up Firebase Authentication** (Required for auth features):
```bash
# Follow the detailed guide in FIREBASE_SETUP.md
# Add your Firebase credentials to .env
```

## 🏃 Development

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 🧪 Code Quality

Run linter:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code with Prettier:

```bash
npm run format
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components (ProtectedRoute)
│   ├── common/         # Reusable UI components (Button, Modal, etc.)
│   └── layout/         # Layout components
├── contexts/           # React contexts (AuthContext)
├── pages/              # Page components (Login, SignUp, Profile, etc.)
├── hooks/              # Custom React hooks
├── services/           # API services and auth service
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Library configurations
    ├── axios.ts        # Axios configuration with Firebase token injection
    ├── firebase.ts     # Firebase initialization
    └── query-client.ts # TanStack Query configuration
```

## 🎨 UI Components

### Button
Customizable button component with variants:
- `primary` - Primary action button
- `secondary` - Secondary action button
- `outline` - Outlined button
- `danger` - Destructive action button

Sizes: `sm`, `md`, `lg`

### Modal
Accessible modal dialog with backdrop and keyboard support (ESC to close).

### Spinner
Loading spinner with multiple sizes.

### Toast
Toast notifications with types: `success`, `error`, `warning`, `info`.

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=ReceiptScan.ai
VITE_APP_ENV=development

# Firebase Configuration (see FIREBASE_SETUP.md for details)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Important**: Never commit your `.env` file with real credentials to version control.

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## 🔐 Authentication

The application includes a complete Firebase Authentication integration:

### Features
- **Email/Password Authentication** - Secure user registration and login
- **Google OAuth** - One-click sign in with Google
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Password Reset** - Self-service password recovery via email
- **User Profile Management** - Update display name and view account info
- **Session Persistence** - Stay logged in across page refreshes
- **Automatic Token Refresh** - Seamless token management

### Usage

#### Using the Auth Hook

```typescript
import { useAuth } from './contexts/useAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.displayName || user.email}!</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

#### Creating Protected Routes

```typescript
import { ProtectedRoute } from './components/auth';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

#### Available Auth Methods

```typescript
const {
  user,                      // Current user object or null
  loading,                   // Auth state loading indicator
  signIn,                    // Sign in with email/password
  signUp,                    // Create new account
  signInWithGoogleProvider,  // Sign in with Google
  logout,                    // Sign out current user
  sendPasswordReset,         // Send password reset email
  updateProfile,             // Update user profile
  getToken,                  // Get current Firebase ID token
} = useAuth();
```

### Pages

- `/login` - Sign in with email/password or Google
- `/signup` - Create a new account
- `/forgot-password` - Request password reset
- `/profile` - User profile management (protected)

### Tailwind Theme

Custom theme colors are configured in `tailwind.config.js`:
- Primary colors (blue shades)
- Secondary colors (purple shades)

## 🌐 API Integration

The project uses Axios with interceptors for API calls. Configuration is in `src/lib/axios.ts`:

- Automatic auth token injection
- Global error handling
- 401 redirect to login

Example API service:

```typescript
import apiClient from '../lib/axios';

export const myService = {
  getAll: async () => {
    const response = await apiClient.get('/endpoint');
    return response.data;
  },
};
```

## 🗂️ State Management

### Global State (Zustand)

Example store in `src/store/auth.ts`:

```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

### Server State (TanStack Query)

Example hook in `src/hooks/`:

```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/axios';

export const useData = () => {
  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const response = await apiClient.get('/data');
      return response.data;
    },
  });
};
```

## 📝 Code Style

The project uses ESLint and Prettier for code quality:

- ESLint config: `eslint.config.js`
- Prettier config: `.prettierrc`
- TypeScript config: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

## 🚦 Routing

Routes are configured in `src/App.tsx`:

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="about" element={<AboutPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

## 📦 Dependencies

### Production
- react, react-dom - UI framework
- react-router-dom - Routing
- @tanstack/react-query - Server state
- zustand - Global state
- axios - HTTP client
- tailwindcss - Styling

### Development
- vite - Build tool
- typescript - Type system
- eslint, prettier - Code quality
- @vitejs/plugin-react - Vite React plugin

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

Developed by the ReceiptScan.ai team.

---

Built with ❤️ using React + TypeScript + Vite

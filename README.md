# ReceiptScan.ai Web Frontend

Modern web application for AI-powered receipt scanning and expense management built with React, TypeScript, and Vite.

## 🚀 Features

- ⚡️ **Vite 7** - Lightning-fast development and optimized builds
- ⚛️ **React 19** - Latest React features and performance improvements
- 📘 **TypeScript 5** - Type-safe development with latest TypeScript
- 🎨 **Tailwind CSS 3** - Utility-first CSS with custom theme
- 🔄 **React Router v6** - Client-side routing
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
│   ├── common/         # Reusable UI components (Button, Modal, etc.)
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Library configurations
    ├── axios.ts        # Axios configuration
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
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=ReceiptScan.ai
VITE_APP_ENV=development
```

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

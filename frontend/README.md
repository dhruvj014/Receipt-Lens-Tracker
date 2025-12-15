# ReceiptLens Frontend

React Native mobile app built with Expo for the ReceiptLens Personal Expense Tracker.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Receipt Upload**: Capture or select receipt images for OCR processing
- **Transaction Management**: View, filter, and delete transactions
- **Budget Tracking**: Set monthly budgets per category with visual alerts
- **Analytics Dashboard**: Monthly spending charts and category breakdowns

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (installed globally or via npx)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on physical device

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 2. Configure Backend URL

Edit `src/config/env.ts` to set your backend API URL:

```typescript
export const API_BASE_URL = "http://localhost:8000";  // For local development
// For physical device, use your computer's IP: "http://192.168.1.100:8000"
```

**Important for Physical Devices:**
- Use your computer's local IP address instead of `localhost`
- Ensure your device and computer are on the same network
- Make sure the backend server allows connections from your network

### 3. Start the Development Server

```bash
npm start
# or
yarn start
# or
npx expo start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Show a QR code for scanning with Expo Go app

### 4. Run on Simulator/Emulator

**iOS Simulator (macOS only):**
```bash
npm run ios
# or
npx expo start --ios
```

**Android Emulator:**
```bash
npm run android
# or
npx expo start --android
```

**Physical Device:**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal or browser
3. The app will load on your device

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # Axios client with auth
│   ├── components/
│   │   ├── TransactionList.tsx
│   │   ├── ReceiptCard.tsx
│   │   └── SpendChart.tsx
│   ├── config/
│   │   └── env.ts             # API configuration
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   └── useAnalytics.ts
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AddReceiptScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   └── BudgetsScreen.tsx
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── App.tsx                    # Main app component
├── package.json
└── README.md
```

## Key Technologies

- **Expo**: React Native framework for easy development
- **React Navigation**: Stack navigation for screen management
- **React Query (@tanstack/react-query)**: Data fetching and state management
- **Axios**: HTTP client for API requests
- **AsyncStorage**: Secure token storage
- **Expo ImagePicker**: Camera and gallery access
- **React Native SVG Charts**: Chart visualization

## Development Notes

### Authentication Flow

1. User registers/logs in via `LoginScreen`
2. JWT token is stored in AsyncStorage
3. Token is automatically attached to all API requests via Axios interceptor
4. On 401 errors, token is cleared and user is redirected to login

### State Management

- React Query handles all server state (transactions, budgets, analytics)
- Local component state for UI interactions
- Automatic cache invalidation on mutations

### Image Upload

- Uses Expo ImagePicker for camera/gallery access
- Images are uploaded as multipart/form-data to backend
- Backend processes with OCR and returns parsed receipt data

## Troubleshooting

**"Network request failed" error:**
- Ensure backend is running
- Check `API_BASE_URL` in `src/config/env.ts`
- For physical devices, use your computer's IP address, not `localhost`
- Ensure firewall allows connections on port 8000

**Expo Go connection issues:**
- Make sure device and computer are on the same Wi-Fi network
- Try restarting Expo dev server
- Clear Expo Go app cache and reload

**Module not found errors:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start -c`

**TypeScript errors:**
- Run `npx tsc --noEmit` to check for type errors
- Ensure all dependencies are installed

## Building for Production

To create a standalone app:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS/Android
eas build --platform ios
eas build --platform android
```

See [Expo documentation](https://docs.expo.dev/build/introduction/) for more details.

## License

This project is for demonstration purposes.


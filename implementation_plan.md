# Multi-Modal Data Verification App Implementation Plan

## Goal
Build a React Native + TypeScript Expo application based on the proposed system architecture in Chapter 3 for construction management. While the original spec highlighted GPS checking, Photo Capture, and Sequential material checking, the user's specific request for this MVP adds: **Worker Registration and QR Code-based Attendance Check-In**.

The app will allow the project supervisor to:
1. Create Worker profiles (generating and displaying a QR Code for each worker).
2. Scan the Worker's QR Code when they arrive at the site.
3. Automatically perform GPS Geofencing checks and prompt for mandatory Photo Evidence upon scanning.

## Proposed Changes

### [New Project Setup]
We will initialize a new Expo project with TypeScript, setting up routing, and ensuring the application runs across both iOS and Android via the Expo Go app.

### Dependencies
- `expo`: Core React Native framework.
- `expo-camera` & `expo-barcode-scanner` / `expo-camera/next`: For scanning QR codes and taking attendance photos.
- `expo-location`: For GPS geofencing checks.
- `react-native-qrcode-svg` or `react-native-svg`: For generating the printed QR codes for the workers.
- `@react-navigation/native` or Expo Router: For app navigation (Dashboard, Worker Registration, Scanner).
- `zustand` or React Context: For local state management (worker records, geofence status).

### Core Components
#### [NEW] App Navigation
Set up an Expo Router-based (or React Navigation) tab/stack structure with screens:
- **Login**: Auth screen.
- **Dashboard**: Quick actions.
- **Worker Registration**: Form to create a worker and generate their unique QR code (which can be saved/printed).
- **Scanner/Attendance**: The camera view where the supervisor scans the worker's QR code.
- **Verification Flow**: Once QR is scanned, application verifies GPS and asks for a photo.
- **Reports & Analytics**: Visualizations for daily/monthly worker attendance, progress charts, and material usage summaries. Report generation features.

#### [NEW] Backend / Data Layer
For the prototype, we will implement local SQLite or AsyncStorage + Zustand store to mock the Firebase behavior (storing workers and their attendance logs with timestamps and GPS locations). Adding Firebase is possible if needed.

## Verification Plan

### Automated Tests
- Test TypeScript compilation (`tsc`).

### Manual Verification
1. Run `npx expo start`.
2. Open the Expo Go app on iOS or Android.
3. Navigate to "Add Worker", create a "John Doe" worker, and note the generated QR code.
4. Navigate to "Scan Attendance", use a secondary device or test screen to scan the QR code.
5. Verify that scanning triggers GPS fetch, opens the camera for photo capture, and logs the attendance properly.

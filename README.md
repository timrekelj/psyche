# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisites

Before running the app, you'll need to set up a Supabase project:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your Project URL and anon public key

## Setup

1. Clone this repository and navigate to the project directory

2. Copy the environment file and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and replace the placeholder values with your actual Supabase project URL and anon key.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Features

This app includes:

- **User Authentication**: Complete login and registration system using Supabase Auth
- **Protected Routes**: Home page is only accessible to authenticated users
- **Session Management**: Automatic session handling with persistent login
- **Responsive UI**: Clean, modern interface built with NativeWind (Tailwind CSS)

## Authentication Flow

1. **Registration**: Users can create new accounts with email and password
2. **Login**: Existing users can sign in with their credentials
3. **Protected Home**: Authenticated users are redirected to the home page
4. **Logout**: Users can securely log out from the home page
5. **Auto-redirect**: Unauthenticated users are automatically redirected to login

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
- [Supabase documentation](https://supabase.com/docs): Learn about Supabase features and authentication.

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Supabase Auth
- **Navigation**: Expo Router
- **State Management**: React Context API

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

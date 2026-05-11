# Heritage Properties - Full Stack App

A functional real estate application built with React, Node.js, Express, and MongoDB.

## Features
- **User Authentication**: Sign up, Login, and Google OAuth.
- **Property Management**: Create, Read, Update, and Delete property ads.
- **User Dashboard**: Manage your own listings.
- **RTL Support**: Optimized for Arabic language and RTL layout.
- **Responsive Design**: Modern UI that works on all devices.

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file based on the template:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   ```
3. Run `npm install`.
4. Run `npm start` (or `npm run dev` if you install nodemon).

### 3. Frontend Setup
1. Navigate to the `frontend` folder.
2. Run `npm install`.
3. In `App.jsx`, update the `googleClientId` with your own Google Client ID.
4. Run `npm run dev`.

### 4. Running Both
You can run the backend on port 5000 and frontend on port 5173. The frontend is configured to communicate with the backend at `http://localhost:5000`.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios.
- **Backend**: Node.js, Express, Mongoose, JWT, Google Auth Library.
- **Database**: MongoDB.

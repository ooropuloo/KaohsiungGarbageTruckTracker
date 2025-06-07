
# Kaohsiung Garbage Truck Tracker

A web application to track Kaohsiung city garbage trucks in real-time. This project features live map updates, user geolocation, customizable alerts, a persistent watch list, and insights powered by Google's Gemini AI.

## Key Features

*   **Real-time Map Tracking**: Displays garbage trucks on a Leaflet map with their current locations.
*   **User Geolocation**: Shows the user's current location and a configurable search radius.
*   **Customizable Settings**:
    *   Adjustable data refresh interval.
    *   Selectable search range for nearby trucks.
    *   Configurable distance for proximity alerts.
*   **Persistent Watch List**:
    *   Users can add specific truck plate numbers to a watch list.
    *   Watched trucks are highlighted and prioritized in the list.
    *   Watched trucks remain visible in the sidebar (marked as "Offline") even if they are not in the current API response.
    *   Watch list is saved in the browser's `localStorage`.
*   **Proximity Alerts**:
    *   Receive toast notifications when a truck enters the defined alert distance.
    *   Optional vibration on alert.
    *   Mute/unmute functionality for all notifications.
*   **Search & Filtering**:
    *   Search for trucks by plate number or location within the sidebar.
*   **Gemini AI Integration**:
    *   **Quick Insights**: Get contextual information or advice based on current truck data.
    *   **Grounded Search**: Ask questions related to garbage collection or Kaohsiung, with answers grounded by Google Search results provided via Gemini.
*   **Responsive Design**: Optimized for both desktop and mobile viewing.
*   **Interactive UI**:
    *   Collapsible sidebar for truck details and controls.
    *   User-friendly toast notifications for alerts and actions.
    *   Dark theme for comfortable viewing.
*   **Status Indicators**: Clear visual cues for GPS status and API connection.

## Tech Stack

*   **Frontend Framework**: React 19 (using `esm.sh` for module resolution)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (via CDN)
*   **Mapping**: Leaflet.js
*   **Icons**: Font Awesome
*   **Notifications**: `react-hot-toast`
*   **AI**: Google Gemini API (`@google/genai` library)

## APIs Used

*   **Kaohsiung City Open Data API**: For fetching real-time garbage truck data.
    *   Endpoint: `https://api.kcg.gov.tw/api/service/Get/aaf4ce4b-4ca8-43de-bfaf-6dc97e89cac0`
*   **Google Gemini API**: For AI-powered insights and search grounding.
    *   Model: `gemini-2.5-flash-preview-04-17`

## Project Structure

```
.
├── index.html            # Main HTML entry point
├── index.tsx             # Main React application entry point
├── App.tsx               # Core application logic and state management
├── components/           # React UI components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── MapDisplay.tsx
│   ├── TruckItem.tsx
│   ├── GeminiModal.tsx
│   ├── RecenterMapControl.tsx
│   └── icons/index.tsx   # Icon components
├── services/             # API interaction and business logic
│   ├── truckService.ts
│   ├── geolocationService.ts
│   └── geminiService.ts
├── hooks/                # Custom React hooks
│   └── useLocalStorage.ts
├── types.ts              # TypeScript type definitions
├── constants.ts          # Application-wide constants
├── metadata.json         # Project metadata (e.g., permissions)
└── README.md             # This file
```

## Setup and Installation

This project is designed to be run directly in a browser that supports ES modules and modern JavaScript. There is no build step required for the current setup.

### Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
*   Internet connection.
*   (Optional, for `npx serve` method) Node.js and npm/npx installed.

### Running Locally

1.  **Get the Project Files**:
    Download or clone the project files to your local machine.

2.  **Handle the Gemini API Key (for Gemini AI Features)**:
    The application code in `services/geminiService.ts` uses `const API_KEY = process.env.API_KEY;` to get the Gemini API Key. When serving static files directly in a browser, `process.env.API_KEY` will be undefined.
    You have two options:

    *   **Option A: Enable Gemini Features (Local Development Only - INSECURE for sharing)**
        To make Gemini features work locally, you need to *temporarily* modify `services/geminiService.ts`:
        1.  Open `services/geminiService.ts`.
        2.  Find the line: `const API_KEY = process.env.API_KEY;`
        3.  Change it to include your actual API key, like this:
            `const API_KEY = "YOUR_ACTUAL_GEMINI_API_KEY_HERE";`
            (Replace `"YOUR_ACTUAL_GEMINI_API_KEY_HERE"` with your real key).
        4.  **VERY IMPORTANT WARNING**:
            *   **Do NOT commit this change** if you are using version control (like Git).
            *   **Do NOT deploy the application with your API key hardcoded like this.**
            *   This method is **ONLY for local testing**.
            *   Remember to revert this change (remove your hardcoded key) before sharing your code or committing it.

    *   **Option B: Run Without Gemini Features**
        If you don't have a Gemini API key or prefer not to modify the code, the application will still run. The Gemini AI features will be disabled, and you'll see a warning in the browser console. The application is designed to gracefully degrade.

3.  **Serve `index.html`**:
    You need a local HTTP server to serve the `index.html` file and other assets correctly due to browser security policies (e.g., for ES module imports).

    *   **Method 1: Using `npx serve` (Recommended if you have Node.js)**
        1.  Open your terminal or command prompt.
        2.  Navigate to the project's root directory (where `index.html` is located).
        3.  Run the command:
            ```bash
            npx serve .
            ```
        4.  The terminal will output a local address, usually `http://localhost:3000` or `http://localhost:5000`.

    *   **Method 2: Using VS Code's "Live Server" Extension**
        1.  If you are using Visual Studio Code, install the "Live Server" extension by Ritwick Dey.
        2.  Once installed, right-click on the `index.html` file in the VS Code explorer.
        3.  Select "Open with Live Server". This will automatically open the application in your default browser.

    *   **Method 3: Using Python's built-in HTTP server**
        1. Open your terminal or command prompt.
        2. Navigate to the project's root directory.
        3. If you have Python 3, run: `python -m http.server`
        4. If you have Python 2, run: `python -m SimpleHTTPServer`
        5. The server will typically run on `http://localhost:8000`.

4.  **Open in Browser**:
    Open the local address provided by your server (e.g., `http://localhost:3000`) in your web browser.

## Core Functionality Breakdown

### 1. Real-time Truck Tracking
The `MapDisplay` component uses Leaflet.js to render an interactive map. Truck data is fetched periodically by `App.tsx` using `truckService.ts`, which calls the Kaohsiung City API. Truck markers are updated on the map with their latest positions, status, and details accessible via popups.

### 2. User Geolocation
`geolocationService.ts` handles obtaining and watching the user's GPS position using the browser's Geolocation API. This position is displayed on the map with a distinct marker and a circle indicating the current search radius.

### 3. Search and Filtering
The `Sidebar` component provides an input field to filter the list of trucks by plate number or location. This filtering is done client-side on the currently displayed truck data.

### 4. Watch List
Users can add trucks to a "watch list" via the `Sidebar` or `TruckItem` components. This list is managed using the `useLocalStorage` hook to persist across sessions. Watched trucks are highlighted. If a watched truck is not present in the latest API fetch, it's still displayed in the sidebar with an "Offline" status.

### 5. Notifications
`App.tsx` handles proximity alerts. If an active (non-offline) truck's calculated `distance` (via `haversineDistance` in `truckService.ts`) falls within the user-defined `alertDistance`, a toast notification is triggered using `react-hot-toast`. A mute option is available in the `Header`.

### 6. Gemini AI Integration
The `GeminiModal` component, accessible from the `Header`, allows users to interact with the Gemini API via `geminiService.ts`:
*   **Quick Insights**: `getSimpleTruckInsights` sends a summary of current truck data to Gemini for a brief, helpful observation.
*   **Grounded Search**: `queryGeminiWithGrounding` allows users to ask free-form questions. The query is sent to Gemini with the `googleSearch` tool enabled, and the response includes the AI's answer along with web sources.

### 7. Responsive Design
Tailwind CSS is used extensively to ensure the application adapts to different screen sizes. The sidebar is collapsible on mobile and becomes sticky on larger screens.

## UI/UX Highlights

*   **Dark Theme**: Provides a visually comfortable experience, especially in low-light conditions.
*   **Interactive Map**: Smooth panning, zooming, and clickable markers with informative popups.
*   **Toast Notifications**: Non-intrusive feedback for alerts and user actions.
*   **Clear Status Indicators**: Visual cues in the header for API connectivity and GPS status.
*   **Intuitive Controls**: Easy-to-use dropdowns for settings and clear buttons for actions.

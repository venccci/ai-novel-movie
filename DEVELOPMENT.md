# AI Novel Movie - Development Guide

This document provides instructions for setting up and running the AI Novel Movie application for development purposes.

## Project Structure

The project is a monorepo with two main parts:

-   `/client`: A React frontend application built with Vite and styled with Tailwind CSS. This is the main application that directly integrates with DeepSeek API for AI-powered features.
-   `/server`: A Node.js backend server using Express. This is optional and provides additional project management capabilities for future extensions.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   DeepSeek API key (obtain from https://platform.deepseek.com/)

## Setup and Installation

### 1. Frontend Setup (Required)

Open a terminal and navigate to the `client` directory:

```bash
cd client
npm install
```

### 2. Configure DeepSeek API Key

In `client/src/App.tsx`, locate the `API_KEY` constant and replace it with your own DeepSeek API key:

```typescript
const API_KEY = "your_deepseek_api_key_here";
```

### 3. Backend Setup (Optional)

If you want to use the backend for project management features, navigate to the `server` directory:

```bash
cd server
npm install
```

## Running the Application

### Primary: Frontend-Only Mode (Recommended)

The application can run with just the frontend, which directly calls DeepSeek API:

1.  **Start the frontend application:**
    In your terminal in the `client` directory, run:

    ```bash
    npm run dev
    ```

    The frontend development server will start, usually on `http://localhost:5173`. You can open this URL in your web browser to see the application. The Vite server supports Hot Module Replacement (HMR) for a fast development experience.

### Optional: Full Stack Mode

If you want to use backend features (project persistence, etc.):

1.  **Start the backend server:**
    In your terminal in the `server` directory, run:

    ```bash
    npm start
    ```

    The backend server will start on `http://localhost:3000`. It uses `nodemon` and will automatically restart if you make any changes to the server files.

2.  **Start the frontend application** (as above).

## Backend API Endpoints (Optional)

The backend provides a RESTful API for project management. The data is currently stored in-memory and will be reset every time the server restarts.

### Projects

-   `POST /api/projects`
    -   Creates a new project and its associated style profile.
    -   **Body:**
        ```json
        {
          "name": "string (required)",
          "description": "string",
          "targetPlatform": "string",
          "language": "string",
          "visual": "object",
          "narrative": "object",
          "aiConstraints": "object"
        }
        ```

### Scripts

-   `POST /api/scripts`
    -   (Simulates) generating a structured script from novel text.
    -   **Body:**
        ```json
        {
          "novelText": "string (required)",
          "projectId": "number (required)"
        }
        ```

### Characters

-   `POST /api/characters`
    -   (Simulates) generating character assets from a script ID.
    -   **Body:**
        ```json
        {
          "scriptId": "string (required)"
        }
        ```

### Shot Lists

-   `POST /api/shotlists`
    -   (Simulates) generating a director's shot list from a script ID.
    -   **Body:**
        ```json
        {
          "scriptId": "string (required)"
        }
        ```

## Frontend Development

The frontend code is located in `/client/src`. The main application component is `App.tsx`, which implements a four-step workflow:

1.  **Project & Style Setting** (`Step1ProjectStyle` component)
2.  **Novel to Script Conversion** (`Step2Script` component)
3.  **Character Design** (`Step3Characters` component)
4.  **Storyboard Generation** (`Step4Storyboard` component)

The application uses React hooks for state management and directly calls the DeepSeek API for AI processing. The UI is built with Tailwind CSS and Lucide React icons.

## Architecture Notes

-   **AI Integration**: The frontend directly integrates with DeepSeek's chat completion API for all AI tasks (script analysis, character extraction, storyboard generation).
-   **State Management**: All application state is managed locally using React useState hooks. No external state management library is used.
-   **Optional Backend**: The backend is currently optional and not required for core functionality. It can be extended for persistence, user authentication, and project management.
-   **Component Structure**: The application uses a monolithic component structure with all steps defined in `App.tsx`. For larger projects, consider splitting into separate component files.

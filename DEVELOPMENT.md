# AI Novel Movie - Development Guide

This document provides instructions for setting up and running the AI Novel Movie application for development purposes.

## Project Structure

The project is a monorepo with two main parts:

-   `/client`: A React frontend application built with Vite and styled with Tailwind CSS.
-   `/server`: A Node.js backend server using Express.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Setup and Installation

You need to install dependencies for both the client and the server separately.

### 1. Backend Setup

Open a terminal and navigate to the `server` directory:

```bash
cd server
npm install
```

### 2. Frontend Setup

Open another terminal and navigate to the `client` directory:

```bash
cd client
npm install
```

## Running the Application

Both the frontend and backend servers must be running simultaneously.

### 1. Start the Backend Server

In your terminal in the `server` directory, run:

```bash
npm start
```

The backend server will start on `http://localhost:3000`. It uses `nodemon` and will automatically restart if you make any changes to the server files.

### 2. Start the Frontend Application

In your terminal in the `client` directory, run:

```bash
npm run dev
```

The frontend development server will start, usually on `http://localhost:5173`. You can open this URL in your web browser to see the application. The Vite server supports Hot Module Replacement (HMR) for a fast development experience.

## Backend API Endpoints

The backend provides a RESTful API to support the frontend application. The data is currently stored in-memory and will be reset every time the server restarts.

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

The frontend code is located in `/client/src`. The main application component is `App.tsx`, which currently displays the component for the active development step. To switch between steps, you can comment/uncomment the components within `App.tsx`. In a full implementation, this would be handled by a routing library like `react-router-dom`.

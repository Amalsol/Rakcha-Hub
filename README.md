# Rakcha-Hub


A dynamic, full-stack personal workspace designed for focus, productivity, and creativity. Built with Node.js, Express, and Vanilla JavaScript.


## About The Project

Rakcha Hub started as a simple to-do list and evolved into a comprehensive, interactive workspace. It moves beyond linear checklists, offering a visual, zoomable canvas where you can organize tasks, ideas, and notes as draggable "nodes."

This application is built to be a private sanctuary for deep work, combining task management with integrated tools to help maintain focus and spark creativity, like a Pomodoro timer, a music player, and a free-form digital whiteboard.

---

## ✨ Features

*   **Visual Canvas:** An infinite, scrollable canvas to visually organize your workflow.
*   **Draggable Nodes:** Create, edit, and move nodes freely to map out your thoughts.
*   **Task Management:** Each node acts as a task with a checklist, editable title, content, and tags.
*   **Visual Progress Tracker:** A dynamic donut chart and progress bars in the sidebar show your completion stats at a glance.
*   **Pomodoro Timer:** A built-in focus/break timer to help you concentrate on specific tasks.
*   **Integrated Whiteboard:** A "Jam Session" mode that provides a full-screen digital whiteboard for sketching and brainstorming.
*   **Zen Music Player:** An embedded YouTube player with a dropdown to select focus-friendly music genres (Lofi, Jazz, Classical, etc.).
*   **Server-Side Logic:** Built with a Node.js and Express backend to handle data and user sessions.
*   **Simple User System:** A clean login system that uses in-memory storage on the server to keep each user's workspace private.

---

## 🛠️ Tech Stack

This project uses a simple and powerful stack, demonstrating core web development principles.

*   **Frontend:**
    *   HTML5
    *   CSS3 (with CSS Variables for theming)
    *   Vanilla JavaScript (ES6+)
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Storage:**
    *   In-Memory Storage (Data persists as long as the server is running)
*   **Deployment:**
    *   Configured to be deployed on services like Render, Glitch, or Replit.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js and npm installed on your machine.
*   [Node.js (LTS version recommended)](https://nodejs.org/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone[ https://github.com/YourUsername/creator-hub-fullstack.git](https://github.com/Amalsol/Rakcha-Hub)
    ```
2.  **Navigate into the project directory:**
    ```sh
    cd Rakcha-hub
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Run the application:**
    ```sh
    npm start
    ```
5.  Open your browser and go to `http://localhost:3000`.

---

## 💡 Future Ideas

This project has a solid foundation that can be extended with more powerful features:

*   **Migrate to a Persistent Database:** Replace the in-memory storage with a real database like MongoDB Atlas to make all data permanent.
*   **Full User Authentication:** Implement a proper authentication system with hashed passwords and user accounts.
*   **Node Connections:** Add the ability to draw visual connections between nodes to create a true mind-map or "Zettelkasten."
*   **Cloud Storage for Whiteboard:** Save and load whiteboard sessions.

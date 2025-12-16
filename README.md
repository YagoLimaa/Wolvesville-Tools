# Welcome to Wolvesville Tools!

[Wolvesville Tools](https://wolvesville-tools.pages.dev) is your ultimate companion for Wolvesville. Dive deep into the world of Wolvesville with our comprehensive platform designed to enhance your gaming experience. Whether you're a seasoned veteran or a new recruit, we have everything you need to stay ahead of the curve!

## Key Features

- **Clan Management**: Explore detailed clan information, track rankings, and find new clans to join or recruit for.
- **Player Profiles**: Search for players, view their stats, and compare highscores to see where you stand among the best.
- **Item & Skin Marketplace**: Browse and discover the latest items and skins available in the game's shop, including active offers and battle pass rewards.
- **Battle Pass Tracker**: Stay on top of your Battle Pass progress with detailed views of challenges, rewards, and seasonal content.
- **Game Updates & Announcements**: Keep up-to-date with the latest news, changelogs, and announcements directly from the game.
- **Role Rotations**: Stay informed about current role rotations and optimize your gameplay.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Cloudflare Workers (Serverless Functions)
- **Deployment**: Cloudflare Pages

---

## 🚀 Developer Guide

This guide will help you get a local copy of the project up and running for development purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for backend)
- [Concurrently](https://www.npmjs.com/package/concurrently) (will be installed with `npm install`)


### 1. Clone the Repository

```bash
git clone https://github.com/YagoLimaa/Wolvesville-Tools.git
cd Wolvesville-Tools
```

### 2. Install Dependencies

This project is a monorepo with three separate `package.json` files. You need to install dependencies for all of them.

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd front
npm install
cd ..

# Install functions (backend) dependencies
cd functions
npm install
cd ..
```

### 3. Configure Environment Variables

The backend requires an API key from Wolvesville to function. For local development, you need to create a file to store this key.

1.  Create a file named `.dev.vars` in the **root** of the project.
2.  Add the following content to it, replacing `YOUR_API_KEY_HERE` with your actual key:

    ```
    WOLVESVILLE_API_KEY="YOUR_API_KEY_HERE"
    ```

> **Note**: The `.dev.vars` file is intended for local development only. It is already included in the root `.gitignore` file.

### 4. Running the Project Locally

Thanks to the `concurrently` script, you can start both the frontend and backend with a single command from the project's **root** directory.

```bash
npm run dev
```

This command will:
1.  Start the frontend development server (Vite).
2.  Wait for the frontend to be available.
3.  Start the backend server (Wrangler) and proxy requests to the frontend.

The application will be available at the address shown in your terminal, typically `http://localhost:8788`.

## Deployment

This project is configured for deployment on [Cloudflare Pages](https://pages.cloudflare.com/). Pushing to the main branch of your connected GitHub repository will trigger a new deployment. Remember to configure the `WOLVESVILLE_API_KEY` as a secret in your Cloudflare project settings, not in the `wrangler.toml` file.

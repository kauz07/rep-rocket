# RepRocket: Ultimate Gym & Calorie Tracker

RepRocket is a modern, client-side gym workout planner and tracker with an integrated calorie counter and AI-powered coach. Plan your workouts on a calendar, track your daily progress, visualize your stats, and get workout ideas from an intelligent assistant. All your data is stored securely in your browser's local storage, ensuring 100% privacy.

## Features

- **Interactive Calendar:** Plan and view your workouts, rest days, and missed days at a glance.
- **Detailed Workout Logging:** Track exercises, sets, reps, and weight for each session.
- **Calorie & Macro Tracking:** Monitor your daily calorie and protein intake against your goals.
- **AI Coach:** Get workout suggestions, exercise alternatives, and form tips powered by Google Gemini.
- **Stats Dashboard:** Visualize your progress with charts for workout frequency, calorie intake, weight progression, and personal records.
- **Goal Setting:** Set and track custom fitness goals.
- **Progress Photos:** Upload photos to visually track your transformation.
- **Data Privacy:** All data is stored locally on your device. No sign-up required.
- **Data Management:** Easily import and export your entire fitness journey as a JSON backup or workouts as a CSV file.
- **Customizable Themes:** Personalize the look and feel with multiple light and dark themes.

---

## Technical Overview

RepRocket is built as a static web application that uses your browser's local storage as its database. This means all your fitness data lives exclusively on your device, ensuring complete privacy.

To protect the Google Gemini API key, AI-powered features are handled by **Netlify Functions** (serverless functions) that act as a secure backend proxy. The frontend application calls these functions, which then securely call the Google Gemini API using an API key stored as a secret environment variable on Netlify.

---

## Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A code editor (like VS Code)
- A web browser

### Installation & Setup

1.  **Download and Unzip:**
    Download and unzip the project files into a new folder on your computer.

2.  **Get a Google Gemini API Key:**
    The AI Coach feature requires a Google Gemini API key.
    - Go to the [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Click "Create API key in new project".
    - Copy the generated API key. You will need it in the next step.

3.  **Set Up Environment Variable:**
    - In the root of the project folder, create a new file named `.env`.
    - Add the following line to the `.env` file, replacing `YOUR_GEMINI_API_KEY` with your actual key:
      ```
      GEMINI_API_KEY=YOUR_GEMINI_API_KEY
      ```

4.  **Install Dependencies & Run Locally:**
    - Open your terminal or command prompt and navigate to the project's root directory.
    - Install the Netlify CLI, which will allow you to run the application and the serverless functions locally.
      ```bash
      npm install -g netlify-cli
      ```
    - Install the function dependencies:
      ```bash
      npm install
      ```
    - Start the local development server:
      ```bash
      netlify dev
      ```
    - Your default web browser will open with the application running, typically at an address like `http://localhost:8888`. The Netlify CLI automatically loads your `GEMINI_API_KEY` from the `.env` file and makes the serverless functions available for the frontend to call.

---

## Deployment to Netlify

You can deploy this application for free on Netlify.

### 1. Push to a Git Repository

- Create a new repository on a Git provider (e.g., GitHub, GitLab).
- Push your project code to this new repository.
- **Important:** Ensure your `.env` file is listed in a `.gitignore` file so you don't accidentally commit your secret API key. A `.gitignore` file has been included for this purpose.

### 2. Deploy on Netlify

- Create an account on [Netlify](https://www.netlify.com/) and connect it to your Git provider.
- Select "Add new site" -> "Import an existing project" and choose your repository.

### 3. Configure Build Settings & Environment Variable

-   **Build Settings:** In your site's settings on Netlify, go to "Site configuration" -> "Build & deploy".
    -   **Build command:** Leave this field **blank**. This project does not require a frontend build step.
    -   **Publish directory:** Set this to the root of your project. You can usually leave it blank or enter `/`.
    -   **Functions directory:** This should be automatically set to `netlify/functions`.

-   **Add Environment Variable:** This is the most important step for securing your API key.
    -   Go to "Site configuration" -> "Environment variables".
    -   Click "Add a variable" and provide the following:
        -   **Key:** `GEMINI_API_KEY`
        -   **Value:** Paste the Google Gemini API key you obtained earlier.

### 4. Deploy

- Trigger a deploy from the Netlify UI. Netlify will build your serverless functions and deploy your static site. Once it's live, your application will use the secure serverless functions to power its AI features.

---
### Troubleshooting: `remix: command not found` Error

If your Netlify build fails with an error like `remix: command not found`, it means Netlify is using an incorrect build command from a previous project or from a faulty auto-detection.

**Solution:** Go to your site's **Build & deploy** settings on Netlify and ensure the **Build command** is **empty** and the **Publish directory** is set to the **root (`/`)**, as described in the "Build Settings" section above. Then, trigger a new deploy.

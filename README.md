# Harmonica Music App

This is a Next.js application for managing and playing your personal music library, with AI-powered playlist generation. This project was built in Firebase Studio.

## Getting Started & Local Development

To run this project on your local machine, you'll need to have [Node.js](https://nodejs.org/) (version 18 or later) and [npm](https://www.npmjs.com/) installed.

### 1. Download the Code

Download the project source code as a ZIP file from Firebase Studio and unzip it.

### 2. Install Dependencies

Navigate to the project's root directory in your terminal and install the necessary packages:

```bash
npm install
```

### 3. Set Up Environment Variables (for AI Features)

This project uses Genkit for its AI features, which requires an API key for the Google AI models.

1.  Create a new file named `.env` in the root of your project.
2.  Add your API key to the file like this:

```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). **Note**: Using AI features may require a billing account.

### 4. Run the Development Server

You can start the development server to run the app locally:

```bash
npm run dev
```

This will start the application, and you can view it in your browser at [http://localhost:9002](http://localhost:9002).

## Deployment

You can deploy this application to the web for free using [Vercel](https://vercel.com).

### Deploying with Vercel (Recommended for Free Hosting)

Vercel is a platform for hosting web applications that has a generous free tier and does not require a credit card for hobby projects.

1.  **Sign up for Vercel**: Create a free account at [vercel.com](https://vercel.com/signup). It's easiest to sign up with a GitHub, GitLab, or Bitbucket account.

2.  **Push Code to a Git Repository**: Vercel needs a Git repository URL to import your project. You'll need to upload your code to a service like GitHub first.

    *   **A. Create a GitHub Account**: If you don't have one, sign up for a free account at [github.com](https://github.com).

    *   **B. Create a New Repository on GitHub**:
        *   Go to [github.com/new](https://github.com/new).
        *   Give your repository a name (e.g., `harmonica-music-app`).
        *   You can keep it public.
        *   Don't initialize it with a README or .gitignore file, since your project already has these.
        *   Click **"Create repository"**.

    *   **C. Upload Your Code**:
        *   Open a terminal or command prompt on your computer and navigate to your project's folder.
        *   Initialize a new Git repository locally and push your code using the commands GitHub provides on the next page. They will look like this:
        ```bash
        # Initialize your local folder as a Git repository
        git init
        git add .
        git commit -m "Initial commit"

        # Rename the default branch to 'main'
        git branch -M main

        # Connect your local repository to the one on GitHub
        # Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual details
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

        # Push your code to GitHub
        git push -u origin main
        ```

3.  **Import Project in Vercel**:
    *   Now, on your Vercel dashboard, click **"Add New... > Project"**.
    *   Select the Git repository you just created on GitHub. Vercel will ask for permission to access your GitHub account if it's the first time.
    *   Vercel will automatically detect that it's a Next.js project. You don't need to change any settings.

4.  **Add Environment Variable (Optional for AI)**:
    *   If you want to use the AI features on your live app, go to your project's **Settings > Environment Variables** in Vercel.
    *   Add a variable with the name `GEMINI_API_KEY` and your API key as the value.

5.  **Deploy**: Click the **"Deploy"** button.

Vercel will build and deploy your application, giving you a live URL. Any time you push new changes to your Git repository, Vercel will automatically redeploy the app for you.

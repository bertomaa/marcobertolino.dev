# Firebase Deployment Guide

This guide explains how to set up automatic deployment to Firebase Hosting using GitHub Actions.

## Prerequisites

- A Firebase project with Hosting enabled
- A GitHub repository for your website
- Firebase CLI installed (optional, for local testing)

## Setup Steps

### 1. Update Firebase Project ID

Edit [.firebaserc](file:///home/marco/dev/personal_website/.firebaserc) and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2. Create Firebase Service Account

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

### 3. Add GitHub Secrets

Go to your GitHub repository settings and add these secrets:

1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

**FIREBASE_SERVICE_ACCOUNT**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Paste the entire contents of the service account JSON file you downloaded

**FIREBASE_PROJECT_ID**
- Name: `FIREBASE_PROJECT_ID`
- Value: Your Firebase project ID (e.g., `my-portfolio-12345`)

> [!IMPORTANT]
> The `GITHUB_TOKEN` secret is automatically provided by GitHub Actions, so you don't need to create it.

### 4. Push to GitHub

Initialize git and push your code:

```bash
cd /home/marco/dev/personal_website
git init
git add .
git commit -m "Initial commit with Firebase deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 5. Automatic Deployment

Once you push to the `main` branch, GitHub Actions will:
1. Checkout your code
2. Deploy to Firebase Hosting automatically
3. Your site will be live at: `https://YOUR_PROJECT_ID.web.app`

## Workflow Details

The GitHub Actions workflow ([.github/workflows/firebase-deploy.yml](file:///home/marco/dev/personal_website/.github/workflows/firebase-deploy.yml)) runs on:
- **Push to main**: Deploys to production
- **Pull requests**: Creates preview channels for testing

## Local Testing (Optional)

If you want to test Firebase hosting locally before deploying:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Test locally
firebase serve

# Manual deployment (if needed)
firebase deploy
```

## Files Created

- [.github/workflows/firebase-deploy.yml](file:///home/marco/dev/personal_website/.github/workflows/firebase-deploy.yml) - GitHub Actions workflow
- [firebase.json](file:///home/marco/dev/personal_website/firebase.json) - Firebase hosting configuration
- [.firebaserc](file:///home/marco/dev/personal_website/.firebaserc) - Firebase project settings
- [.gitignore](file:///home/marco/dev/personal_website/.gitignore) - Git ignore rules

## Troubleshooting

### Deployment fails with authentication error
- Verify your `FIREBASE_SERVICE_ACCOUNT` secret is correctly set
- Ensure the service account has Firebase Hosting Admin permissions

### Wrong project being deployed
- Check that `FIREBASE_PROJECT_ID` matches your actual project ID
- Verify [.firebaserc](file:///home/marco/dev/personal_website/.firebaserc) has the correct project ID

### Changes not appearing
- Clear browser cache
- Check GitHub Actions tab to ensure deployment succeeded
- Verify you pushed to the `main` branch

## Next Steps

> [!TIP]
> After your first deployment, you can view your live site at `https://YOUR_PROJECT_ID.web.app` or connect a custom domain through the Firebase Console.

For custom domains:
1. Go to Firebase Console → Hosting
2. Click **Add custom domain**
3. Follow the DNS configuration steps

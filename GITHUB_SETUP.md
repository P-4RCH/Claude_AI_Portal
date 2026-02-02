# GitHub Setup Guide

## Method 1: Upload Files Directly to GitHub (Easiest)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `claude-ai-portal` (or your choice)
   - Description: "AI chat portal powered by Claude API"
   - Choose Public or Private
   - ❌ **Do NOT** check "Add a README file"
   - Click "Create repository"

2. **Download and extract the project:**
   - Download the `claude-portal.tar.gz` file
   - Extract it to a folder on your computer

3. **Upload files to GitHub:**
   - On your new repository page, click "uploading an existing file"
   - Drag and drop ALL files from the extracted folder
   - Or click "choose your files" and select all files
   - Add commit message: "Initial commit - Claude AI Portal"
   - Click "Commit changes"

## Method 2: Use Git Commands (Recommended for developers)

1. **Create a new repository on GitHub** (same as Method 1 step 1)

2. **Extract and navigate to the project:**
   ```bash
   tar -xzf claude-portal.tar.gz
   cd claude-portal
   ```

3. **Initialize Git and push:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Claude AI Portal"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Important Files Overview

```
claude-portal/
├── api/
│   └── chat.js              # Backend API for Claude
├── src/
│   ├── App.jsx              # Main React component
│   ├── App.css              # Styles
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore file
├── README.md                # Documentation
└── DEPLOYMENT.md            # Deployment guide
```

## After Uploading to GitHub

### Option A: Deploy with Vercel (Recommended)

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your API key from https://console.anthropic.com/
5. Click "Deploy"

### Option B: Clone and develop locally

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
cp .env.example .env
# Edit .env and add your API key
npm run dev
```

## Security Reminder

⚠️ **NEVER commit your `.env` file with your actual API key!**

The `.gitignore` file is already configured to ignore:
- `.env`
- `.env.local`
- `node_modules/`
- `dist/`

## Updating Your Repository

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

If you deployed to Vercel, it will automatically redeploy when you push!

## Get Your API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy it and add to Vercel environment variables

## Need Help?

- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Anthropic API Docs: https://docs.anthropic.com

Happy coding! 🚀

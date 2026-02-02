# Quick Deployment Guide for Vercel

## Prerequisites
✅ Get your Anthropic API key from: https://console.anthropic.com/
✅ Create a Vercel account at: https://vercel.com (it's free!)

## Option 1: Deploy via Vercel CLI (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
vercel
```

Answer the prompts:
- Set up and deploy? **Yes**
- Link to existing project? **No**
- Project name? **Press Enter** (or choose a custom name)
- Directory? **./** (press Enter)

### Step 5: Add Your API Key
```bash
vercel env add ANTHROPIC_API_KEY
```

When prompted:
- Enter your Anthropic API key
- Select: **Production**

### Step 6: Deploy to Production
```bash
vercel --prod
```

🎉 **Done!** Your site is now live. Vercel will give you a URL like: `your-project.vercel.app`

---

## Option 2: Deploy via GitHub (10 minutes)

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (can be public or private)
3. Don't initialize with README (we already have files)

### Step 2: Push Your Code
```bash
git init
git add .
git commit -m "Initial commit - Claude AI Portal"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Import to Vercel
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Vercel will auto-detect it's a Vite project

### Step 4: Add Environment Variable
Before clicking Deploy:
1. Click **"Environment Variables"**
2. Add variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your API key from Anthropic
3. Select **all environments** (Production, Preview, Development)

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Your site is live!

🎉 **Done!** Vercel will give you a URL like: `your-project.vercel.app`

---

## After Deployment

### Custom Domain (Optional)
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### View Logs
1. Go to your project dashboard
2. Click "Deployments"
3. Click on any deployment to see logs

### Update Your Site
Just push to GitHub or run `vercel --prod` again!

---

## Troubleshooting

### "API key not found" error
- Go to Vercel → Your Project → Settings → Environment Variables
- Make sure `ANTHROPIC_API_KEY` is set
- Click "Redeploy" button

### Build fails
- Check the build logs in Vercel dashboard
- Make sure all dependencies are in package.json
- Try running `npm run build` locally first

### Site is slow
- Check your Anthropic API usage/limits
- Consider upgrading Vercel plan if needed
- Monitor the serverless function timeout

---

## Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME

# View deployment logs
vercel logs
```

---

## Cost Information

- **Vercel**: Free tier includes 100GB bandwidth, unlimited projects
- **Anthropic API**: Pay-as-you-go pricing, see https://anthropic.com/pricing

---

Need help? Check the main README.md or visit:
- Vercel Docs: https://vercel.com/docs
- Anthropic Docs: https://docs.anthropic.com

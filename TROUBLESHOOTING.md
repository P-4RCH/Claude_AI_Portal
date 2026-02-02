# Troubleshooting Guide

## Error: "Sorry, there was an error processing your request"

This usually means one of three things:

### 1. API Key Not Configured ⚠️ (Most Common)

**Solution:**
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Your API key from https://console.anthropic.com/
   - **Environments:** Check all three (Production, Preview, Development)
4. Click **Save**
5. Go to **Deployments** tab
6. Click the **three dots** (•••) on your latest deployment
7. Click **Redeploy** → **Use existing Build Cache** → **Redeploy**

### 2. Wrong API Endpoint

The API route should be at: `https://your-domain.vercel.app/api/chat`

**Check this:**
- Open browser console (F12)
- Try sending a message
- Look at the Network tab
- See what URL it's calling

**If the URL is wrong**, the app might be calling `/api/chat` but Vercel expects it at that exact path.

### 3. API Key Invalid

**Test your API key:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

If this returns an error, your API key is invalid.

## How to Check Vercel Logs

1. Go to your project on Vercel
2. Click **Deployments**
3. Click on your latest deployment
4. Click **Functions** tab
5. Click on the `/api/chat` function
6. View the logs to see actual errors

## Common Error Messages

### "API key not configured"
→ Add `ANTHROPIC_API_KEY` in Vercel environment variables and redeploy

### "Authentication error"
→ Your API key is invalid or expired. Get a new one from Anthropic

### "Rate limit exceeded"
→ You've hit Anthropic's API rate limit. Wait a few minutes or upgrade your plan

### "Model not found"
→ The model name is wrong. Use: `claude-sonnet-4-5-20250929`

### "CORS error"
→ The API route should handle CORS (it does in the fixed version)

## Testing Your Deployment

### Test 1: Check if the API route exists
```bash
curl https://your-domain.vercel.app/api/chat
```
Should return: `{"error":"Method not allowed"}`

### Test 2: Test with a POST request
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

Should return a response with Claude's message.

## Environment Variable Checklist

✅ Variable name is exactly: `ANTHROPIC_API_KEY` (case-sensitive)
✅ Value has no extra spaces before/after
✅ Value starts with `sk-ant-` (Anthropic API keys format)
✅ All three environments are selected (Production, Preview, Development)
✅ You clicked "Save"
✅ You redeployed after saving

## Still Not Working?

### Option 1: Check Browser Console
1. Open your deployed site
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Try sending a message
5. Look for red error messages
6. Share the error message for help

### Option 2: View Network Requests
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try sending a message
4. Click on the `/api/chat` request
5. Check the **Response** tab
6. See what error message is returned

### Option 3: Check Vercel Function Logs
1. Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click your latest deployment
4. Click **Functions** → `/api/chat`
5. View real-time logs

## Quick Fix Commands

If you need to redeploy with the fixed code:

```bash
# Pull latest changes
git pull origin main

# If you made changes
npm install
npm run build

# Commit and push
git add .
git commit -m "Fix API configuration"
git push

# Or use Vercel CLI
vercel --prod
```

## Vercel Configuration

Make sure your `vercel.json` looks like this:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Getting Help

If none of this works:

1. **Check Anthropic Status:** https://status.anthropic.com/
2. **Check Vercel Status:** https://www.vercel-status.com/
3. **Review API Docs:** https://docs.anthropic.com/
4. **Vercel Support:** https://vercel.com/support

## Common Success Path

1. ✅ Get API key from Anthropic Console
2. ✅ Add to Vercel Environment Variables
3. ✅ Redeploy (important!)
4. ✅ Wait 30-60 seconds for deployment
5. ✅ Hard refresh your browser (Ctrl+F5)
6. ✅ Test sending a message

Remember: **Environment variable changes require a redeploy to take effect!**

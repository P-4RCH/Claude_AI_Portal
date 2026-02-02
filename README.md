# Claude AI Portal

A beautiful, modern web portal for interacting with Claude AI, built with React and ready to deploy on Vercel.

## Features

- 💬 Real-time chat interface with Claude AI
- 🎨 Modern, responsive design with smooth animations
- 🚀 Fast and optimized with Vite
- 🔒 Secure API key handling
- 📱 Mobile-friendly interface
- ⚡ Easy deployment to Vercel

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key (get one at https://console.anthropic.com/)
- A Vercel account (free at https://vercel.com)

## Local Development Setup

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5173 in your browser.

## API Endpoint

Once deployed, your API endpoint will be at:
```
https://your-project-name.vercel.app/api/chat
```

This is a serverless function that:
- Accepts POST requests with chat messages
- Forwards them to Claude API
- Returns Claude's responses
- Handles errors and CORS

**Testing your API endpoint:**
```bash
curl -X POST https://your-project-name.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

## Deploying to Vercel

### Method 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts. For the first deployment, Vercel will ask:
   - Set up and deploy? Yes
   - Which scope? (select your account)
   - Link to existing project? No
   - What's your project's name? (press enter or choose a name)
   - In which directory is your code located? ./
   
4. **Add environment variable**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   
   Enter your API key when prompted, and select "Production" when asked which environment.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via GitHub

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Add environment variables**
   - In the deployment settings, add:
     - Name: `ANTHROPIC_API_KEY`
     - Value: Your Anthropic API key
   
4. **Deploy**
   - Click "Deploy"
   - Your site will be live in minutes!

## Environment Variables

Make sure to add these environment variables in Vercel:

- `ANTHROPIC_API_KEY` - Your Anthropic API key from https://console.anthropic.com/

### Adding Environment Variables in Vercel Dashboard

1. Go to your project in Vercel
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add `ANTHROPIC_API_KEY` with your API key
5. Select all environments (Production, Preview, Development)
6. Click "Save"

## Project Structure

```
claude-portal/
├── api/
│   └── chat.js           # Serverless API endpoint for Claude
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Component styles
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## Customization

### Changing the AI Model

Edit `api/chat.js` and change the model:

```javascript
model: 'claude-sonnet-4-5-20250929',  // Change to another Claude model
```

Available models:
- `claude-opus-4-5-20251101` (most capable)
- `claude-sonnet-4-5-20250929` (balanced)
- `claude-haiku-4-5-20251001` (fast and efficient)

### Styling

All styles are in `src/App.css`. You can customize:
- Colors (change the gradient and theme colors)
- Typography
- Spacing and layout
- Animations

## Troubleshooting

### API Key Issues
- Make sure your API key is correctly added to Vercel environment variables
- Redeploy after adding environment variables

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Make sure you're using Node.js 18 or higher

### Deployment Issues
- Check Vercel deployment logs for specific errors
- Ensure all environment variables are set correctly

## Security Notes

- Never commit your `.env` file to Git
- Keep your API key secure
- The API route is serverless and runs on Vercel's infrastructure
- API keys are never exposed to the client

## License

MIT License - feel free to use this for your own projects!

## Support

For issues with:
- Claude API: https://docs.anthropic.com
- Vercel deployment: https://vercel.com/docs
- React/Vite: Check their respective documentation

## Next Steps

After deployment, you might want to:
- Add user authentication
- Implement conversation history storage
- Add rate limiting
- Customize the UI with your branding
- Add more features like file uploads or voice input

Enjoy your Claude AI Portal! 🚀

# Chess Roulette - Deployment Guide to Railway

This guide will help you deploy your Chess Roulette application to Railway, making it publicly accessible on the internet.

## Prerequisites

- GitHub account (you have one: leesegundo)
- Railway account (free tier available)
- Git installed on your machine

## Step 1: Initialize Git and Push to GitHub

Open **Windows PowerShell** or **Git Bash** in your project directory and run:

```bash
# Navigate to your project
cd C:\path\to\chess-roulette

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Chess Roulette app"

# Create a new repository on GitHub
# Option A: Use GitHub CLI (if installed)
gh repo create chess-roulette --public --source=. --push

# Option B: Manual creation
# 1. Go to https://github.com/new
# 2. Repository name: chess-roulette
# 3. Make it Public
# 4. Click "Create repository"
# 5. Then run these commands:
git remote add origin https://github.com/leesegundo/chess-roulette.git
git branch -M main
git push -u origin main
```

## Step 2: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → "Sign in with GitHub"
3. Authorize Railway to access your GitHub account
4. You'll get 500 free credits/month (enough for small projects)

## Step 3: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. After logging into Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select **"chess-roulette"** from your repositories
4. Railway will automatically detect it's a Node.js app
5. Click **"Deploy"**

### Option B: Deploy from CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to your project
railway link

# Deploy
railway up
```

## Step 4: Configure Environment Variables

After deployment starts:

1. Go to your project in Railway dashboard
2. Click on your service → **"Variables"** tab
3. Add these environment variables:

```
PORT=3001
NODE_ENV=production
CLIENT_URL=https://your-railway-url.railway.app
VITE_SERVER_URL=https://your-railway-url.railway.app
```

**Important:** Replace `your-railway-url.railway.app` with your actual Railway URL (you'll get this after deployment).

## Step 5: Update Frontend Configuration

Since this is a full-stack app with Socket.io, you need to ensure the frontend connects to the correct server URL:

1. In Railway dashboard, find your project's public URL
2. Update the `VITE_SERVER_URL` environment variable with this URL
3. Redeploy: `railway up` or trigger redeploy from dashboard

## Step 6: Access Your App

Once deployment is complete:

1. Railway will provide a public URL like: `https://chess-roulette-production.up.railway.app`
2. Share this URL with anyone to play chess!
3. Both players can access the same URL and will be matched randomly

## Troubleshooting

### WebSocket Connection Issues

If players can't connect:

1. Make sure `VITE_SERVER_URL` points to your Railway URL
2. Check Railway logs for errors (Dashboard → Deployments → View Logs)
3. Ensure CORS is properly configured in the server

### Camera/Microphone Not Working

WebRTC requires HTTPS in production. Railway provides HTTPS automatically, so this should work out of the box.

### Build Failures

Check the build logs in Railway dashboard. Common issues:
- Missing dependencies → ensure all packages are in `package.json`
- TypeScript errors → run `npm run build` locally first to catch errors
- Port conflicts → Railway sets the `PORT` variable automatically

## Monitoring Your Deployment

- **Logs**: Railway Dashboard → Your Service → Deployments → View Logs
- **Metrics**: Dashboard shows CPU, Memory, and Network usage
- **Alerts**: Set up alerts in Railway settings for failures

## Pricing

Railway offers:
- **Free tier**: $5 credit/month (enough for hobby projects)
- **Paid plans**: Start at $5/month for more resources

Your chess app should run well on the free tier for moderate usage.

## Next Steps

After successful deployment:

1. Test the app with a friend (open in two different browsers/devices)
2. Share the URL on social media or with your chess community
3. Monitor usage and upgrade Railway plan if needed
4. Consider adding a custom domain (Railway supports this)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/leesegundo/chess-roulette/issues

---

**Good luck with your Chess Roulette deployment! 🎮♟️**

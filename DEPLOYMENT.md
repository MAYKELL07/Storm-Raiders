# ⚓ Deploying Raiders on Deck to Vercel

## Quick Deployment Steps

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```powershell
   npm install -g vercel
   ```

2. **Navigate to your project directory**:
   ```powershell
   cd "c:\Users\ferre\Documents\ProjecrMic\Storm Raiders"
   ```

3. **Login to Vercel**:
   ```powershell
   vercel login
   ```
   - Choose your preferred login method (GitHub, GitLab, Email, etc.)

4. **Deploy the project**:
   ```powershell
   vercel
   ```
   - Follow the prompts:
     - Set up and deploy? **Y**
     - Which scope? Select your account
     - Link to existing project? **N** (for first deployment)
     - Project name? **raiders-on-deck** (or your preferred name)
     - Directory? **./** (press Enter)
     - Override settings? **N**

5. **Your game is now live!**
   - Vercel will give you a URL like: `https://raiders-on-deck.vercel.app`
   - Copy this URL and share it with anyone!

6. **For production deployment**:
   ```powershell
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard (No CLI needed)

1. **Go to** [vercel.com](https://vercel.com)

2. **Sign up or Log in** (use GitHub for easier integration)

3. **Click "Add New..." → "Project"**

4. **Import Git Repository** OR **Deploy from folder**:
   - If using Git: Connect your GitHub account and select the repository
   - If no Git: Use the CLI method above

5. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: **.**
   - Build Command: (leave empty)
   - Output Directory: **.**

6. **Click "Deploy"**

7. **Wait for deployment** (usually takes 1-2 minutes)

8. **Your game is live!** Visit the URL provided

---

## Important: Multiplayer Limitations

⚠️ **Current Implementation Uses LocalStorage**

The current multiplayer system uses `localStorage` which only works on the same computer (different browser tabs). For TRUE online multiplayer across different computers, you'll need to upgrade to WebSockets.

### What This Means:

**Current (LocalStorage):**
- ✅ Game works perfectly for single-player or local testing
- ✅ Can test multiplayer on one computer (multiple browser windows)
- ❌ Players on different computers CANNOT play together
- ❌ Rooms are not shared between different users

**For True Online Multiplayer:**
You need to implement a backend server. See "Upgrading to Real Multiplayer" below.

---

## After Deployment

### Your Vercel URL will be:
- Development: `https://your-project-name.vercel.app`
- Production: `https://your-project-name.vercel.app` (after `vercel --prod`)
- Custom domain: Can add in Vercel dashboard settings

### Testing Your Deployed Game:

1. Open the Vercel URL in your browser
2. Create a room
3. Open the SAME URL in another tab on YOUR computer
4. Join the room with the code
5. Play!

**Note:** Players on different computers won't be able to join each other's rooms with the current localStorage implementation.

---

## Upgrading to Real Online Multiplayer

To enable true multiplayer across different computers:

### Option A: Use Vercel Serverless Functions + Database

1. **Create a Vercel Serverless API** (free tier available)
2. **Add a database** (Vercel KV, Supabase, or Firebase)
3. **Replace `multiplayer.js`** with API calls
4. **Use polling or Server-Sent Events** for real-time updates

### Option B: Use External WebSocket Service

1. **Sign up for a WebSocket service**:
   - [Ably](https://ably.com) (free tier: 3M messages/month)
   - [Pusher](https://pusher.com) (free tier available)
   - [Socket.io on Railway](https://railway.app) (free tier available)

2. **Replace `multiplayer.js`** with WebSocket implementation

3. **Redeploy to Vercel**

### Option C: Full Backend (Node.js + Socket.io)

1. **Create a separate backend** (Node.js + Express + Socket.io)
2. **Deploy backend to**:
   - Railway.app (free tier)
   - Render.com (free tier)
   - Heroku (paid)
   - Your own VPS

3. **Update frontend** to connect to backend
4. **Deploy frontend to Vercel**

---

## File Structure (Already Created)

```
Storm Raiders/
├── index.html          # Main game page
├── info.html           # Game information
├── styles.css          # All styling
├── gameData.js         # Ships and cards
├── gameEngine.js       # Game logic
├── multiplayer.js      # Room system (localStorage)
├── ui.js               # UI management
├── wiki.js             # Game guide
├── main.js             # Game controller
├── package.json        # ✅ Created
├── vercel.json         # ✅ Created
├── .gitignore          # ✅ Created
├── README.md           # Documentation
├── QUICKSTART.md       # Quick guide
└── ACTION_GUIDE.md     # Action help
```

---

## Vercel Features You Get:

✅ **Free Hosting** for static sites
✅ **HTTPS** automatically enabled
✅ **CDN** for fast global loading
✅ **Automatic deployments** from Git (if connected)
✅ **Custom domains** (can add your own)
✅ **Analytics** (basic usage stats)
✅ **99.99% uptime**

---

## Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `raiders.yourdomain.com`)
4. Update your DNS records as instructed
5. Wait for SSL certificate (automatic)

---

## Troubleshooting

### "Command not found: vercel"
- Install Node.js first from [nodejs.org](https://nodejs.org)
- Then install Vercel CLI: `npm install -g vercel`

### "Project already exists"
- Use `vercel --prod` to deploy to production
- Or create new project with different name

### "Build failed"
- This shouldn't happen (static files only)
- Check that all files are in the directory
- Make sure `vercel.json` is correct

### Game loads but multiplayer doesn't work
- **Expected!** LocalStorage only works locally
- See "Upgrading to Real Multiplayer" section above

---

## Quick Commands Reference

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview (testing)
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# Remove a deployment
vercel rm [deployment-url]
```

---

## Next Steps After Deployment

1. ✅ Deploy to Vercel (follow steps above)
2. ✅ Test the deployed game
3. ✅ Share the URL with friends (they can see the game)
4. ⚠️ Note: Multiplayer won't work across different computers yet
5. 🔄 Consider upgrading to real multiplayer (see options above)
6. 🎨 Customize domain name (optional)
7. 📊 Monitor usage in Vercel dashboard

---

## Cost

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Analytics (basic)

**This is MORE than enough for your game!**

For true multiplayer, backend services have their own free tiers:
- Ably: 3M messages/month free
- Railway: $5 credit/month free
- Supabase: 500 MB database free

---

## Ready to Deploy?

1. Open PowerShell
2. Run: `npm install -g vercel`
3. Run: `cd "c:\Users\ferre\Documents\ProjecrMic\Storm Raiders"`
4. Run: `vercel login`
5. Run: `vercel`
6. Share your game URL! 🎮⚓

**Your pirate game will be live in minutes!** 🏴‍☠️

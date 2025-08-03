# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Railway/Render account (for backend)
- MongoDB Atlas account
- Cloudinary account

## Step 1: Push to GitHub

1. **Initialize Git repository:**
   ```bash
   cd Droply
   git init
   git add .
   git commit -m "Initial commit: Droply file sharing app"
   ```

2. **Create GitHub repository:**
   - Go to GitHub and create a new repository named "droply"
   - Don't initialize with README (we already have one)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOURUSERNAME/droply.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend (Railway)

1. **Go to [Railway.app](https://railway.app)**
2. **Connect GitHub** and select your repository
3. **Configure Build Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
4. **Set Environment Variables:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/droply
   JWT_SECRET=your-super-secret-jwt-key-here
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Deploy** - Railway will automatically deploy your backend

## Step 3: Deploy Frontend (Vercel)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Import Project** from GitHub
3. **Configure Project:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
4. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```

5. **Deploy** - Vercel will build and deploy your frontend

## Step 4: Update Backend FRONTEND_URL

After Vercel deployment, update your Railway backend environment variable:
```
FRONTEND_URL=https://your-app.vercel.app
```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test registration/login
3. Upload a file
4. Share a file
5. Test all features

## 🔧 Alternative Hosting Options

### Backend:
- **Render** (Free tier available)
- **Heroku** (Paid)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**

### Frontend:
- **Netlify**
- **GitHub Pages** (static only)
- **Cloudflare Pages**

## 🐛 Common Issues

1. **CORS Errors**: Make sure FRONTEND_URL matches your deployed frontend URL
2. **API Connection**: Verify VITE_API_URL points to your deployed backend
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **MongoDB Connection**: Ensure MongoDB Atlas allows connections from Railway's IPs

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] Database connection working
- [ ] File upload working
- [ ] File sharing working
- [ ] Authentication working
- [ ] All environment variables configured
- [ ] CORS properly configured
- [ ] Custom domain (optional)

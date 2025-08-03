# 📁 Droply - File Sharing Made Simple

A modern, secure file sharing application built with the MERN stack. Upload, share, and manage your files with ease.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user authentication
- ☁️ **Cloud Storage** - Powered by Cloudinary for reliable file storage
- 🔗 **Easy Sharing** - Generate shareable links with QR codes
- 🖼️ **File Preview** - Preview images, videos, and documents
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, dark theme interface
- 🗑️ **File Management** - Upload, delete, and organize your files
- 💾 **Storage Tracking** - Monitor your storage usage

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Vite
- React Router
- Lucide Icons

**Backend:**
- Node.js
- Express.js
- MongoDB
- Cloudinary
- JWT Authentication

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/droply.git
   cd droply
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

5. **Start the application**
   
   Backend:
   ```bash
   cd backend
   npm start
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## 📦 Deployment

### Backend (Railway/Render)
1. Push your code to GitHub
2. Connect your repository to Railway or Render
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push your code to GitHub
2. Import project to Vercel
3. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |
| `FRONTEND_URL` | Frontend URL for CORS |

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Files
- `GET /api/files` - Get user files
- `POST /api/files/upload` - Upload files
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/share/:shareLink` - Get shared file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Cloudinary](https://cloudinary.com/) for file storage
- [MongoDB](https://mongodb.com/) for database
- [Vercel](https://vercel.com/) for hosting
- [React](https://reactjs.org/) for the frontend framework

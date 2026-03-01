# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 2: Setup Environment Variables

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=mysecretkey123
GEMINI_API_KEY=your_gemini_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Step 3: Start MongoDB

**Windows:**
```bash
mongod
```

**Mac/Linux:**
```bash
sudo systemctl start mongodb
```

### Step 4: Run the Application

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### Step 5: Open Browser

Navigate to: http://localhost:5173

## 📝 Test the Application

1. Click "Get Started" or "Login"
2. Create a new account
3. Create your first resume
4. Fill in your information
5. Try the AI optimization feature
6. Preview and share your resume

## 🔑 Getting API Keys (Optional for Testing)

### Google Gemini (for AI features)
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env`

### ImageKit (for image uploads)
1. Sign up: https://imagekit.io/
2. Go to Dashboard → Developer Options
3. Copy Public Key, Private Key, and URL Endpoint
4. Add to `.env`

## 🎨 Available Templates

- Modern (default)
- Classic
- Minimal
- Minimal with Image

## 📱 Features to Test

- ✅ User Registration/Login
- ✅ Create Multiple Resumes
- ✅ Live Preview
- ✅ AI Content Optimization
- ✅ Image Upload
- ✅ Template Switching
- ✅ Color Customization
- ✅ Share Resume Link
- ✅ Download as PDF

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check the connection string in `.env`

**Port Already in Use:**
- Change PORT in `server/.env`
- Update API_URL in `client/src/api.js`

**AI Optimization Not Working:**
- Verify GEMINI_API_KEY is correct
- Check API quota limits

**Image Upload Failing:**
- Verify ImageKit credentials
- Check file size (max 5MB)

## 📚 Next Steps

- Customize templates in `client/src/assets/templates/`
- Add more AI prompts in `server/controllers/aiController.js`
- Implement additional features
- Deploy to production

## 💡 Tips

- Use Chrome DevTools for debugging
- Check browser console for errors
- Monitor server logs for API issues
- Test with different resume data

Happy Building! 🎉

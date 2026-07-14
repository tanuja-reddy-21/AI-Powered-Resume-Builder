# 🚀 AI-Powered Resume Builder

A smart, full-stack web application that empowers users to create professional, ATS-optimized resumes in minutes using AI. Built with the MERN stack, this application streamlines formatting, generates tailored content, and provides real-time previews alongside downloadable PDF functionality.

---

## ✨ Features

*   **🧠 AI Content Generation:** Generates high-impact professional summaries, refines work experience bullet points, and suggests relevant industry skills.
*   **📊 Smart AI Scoring & Analysis:** Evaluates your resume against specific Job Descriptions (JD Matcher) and provides actionable feedback to improve ATS scores.
*   **🎨 Dynamic Templates & Styling:** Offers clean, modern, and classic templates with live color-picking and header customization.
*   **👁️ Live Real-Time Preview:** Instantly visualizes form inputs and layout adjustments side-by-side as you edit.
*   **📥 Seamless PDF Export:** High-quality, print-ready PDF conversion for easy application submission.
*   **🔐 Secure Authentication:** Complete user dashboard to securely save, manage, and re-edit multiple resumes.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** React.js (Vite)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React

### Backend (Server)
*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose)
*   **AI Engine:** OpenAI API Integration

---

## 📂 Project Structure

```text
AI-POWERED-RESUME-BUILDER/
│
├── client/                 # Frontend React Application
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── assets/         # Images, templates, and asset managers
│   │   ├── components/     # Reusable UI elements (AI tools, pickers, layouts)
│   │   ├── context/        # App-wide global state management
│   │   ├── pages/          # Full page views (Dashboard, Builder, Home, Login)
│   │   ├── App.jsx         # Core layout and routing implementation
│   │   ├── api.js          # Centralized backend API configurations
│   │   └── main.jsx        # React application entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Express API
│   ├── config/             # Database connection profiles
│   ├── controllers/        # Business logic for Auth, AI, Resumes, and Images
│   ├── middleware/         # Security and JWT authentication checks
│   ├── models/             # Mongoose schemas (User, Resume)
│   ├── routes/             # Express routing rules mapping controllers
│   ├── utils/              # Helper modules (AI analyzer, prompt managers)
│   ├── server.js           # Server initialization entry point
│   └── package.json
│
├── .gitignore              # Multi-tier build environment exclusion list
└── README.md
⚙️ Installation & Setup
Follow these steps to configure your local development environment:

1️⃣ Clone the Repository
Bash
git clone [https://github.com/tanuja-reddy-21/AI-Powered-Resume-Builder.git](https://github.com/tanuja-reddy-21/AI-Powered-Resume-Builder.git)
cd AI-Powered-Resume-Builder
2️⃣ Configure the Server
Navigate to the server directory, install the required dependencies, and set up your environment variables:

Bash
cd server
npm install
Create a .env file in the root of the server/ directory and include the following:

Bash
npm run dev # or node server.js
3️⃣ Configure the Client
Open a new terminal tab, navigate to the client directory, install its packages, and boot the interface:

Bash
cd client
npm install
npm run dev
Open your browser and navigate to the local address provided by Vite (typically http://localhost:5173).

🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
Distributed under the MIT License. See LICENSE for more information.

👨‍💻 Author
Tanuja Gaddam

GitHub: https://github.com/tanuja-reddy-21

LinkedIn: https://www.linkedin.com/in/gaddam-tanuja-b574522bb/

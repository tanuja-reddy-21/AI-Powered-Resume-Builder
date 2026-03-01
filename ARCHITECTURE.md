# Application Flow & Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + Tailwind CSS)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND ROUTES                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │  Home    │  Login   │Dashboard │ Builder  │ Preview  │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│                   (Express.js Server)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CORS  │  Body Parser  │  JWT Middleware  │  Routes     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┬─────────────┐
                │             │             │             │
                ▼             ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   Auth   │  │  Resume  │  │    AI    │  │  Image   │
        │Controller│  │Controller│  │Controller│  │Controller│
        └──────────┘  └──────────┘  └──────────┘  └──────────┘
                │             │             │             │
                ▼             ▼             │             │
        ┌──────────┐  ┌──────────┐         │             │
        │   User   │  │  Resume  │         │             │
        │  Model   │  │  Model   │         │             │
        └──────────┘  └──────────┘         │             │
                │             │             │             │
                └─────────────┴─────────────┘             │
                              │                           │
                              ▼                           │
                    ┌──────────────────┐                  │
                    │    MongoDB       │                  │
                    │   Database       │                  │
                    └──────────────────┘                  │
                                                          │
                ┌─────────────────────────────────────────┤
                │                                         │
                ▼                                         ▼
    ┌──────────────────────┐                ┌──────────────────────┐
    │  Google Gemini AI    │                │     ImageKit         │
    │  (Content Optimize)  │                │  (Image Storage)     │
    └──────────────────────┘                └──────────────────────┘
```

## User Journey Flow

### 1. Registration & Login Flow
```
User → Landing Page → Click "Get Started"
                          ↓
                    Login/Signup Page
                          ↓
                    Enter Credentials
                          ↓
                    POST /api/auth/signup or /api/auth/login
                          ↓
                    Receive JWT Token
                          ↓
                    Store in localStorage
                          ↓
                    Redirect to Dashboard
```

### 2. Resume Creation Flow
```
Dashboard → Click "Create New Resume"
                ↓
        POST /api/resumes
                ↓
        Create Empty Resume in DB
                ↓
        Redirect to Resume Builder
                ↓
        User Fills Information
                ↓
        Auto-save (PUT /api/resumes/:id)
                ↓
        Live Preview Updates
```

### 3. AI Optimization Flow
```
Resume Builder → User Writes Content
                      ↓
                Click "AI Optimize"
                      ↓
            POST /api/ai/optimize
                      ↓
            Send to Google Gemini
                      ↓
            Receive Optimized Text
                      ↓
            Display to User
                      ↓
            User Accepts/Modifies
                      ↓
            Save to Database
```

### 4. Image Upload Flow
```
Resume Builder → Click "Upload Image"
                      ↓
                Select File
                      ↓
            POST /api/images/upload
                      ↓
            Upload to ImageKit
                      ↓
            Background Removal
                      ↓
            Receive CDN URL
                      ↓
            Save URL in Resume
                      ↓
            Display in Preview
```

### 5. Resume Sharing Flow
```
Dashboard → Click Eye Icon
              ↓
        GET /api/resumes/:id
              ↓
        Public Preview Page
              ↓
        Click "Share"
              ↓
        Copy Public URL
              ↓
        Share with Others
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐       │
│  │   React    │───▶│  Context   │───▶│Local Storage│       │
│  │ Components │    │   (State)  │    │   (Token)   │       │
│  └────────────┘    └────────────┘    └────────────┘       │
│         │                                                    │
│         │ API Calls (fetch)                                │
│         ▼                                                    │
└──────────────────────────────────────────────────────────────┘
         │
         │ HTTP Requests
         ▼
┌──────────────────────────────────────────────────────────────┐
│                       SERVER SIDE                            │
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐       │
│  │  Express   │───▶│Middleware  │───▶│Controllers │       │
│  │   Routes   │    │   (Auth)   │    │  (Logic)   │       │
│  └────────────┘    └────────────┘    └────────────┘       │
│         │                                    │              │
│         │                                    ▼              │
│         │                          ┌────────────┐          │
│         │                          │  Models    │          │
│         │                          │ (Schemas)  │          │
│         │                          └────────────┘          │
│         │                                    │              │
│         ▼                                    ▼              │
└──────────────────────────────────────────────────────────────┘
         │                                    │
         │ External APIs                      │ Database Queries
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│  Google Gemini   │              │    MongoDB       │
│    ImageKit      │              │   Collections    │
└──────────────────┘              └──────────────────┘
```

## Component Hierarchy

```
App
├── BrowserRouter
│   └── AppProvider (Context)
│       └── Routes
│           ├── Home
│           │   ├── Banner
│           │   ├── Hero
│           │   ├── Features
│           │   ├── Testimonial
│           │   ├── CallToAction
│           │   └── Footer
│           │
│           ├── Login (Auth Page)
│           │
│           ├── Layout (Protected)
│           │   ├── Navigation
│           │   └── Outlet
│           │       ├── Dashboard
│           │       │   └── Resume Cards
│           │       │
│           │       └── ResumeBuilder
│           │           ├── Editor Panel
│           │           │   ├── Personal Info Form
│           │           │   ├── Summary Form
│           │           │   ├── Experience Form
│           │           │   ├── Education Form
│           │           │   ├── Skills Form
│           │           │   └── Projects Form
│           │           │
│           │           └── Preview Panel
│           │               └── Template Component
│           │
│           └── Preview (Public)
│               └── Template Component
```

## Database Relationships

```
┌─────────────────┐
│      User       │
│─────────────────│
│ _id (PK)        │
│ name            │
│ email (unique)  │
│ password (hash) │
│ createdAt       │
└─────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│     Resume      │
│─────────────────│
│ _id (PK)        │
│ userId (FK)     │◀── References User._id
│ title           │
│ template        │
│ accentColor     │
│ personal_info   │
│ summary         │
│ experience[]    │
│ education[]     │
│ skills[]        │
│ project[]       │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└──────────┘                                    └──────────┘
     │                                                │
     │  POST /api/auth/signup                        │
     │  { name, email, password }                    │
     ├──────────────────────────────────────────────▶│
     │                                                │
     │                                    Hash Password (bcrypt)
     │                                                │
     │                                    Create User in DB
     │                                                │
     │                                    Generate JWT Token
     │                                                │
     │  { token, user }                              │
     │◀──────────────────────────────────────────────┤
     │                                                │
Store Token in localStorage                          │
     │                                                │
     │  GET /api/resumes                             │
     │  Headers: { Authorization: Bearer <token> }   │
     ├──────────────────────────────────────────────▶│
     │                                                │
     │                                    Verify JWT Token
     │                                                │
     │                                    Extract userId
     │                                                │
     │                                    Query Database
     │                                                │
     │  { resumes: [...] }                           │
     │◀──────────────────────────────────────────────┤
     │                                                │
```

## Resume Builder State Management

```
┌─────────────────────────────────────────────────────────┐
│                    AppContext                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │  State:                                           │ │
│  │  - user: { id, name, email }                      │ │
│  │  - token: "jwt_token_string"                      │ │
│  │                                                    │ │
│  │  Methods:                                         │ │
│  │  - login(token, userData)                         │ │
│  │  - logout()                                       │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Provides to
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  ResumeBuilder                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Local State:                                     │ │
│  │  - resumeData: { ...all resume fields }          │ │
│  │  - activeSection: "personal" | "summary" | ...   │ │
│  │  - optimizing: boolean                           │ │
│  │                                                    │ │
│  │  Effects:                                         │ │
│  │  - Load resume on mount                          │ │
│  │  - Auto-save on changes                          │ │
│  │                                                    │ │
│  │  Handlers:                                        │ │
│  │  - saveResume()                                   │ │
│  │  - optimizeText()                                 │ │
│  │  - handleImageUpload()                            │ │
│  │  - addExperience/Education/Project()             │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## API Request/Response Examples

### Create Resume
```
Request:
POST /api/resumes
Headers: { Authorization: Bearer <token> }
Body: { title: "My Resume" }

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "My Resume",
  "template": "modern",
  "accentColor": "#3b82f6",
  "personal_info": {},
  "experience": [],
  "education": [],
  "skills": [],
  "project": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### AI Optimization
```
Request:
POST /api/ai/optimize
Headers: { Authorization: Bearer <token> }
Body: {
  "text": "I am a developer",
  "type": "summary"
}

Response:
{
  "optimizedText": "Results-driven software developer with expertise in full-stack development..."
}
```

This architecture ensures:
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ User Experience

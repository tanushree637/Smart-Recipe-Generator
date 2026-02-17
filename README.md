# 🍳 Smart Recipe Generator  

<p align="center">
  <b>AI-Powered Recipe Discovery Platform</b><br/>
  Transform your available ingredients into personalized culinary experiences.
</p>

<p align="center">
  <a href="https://smart-recipe-generator-q9mk9lvjm-tanushree-srivastvs-projects.vercel.app/">
    🚀 Live Demo
  </a>
</p>

---

## ✨ About The Project

Smart Recipe Generator is a modern full-stack AI application that helps users discover recipes using available ingredients. 
It leverages image recognition and intelligent matching to suggest personalized recipes based on user preferences.

Built with **React, Node.js, Express, and AI Vision APIs**, the platform delivers a seamless and interactive cooking experience.

---

## 🧩 Implementation Approach
The Smart Recipe Generator was designed using a modular full-stack architecture with a clear separation between frontend, backend, and AI services.
On the frontend, I built a responsive and intuitive UI using React and Tailwind CSS to ensure smooth interaction and real-time filtering. The interface allows users to manually enter ingredients or upload food images for automatic detection.
The backend, built with Node.js and Express, handles recipe matching, filtering logic, serving-size recalculations, and intelligent substitutions. Recipes are stored in a structured JSON format for efficient querying and scalability.
For AI integration, I used the Hugging Face Vision API to detect ingredients from uploaded images. The detected ingredients are processed and matched against the recipe dataset using similarity-based logic, enabling suggestions even when ingredient inputs are partial or approximate.
I implemented personalization features such as ratings and favorites to refine recommendations over time. The application is deployed using Vercel (frontend) and Render (backend), ensuring a production-ready, scalable setup.
The overall goal was to combine AI capability with user-centric design to create a practical, real-world cooking assistant.

---

## 🔥 Features

### 🧠 AI-Powered Ingredient Detection
- Upload food images to detect ingredients automatically
- Smart matching even with incomplete ingredient lists
- Personalized suggestions based on user ratings

### 🍽️ Advanced Filtering
- Filter by cuisine, dietary preference, difficulty, and cooking time
- Dynamic serving size adjustments
- Automatic calorie and ingredient recalculation

### ❤️ Personalized Experience
- Rate recipes
- Save favorites
- Real-time search with autocomplete
- Responsive design across all devices

### 🔄 Intelligent Substitutions
- Suggests alternative ingredients
- Handles dietary restrictions
- Maintains taste balance and flexibility

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Data Storage | JSON-based database |
| AI Integration | Hugging Face Vision API |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## 📂 Project Structure

```
SMART-RECIPE-GENERATOR/
│
├── client/
│   ├── dist/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
├── server/
│   ├── node_modules/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── recipes.json
│   ├── recipes.json.bak
│   ├── server.js
│   └── substitutions.js
│
├── node_modules/
├── package.json
└── package-lock.json
```

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/tanushree637/Smart-Recipe-Generator
cd Smart-Recipe-Generator
```

---

### 2️⃣ Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file inside the `server` folder:

```
PORT=5000
HUGGINGFACE_API_KEY=hf_...mtCK
```

---

### 4️⃣ Run Locally

```bash
# Start Backend
cd server
npm start

# Start Frontend
cd ../client
npm run dev
```

- Frontend → http://localhost:3000  
- Backend → http://localhost:5000  

---

## 🌍 Deployment

### 🚀 Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Add required environment variables
3. Deploy
4. Example: https://smart-recipe-generator-q9mk9lvjm-tanushree-srivastvs-projects.vercel.app/

### 🌐 Backend (Render)

1. Connect GitHub repository to Render
2. Add environment variables
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Deploy
5. Example: https://smart-recipe-generator-rnri.onrender.com/

---

## 🎯 Why This Project?

✔ Real-world AI integration  
✔ Full-stack architecture  
✔ Production-ready deployment  
✔ Clean and responsive UI  
✔ Personalized recommendation logic  


---

## 💡 Future Enhancements

- User authentication system  
- Database migration to MongoDB or PostgreSQL  
- AI-generated cooking instructions  
- Shopping list generation  
- Recipe video integration  

---

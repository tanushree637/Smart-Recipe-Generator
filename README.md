1️⃣ Working Application URL
Live URL: https://smart-recipe-generator-q9mk9lvjm-tanushree-srivastvs-projects.vercel.app/

🍳 Smart Recipe Generator

Smart Recipe Generator is a full-stack web application that recommends recipes based on user-provided ingredients, dietary preferences, cuisine, cooking time, and difficulty level.

The backend, built with Node.js & Express, uses a structured JSON recipe database. To ensure accurate matches, ingredients are processed with normalization, basic stemming, substring matching, and synonym mapping. Recipes are ranked using a composite scoring algorithm that prioritizes ingredient coverage and match percentage, while penalizing missing non-pantry items.

The app also supports dietary filtering, nutritional calculations per serving, and ingredient substitution suggestions, giving users a personalized cooking experience.

For image-based input, users can upload food photos, which are analyzed using Hugging Face’s Vision Transformer API to detect likely ingredients automatically.

The frontend, built with React and styled with Tailwind CSS, is deployed on Vercel, while the backend API runs on Render, providing a scalable and seamless deployment.

By combining algorithmic ingredient matching, AI-powered image recognition, and user-centric design, this project delivers intelligent, personalized recipe recommendations efficiently.

🛠️ Technical Stack

React, Tailwind CSS, Node.js, Express, JSON Database, Hugging Face Vision Transformer, Vercel, Render

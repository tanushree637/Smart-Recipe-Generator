# Smart Recipe Generator (Client)

This React + Vite app lets you generate recipe suggestions from ingredients and filter results by dietary preference, difficulty, and maximum cooking time.
You can also adjust serving sizes to see total calories for your selected number of servings.

## Run Locally

1. Start the backend in `server`:
   ```bash
   npm start
   ```
2. Start the client in `client`:
   ```bash
   npm run dev
   ```
3. Open the URL shown (e.g. http://localhost:5174).

## Usage

- Enter ingredients separated by commas (e.g. `tomato, onion, cheese`).
- Choose a **Dietary Preference**: Any, Vegetarian, Vegan, or Non-Vegetarian.
- Select a **Difficulty**: Any, Easy, Medium, or Hard.
- Optionally set **Max Cooking Time** in minutes.
- Set **Servings** (defaults to 1) to calculate total calories.
- Click "Generate Recipes" to see filtered results with calories, difficulty, and time.
- Click "Generate Recipes" to see filtered results. Each recipe includes steps and nutritional info (calories per serving).
- Rate recipes (★1–★5) and mark favorites. Favorites are saved locally.
- Click "Get Suggestions" to receive recommendations based on your top-rated ingredients and current preferences.
- Upload an image of ingredients; the system detects items and fills the ingredients field. Click "Use Detected & Generate" to match recipes.

## Base Servings & Calories

- Each recipe defines **Base Servings** (defaults to 2) and **Base Calories** (total calories for the base servings).
- The app computes **Total Calories** for your chosen servings using:
  - Total = `Base Calories × (Servings ÷ Base Servings)`

## Ratings, Favorites, Suggestions

- **Ratings & Favorites**: Stored in your browser via localStorage. No account needed.
- **Suggestions**: Built from ingredients appearing in your 4★+ recipes, then filtered by your dietary preference, difficulty, and max time.

## Image Ingredient Detection

- Requires OpenAI Vision configuration on the server.
- Set environment variables in `server/.env`:
  - `OPENAI_API_KEY=<your-openai-api-key>`
- After configuring, restart the server and upload a clear photo of ingredients.

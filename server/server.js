const axios = require("axios");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const recipesData = require("./recipes.json");
const { getSuggestions, SUBSTITUTIONS } = require("./substitutions");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// ─── Substitutions endpoint ──────────────────────────────────────────────────
// Returns substitution suggestions for a list of ingredients
app.post("/substitutions", (req, res) => {
  const { ingredients } = req.body; // string[] of missing ingredients
  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ error: "ingredients must be an array" });
  }
  res.json({ substitutions: getSuggestions(ingredients) });
});

// GET the full substitution map (useful for the frontend)
app.get("/substitutions", (_req, res) => {
  res.json({ substitutions: SUBSTITUTIONS });
});

const PORT = 5000;

// ─── Return all unique ingredient names from the database ────────────────────
app.get("/ingredients", (_req, res) => {
  const allIngredients = new Set();
  recipesData.forEach((r) => {
    (r.ingredients || []).forEach((ing) => allIngredients.add(ing.toLowerCase()));
  });
  // Also add common pantry items for the picker
  const extras = [
    "salt","pepper","oil","olive oil","butter","garlic","ginger","onion",
    "tomato","potato","carrot","cucumber","lettuce","broccoli","spinach",
    "cabbage","mushroom","bell pepper","corn","peas","beans","zucchini",
    "eggplant","cauliflower","celery","avocado","lemon","lime",
    "chicken","beef","pork","fish","egg","shrimp","lamb","turkey","bacon",
    "milk","cheese","cream","yogurt","paneer","tofu","tempeh",
    "rice","bread","pasta","noodles","flour","oats","tortilla","quinoa",
    "sugar","honey","soy sauce","vinegar","coconut milk","peanut",
    "almond","cashew","walnut","sesame","basil","oregano","thyme",
    "cumin","paprika","turmeric","cinnamon","chili","cilantro","parsley",
    "mint","rosemary","bay leaf","garam masala","curry powder",
    "banana","strawberry","apple","mango","pineapple","coconut",
    "chocolate","cocoa powder","vanilla","maple syrup",
  ];
  extras.forEach((e) => allIngredients.add(e));
  res.json({ ingredients: [...allIngredients].sort() });
});

// ─── Return all unique cuisine types ─────────────────────────────────────────
app.get("/cuisines", (_req, res) => {
  const cuisines = new Set();
  recipesData.forEach((r) => {
    if (r.cuisine) cuisines.add(r.cuisine);
  });
  res.json({ cuisines: [...cuisines].sort() });
});

// ─── Helper functions ────────────────────────────────────────────────────────
const normalize = (arr) => arr.map((x) => x.toLowerCase().trim());

// Simple stemming: strip trailing "s", "es", "ies"→"y" for ingredient matching
const stem = (word) => {
  let w = word.toLowerCase().trim();
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("oes")) return w.slice(0, -2);
  if (w.endsWith("es")) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

// Synonym map for common ingredient aliases
const SYNONYMS = {
  "coriander": "cilantro", "cilantro": "coriander",
  "capsicum": "bell pepper", "bell pepper": "capsicum",
  "scallion": "green onion", "green onion": "scallion",
  "spring onion": "green onion",
  "courgette": "zucchini", "zucchini": "courgette",
  "aubergine": "eggplant", "eggplant": "aubergine",
  "prawns": "shrimp", "shrimp": "prawns",
  "curd": "yogurt", "yogurt": "curd",
  "heavy cream": "cream", "whipping cream": "cream",
  "spaghetti": "pasta", "penne": "pasta", "linguine": "pasta",
  "basmati rice": "rice", "jasmine rice": "rice", "brown rice": "rice",
  "olive oil": "oil",
  "coconut oil": "oil",
  "vegetable oil": "oil",
};

// Check whether two ingredient strings are considered a match
const ingredientsMatch = (a, b) => {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  // 1. Exact match
  if (la === lb) return true;
  // 2. Stem match (tomato ↔ tomatoes)
  if (stem(la) === stem(lb)) return true;
  // 3. Substring match (e.g., "garlic" in "garlic cloves")
  if (la.includes(lb) || lb.includes(la)) return true;
  // 4. Stem-based substring
  if (stem(la).includes(stem(lb)) || stem(lb).includes(stem(la))) return true;
  // 5. Synonym match
  const synA = SYNONYMS[la];
  const synB = SYNONYMS[lb];
  if (synA && (synA === lb || stem(synA) === stem(lb))) return true;
  if (synB && (synB === la || stem(synB) === stem(la))) return true;
  return false;
};

// Expanded ingredient classification
const NON_VEG_INGREDIENTS = new Set([
  "chicken", "egg", "beef", "pork", "fish", "mutton", "meat", "shrimp",
  "prawn", "lamb", "turkey", "bacon", "ham", "sausage", "crab", "lobster",
]);
const DAIRY_INGREDIENTS = new Set([
  "milk", "cheese", "butter", "cream", "paneer", "yogurt", "curd", "ghee",
  "whey", "cottage cheese", "mozzarella", "parmesan",
]);
const GLUTEN_INGREDIENTS = new Set([
  "flour", "bread", "pasta", "bun", "noodles", "wheat", "semolina",
  "spring roll wrapper", "soy sauce", "barley", "rye", "couscous",
]);
const NUT_INGREDIENTS = new Set([
  "peanut", "almond", "cashew", "walnut", "pistachio", "hazelnut",
  "macadamia", "pecan", "pine nut",
]);
const HIGH_CARB_INGREDIENTS = new Set([
  "rice", "pasta", "bread", "potato", "sugar", "flour", "oats", "bun",
  "noodles", "honey", "banana",
]);

// Check if recipe passes a dietary filter
const matchesDiet = (recipe, preference) => {
  if (!preference || preference.toLowerCase() === "any") return true;

  // If recipe has explicit dietaryTags, use them
  const tags = (recipe.dietaryTags || []).map((t) => t.toLowerCase());
  const pref = preference.toLowerCase();

  if (tags.length > 0) {
    // Special handling: "non-vegetarian" means recipe MUST contain meat
    if (pref === "non-vegetarian") {
      return tags.includes("non-vegetarian") ||
        normalize(recipe.ingredients).some((i) => NON_VEG_INGREDIENTS.has(i));
    }
    return tags.includes(pref);
  }

  // Fallback to ingredient-based detection
  const ing = normalize(recipe.ingredients);
  const hasNonVeg = ing.some((i) => NON_VEG_INGREDIENTS.has(i));
  const hasDairy = ing.some((i) => DAIRY_INGREDIENTS.has(i));
  const hasGluten = ing.some((i) => GLUTEN_INGREDIENTS.has(i));
  const hasNuts = ing.some((i) => NUT_INGREDIENTS.has(i));
  const highCarb = ing.some((i) => HIGH_CARB_INGREDIENTS.has(i));
  const hasHoney = ing.includes("honey");

  switch (pref) {
    case "vegetarian":   return !hasNonVeg;
    case "vegan":        return !hasNonVeg && !hasDairy && !hasHoney;
    case "non-vegetarian": return hasNonVeg;
    case "gluten-free":  return !hasGluten;
    case "dairy-free":   return !hasDairy;
    case "nut-free":     return !hasNuts;
    case "low-carb":     return !highCarb;
    default:             return true;
  }
};

const matchesDifficulty = (recipe, diff) => {
  if (!diff || diff.toLowerCase() === "any") return true;
  return (recipe.difficulty || "").toLowerCase() === diff.toLowerCase();
};

const withinTime = (recipe, limit) => {
  if (!limit || Number.isNaN(Number(limit))) return true;
  return Number(recipe.time) <= Number(limit);
};

// ─── Generate endpoint (enhanced matching) ───────────────────────────────────
app.post("/generate", (req, res) => {
  const { ingredients, dietaryPreference, difficulty, maxTime, cuisine } = req.body;

  if (!ingredients) {
    return res.status(400).json({ error: "Ingredients are required" });
  }

  const userIngredients = ingredients
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  // Common pantry staples that shouldn't heavily penalise a recipe if missing
  const PANTRY_STAPLES = new Set([
    "salt", "pepper", "oil", "water", "sugar", "butter",
    "olive oil", "vegetable oil",
  ]);

  const scoredRecipes = recipesData.map((recipe) => {
    const recipeIng = normalize(recipe.ingredients);

    // ── Enhanced matching using stemming, substrings & synonyms ──
    const matchedIngredients = [];
    const missingIngredients = [];

    for (const ri of recipeIng) {
      const isMatch = userIngredients.some((ui) => ingredientsMatch(ri, ui));
      if (isMatch) {
        matchedIngredients.push(ri);
      } else {
        missingIngredients.push(ri);
      }
    }

    // Which of the USER's ingredients does this recipe actually use?
    const userIngsUsed = userIngredients.filter((ui) =>
      recipeIng.some((ri) => ingredientsMatch(ri, ui)),
    );

    const matchCount = matchedIngredients.length;
    const totalIngredients = recipeIng.length;

    // ── Key metrics ──
    // recipeMatchPct: what % of the RECIPE's ingredients the user has
    const recipeMatchPct = totalIngredients > 0
      ? Math.round((matchCount / totalIngredients) * 100)
      : 0;

    // coveragePct: what % of the USER's ingredients this recipe uses
    const coveragePct = userIngredients.length > 0
      ? Math.round((userIngsUsed.length / userIngredients.length) * 100)
      : 0;

    // How many missing ingredients are just pantry staples?
    const missingNonPantry = missingIngredients.filter(
      (m) => !PANTRY_STAPLES.has(m),
    );
    const missingPantryCount = missingIngredients.length - missingNonPantry.length;

    // ── Composite ranking score (higher = better) ──
    // Heavily reward recipes that use ALL user ingredients
    // Reward recipes where the user has most of the recipe's ingredients
    // Lightly penalise missing non-pantry ingredients
    const compositeScore =
      (coveragePct * 3) +        // 3× weight: prefer recipes that use ALL user ingredients
      (recipeMatchPct * 2) +     // 2× weight: prefer recipes user can fully make
      (userIngsUsed.length * 10) + // bonus per user ingredient used
      (missingPantryCount * 5) - // reduce penalty for missing pantry staples
      (missingNonPantry.length * 8); // penalise hard-to-get missing items

    // Substitution suggestions for missing ingredients
    const substitutionSuggestions = getSuggestions(missingIngredients);

    // ── Nutrition calculation ──
    const baseServings = Number(recipe.baseServings ?? 1) || 1;
    const baseCalories = Number(
      recipe.baseCalories ?? recipe.calories ?? recipe.nutrition?.calories ?? 0,
    );
    const totalProtein = Number(recipe.nutrition?.protein ?? 0);
    const totalCarbs = Number(recipe.nutrition?.carbs ?? 0);
    const totalFat = Number(recipe.nutrition?.fat ?? 0);

    const caloriesPerServing =
      baseServings > 0 ? Math.round(baseCalories / baseServings) : baseCalories;
    const perServingProtein =
      baseServings > 0 ? Math.round(totalProtein / baseServings) : totalProtein;
    const perServingCarbs =
      baseServings > 0 ? Math.round(totalCarbs / baseServings) : totalCarbs;
    const perServingFat =
      baseServings > 0 ? Math.round(totalFat / baseServings) : totalFat;

    const defaultSteps = [
      "Prep ingredients (wash, chop as needed)",
      "Cook components (boil, sauté, bake) as appropriate",
      "Combine, season to taste, and adjust textures",
      "Plate and serve",
    ];

    return {
      ...recipe,
      matchCount,
      totalIngredients,
      matchPercentage: recipeMatchPct,
      coveragePercentage: coveragePct,
      userIngsUsed,
      matchedIngredients,
      missingIngredients,
      substitutionSuggestions,
      compositeScore,
      steps:
        Array.isArray(recipe.steps) && recipe.steps.length > 0
          ? recipe.steps
          : defaultSteps,
      nutrition: {
        caloriesPerServing,
        perServing: {
          calories: caloriesPerServing,
          protein: perServingProtein,
          carbs: perServingCarbs,
          fat: perServingFat,
        },
        totals: {
          calories: baseCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
      },
    };
  });

  const filteredRecipes = scoredRecipes
    .filter(
      (recipe) =>
        recipe.matchCount > 0 &&
        matchesDiet(recipe, dietaryPreference) &&
        matchesDifficulty(recipe, difficulty) &&
        withinTime(recipe, maxTime) &&
        (!cuisine || (recipe.cuisine && recipe.cuisine.toLowerCase() === cuisine.toLowerCase())),
    )
    // Primary sort: composite score (desc)
    // Tie-breaker: coverage % (desc), then recipe match % (desc)
    .sort((a, b) =>
      b.compositeScore - a.compositeScore ||
      b.coveragePercentage - a.coveragePercentage ||
      b.matchPercentage - a.matchPercentage,
    );

  res.json({ recipes: filteredRecipes });
});

// Return all recipes with steps and nutrition (totals and per-serving)
app.get("/recipes", (req, res) => {
  const enriched = recipesData.map((recipe) => {
    const baseServings = Number(recipe.baseServings ?? 1) || 1;
    const baseCalories = Number(
      recipe.baseCalories ?? recipe.calories ?? recipe.nutrition?.calories ?? 0,
    );

    const totalProtein = Number(recipe.nutrition?.protein ?? 0);
    const totalCarbs = Number(recipe.nutrition?.carbs ?? 0);
    const totalFat = Number(recipe.nutrition?.fat ?? 0);

    const caloriesPerServing =
      baseServings > 0 ? Math.round(baseCalories / baseServings) : baseCalories;
    const perServingProtein =
      baseServings > 0 ? Math.round(totalProtein / baseServings) : totalProtein;
    const perServingCarbs =
      baseServings > 0 ? Math.round(totalCarbs / baseServings) : totalCarbs;
    const perServingFat =
      baseServings > 0 ? Math.round(totalFat / baseServings) : totalFat;

    const defaultSteps = [
      "Prep ingredients (wash, chop as needed)",
      "Cook components (boil, sauté, bake) as appropriate",
      "Combine, season to taste, and adjust textures",
      "Plate and serve",
    ];

    return {
      ...recipe,
      steps:
        Array.isArray(recipe.steps) && recipe.steps.length > 0
          ? recipe.steps
          : defaultSteps,
      nutrition: {
        caloriesPerServing,
        perServing: {
          calories: caloriesPerServing,
          protein: perServingProtein,
          carbs: perServingCarbs,
          fat: perServingFat,
        },
        totals: {
          calories: baseCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        },
      },
    };
  });

  res.json({ recipes: enriched });
});

// Detect ingredients from image using Hugging Face Router
// Accepts either multipart/form-data (field name: "image") or raw application/octet-stream
const selectBodyParser = (req, res, next) => {
  if (req.is("application/octet-stream")) {
    return express.raw({ type: "application/octet-stream", limit: "10mb" })(
      req,
      res,
      next,
    );
  }
  return upload.single("image")(req, res, next);
};

// ── Shared image-analysis logic ──────────────────────────────────────────────
const ingredientKeywords = [
  // Vegetables
  "tomato", "onion", "potato", "carrot", "cucumber", "lettuce", "broccoli",
  "cabbage", "spinach", "kale", "bell pepper", "pepper", "mushroom",
  "zucchini", "eggplant", "corn", "peas", "beans", "garlic", "ginger",
  "celery", "cauliflower", "beetroot", "radish", "turnip", "leek",
  "asparagus", "artichoke", "pumpkin", "squash",
  // Fruits
  "apple", "banana", "strawberry", "orange", "lemon", "lime", "mango",
  "grape", "watermelon", "pineapple", "peach", "pear", "cherry",
  "blueberry", "raspberry", "avocado", "coconut", "papaya", "kiwi",
  // Proteins
  "chicken", "beef", "pork", "fish", "egg", "shrimp", "prawn", "lamb",
  "turkey", "bacon", "sausage", "ham", "salmon", "tuna", "crab",
  // Dairy
  "milk", "cheese", "butter", "cream", "yogurt", "paneer", "curd",
  // Grains & carbs
  "rice", "bread", "pasta", "noodles", "flour", "oats", "wheat",
  // Nuts & seeds
  "peanut", "almond", "cashew", "walnut", "pistachio",
  // Misc
  "chocolate", "cocoa", "honey", "sugar", "salt", "oil", "vinegar",
  "soy sauce", "tofu", "lentils", "chickpeas",
];

async function analyzeOneImage(imageBuffer) {
  const response = await axios.post(
    "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224",
    imageBuffer,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    },
  );

  const predictions = response.data;

  const ingredients = predictions
    .filter((item) => item.score > 0.01)
    .map((item) => ({ label: item.label.toLowerCase(), score: item.score }))
    .filter((item) => ingredientKeywords.some((kw) => item.label.includes(kw)))
    .slice(0, 8);

  const names = [];
  const confidence = [];
  const seen = new Set();

  for (const item of ingredients) {
    const name = ingredientKeywords.find((kw) => item.label.includes(kw)) || item.label;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
      confidence.push({ name, confidence: Math.round(item.score * 100), rawLabel: item.label });
    }
  }

  return { names, confidence };
}

// ── Single image upload (backward-compatible) ───────────────────────────────
app.post("/analyze-image", selectBodyParser, async (req, res) => {
  try {
    const imageBuffer =
      req.is("application/octet-stream") && Buffer.isBuffer(req.body)
        ? req.body
        : req.file?.buffer;

    if (!imageBuffer) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { names, confidence } = await analyzeOneImage(imageBuffer);

    if (names.length === 0) {
      names.push("tomato");
      confidence.push({ name: "tomato", confidence: 50, rawLabel: "fallback" });
    }

    console.log("FINAL INGREDIENTS SENT:", names);
    res.json({ ingredients: names, confidence });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

// ── Multi-image upload – accepts up to 10 images at once ────────────────────
app.post("/analyze-images", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Analyze all images in parallel
    const results = await Promise.allSettled(
      files.map((f) => analyzeOneImage(f.buffer)),
    );

    // Merge results across all images, de-duplicating
    const mergedNames = [];
    const mergedConfidence = [];
    const seen = new Set();
    const perImage = []; // per-image breakdown for the frontend

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        const { names, confidence } = result.value;
        perImage.push({ index: idx, ingredients: names, confidence });
        for (let i = 0; i < names.length; i++) {
          if (!seen.has(names[i])) {
            seen.add(names[i]);
            mergedNames.push(names[i]);
            mergedConfidence.push(confidence[i]);
          }
        }
      } else {
        perImage.push({ index: idx, error: result.reason?.message || "Analysis failed" });
      }
    });

    if (mergedNames.length === 0) {
      mergedNames.push("tomato");
      mergedConfidence.push({ name: "tomato", confidence: 50, rawLabel: "fallback" });
    }

    console.log("MULTI-IMAGE INGREDIENTS:", mergedNames);
    res.json({
      ingredients: mergedNames,
      confidence: mergedConfidence,
      perImage,
      totalImages: files.length,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

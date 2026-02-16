// Production API update - Feb 2026
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart, faClock, faUtensils, faChartBar, faLightbulb, faPlus, faTimes, faSearch, faSpinner, faCheckCircle, faExclamationCircle, faTrash, faTags, faCamera } from '@fortawesome/free-solid-svg-icons';

function App() {
  // ... existing state declarations ...
  const [ingredientTags, setIngredientTags] = useState([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [allIngredients, setAllIngredients] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState("any");
  const [cuisineFilter, setCuisineFilter] = useState("any");
  const [allCuisines, setAllCuisines] = useState([]);
  const [difficulty, setDifficulty] = useState("any");
  const [maxTime, setMaxTime] = useState("");
  const [servings, setServings] = useState(1);
  const [allRecipes, setAllRecipes] = useState([]);
  const [ratings, setRatings] = useState({});
  const [favorites, setFavorites] = useState({});
  const [suggestMsg, setSuggestMsg] = useState("");

  // Image recognition state (multi-image support)
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); // array of {url, status, ingredients[]}

  // ── Load all recipes, ingredients list, cuisines, and persisted user data ──
  useEffect(() => {
    const storedRatings = localStorage.getItem("sr_ratings");
    const storedFavorites = localStorage.getItem("sr_favorites");
    if (storedRatings) {
      try { setRatings(JSON.parse(storedRatings)); } catch { /* ignore */ }
    }
    if (storedFavorites) {
      try { setFavorites(JSON.parse(storedFavorites)); } catch { /* ignore */ }
    }
    (async () => {
      try {
        const [recipeResp, ingResp, cuisineResp] = await Promise.all([
          fetch("https://smart-recipe-generator-rnri.onrender.com/recipes"),
          fetch("https://smart-recipe-generator-rnri.onrender.com/ingredients"),
          fetch("https://smart-recipe-generator-rnri.onrender.com/cuisines"),
        ]);
        const recipeData = await recipeResp.json();
        const ingData = await ingResp.json();
        const cuisineData = await cuisineResp.json();
        setAllRecipes(recipeData.recipes || []);
        setAllIngredients(ingData.ingredients || []);
        setAllCuisines(cuisineData.cuisines || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("sr_ratings", JSON.stringify(ratings));
  }, [ratings]);
  useEffect(() => {
    localStorage.setItem("sr_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.parentElement.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Ingredient tag helpers ──
  const addTag = useCallback((name) => {
    const clean = name.trim().toLowerCase();
    if (clean && !ingredientTags.includes(clean)) {
      setIngredientTags((prev) => [...prev, clean]);
    }
    setIngredientInput("");
    setShowDropdown(false);
    setHighlightIdx(-1);
    inputRef.current?.focus();
  }, [ingredientTags]);

  const removeTag = (tag) => {
    setIngredientTags((prev) => prev.filter((t) => t !== tag));
  };

  // Filtered suggestions for dropdown
  const filteredSuggestions = ingredientInput.trim()
    ? allIngredients.filter(
        (ing) =>
          ing.toLowerCase().includes(ingredientInput.toLowerCase()) &&
          !ingredientTags.includes(ing.toLowerCase())
      ).slice(0, 12)
    : [];

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filteredSuggestions.length) {
        addTag(filteredSuggestions[highlightIdx]);
      } else if (ingredientInput.trim()) {
        const parts = ingredientInput.split(",").map((s) => s.trim()).filter(Boolean);
        parts.forEach((p) => addTag(p));
      }
    } else if (e.key === "Backspace" && !ingredientInput && ingredientTags.length > 0) {
      setIngredientTags((prev) => prev.slice(0, -1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === ",") {
      e.preventDefault();
      if (ingredientInput.trim()) addTag(ingredientInput);
    }
  };

  const handleRate = (name, value) => {
    setRatings((prev) => ({ ...prev, [name]: value }));
  };
  const toggleFavorite = (name) => {
    setFavorites((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleGenerate = async () => {
    if (ingredientTags.length === 0 && !ingredientInput.trim()) return;
    const finalTags = [...ingredientTags];
    if (ingredientInput.trim()) {
      ingredientInput.split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => {
        if (!finalTags.includes(t.toLowerCase())) finalTags.push(t.toLowerCase());
      });
    }
    setIngredientTags(finalTags);
    setIngredientInput("");

    setLoading(true);
    try {
      const response = await fetch("https://smart-recipe-generator-rnri.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: finalTags.join(", "),
          dietaryPreference,
          difficulty,
          maxTime: maxTime ? parseInt(maxTime, 10) : undefined,
          cuisine: cuisineFilter !== "any" ? cuisineFilter : undefined,
        }),
      });
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  // ── Multi-image upload handler ──
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const previews = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      status: "analyzing",
      ingredients: [],
    }));
    setImagePreviews((prev) => [...prev, ...previews]);
    setLoading(true);

    const form = new FormData();
    files.forEach((file) => form.append("images", file));

    try {
      const resp = await fetch("http://localhost:5000/analyze-images", {
        method: "POST",
        body: form,
      });
      const data = await resp.json();

      if (data.ingredients && data.ingredients.length) {
        const newTags = [...ingredientTags];
        data.ingredients.forEach((name) => {
          const clean = name.trim().toLowerCase();
          if (clean && !newTags.includes(clean)) newTags.push(clean);
        });
        setIngredientTags(newTags);
        setDetectedIngredients((prev) => {
          const existing = new Set(prev.map((d) => d.name));
          const merged = [...prev];
          (data.confidence || []).forEach((c) => {
            if (!existing.has(c.name)) {
              existing.add(c.name);
              merged.push(c);
            }
          });
          return merged;
        });
      }

      setImagePreviews((prev) => {
        const updated = [...prev];
        const startIdx = updated.length - files.length;
        (data.perImage || []).forEach((pi) => {
          const idx = startIdx + pi.index;
          if (updated[idx]) {
            updated[idx] = {
              ...updated[idx],
              status: pi.error ? "error" : "done",
              ingredients: pi.ingredients || [],
            };
          }
        });
        // Mark any remaining as error (if server didn't return info for them)
        for(let i = startIdx; i < updated.length; i++) {
          if (updated[i].status === 'analyzing') {
            updated[i].status = 'error';
          }
        }
        return updated;
      });

      if (!data.ingredients || data.ingredients.length === 0) {
        // Consider a more subtle notification
      }
    } catch (err) {
      console.error("Analyze images error", err);
      setImagePreviews((prev) => {
        const updated = [...prev];
        const startIdx = updated.length - files.length;
        for (let i = startIdx; i < updated.length; i++) {
          if (updated[i].status === 'analyzing') {
            updated[i] = { ...updated[i], status: "error" };
          }
        }
        return updated;
      });
    }
    setLoading(false);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImagePreviews((prev) => {
      const removed = prev[idx];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const clearAllImages = () => {
    imagePreviews.forEach((p) => { if (p.url) URL.revokeObjectURL(p.url); });
    setImagePreviews([]);
    setDetectedIngredients([]);
  };

  // ... existing color functions ...
  const tagColor = (tag) => {
    const colors = {
      vegetarian: "#4caf50", vegan: "#66bb6a", "non-vegetarian": "#e53935",
      "gluten-free": "#ff9800", "dairy-free": "#29b6f6", "nut-free": "#ab47bc",
      "low-carb": "#8d6e63",
    };
    return colors[tag] || "#9E9E9E";
  };

  const cuisineColor = (cuisine) => {
    const colors = {
      Indian: "#e65100", Italian: "#c62828", Mexican: "#2e7d32", Thai: "#6a1b9a",
      Chinese: "#d84315", Japanese: "#1565c0", Korean: "#ad1457",
      Mediterranean: "#00838f", French: "#283593", American: "#37474f",
      British: "#4e342e",
    };
    return colors[cuisine] || "#607d8b";
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Smart Recipe Generator 🍲</h1>
        <p className="header-sub">AI-powered discovery for your kitchen</p>
      </header>

      <main className="container">
        <section className="input-section">
          <h2><FontAwesomeIcon icon={faTags} /> Your Ingredients</h2>

          <div className="image-upload-area">
            <label className="upload-label" htmlFor="image-input">
              <FontAwesomeIcon icon={faCamera} /> Upload food images to detect ingredients
            </label>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {imagePreviews.length > 0 && (
              <div className="image-gallery">
                <div className="gallery-header">
                  <strong>{imagePreviews.length} image{imagePreviews.length > 1 ? "s" : ""}</strong>
                  <button type="button" className="clear-images-btn" onClick={clearAllImages}>
                    <FontAwesomeIcon icon={faTrash} /> Clear
                  </button>
                </div>
                <div className="gallery-grid">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className={`gallery-item gallery-${img.status}`}>
                      <button
                        type="button"
                        className="gallery-remove"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <img src={img.url} alt={img.name || `Image ${idx + 1}`} className="gallery-thumb" />
                      <div className="gallery-status">
                        {img.status === "analyzing" && <><FontAwesomeIcon icon={faSpinner} spin /> Analyzing...</>}
                        {img.status === "done" && <><FontAwesomeIcon icon={faCheckCircle} /> {img.ingredients.length} found</>}
                        {img.status === "error" && <><FontAwesomeIcon icon={faExclamationCircle} /> Failed</>}
                      </div>
                      {img.status === "done" && img.ingredients.length > 0 && (
                        <div className="gallery-ingredients">
                          {img.ingredients.map((name, i) => (
                            <span key={i} className="gallery-ing-chip">{name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label style={{ fontWeight: 600, marginTop: 16, display: "block", marginBottom: 4 }}>
            Add or edit ingredients
          </label>
          <div className="tag-input-wrapper" onClick={() => inputRef.current?.focus()}>
            {ingredientTags.map((tag) => (
              <span key={tag} className="ingredient-tag">
                {tag}
                <button
                  type="button"
                  className="tag-remove"
                  onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  aria-label={`Remove ${tag}`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </span>
            ))}
            <div className="autocomplete-container">
              <input
                ref={inputRef}
                type="text"
                className="tag-text-input"
                placeholder={ingredientTags.length === 0 ? "Type ingredients..." : "Add more..."}
                value={ingredientInput}
                onChange={(e) => {
                  setIngredientInput(e.target.value);
                  setShowDropdown(true);
                  setHighlightIdx(-1);
                }}
                onFocus={() => {
                  if (ingredientInput.trim()) setShowDropdown(true);
                }}
                onKeyDown={handleInputKeyDown}
              />
              {showDropdown && filteredSuggestions.length > 0 && (
                <ul className="autocomplete-dropdown" ref={dropdownRef}>
                  {filteredSuggestions.map((sug, idx) => (
                    <li
                      key={sug}
                      className={`autocomplete-item ${idx === highlightIdx ? "highlighted" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); addTag(sug); }}
                      onMouseEnter={() => setHighlightIdx(idx)}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <p className="tag-hint">
            Use <kbd>Enter</kbd> or <kbd>,</kbd> to add. <kbd>Backspace</kbd> to remove last tag.
          </p>

          <div className="quick-add">
            <span className="quick-add-label">Quick add:</span>
            {["tomato", "onion", "garlic", "chicken", "rice", "pasta", "egg", "cheese", "potato", "butter"].map((ing) => (
              <button
                key={ing}
                type="button"
                className={`quick-add-btn ${ingredientTags.includes(ing) ? "quick-added" : ""}`}
                onClick={() => ingredientTags.includes(ing) ? removeTag(ing) : addTag(ing)}
              >
                <FontAwesomeIcon icon={ingredientTags.includes(ing) ? faTimes : faPlus} /> {ing}
              </button>
            ))}
          </div>

          <div className="filters-grid">
            <div className="filter-item">
              <label htmlFor="diet-select">Dietary Preference</label>
              <select id="diet-select" className="input-field" value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}>
                <option value="any">Any</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="gluten-free">Gluten-Free</option>
                <option value="dairy-free">Dairy-Free</option>
                <option value="nut-free">Nut-Free</option>
                <option value="low-carb">Low-Carb</option>
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="cuisine-select">Cuisine</label>
              <select id="cuisine-select" className="input-field" value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
                <option value="any">Any Cuisine</option>
                {allCuisines.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="difficulty-select">Difficulty</label>
              <select id="difficulty-select" className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="any">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="time-input">Max Time (min)</label>
              <input id="time-input" type="number" min="0" className="input-field" placeholder="e.g. 30" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} />
            </div>
            <div className="filter-item">
              <label htmlFor="servings-input">Servings</label>
              <input id="servings-input" type="number" min="1" className="input-field" placeholder="e.g. 2" value={servings} onChange={(e) => setServings(Math.max(1, parseInt(e.target.value, 10) || 1))} />
            </div>
          </div>

          <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
            {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Generating...</> : <><FontAwesomeIcon icon={faSearch} /> Generate Recipes</>}
          </button>
        </section>

        <section className="results-section">
          <h2>Recipes {recipes.length > 0 && <span className="count-badge">{recipes.length}</span>}</h2>
          {suggestMsg && <p className="suggest-msg">{suggestMsg}</p>}
          {recipes.length === 0 && ingredientTags.length > 0 && !loading && (
            <p className="empty-msg">No matching recipes found. Try different ingredients or filters.</p>
          )}
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} servings={servings} ratings={ratings} favorites={favorites} onRate={handleRate} onToggleFavorite={toggleFavorite} tagColor={tagColor} cuisineColor={cuisineColor} showMatchInfo />
            ))}
          </div>
        </section>

        <section className="results-section">
          <h2><FontAwesomeIcon icon={faHeart} /> Favorites</h2>
          {allRecipes.filter((r) => favorites[r.name]).length === 0 ? (
            <p className="empty-msg">You haven't favorited any recipes yet. Click the ♡ on a recipe to save it here.</p>
          ) : (
            <div className="recipe-grid">
              {allRecipes.filter((r) => favorites[r.name]).map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} servings={servings} ratings={ratings} favorites={favorites} onRate={handleRate} onToggleFavorite={toggleFavorite} tagColor={tagColor} cuisineColor={cuisineColor} />
              ))}
            </div>
          )}
        </section>

        <section className="input-section">
          <h2><FontAwesomeIcon icon={faLightbulb} /> Recipe Suggestions</h2>
          <p>Get recommendations based on your top-rated recipes.</p>
          <button
            className="primary-btn"
            disabled={loading}
            onClick={async () => {
              setSuggestMsg("");
              const topRatedNames = Object.entries(ratings).filter(([, v]) => (v || 0) >= 4).map(([name]) => name);
              if (topRatedNames.length === 0) {
                setSuggestMsg("Rate some recipes 4 stars or higher to get tailored suggestions.");
                return;
              }
              const topRatedRecipes = allRecipes.filter((r) => topRatedNames.includes(r.name));
              const freq = {};
              topRatedRecipes.forEach((r) => { (r.ingredients || []).forEach((ing) => { freq[String(ing).toLowerCase()] = (freq[String(ing).toLowerCase()] || 0) + 1; }); });
              const seedIngredients = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 4);
              if (seedIngredients.length === 0) {
                setSuggestMsg("Could not determine top ingredients. Please rate more recipes.");
                return;
              }
              setLoading(true);
              try {
                const response = await fetch("http://localhost:5000/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ingredients: seedIngredients.join(", "),
                    dietaryPreference, difficulty,
                    maxTime: maxTime ? parseInt(maxTime, 10) : undefined,
                    cuisine: cuisineFilter !== "any" ? cuisineFilter : undefined,
                  }),
                });
                const data = await response.json();
                setRecipes((data.recipes || []).filter((r) => !favorites[r.name]));
                setSuggestMsg(`Suggestions based on your love for: ${seedIngredients.join(", ")}`);
              } catch (e) { console.error("Suggestion error", e); }
              setLoading(false);
            }}
          >
            {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Finding...</> : "✨ Get Suggestions"}
          </button>
        </section>
      </main>
    </div>
  );
}

function RecipeCard({ recipe, servings, ratings, favorites, onRate, onToggleFavorite, tagColor, cuisineColor, showMatchInfo }) {
  const currentRating = ratings[recipe.name] || 0;
  const isFavorite = favorites[recipe.name] || false;

  return (
    <div className="recipe-card">
      <div className="card-header">
        <div className="card-title-row">
          <h3>{recipe.name}</h3>
          {showMatchInfo && recipe.matchPercentage != null && (
            <div className="match-badges">
              <span
                className="match-badge"
                style={{
                  background: recipe.matchPercentage >= 75 ? "#4caf50"
                    : recipe.matchPercentage >= 50 ? "#ff9800"
                    : "#e53935",
                }}
                title="% of recipe ingredients you have"
              >
                {recipe.matchPercentage}% recipe match
              </span>
              {recipe.coveragePercentage != null && (
                <span
                  className="match-badge coverage-badge"
                  style={{
                    background: recipe.coveragePercentage >= 75 ? "#1565c0"
                      : recipe.coveragePercentage >= 50 ? "#5c6bc0"
                      : "#7986cb",
                  }}
                  title="% of your ingredients used by this recipe"
                >
                  Uses {recipe.coveragePercentage}% of yours
                </span>
              )}
            </div>
          )}
        </div>
        {recipe.cuisine && (
          <span className="cuisine-badge" style={{ background: cuisineColor(recipe.cuisine) }}>
            {recipe.cuisine}
          </span>
        )}
      </div>

      {Array.isArray(recipe.dietaryTags) && recipe.dietaryTags.length > 0 && (
        <div className="dietary-tags">
          {recipe.dietaryTags.map((tag) => (
            <span key={tag} className="diet-tag" style={{ background: tagColor(tag) }}>{tag}</span>
          ))}
        </div>
      )}

      <div className="card-meta">
        <span><FontAwesomeIcon icon={faClock} /> {recipe.time} min</span>
        <span><FontAwesomeIcon icon={faChartBar} /> {recipe.difficulty}</span>
        <span><FontAwesomeIcon icon={faUtensils} /> {recipe.baseServings ?? 1} servings</span>
      </div>

      {showMatchInfo && (
        <div className="match-details">
          {recipe.matchedIngredients?.length > 0 && (
            <div className="matched-ing">
              <strong>✅ Matched:</strong> {recipe.matchedIngredients.join(", ")}
            </div>
          )}
          {recipe.missingIngredients?.length > 0 && (
            <div className="missing-ing">
              <strong>❌ Missing:</strong> {recipe.missingIngredients.join(", ")}
            </div>
          )}
          {recipe.substitutionSuggestions && Object.keys(recipe.substitutionSuggestions).length > 0 && (
            <div className="substitution-box">
              <strong>🔄 Substitutions:</strong>
              <ul className="sub-list">
                {Object.entries(recipe.substitutionSuggestions).map(([ing, subs]) => (
                  <li key={ing}><em>{ing}</em> → {subs.join(", ")}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="nutrition-box">
        <strong>Nutrition (per serving):</strong>
        <div className="nutrition-row">
          <span>🔥 {recipe.nutrition?.perServing?.calories ?? recipe.nutrition?.caloriesPerServing} kcal</span>
          {recipe.nutrition?.perServing?.protein != null && <span>💪 {recipe.nutrition.perServing.protein}g protein</span>}
          {recipe.nutrition?.perServing?.carbs != null && <span>🌾 {recipe.nutrition.perServing.carbs}g carbs</span>}
          {recipe.nutrition?.perServing?.fat != null && <span>🧈 {recipe.nutrition.perServing.fat}g fat</span>}
        </div>
      </div>

      {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
        <details className="steps-details">
          <summary>📝 Steps ({recipe.steps.length})</summary>
          <ol className="steps-list">
            {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </details>
      )}

      <div className="card-actions">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => onRate(recipe.name, n)} aria-label={`Rate ${n}`} className={`star-btn ${currentRating >= n ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faStar} />
            </button>
          ))}
        </div>
        <button onClick={() => onToggleFavorite(recipe.name)} className={`fav-btn ${isFavorite ? "fav-active" : ""}`}>
          <FontAwesomeIcon icon={faHeart} /> {isFavorite ? "Favorited" : "Favorite"}
        </button>
      </div>
    </div>
  );
}

export default App;

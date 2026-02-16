/**
 * Ingredient substitution map.
 * Each key is an ingredient and its value is an array of possible substitutes.
 */
const SUBSTITUTIONS = {
  // Dairy
  milk: ["oat milk", "almond milk", "soy milk", "coconut milk"],
  butter: ["olive oil", "coconut oil", "margarine", "ghee"],
  cheese: ["nutritional yeast", "tofu", "cashew cheese", "vegan cheese"],
  cream: ["coconut cream", "cashew cream", "silken tofu"],
  yogurt: ["coconut yogurt", "soy yogurt"],
  curd: ["coconut yogurt", "soy yogurt"],
  paneer: ["tofu", "tempeh"],
  ghee: ["coconut oil", "olive oil"],

  // Protein
  egg: ["flax egg", "chia egg", "applesauce", "mashed banana"],
  chicken: ["tofu", "tempeh", "jackfruit", "seitan"],
  beef: ["mushroom", "tempeh", "seitan", "lentils"],
  pork: ["jackfruit", "tempeh", "mushroom"],
  fish: ["tofu", "hearts of palm", "banana blossom"],
  mutton: ["jackfruit", "mushroom", "soy chunks"],

  // Grains & gluten
  flour: ["almond flour", "oat flour", "rice flour", "chickpea flour"],
  bread: ["gluten-free bread", "lettuce wrap", "rice cake"],
  pasta: ["rice noodles", "zucchini noodles", "gluten-free pasta"],
  "soy sauce": ["tamari", "coconut aminos"],
  bun: ["lettuce wrap", "gluten-free bun"],
  "spring roll wrapper": ["rice paper wrapper"],

  // Sweeteners
  sugar: ["honey", "maple syrup", "stevia", "coconut sugar"],
  honey: ["maple syrup", "agave nectar", "date syrup"],

  // Oils & fats
  oil: ["olive oil", "avocado oil", "coconut oil"],
  "olive oil": ["avocado oil", "canola oil"],

  // Vegetables
  onion: ["shallot", "leek", "scallion"],
  tomato: ["sun-dried tomato", "red bell pepper", "canned tomato"],
  potato: ["sweet potato", "cauliflower", "turnip"],
  carrot: ["parsnip", "sweet potato"],
  lettuce: ["spinach", "kale", "arugula"],
  cucumber: ["zucchini", "celery"],
  "bell pepper": ["zucchini", "celery"],
  mushroom: ["eggplant", "zucchini"],
  broccoli: ["cauliflower", "green beans"],
  cabbage: ["kale", "bok choy"],

  // Nuts & seeds
  peanut: ["sunflower seeds", "soy butter"],
  almond: ["sunflower seeds", "pumpkin seeds"],
  cashew: ["macadamia", "sunflower seeds"],

  // Misc
  "cocoa powder": ["carob powder"],
  "rice batter": ["chickpea batter"],
  "garam masala": ["cumin + coriander + cinnamon"],
  spices: ["herb blend", "curry powder"],
};

/**
 * Given a list of missing ingredients, return a map of ingredient -> substitutes.
 */
function getSuggestions(missingIngredients) {
  const result = {};
  for (const ing of missingIngredients) {
    const key = ing.toLowerCase().trim();
    if (SUBSTITUTIONS[key]) {
      result[key] = SUBSTITUTIONS[key];
    }
  }
  return result;
}

module.exports = { SUBSTITUTIONS, getSuggestions };

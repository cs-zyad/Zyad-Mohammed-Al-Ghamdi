
export enum AllergyType {
  GLUTEN = "حساسية الجلوتين",
  PEANUT = "حساسية الفول السوداني",
  LACTOSE = "حساسية اللاكتوز",
  NUT = "حساسية المكسرات",
  EGG = "حساسية البيض",
  FISH = "حساسية السمك",
  SESAME = "حساسية السمسم",
  SHELLFISH = "حساسية القشريات"
}

export enum SafetyLevel {
  SAFE = "SAFE",
  CAUTION = "CAUTION",
  UNSAFE = "UNSAFE"
}

export enum MealType {
  BREAKFAST = "فطور",
  LUNCH = "غداء",
  DINNER = "عشاء"
}

export interface MealAnalysisResult {
  safetyStatus: SafetyLevel;
  explanation: string;
  potentialAllergens: string[];
  alternatives: string[];
  safeIngredients: string[];
}

export interface Restaurant {
  name: string;
  location: string;
  safetyLevel: string;
  suggestedMeals: string[];
  description: string;
  budgetLevel: "اقتصادي" | "متوسط" | "فاخر";
  imageUrl?: string;
  mapsUri?: string; // رابط خرائط جوجل الحقيقي من Grounding
}

export interface RestaurantSearchResult {
  restaurants: Restaurant[];
}

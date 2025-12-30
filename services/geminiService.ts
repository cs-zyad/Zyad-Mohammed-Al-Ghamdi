
import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysisResult, RestaurantSearchResult, AllergyType, SafetyLevel, MealType, Restaurant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a meal for specific allergies using Gemini 3 Flash.
 */
export const analyzeMealSafety = async (mealName: string, allergies: string[], imageBase64?: string): Promise<MealAnalysisResult> => {
  const modelId = "gemini-3-flash-preview";
  const allergiesString = allergies.join(" و ");

  const systemPrompt = `
    أنت خبير تغذية وسلامة غذائية للحجاج في مكة.
    يجب عليك تحليل الوجبة (سواء من الاسم أو الصورة) بالنسبة لشخص يعاني من الحساسيات التالية: "${allergiesString}".
    قم بتقييم الوجبة بناءً على المكونات الشائعة فيها واحتمالية وجود تلوث خلطي.
    جاوب باللغة العربية بتنسيق JSON حصراً.
  `;

  const parts: any[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64 } });
    parts.push({ text: `هذه صورة للوجبة. الاسم المقترح: "${mealName}". حلل الصورة بحثاً عن مسببات الحساسية لـ: ${allergiesString}.` });
  } else {
    parts.push({ text: `قم بتحليل الوجبة التالية: "${mealName}" ومدى ملاءمتها لحساسية: ${allergiesString}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { role: "user", parts: parts },
      config: { 
        systemInstruction: systemPrompt, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safetyStatus: { type: Type.STRING, enum: [SafetyLevel.SAFE, SafetyLevel.CAUTION, SafetyLevel.UNSAFE] },
            explanation: { type: Type.STRING },
            potentialAllergens: { type: Type.ARRAY, items: { type: Type.STRING } },
            safeIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["safetyStatus", "explanation", "potentialAllergens", "alternatives", "safeIngredients"]
        }
      },
    });
    return JSON.parse(response.text || "{}") as MealAnalysisResult;
  } catch (error) {
    console.error("Error analyzing meal:", error);
    throw error;
  }
};

/**
 * Finds restaurants in Makkah based on AI knowledge (No Grounding).
 */
export const findSafeRestaurants = async (
  allergies: string[], 
  locationName: string, 
  mealType: MealType = MealType.LUNCH
): Promise<RestaurantSearchResult> => {
  const modelId = "gemini-3-flash-preview";
  const allergiesString = allergies.join(" و ");

  const prompt = `
    أنت دليل غذائي خبير للحجاج في مكة المكرمة.
    اقترح أفضل 3 مطاعم ${mealType} في منطقة ${locationName} بمكة المكرمة.
    يجب أن تكون هذه المطاعم معروفة بمراعاتها لمعايير النظافة وتناسب الأشخاص الذين يعانون من: [${allergiesString}].
    
    قم بتوفير النتائج بتنسيق JSON حصراً يحتوي على مصفوفة "restaurants" مع الحقول التالية لكل مطعم:
    - name: اسم المطعم
    - location: اسم الحي أو المنطقة في مكة
    - safetyLevel: وصف لمستوى الأمان بالنسبة للحساسية المذكورة
    - description: وصف قصير للمطعم وما يميزه
    - budgetLevel: (اقتصادي، متوسط، أو فاخر)
    - suggestedMeals: (مصفوفة من 3 وجبات آمنة مقترحة)
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text || "{\"restaurants\": []}";
    return JSON.parse(responseText) as RestaurantSearchResult;
  } catch (error) {
    console.error("Error finding restaurants:", error);
    throw error;
  }
};

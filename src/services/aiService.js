const { GoogleGenerativeAI } = require('@google/generative-ai');


const generateLocalSummary = (city, temperature, humidity, condition) => {
  const tempWord = temperature >= 30 ? 'warm' : temperature <= 15 ? 'chilly' : 'pleasant';
  const humidityWord = humidity >= 70 ? 'high' : humidity <= 40 ? 'low' : 'moderate';
  return `Today's weather in ${city} is ${tempWord} and ${condition.toLowerCase()} with ${humidityWord} humidity.`;
};

const generateLocalRecommendation = (temperature, condition) => {
  const recs = [];
  const condLower = condition.toLowerCase();

  if (temperature >= 30) {
    recs.push('stay hydrated');
    recs.push('wear light cotton clothes');
    if (condLower.includes('sunny') || condLower.includes('clear')) {
      recs.push('avoid outdoor activities during peak afternoon hours');
    }
  } else if (temperature <= 15) {
    recs.push('wear warm layers');
    recs.push('keep hot drinks nearby');
  } else {
    recs.push('enjoy the comfortable temperature');
    recs.push('great day for outdoor plans');
  }

  if (condLower.includes('rain') || condLower.includes('drizzle') || condLower.includes('thunderstorm')) {
    recs.push('remember to carry an umbrella or raincoat');
  } else if (condLower.includes('cloud') || condLower.includes('overcast')) {
    recs.push('a light jacket might be handy');
  } else if (condLower.includes('snow')) {
    recs.push('watch out for slippery roads and stay warm');
  }

  if (recs.length === 0) {
    recs.push('dress comfortably for the current conditions');
  }

  // Combine recommendations list into a sentence
  const sentence = recs.slice(0, -1).join(', ') + (recs.length > 1 ? ', and ' : '') + recs.slice(-1);
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
};

/**
 * Generate AI Summary
 */
const generateSummary = async (city, temperature, humidity, condition) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    console.log('[AIService] Using rule-based fallback for weather summary (No Gemini key)');
    return generateLocalSummary(city, temperature, humidity, condition);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate a concise weather summary (maximum 1-2 sentences) for the following weather conditions:
    City: ${city}
    Temperature: ${temperature}Â°C
    Humidity: ${humidity}%
    Condition: ${condition}
    
    Response format should be simple, natural, and directly describe the current feel. Do not include markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text || generateLocalSummary(city, temperature, humidity, condition);
  } catch (error) {
    console.error('[AIService] Gemini API error generating summary:', error.message);
    return generateLocalSummary(city, temperature, humidity, condition);
  }
};

/**
 * Generate AI Recommendation
 */
const generateRecommendation = async (temperature, condition) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    console.log('[AIService] Using rule-based fallback for weather recommendation (No Gemini key)');
    return generateLocalRecommendation(temperature, condition);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Provide actionable personalized recommendations (maximum 1-2 sentences, e.g., clothing, hydration, activities) based on these weather conditions:
    Temperature: ${temperature}Â°C
    Condition: ${condition}
    
    Response format should be natural, friendly, and practical. Do not include markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text || generateLocalRecommendation(temperature, condition);
  } catch (error) {
    console.error('[AIService] Gemini API error generating recommendation:', error.message);
    return generateLocalRecommendation(temperature, condition);
  }
};
/**
 * Generate AI Summary for Study Material
 */
const generateStudyMaterialSummary = async (title, subject, content) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    console.log('[AIService] Gemini key not available for study material summary');
    return `Summary for ${title}: ${content.substring(0, 300)}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });

    const prompt = `
You are an AI StudyBuddy assistant.

Create a concise and easy-to-understand study summary.

Title: ${title}
Subject: ${subject}

Study Material:
${content}

Requirements:
- Summarize the important concepts.
- Use simple language suitable for students.
- Keep the summary concise.
- Do not add information that is not present in the study material.
- Do not use markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text || `Summary for ${title}: ${content.substring(0, 300)}`;
  } catch (error) {
    console.error(
      '[AIService] Gemini API error generating study material summary:',
      error.message
    );

    return `Summary for ${title}: ${content.substring(0, 300)}`;
  }
};
/**
 * Generate AI Flashcards for Study Material
 */
const generateFlashcards = async (title, subject, content) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return [
      {
        question: `What is ${title}?`,
        answer: content.substring(0, 300)
      }
    ];
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });
    const prompt = `
Create exactly 5 study flashcards from this material.
Title: ${title}
Subject: ${subject}
Material:
${content}
Return ONLY valid JSON in this format:
[
  {
    "question": "Question",
    "answer": "Answer"
  }
]
`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    text = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const flashcards = JSON.parse(text);
    if (!Array.isArray(flashcards)) {
      throw new Error('Invalid flashcards format');
    }
    return flashcards;
  } catch (error) {
    console.error('[AIService] Flashcards error:', error.message);
    return [
      {
        question: `What is ${title}?`,
        answer: content.substring(0, 300)
      }
    ];
  }
};module.exports = {
  generateSummary,
  generateRecommendation,
  generateStudyMaterialSummary,
  generateFlashcards
};




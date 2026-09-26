const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = 'gemini-3.8-flash';

// ==========================
// Local Weather Summary
// ==========================
const generateLocalSummary = (city, temperature, humidity, condition) => {
  const tempWord =
    temperature >= 30
      ? 'warm'
      : temperature <= 15
        ? 'chilly'
        : 'pleasant';

  const humidityWord =
    humidity >= 70
      ? 'high'
      : humidity <= 40
        ? 'low'
        : 'moderate';

  return `Today's weather in ${city} is ${tempWord} and ${condition.toLowerCase()} with ${humidityWord} humidity.`;
};

// ==========================
// Local Weather Recommendation
// ==========================
const generateLocalRecommendation = (
  city,
  temperature,
  humidity,
  condition
) => {
  const recommendations = [];

  if (temperature >= 30) {
    recommendations.push('Stay hydrated and avoid excessive outdoor activity.');
  } else if (temperature <= 15) {
    recommendations.push('Carry a light jacket and stay warm.');
  } else {
    recommendations.push('The temperature is comfortable for normal activities.');
  }

  if (humidity >= 70) {
    recommendations.push('High humidity may make it feel warmer.');
  }

  if (condition.toLowerCase().includes('rain')) {
    recommendations.push('Carry an umbrella and be careful on wet roads.');
  }

  return recommendations.join(' ');
};

// ==========================
// AI Helper
// ==========================
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey === 'your_gemini_api_key' ||
    apiKey.trim() === ''
  ) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: GEMINI_MODEL
  });
};

// ==========================
// Weather Summary
// ==========================
const generateSummary = async (
  city,
  temperature,
  humidity,
  condition
) => {
  const model = getGeminiModel();

  if (!model) {
    return generateLocalSummary(
      city,
      temperature,
      humidity,
      condition
    );
  }

  try {
    const prompt = `
Give a short and simple weather summary for a student.

City: ${city}
Temperature: ${temperature}°C
Humidity: ${humidity}%
Condition: ${condition}

Keep it under 3 sentences.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error(
      '[AIService] Weather summary error:',
      error.message
    );

    return generateLocalSummary(
      city,
      temperature,
      humidity,
      condition
    );
  }
};

// ==========================
// Weather Recommendation
// ==========================
const generateRecommendation = async (
  city,
  temperature,
  humidity,
  condition
) => {
  const model = getGeminiModel();

  if (!model) {
    return generateLocalRecommendation(
      city,
      temperature,
      humidity,
      condition
    );
  }

  try {
    const prompt = `
Give simple and practical weather recommendations for a student.

City: ${city}
Temperature: ${temperature}°C
Humidity: ${humidity}%
Condition: ${condition}

Give 3 short recommendations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error(
      '[AIService] Weather recommendation error:',
      error.message
    );

    return generateLocalRecommendation(
      city,
      temperature,
      humidity,
      condition
    );
  }
};

// ==========================
// Study Material Summary
// ==========================
const generateStudyMaterialSummary = async (
  title,
  subject,
  content
) => {
  const model = getGeminiModel();

  if (!model) {
    return `Summary of ${title}: ${content.substring(0, 500)}`;
  }

  try {
    const prompt = `
Create a clear and easy-to-understand study summary.

Title: ${title}
Subject: ${subject}

Content:
${content}

Include:
- Main concepts
- Important points
- Key terms

Keep it suitable for a college student.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error(
      '[AIService] Study material summary error:',
      error.message
    );

    return `Summary of ${title}: ${content.substring(0, 500)}`;
  }
};

// ==========================
// Flashcards
// ==========================
const generateFlashcards = async (
  title,
  subject,
  content
) => {
  const model = getGeminiModel();

  if (!model) {
    return [
      {
        question: `What is ${title}?`,
        answer: `It is a study material related to ${subject}.`
      }
    ];
  }

  try {
    const prompt = `
Create 5 useful flashcards from the following study material.

Title: ${title}
Subject: ${subject}

Content:
${content}

Return ONLY valid JSON.

Format:
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

    return JSON.parse(text);
  } catch (error) {
    console.error(
      '[AIService] Flashcards error:',
      error.message
    );

    return [
      {
        question: `What is ${title}?`,
        answer: `It is a study material related to ${subject}.`
      }
    ];
  }
};

// ==========================
// Quiz
// ==========================
const generateQuiz = async (
  title,
  subject,
  content
) => {
  const model = getGeminiModel();

  if (!model) {
    return [
      {
        question: `What is the main topic of ${title}?`,
        options: [
          subject,
          'History',
          'Geography',
          'General Knowledge'
        ],
        answer: subject
      }
    ];
  }

  try {
    const prompt = `
Create 5 multiple-choice quiz questions from this study material.

Title: ${title}
Subject: ${subject}

Content:
${content}

Return ONLY valid JSON.

Format:
[
  {
    "question": "Question",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "Correct option"
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

    return JSON.parse(text);
  } catch (error) {
    console.error(
      '[AIService] Quiz error:',
      error.message
    );

    return [
      {
        question: `What is the main topic of ${title}?`,
        options: [
          subject,
          'History',
          'Geography',
          'General Knowledge'
        ],
        answer: subject
      }
    ];
  }
};

// ==========================
// Study Plan
// ==========================
const generateStudyPlan = async (
  subject,
  topics,
  days
) => {
  const model = getGeminiModel();

  // Local fallback if Gemini API is not available
  if (!model) {
    return topics.map((topic, index) => ({
      day: index + 1,
      topic,
      tasks: [
        `Study ${topic}`,
        `Review important concepts from ${topic}`
      ]
    }));
  }

  try {
    const prompt = `
Create a simple day-by-day study plan for a college student.

Subject: ${subject}

Topics:
${topics.join(', ')}

Number of days: ${days}

Create a plan covering all ${days} days.

Return ONLY valid JSON.

Format:
[
  {
    "day": 1,
    "topic": "Topic name",
    "tasks": [
      "Task 1",
      "Task 2"
    ]
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

    const studyPlan = JSON.parse(text);

    if (!Array.isArray(studyPlan)) {
      throw new Error('Invalid study plan format');
    }

    return studyPlan;
  } catch (error) {
    console.error(
      '[AIService] Study plan error:',
      error.message
    );

    // Local fallback
    return topics.map((topic, index) => ({
      day: index + 1,
      topic,
      tasks: [
        `Study ${topic}`,
        `Review important concepts from ${topic}`
      ]
    }));
  }
};

// ==========================
// EXPORTS
// ==========================
module.exports = {
  generateSummary,
  generateRecommendation,
  generateStudyMaterialSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan
};
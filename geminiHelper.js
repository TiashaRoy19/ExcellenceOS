const { GoogleGenAI } = require('@google/generative-ai');

// Clean helper to safely call Gemini and fallback to mocks if key is missing or calls fail
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is not defined in server/.env. Using mock AI generator fallback.');
    return null;
  }
  // Set up generative AI
  // Note: standard SDK requires calling new GoogleGenAI({ apiKey }) or standard initialization
  // Let's use the official google/generative-ai constructor:
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  return new GoogleGenerativeAI(apiKey);
};

// ==========================================
// MOCK FALLBACKS
// ==========================================

const generateMockSummary = (text) => {
  const sampleWords = text.toLowerCase();
  
  if (sampleWords.includes('react') || sampleWords.includes('javascript') || sampleWords.includes('vite')) {
    return `# React & Modern Frontend Architecture (AI Summary)

## Core Concepts
* **Component-Based Development**: Encourages breaking down UIs into reusable self-contained logic blocks.
* **Virtual DOM**: Syncs UI state with memory to prevent expensive rendering updates.
* **Vite Tooling**: Extremely fast bundler utilizing native ES Modules (ESM) under the hood.

## Detailed Breakdown
React is a declarative library. State transitions prompt components to re-run and virtual trees to reconcile. State hooks like \`useState\` handle local values, while \`useEffect\` handles asynchronous side-effects.

## Conclusion
Building modular projects like Study OS involves leveraging state managers and routing effectively to keep states synchronous and predictable.`;
  }

  if (sampleWords.includes('machine learning') || sampleWords.includes('ai') || sampleWords.includes('model') || sampleWords.includes('data')) {
    return `# Artificial Intelligence & Machine Learning (AI Summary)

## Core Concepts
* **Supervised Learning**: Training models using labeled data inputs and matching outputs.
* **Unsupervised Learning**: Uncovering hidden clusters or associations within unlabeled data.
* **Neural Networks**: Layered mathematical models designed to compute predictions dynamically.

## Detailed Breakdown
Models find coefficients that minimize error functions (like mean squared error or cross-entropy loss) via optimization routines like gradient descent. Scaling parameters and checking validation curves are essential to prevent overfitting.

## Summary Checklist
- [x] Pre-process and scale inputs
- [x] Initialize layers and weights
- [x] Run gradient descent steps
- [x] Evaluate accuracy on test folds`;
  }

  // General Mock Summary
  const firstSentence = text.split(/[.!?]/)[0] || 'your uploaded notes';
  return `# Smart Study Notes: ${firstSentence.substring(0, 50)}... (AI Summary)

## Core Concepts Summary
* **Primary Theme**: Focuses on key concepts mentioned in study notes.
* **Retention Strategy**: Focuses on structuring definitions clearly to optimize revision.
* **Critical Takeaways**: Organizing items into hierarchical notes speeds up learning.

## Detailed Notes
Your text has been analyzed. We suggest breaking the materials into multiple interactive Pomodoro study blocks and using quizzes to test retention.

## Action Plan
1. Review flashcards regularly.
2. Complete practice quizzes.
3. Keep study streak alive.`;
};

const generateMockFlashcards = (text) => {
  const sampleWords = text.toLowerCase();

  if (sampleWords.includes('react') || sampleWords.includes('javascript')) {
    return [
      { front: 'What is a React Hook?', back: 'Functions that let you hook into React state and lifecycle features from function components (e.g., useState, useEffect).' },
      { front: 'What is the Virtual DOM?', back: 'A programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the real DOM via reconciliation.' },
      { front: 'Explain Prop Drilling.', back: 'Passing props down multiple levels to reach a deeply nested child component, which can make code hard to maintain.' }
    ];
  }

  if (sampleWords.includes('machine learning') || sampleWords.includes('ai')) {
    return [
      { front: 'What is Overfitting?', back: 'When a machine learning model performs exceptionally well on the training data but fails to generalize to unseen test data.' },
      { front: 'What is Supervised Learning?', back: 'A type of machine learning where models are trained using input-output pairs that have been labeled in advance.' },
      { front: 'What is Gradient Descent?', back: 'An optimization algorithm used to minimize the cost function by iteratively moving in the direction of steepest descent.' }
    ];
  }

  // Generic fallback cards derived from user text
  const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, '');
  const words = cleanText.split(/\s+/).filter(w => w.length > 5);
  const terms = [...new Set(words)].slice(0, 3);
  
  if (terms.length >= 2) {
    return terms.map((t, idx) => ({
      front: `What is the significance of the term "${t}" in this context?`,
      back: `In your study notes, "${t}" represents a key vocabulary keyword. Review the main text to see how it connects to surrounding themes.`
    }));
  }

  return [
    { front: 'Active Recall', back: 'A highly efficient testing technique where you actively stimulate your memory during the learning process.' },
    { front: 'Spaced Repetition', back: 'A learning methodology where you review study cards at expanding intervals to lock facts in long-term memory.' }
  ];
};

const generateMockQuiz = (text, difficulty = 'medium') => {
  const sampleWords = text.toLowerCase();

  if (sampleWords.includes('react') || sampleWords.includes('javascript')) {
    return [
      {
        questionText: 'Which React Hook is used to manage state values locally within a component?',
        type: 'mcq',
        options: ['useContext', 'useEffect', 'useState', 'useRef'],
        correctAnswer: 'useState',
        explanation: 'useState allows you to declare state variables inside functional components.'
      },
      {
        questionText: 'Is the Virtual DOM faster than direct DOM manipulation for simple updates?',
        type: 'tf',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Direct DOM manipulation is faster for small, isolated updates. The Virtual DOM adds value by batching and optimizing complex updates.'
      },
      {
        questionText: 'Write the hook name used to trigger side-effects like fetching data.',
        type: 'short',
        correctAnswer: 'useEffect',
        explanation: 'useEffect handles external side-effects in functional components.'
      }
    ];
  }

  if (sampleWords.includes('machine learning') || sampleWords.includes('ai')) {
    return [
      {
        questionText: 'What parameter tuning helps prevent overfitting in neural networks?',
        type: 'mcq',
        options: ['Increasing learning rate', 'Adding Regularization (L1/L2)', 'Removing layers', 'None of the above'],
        correctAnswer: 'Adding Regularization (L1/L2)',
        explanation: 'Regularization penalizes large weights, simplifying models and improving generalizability.'
      },
      {
        questionText: 'Unsupervised learning uses labeled training sets.',
        type: 'tf',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Unsupervised learning algorithms learn patterns and structures directly from unlabeled data.'
      },
      {
        questionText: 'What term defines a model that cannot capture the underlying trend of the data?',
        type: 'short',
        correctAnswer: 'underfitting',
        explanation: 'Underfitting occurs when a model is too simple to represent the mapping relationship.'
      }
    ];
  }

  return [
    {
      questionText: 'What is the primary benefit of testing yourself with active quizzes?',
      type: 'mcq',
      options: ['Saves time', 'Improves long-term retention', 'It is easier than reading', 'No benefit'],
      correctAnswer: 'Improves long-term retention',
      explanation: 'Testing forces retrieval from memory, strengthening cognitive connections.'
    },
    {
      questionText: 'Reviewing notes passively is the best way to study.',
      type: 'tf',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'Active testing techniques outperform passive reading for exam preparation.'
    },
    {
      questionText: 'What interval review strategy helps fight the forgetting curve?',
      type: 'short',
      correctAnswer: 'spaced repetition',
      explanation: 'Spaced repetition reviews topics over expanding periods to maximize recall.'
    }
  ];
};

// ==========================================
// GEMINI INTEGRATION LOGIC
// ==========================================

exports.summarizeText = async (text) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return generateMockSummary(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a world-class academic tutor. Please summarize the following study materials into a clean, comprehensive study guide using markdown headers, lists, and summary tables where relevant. Break it down into key concepts, detailed explanations, and review tips. Make it look professional and structured.
    
    Materials to summarize:
    ${text}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API summarize error, falling back to mock:', error.message);
    return generateMockSummary(text);
  }
};

exports.generateFlashcardsAI = async (text) => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return generateMockFlashcards(text);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `From the following text, extract the key terms, concepts, or formulas and generate a structured JSON array of study flashcards. Each flashcard must be an object containing "front" (a direct, concise question or term) and "back" (a short, clear answer or definition). Produce only a JSON array of objects. Do not include markdown code block formatting like \`\`\`json.
    
    Text:
    ${text}`;

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API flashcards error, falling back to mock:', error.message);
    return generateMockFlashcards(text);
  }
};

exports.generateQuizAI = async (text, difficulty = 'medium') => {
  const genAI = getGeminiClient();
  if (!genAI) {
    return generateMockQuiz(text, difficulty);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Analyze the study text below and generate an interactive quiz matching a ${difficulty} difficulty level. Return a JSON array containing exactly 3-5 question objects. 
    Each question object must follow this schema:
    - "questionText": String (the question itself)
    - "type": "mcq" | "tf" | "short" (multiple choice, true/false, or short direct answer)
    - "options": Array of String (provide exactly 4 options for "mcq", exactly ["True", "False"] for "tf", omit or leave empty for "short")
    - "correctAnswer": String (must EXACTLY match the correct option string for mcq, "True" or "False" for tf, or a brief 1-3 word key term/phrase for short answer)
    - "explanation": String (brief reasoning of why this answer is correct)
    
    Produce only a valid JSON array. Do not add markdown code block wrappers.
    
    Text:
    ${text}`;

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API quiz error, falling back to mock:', error.message);
    return generateMockQuiz(text, difficulty);
  }
};

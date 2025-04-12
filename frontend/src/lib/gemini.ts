import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeBenefits(formData: {
  isStudent: string;
  hasJob: string;
  hasDependents: string;
}) {
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `Based on the following information, suggest relevant government benefits and support programs:
  - Student Status: ${formData.isStudent === 'Yes' ? 'Currently a student' : 'Not a student'}
  - Employment: ${formData.hasJob === 'Yes' ? 'Employed' : 'Unemployed'}
  - Dependents: ${formData.hasDependents === 'Yes' ? 'Has dependents' : 'No dependents'}
  
  Please provide specific programs, eligibility requirements, and next steps for applying.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    return 'Unable to analyze benefits at this time. Please try again later.';
  }
}

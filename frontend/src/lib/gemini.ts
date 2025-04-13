import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtendedFormData } from './types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeBenefits(formData: ExtendedFormData & { category?: string }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let prompt = `Please analyze the following user profile and provide a succinct recommendation of specific government and educational benefits and support programs they could be eligible for. Include short application instructions or search keywords (as links) where applicable. Do not provide an overly verbose response.\n\n`;
  
  prompt += `User Profile:\n`;
  prompt += `- Student Status: ${formData.isStudent === "Yes" ? "Currently enrolled" : "Not enrolled"}\n`;
  prompt += `- Employment: ${formData.hasJob === "Yes" ? "Employed" : "Unemployed"}\n`;
  prompt += `- Dependents: ${formData.hasDependents === "Yes" ? "Has dependents" : "No dependents"}\n`;
  
  if (formData.institutionType) prompt += `- Institution Type: ${formData.institutionType}\n`;
  if (formData.isUCStudent) prompt += `- UC Student Status: ${formData.isUCStudent}\n`;
  if (formData.financialAid) prompt += `- Receiving Financial Aid: ${formData.financialAid}\n`;
  if (formData.jobTraining) prompt += `- Interested in Job Training: ${formData.jobTraining}\n`;
  if (formData.housingStatus) prompt += `- Housing Status: ${formData.housingStatus}\n`;
  if (formData.needsHousingAssistance) prompt += `- Needs Housing Assistance: ${formData.needsHousingAssistance}\n`;
  if (formData.hasInsurance) prompt += `- Health Insurance: ${formData.hasInsurance}\n`;
  if (formData.eligibleForHealthcare) prompt += `- Eligible for Healthcare Programs: ${formData.eligibleForHealthcare}\n`;
  if (formData.healthcareNeeds) prompt += `- Specific Healthcare Needs: ${formData.healthcareNeeds}\n`;
  if (formData.incomeBracket) prompt += `- Income Bracket: ${formData.incomeBracket}\n`;
  if (formData.dependentsCount) prompt += `- Number of Dependents: ${formData.dependentsCount}\n`;
  
  prompt += `\nBased on this information, list the specific benefit programs that the user could apply for (e.g., scholarships, unemployment insurance, housing vouchers, Medicaid). For each program, provide a short explanation and include a link or search keyword for further information. Keep the response succinct and clear.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    return "Unable to analyze benefits at this time. Please try again later.";
  }
}
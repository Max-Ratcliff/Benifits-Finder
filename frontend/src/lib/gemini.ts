// import { GoogleGenerativeAI } from '@google/generative-ai';
// import type { ExtendedFormData } from './types';

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// /**
//  * Generates a benefits analysis based on the provided profile and conversation history.
//  * @param formData - Extended profile data including optional category.
//  * @param conversationHistory - Optional dialogue history to maintain context.
//  * @returns A textual response from Gemini.
//  */

// export async function analyzeBenefits(
//   formData: ExtendedFormData & { category?: string },
//   conversationHistory: string = ""
// ) {
//   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
//   let prompt = "";
  
//   if (conversationHistory.trim().length > 0) {
//     prompt += `Conversation History:\n${conversationHistory}\n\n`;
//   }
  
//   prompt += `User Profile:\n`;
//   prompt += `- Student Status: ${formData.isStudent === "Yes" ? "Currently enrolled" : "Not enrolled"}\n`;
//   prompt += `- Employment: ${formData.hasJob === "Yes" ? "Employed" : "Unemployed"}\n`;
//   prompt += `- Dependents: ${formData.hasDependents === "Yes" ? "Has dependents" : "No dependents"}\n`;
  
//   if (formData.institutionType)
//     prompt += `- Institution Type: ${formData.institutionType}\n`;
//   if (formData.isUCStudent)
//     prompt += `- UC Student Status: ${formData.isUCStudent}\n`;
//   if (formData.financialAid)
//     prompt += `- Receiving Financial Aid: ${formData.financialAid}\n`;
//   if (formData.jobTraining)
//     prompt += `- Interested in Job Training: ${formData.jobTraining}\n`;
//   if (formData.housingStatus)
//     prompt += `- Housing Status: ${formData.housingStatus}\n`;
//   if (formData.needsHousingAssistance)
//     prompt += `- Needs Housing Assistance: ${formData.needsHousingAssistance}\n`;
//   if (formData.hasInsurance)
//     prompt += `- Health Insurance: ${formData.hasInsurance}\n`;
//   if (formData.eligibleForHealthcare)
//     prompt += `- Eligible for Healthcare Programs: ${formData.eligibleForHealthcare}\n`;
//   if (formData.healthcareNeeds)
//     prompt += `- Specific Healthcare Needs: ${formData.healthcareNeeds}\n`;
//   if (formData.incomeBracket)
//     prompt += `- Income Bracket: ${formData.incomeBracket}\n`;
//   if (formData.dependentsCount)
//     prompt += `- Number of Dependents: ${formData.dependentsCount}\n`;
//   if (formData.category)
//     prompt += `- Benefit Category: ${formData.category}\n`;
  
//   prompt += `\nAnalyze the profile above.  Based on the profile, provide a succinct recommendation of specific government and educational benefit programs
//   the user could be eligible for (e.g., scholarships, unemployment insurance, housing vouchers, Medicaid), including links to the forms.  
//   For each program, provide a short explanation and include a link. Keep your response clear and not overly verbose.
//   Make sure the user information is being used to determine which links to show them. Remove any *, [, or ] character potentially confusing the user.
//   Then, ask one brief follow-up question prompting the user to specify which benefit program they would like more information about.
//   Use information about the follow ups, the profile data, and previous conversation from the user autocomplete the form.`;
  
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     return response.text();
//   } catch (error) {
//     console.error("Error generating content:", error);
//     return "Unable to analyze benefits at this time. Please try again later.";
//   }
// }

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtendedFormData } from './types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generates a benefits analysis based on the provided profile and conversation history.
 * @param formData - Extended profile data including optional category.
 * @param conversationHistory - Optional dialogue history to maintain context.
 * @returns A textual response from Gemini.
 */

export async function analyzeBenefits(
  formData: ExtendedFormData & { category?: string },
  conversationHistory: string = ""
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  let prompt = "";
  
  if (conversationHistory.trim().length > 0) {
    prompt += `Conversation History:\n${conversationHistory}\n\n`;
  }
  
  prompt += `User Profile:\n`;
  prompt += `- Student Status: ${formData.isStudent === "Yes" ? "Currently enrolled" : "Not enrolled"}\n`;
  prompt += `- Employment: ${formData.hasJob === "Yes" ? "Employed" : "Unemployed"}\n`;
  prompt += `- Dependents: ${formData.hasDependents === "Yes" ? "Has dependents" : "No dependents"}\n`;
  
  if (formData.institutionType)
    prompt += `- Institution Type: ${formData.institutionType}\n`;
  if (formData.specificInstitution)
    prompt += `- Specific Institution: ${formData.specificInstitution}\n`;
  if (formData.isUCStudent)
    prompt += `- UC Student Status: ${formData.isUCStudent}\n`;
  if (formData.major)
    prompt += `- Major: ${formData.major}\n`;
  if (formData.financialAid)
    prompt += `- Receiving Financial Aid: ${formData.financialAid}\n`;
  if (formData.financialAidTypes && formData.financialAidTypes.length > 0)
    prompt += `- Financial Aid Types: ${formData.financialAidTypes.join(', ')}\n`;
  if (formData.employmentType)
    prompt += `- Employment Type: ${formData.employmentType}\n`;
  if (formData.jobTraining)
    prompt += `- Interested in Job Training: ${formData.jobTraining}\n`;
  if (formData.housingStatus)
    prompt += `- Housing Status: ${formData.housingStatus}\n`;
  if (formData.needsHousingAssistance)
    prompt += `- Needs Housing Assistance: ${formData.needsHousingAssistance}\n`;
  if (formData.hasInsurance)
    prompt += `- Health Insurance: ${formData.hasInsurance}\n`;
  if (formData.insuranceType)
    prompt += `- Insurance Type: ${formData.insuranceType}\n`;
  if (formData.eligibleForHealthcare)
    prompt += `- Eligible for Healthcare Programs: ${formData.eligibleForHealthcare}\n`;
  if (formData.healthcareNeeds)
    prompt += `- Specific Healthcare Needs: ${formData.healthcareNeeds}\n`;
  if (formData.veteran)
    prompt += `- Veteran Status: ${formData.veteran}\n`;
  if (formData.disability)
    prompt += `- Disability Status: ${formData.disability}\n`;
  if (formData.incomeBracket)
    prompt += `- Income Bracket: ${formData.incomeBracket}\n`;
  if (formData.dependentsCount)
    prompt += `- Number of Dependents: ${formData.dependentsCount}\n`;
  if (formData.dependentsAges)
    prompt += `- Ages of Dependents: ${formData.dependentsAges}\n`;
  if (formData.zipCode)
    prompt += `- ZIP Code: ${formData.zipCode}\n`;
  if (formData.state)
    prompt += `- State: ${formData.state}\n`;
  if (formData.category)
    prompt += `- Benefit Category: ${formData.category}\n`;
  
  prompt += `\nAnalyze the profile above. Based on the profile, provide a succinct recommendation of specific government and educational benefit programs 
  the user could be eligible for (e.g., scholarships, unemployment insurance, housing vouchers, Medicaid), including links to the forms. 
  For each program, provide a short explanation and include a link. Keep your response clear and not overly verbose.
  Make sure the user information is being used to determine which links to show them. Remove any *, [, or ] character potentially confusing the user.
  Then, ask one brief follow-up question prompting the user to specify which benefit program they would like more information about.
  Use information about the follow ups, the profile data, and previous conversation from the user to autocomplete the form.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    return "I'm sorry, I encountered an error while analyzing your eligibility for benefits. Please try again later.";
  }
}

/**
 * Generate form questions for a specific benefit program
 * @param programName - The name of the benefit program
 * @param userProfile - User profile data
 * @returns A list of form fields and initial values
 */
export async function generateFormFields(
  programName: string,
  userProfile: ExtendedFormData
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
  Based on the following user profile:
  ${JSON.stringify(userProfile, null, 2)}
  
  Generate a JSON structure representing the form fields needed for the "${programName}" program application.
  For each field, include:
  1. A field ID
  2. A question or label
  3. A field type (text, number, select, radio, etc.)
  4. Possible options if applicable
  5. A prefilled value based on the user profile if available
  
  Return ONLY the JSON structure without any additional explanation.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error generating form fields:", error);
    return null;
  }
}

/**
 * Process a user's answer to a form question and determine the next question
 * @param programName - The benefit program name
 * @param currentQuestion - The current question being answered
 * @param answer - The user's answer to the current question
 * @param formProgress - Previous answers in the form
 * @param userProfile - User's profile data
 * @returns The next question to ask or null if form is complete
 */

export async function processFormAnswer(
  programName: string,
  currentQuestion: string,
  answer: string,
  formProgress: Record<string, string>,
  userProfile: ExtendedFormData
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let prompt = "";
  if (!currentQuestion) {
    prompt = `Start the application process for "${programName}".
User profile: ${JSON.stringify(userProfile)}
Provide the first question to ask the user and a possible prefilled value based on their profile.
Respond in the following format:
NEXT_QUESTION: [first question]
PREFILL: [prefilled value or empty]
COMPLETE: false`;
  } else {
    prompt = `The user is filling out an application form for the "${programName}" program.
User profile: ${JSON.stringify(userProfile)}
Previous answers:
${Object.entries(formProgress).map(([q, a]) => `${q}: ${a}`).join('\n')}
Current question: ${currentQuestion}
User's answer: ${answer}
Based on this information:
1. Validate if the answer is appropriate for the question
2. Determine the next logical question to ask
3. If all necessary information has been collected, indicate the form is complete
Respond in the following format:
VALID: [true/false]
FEEDBACK: [Any feedback about the answer if invalid]
NEXT_QUESTION: [The next question to ask]
PREFILL: [Suggested answer based on user profile if available]
COMPLETE: [true/false indicating if form is complete]`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!currentQuestion) {
      const nextQuestion = text.match(/NEXT_QUESTION: (.*)/)?.[1] || "";
      const prefill = text.match(/PREFILL: (.*)/)?.[1] || "";
      return { valid: true, feedback: "", nextQuestion, prefill, complete: false };
    } else {
      const valid = text.includes("VALID: true");
      const feedback = text.match(/FEEDBACK: (.*)/)?.[1] || "";
      const nextQuestion = text.match(/NEXT_QUESTION: (.*)/)?.[1] || "";
      const prefill = text.match(/PREFILL: (.*)/)?.[1] || "";
      const complete = text.includes("COMPLETE: true");
      return { valid, feedback, nextQuestion, prefill, complete };
    }
  } catch (error) {
    console.error("Error processing form answer:", error);
    return { valid: false, feedback: "An error occurred.", nextQuestion: "", prefill: "", complete: false };
  }
}

/**
 * Generate a summary of the completed form
 * @param programName - The benefit program name
 * @param formAnswers - All form answers
 * @param userProfile - User's profile data
 * @returns A summary of the form submission and next steps
 */
export async function generateFormSummary(
  programName: string,
  formAnswers: Record<string, string>,
  userProfile: ExtendedFormData
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
  The user has completed an application for the "${programName}" program.
  
  Form answers:
  ${Object.entries(formAnswers)
    .map(([question, answer]) => `${question}: ${answer}`)
    .join('\n')}
  
  User profile:
  ${JSON.stringify(userProfile, null, 2)}
  
  Please generate:
  1. A summary of the information provided
  2. Confirmation of eligibility based on provided information
  3. Estimated timeline for application processing
  4. Next steps the user should take
  5. Any additional documents they might need to provide
  
  Format this as a clear, encouraging message to the user.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating form summary:", error);
    return "Thank you for completing your application. Your submission has been recorded, and you'll be notified about next steps soon.";
  }
}
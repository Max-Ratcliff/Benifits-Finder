import { auth, db } from './firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { ExtendedFormData } from './types';

/**
 * Validates if a value is a valid string and not empty or 'SKIP'
 * @param value - The value to validate
 * @returns boolean indicating if the value is valid
 */
function isValidValue(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim() !== '' && value !== 'SKIP';
}

/**
 * Normalizes a string by converting to lowercase and trimming whitespace
 * @param str - The string to normalize
 * @returns The normalized string
 */
function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Updates the user profile with new form answers
 * @param answers - Form answers to potentially store in user profile
 * @param userProfile - Current user profile data
 * @returns Updated user profile
 * @throws Error if user is not authenticated or if Firestore update fails
 */
export async function updateUserProfileWithFormAnswers(
  answers: Record<string, string>,
  userProfile: ExtendedFormData
): Promise<ExtendedFormData> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to update profile');
  }

  const profileUpdates: Partial<ExtendedFormData> = {};
  
  // Define profile fields with their types for better type safety
  const profileFields = [
    // Personal information
    { field: 'firstName', type: 'string' },
    { field: 'lastName', type: 'string' },
    { field: 'email', type: 'string' },
    { field: 'address', type: 'string' },
    { field: 'ssn', type: 'string' },
    { field: 'dob', type: 'string' },
    { field: 'phoneNumber', type: 'string' },
    { field: 'age', type: 'string' },
    // Education information
    { field: 'isStudent', type: 'string' },
    { field: 'institutionType', type: 'string' },
    { field: 'specificInstitution', type: 'string' },
    { field: 'isUCStudent', type: 'string' },
    { field: 'isCaliStudent', type: 'string' },
    { field: 'isCSUStudent', type: 'string' },
    { field: 'isCCStudent', type: 'string' },
    { field: 'university', type: 'string' },
    { field: 'major', type: 'string' },
    { field: 'gradeLevel', type: 'string' },
    { field: 'gpa', type: 'string' },
    { field: 'highSchoolGradDate', type: 'string' },
    // Financial information
    { field: 'financialAid', type: 'string' },
    { field: 'financialAidTypes', type: 'array' },
    { field: 'incomeBracket', type: 'string' },
    // Employment information
    { field: 'hasJob', type: 'string' },
    { field: 'employmentType', type: 'string' },
    { field: 'jobTraining', type: 'string' },
    // Housing information
    { field: 'housingStatus', type: 'string' },
    { field: 'needsHousingAssistance', type: 'string' },
    // Healthcare information
    { field: 'hasInsurance', type: 'string' },
    { field: 'insuranceType', type: 'string' },
    { field: 'eligibleForHealthcare', type: 'string' },
    { field: 'healthcareNeeds', type: 'string' },
    // Demographic information
    { field: 'hasDependents', type: 'string' },
    { field: 'dependentsCount', type: 'string' },
    { field: 'dependentsAges', type: 'string' },
    { field: 'veteran', type: 'string' },
    { field: 'disability', type: 'string' },
    // Location information
    { field: 'zipCode', type: 'string' },
    { field: 'state', type: 'string' }
  ] as const;

  // Map common question patterns to profile fields with type safety
  const questionMappings: Record<string, { field: keyof ExtendedFormData; type: string }> = {
    // Personal information mappings
    'first name': { field: 'firstName', type: 'string' },
    'last name': { field: 'lastName', type: 'string' },
    'email address': { field: 'email', type: 'string' },
    'mailing address': { field: 'address', type: 'string' },
    'home address': { field: 'address', type: 'string' },
    'social security number': { field: 'ssn', type: 'string' },
    'ssn': { field: 'ssn', type: 'string' },
    'date of birth': { field: 'dob', type: 'string' },
    'phone number': { field: 'phoneNumber', type: 'string' },
    'age': { field: 'age', type: 'string' },
    // Education mappings
    'are you currently enrolled': { field: 'isStudent', type: 'string' },
    'institution type': { field: 'institutionType', type: 'string' },
    'school or college': { field: 'specificInstitution', type: 'string' },
    'university name': { field: 'specificInstitution', type: 'string' },
    'college name': { field: 'specificInstitution', type: 'string' },
    'uc student': { field: 'isUCStudent', type: 'string' },
    'california student': { field: 'isCaliStudent', type: 'string' },
    'csu student': { field: 'isCSUStudent', type: 'string' },
    'community college student': { field: 'isCCStudent', type: 'string' },
    'academic major': { field: 'major', type: 'string' },
    'major': { field: 'major', type: 'string' },
    'grade level': { field: 'gradeLevel', type: 'string' },
    'current gpa': { field: 'gpa', type: 'string' },
    'high school graduation date': { field: 'highSchoolGradDate', type: 'string' },
    // Financial mappings
    'financial aid': { field: 'financialAid', type: 'string' },
    'income bracket': { field: 'incomeBracket', type: 'string' },
    'annual income': { field: 'incomeBracket', type: 'string' },
    // Employment mappings
    'employment status': { field: 'hasJob', type: 'string' },
    'employed': { field: 'hasJob', type: 'string' },
    'type of employment': { field: 'employmentType', type: 'string' },
    'job training': { field: 'jobTraining', type: 'string' },
    // Housing mappings
    'housing status': { field: 'housingStatus', type: 'string' },
    'housing assistance': { field: 'needsHousingAssistance', type: 'string' },
    // Healthcare mappings
    'health insurance': { field: 'hasInsurance', type: 'string' },
    'insurance type': { field: 'insuranceType', type: 'string' },
    'healthcare needs': { field: 'healthcareNeeds', type: 'string' },
    // Demographic mappings
    'dependents': { field: 'hasDependents', type: 'string' },
    'number of dependents': { field: 'dependentsCount', type: 'string' },
    'ages of dependents': { field: 'dependentsAges', type: 'string' },
    'veteran status': { field: 'veteran', type: 'string' },
    'disability status': { field: 'disability', type: 'string' },
    // Location mappings
    'zip code': { field: 'zipCode', type: 'string' },
    'postal code': { field: 'zipCode', type: 'string' },
    'state': { field: 'state', type: 'string' }
  };

  // Process each form answer
  Object.entries(answers).forEach(([question, answer]) => {
    if (!isValidValue(answer)) return;

    const normalizedQuestion = normalizeString(question);

    // Check for direct mappings
    for (const [pattern, mapping] of Object.entries(questionMappings)) {
      if (normalizedQuestion.includes(pattern)) {
        if (mapping.field === 'financialAidTypes') {
          const currentTypes = Array.isArray(profileUpdates[mapping.field]) 
            ? profileUpdates[mapping.field] as string[]
            : [];
          if (!currentTypes.includes(answer)) {
            profileUpdates[mapping.field] = [...currentTypes, answer];
          }
        } else {
          profileUpdates[mapping.field] = answer;
        }
        break;
      }
    }

    // Check for exact field matches
    profileFields.forEach(({ field, type }) => {
      if (normalizedQuestion.includes(field.toLowerCase())) {
        if (type === 'array' && field === 'financialAidTypes') {
          const currentTypes = Array.isArray(profileUpdates[field]) 
            ? profileUpdates[field] as string[]
            : [];
          if (!currentTypes.includes(answer)) {
            profileUpdates[field] = [...currentTypes, answer];
          }
        } else {
          profileUpdates[field] = answer;
        }
      }
    });

    // Special handling for yes/no questions
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'no') {
      if (normalizedQuestion.includes('student') || normalizedQuestion.includes('enrolled')) {
        profileUpdates.isStudent = answer;
      }
      if (normalizedQuestion.includes('job') || normalizedQuestion.includes('employed') || normalizedQuestion.includes('work')) {
        profileUpdates.hasJob = answer;
      }
      if (normalizedQuestion.includes('dependent') || normalizedQuestion.includes('children')) {
        profileUpdates.hasDependents = answer;
      }
      if (normalizedQuestion.includes('veteran')) {
        profileUpdates.veteran = answer;
      }
      if (normalizedQuestion.includes('disability') || normalizedQuestion.includes('disabled')) {
        profileUpdates.disability = answer;
      }
      if (normalizedQuestion.includes('financial aid')) {
        profileUpdates.financialAid = answer;
      }
      if (normalizedQuestion.includes('insurance') || normalizedQuestion.includes('insured')) {
        profileUpdates.hasInsurance = answer;
      }
    }
  });

  // If we found any fields to update, save them to Firestore
  if (Object.keys(profileUpdates).length > 0) {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...profileUpdates,
        updatedAt: serverTimestamp()
      });

      // Return the updated profile
      return {
        ...userProfile,
        ...profileUpdates
      };
    } catch (error) {
      console.error("Error updating user profile with form answers:", error);
      throw new Error("Failed to update user profile in Firestore");
    }
  }

  return userProfile;
}
export interface ExtendedFormData {
    isStudent: string;
    institutionType: string;
    isUCStudent: string;
    financialAid: string;
    hasJob: string;
    jobTraining: string;
    housingStatus: string;
    needsHousingAssistance: string;
    hasInsurance: string;
    eligibleForHealthcare: string;
    healthcareNeeds: string;
    hasDependents: string;
    dependentsCount: string;
    incomeBracket: string;
    specificInstitution?: string;
    major?: string;
    financialAidTypes?: string[];
    employmentType?: string;
    insuranceType?: string;
    veteran?: string;
    disability?: string;
    dependentsAges?: string;
    zipCode?: string;
    state?: string;
  }
  
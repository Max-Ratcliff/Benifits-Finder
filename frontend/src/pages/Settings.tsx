import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface UserProfile {
  isStudent: string;
  institutionType: string;
  specificInstitution: string;
  isUCStudent: string;
  ucCampus: string;
  major: string;
  financialAid: string;
  financialAidTypes: string[];
  hasJob: string;
  employmentType: string;
  jobTraining: string;
  housingStatus: string;
  needsHousingAssistance: string;
  hasInsurance: string;
  insuranceType: string;
  eligibleForHealthcare: string;
  healthcareNeeds: string;
  hasDependents: string;
  dependentsCount: string;
  dependentsAges: string;
  incomeBracket: string;
  zipCode: string;
  state: string;
  veteran: string;
  disability: string;
}

const ucCampuses = [
  "UC Berkeley",
  "UC Davis",
  "UC Irvine",
  "UC Los Angeles",
  "UC Merced",
  "UC Riverside",
  "UC San Diego",
  "UC San Francisco",
  "UC Santa Barbara",
  "UC Santa Cruz"
];

const calStateUniversities = [
  "Cal Poly Pomona",
  "Cal Poly San Luis Obispo",
  "CSU Bakersfield",
  "CSU Channel Islands",
  "CSU Chico",
  "CSU Dominguez Hills",
  "CSU East Bay",
  "CSU Fresno",
  "CSU Fullerton",
  "Humboldt State",
  "CSU Long Beach",
  "CSU Los Angeles",
  "CSU Maritime Academy",
  "CSU Monterey Bay",
  "CSU Northridge",
  "CSU Sacramento",
  "CSU San Bernardino",
  "San Diego State",
  "San Francisco State",
  "San Jose State",
  "CSU San Marcos",
  "Sonoma State",
  "CSU Stanislaus"
];

const communityColleges = [
  "Santa Monica College",
  "Pasadena City College",
  "De Anza College",
  "Foothill College",
  "Diablo Valley College",
  "Orange Coast College",
  "Irvine Valley College",
  "Santa Barbara City College",
  "San Diego Mesa College",
  "Los Angeles City College",
  "El Camino College",
  "Other Community College"
];

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export function Settings() {
  const [profile, setProfile] = useState<UserProfile>({
    isStudent: "",
    institutionType: "",
    specificInstitution: "",
    isUCStudent: "",
    ucCampus: "",
    major: "",
    financialAid: "",
    financialAidTypes: [],
    hasJob: "",
    employmentType: "",
    jobTraining: "",
    housingStatus: "",
    needsHousingAssistance: "",
    hasInsurance: "",
    insuranceType: "",
    eligibleForHealthcare: "",
    healthcareNeeds: "",
    hasDependents: "",
    dependentsCount: "",
    dependentsAges: "",
    incomeBracket: "",
    zipCode: "",
    state: "California", // Default state
    veteran: "",
    disability: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [institutions, setInstitutions] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          // Merge existing data with defaults (in case new fields were added)
          setProfile((prev) => ({ ...prev, ...userDoc.data() } as UserProfile));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update institutions list when institution type changes
  useEffect(() => {
    if (profile.institutionType === "UC") {
      setInstitutions(ucCampuses);
    } else if (profile.institutionType === "CSU") {
      setInstitutions(calStateUniversities);
    } else if (profile.institutionType === "Community College") {
      setInstitutions(communityColleges);
    } else {
      setInstitutions([]);
    }
  }, [profile.institutionType]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...profile,
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCheckboxChange = (value: string) => {
    setProfile(prev => {
      const currentTypes = [...(prev.financialAidTypes || [])];
      if (currentTypes.includes(value)) {
        return { ...prev, financialAidTypes: currentTypes.filter(type => type !== value) };
      } else {
        return { ...prev, financialAidTypes: [...currentTypes, value] };
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-4 space-y-8"
    >
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Profile Settings
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">
          The more information you provide, the more accurately we can match you with eligible programs.
        </p>
      </div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Basic Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <select
              value={profile.state}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, state: e.target.value }))
              }
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            >
              {usStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={profile.zipCode}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              placeholder="e.g. 90210"
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            />
          </div>
        </div>

        {/* Educational Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Are you currently enrolled as a student?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={profile.isStudent === option}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, isStudent: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {profile.isStudent === "Yes" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What type of institution are you attending?
              </label>
              <select
                value={profile.institutionType}
                onChange={(e) =>
                  setProfile((prev) => ({ 
                    ...prev, 
                    institutionType: e.target.value,
                    specificInstitution: "" // Reset when type changes
                  }))
                }
                className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
              >
                <option value="">Select institution type</option>
                <option value="UC">University of California (UC)</option>
                <option value="CSU">California State University (CSU)</option>
                <option value="Community College">Community College</option>
                <option value="Private University">Private University</option>
                <option value="Technical/Vocational">Technical/Vocational School</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {(profile.institutionType === "UC" || profile.institutionType === "CSU" || 
              profile.institutionType === "Community College") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Which {profile.institutionType === "UC" ? "UC campus" : 
                         profile.institutionType === "CSU" ? "CSU campus" : 
                         "community college"} do you attend?
                </label>
                <select
                  value={profile.specificInstitution}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, specificInstitution: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                >
                  <option value="">Select your institution</option>
                  {institutions.map(institution => (
                    <option key={institution} value={institution}>{institution}</option>
                  ))}
                </select>
              </div>
            )}

            {profile.institutionType === "UC" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Are you an undergraduate or graduate student?
                </label>
                <div className="flex space-x-4">
                  {["Undergraduate", "Graduate"].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value={option}
                        checked={profile.isUCStudent === option}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, isUCStudent: e.target.value }))
                        }
                        className="form-radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {profile.institutionType && profile.institutionType !== "UC" && 
             profile.institutionType !== "CSU" && profile.institutionType !== "Community College" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name of your institution
                </label>
                <input
                  type="text"
                  value={profile.specificInstitution}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, specificInstitution: e.target.value }))
                  }
                  placeholder="Enter your institution's name"
                  className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Major or Field of Study
              </label>
              <input
                type="text"
                value={profile.major}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, major: e.target.value }))
                }
                placeholder="e.g. Computer Science, Biology, Business"
                className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Are you currently receiving financial aid?
              </label>
              <div className="flex space-x-4">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option}
                      checked={profile.financialAid === option}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, financialAid: e.target.value }))
                      }
                      className="form-radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {profile.financialAid === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What types of financial aid do you receive? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pell Grant", "Cal Grant", "University Grant", "Scholarships", "Student Loans", "Work-Study", "Other"].map((aid) => (
                    <label key={aid} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={profile.financialAidTypes?.includes(aid) || false}
                        onChange={() => handleCheckboxChange(aid)}
                        className="form-checkbox"
                      />
                      <span>{aid}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Employment Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Are you currently employed?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={profile.hasJob === option}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, hasJob: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        {profile.hasJob === "Yes" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What type of employment do you have?
            </label>
            <select
              value={profile.employmentType}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, employmentType: e.target.value }))
              }
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            >
              <option value="">Select employment type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Contract">Contract/Temporary</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        )}
        
        {profile.hasJob === "No" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Would you like to receive information about job training programs?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={profile.jobTraining === option}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, jobTraining: e.target.value }))
                    }
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Housing Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How would you describe your housing situation?
          </label>
          <select
            value={profile.housingStatus}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, housingStatus: e.target.value }))
            }
            className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
          >
            <option value="">Select your housing situation</option>
            <option value="Stable">Stable housing</option>
            <option value="AtRisk">At risk of homelessness</option>
            <option value="Temporary">Temporary housing</option>
            <option value="Student Housing">Student Housing</option>
            <option value="With Family">Living with family</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Do you require housing assistance?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={profile.needsHousingAssistance === option}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, needsHousingAssistance: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Healthcare Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Do you have health insurance?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={profile.hasInsurance === option}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, hasInsurance: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        {profile.hasInsurance === "Yes" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What type of health insurance do you have?
            </label>
            <select
              value={profile.insuranceType}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, insuranceType: e.target.value }))
              }
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            >
              <option value="">Select insurance type</option>
              <option value="Employer">Employer-provided</option>
              <option value="Private">Private insurance</option>
              <option value="Medicaid">Medicaid/Medi-Cal</option>
              <option value="Medicare">Medicare</option>
              <option value="University">University health plan</option>
              <option value="Marketplace">Healthcare Marketplace</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}
        
        {profile.hasInsurance === "No" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Are you eligible for government healthcare programs (Medicaid, Medicare, etc.)?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No", "I don't know"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={profile.eligibleForHealthcare === option}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, eligibleForHealthcare: e.target.value }))
                    }
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Do you have any specific healthcare needs?
          </label>
          <input
            type="text"
            value={profile.healthcareNeeds}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, healthcareNeeds: e.target.value }))
            }
            placeholder="e.g. Chronic condition, disability"
            className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
          />
        </div>

        {/* Additional Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Are you a veteran?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={profile.veteran === option}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, veteran: e.target.value }))
                    }
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Do you have a disability?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No", "Prefer not to say"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={profile.disability === option}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, disability: e.target.value }))
                    }
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Household / Income Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Do you have dependents?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={profile.hasDependents === option}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, hasDependents: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        {profile.hasDependents === "Yes" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How many dependents do you have?
              </label>
              <input
                type="number"
                value={profile.dependentsCount}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, dependentsCount: e.target.value }))
                }
                placeholder="e.g. 2"
                className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ages of dependents (optional)
              </label>
              <input
                type="text"
                value={profile.dependentsAges}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, dependentsAges: e.target.value }))
                }
                placeholder="e.g. 3, 7, 12"
                className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
              />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What is your current income bracket?
          </label>
          <select
            value={profile.incomeBracket}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, incomeBracket: e.target.value }))
            }
            className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
          >
            <option value="">Select your income bracket</option>
            <option value="< $25k">{`< $25k`}</option>
            <option value="$25k - $50k">$25k - $50k</option>
            <option value="$50k - $75k">$50k - $75k</option>
            <option value="$75k - $100k">$75k - $100k</option>
            <option value="> $100k">{`> $100k`}</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
            success
              ? "bg-green-500 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? "Saving..." : success ? "Saved Successfully!" : "Save Changes"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
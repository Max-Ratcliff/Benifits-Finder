import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

interface UserProfile {
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
}

export function Settings() {
  const [profile, setProfile] = useState<UserProfile>({
    isStudent: "",
    institutionType: "",
    isUCStudent: "",
    financialAid: "",
    hasJob: "",
    jobTraining: "",
    housingStatus: "",
    needsHousingAssistance: "",
    hasInsurance: "",
    eligibleForHealthcare: "",
    healthcareNeeds: "",
    hasDependents: "",
    dependentsCount: "",
    incomeBracket: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
          Help us provide personalized recommendations by updating your information.
        </p>
      </div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
                  setProfile((prev) => ({ ...prev, institutionType: e.target.value }))
                }
                className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
              >
                <option value="">Select institution type</option>
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Community College">Community College</option>
                <option value="UC">University of California (UC)</option>
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Are you currently receiving financial aid (scholarships, grants, etc.)?
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
        {profile.hasInsurance === "No" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Are you eligible for government healthcare programs (Medicaid, Medicare, etc.)?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
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
            <option value="> $75k">{`> $75k`}</option>
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

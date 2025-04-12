import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, updateDoc, DocumentData, serverTimestamp } from "firebase/firestore";

interface UserAnswers {
  isStudent: string;
  hasJob: string;
  hasDependents: string;
}

export function Settings() {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    isStudent: "",
    hasJob: "",
    hasDependents: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserAnswers(userDoc.data() as UserAnswers);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...userAnswers,
        updatedAt: serverTimestamp(),
      } as DocumentData);
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
      className="max-w-2xl mx-auto space-y-8 p-4"
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
          Update your information to receive personalized recommendations.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Are you currently a student?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={userAnswers.isStudent === option}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        isStudent: e.target.value,
                      }))
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
              Do you currently have a job?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={userAnswers.hasJob === option}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        hasJob: e.target.value,
                      }))
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
              Do you have any dependents?
            </label>
            <div className="flex space-x-4">
              {["Yes", "No"].map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option}
                    checked={userAnswers.hasDependents === option}
                    onChange={(e) =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        hasDependents: e.target.value,
                      }))
                    }
                    className="form-radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
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

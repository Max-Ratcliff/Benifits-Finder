// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useLocation } from 'react-router-dom';
// import { analyzeBenefits } from '../lib/gemini';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';


// interface FormData {
//   isStudent: string;
//   hasJob: string;
//   hasDependents: string;
// }

// export function Benefits() {
//   const location = useLocation();
//   const category = location.state?.category;

//   const [formData, setFormData] = useState<FormData>({
//     isStudent: '',
//     hasJob: '',
//     hasDependents: '',
//   });
//   const [results, setResults] = useState<string>('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const benefitsAnalysis = await analyzeBenefits(formData);
//     setResults(benefitsAnalysis);

//     if (!auth.currentUser) {
//       throw new Error('User not authenticated');
//     }
    
//     await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
//       ...formData,
//       category,
//       timestamp: serverTimestamp(),
//       analysis: benefitsAnalysis,
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     setResults('An error occurred. Please try again later.');
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-3xl mx-auto space-y-8"
//     >
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
//           Let's Find Your Benefits
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400">
//           Answer a few questions to discover programs you may be eligible for
//         </p>
//       </div>

//       <motion.form
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         onSubmit={handleSubmit}
//         className="space-y-6"
//       >
//         {/* Form fields similar to your original form, but with updated styling */}
//         {/* Add your radio button groups here with dark mode support */}

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           type="submit"
//           disabled={loading}
//           className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Analyzing...' : 'Find My Benefits'}
//         </motion.button>
//       </motion.form>

//       {results && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
//         >
//           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//             Your Personalized Benefits Analysis
//           </h3>
//           <div className="prose prose-blue dark:prose-invert max-w-none">
//             {results.split('\n').map((paragraph, index) => (
//               <p key={index} className="mb-4 text-gray-600 dark:text-gray-400">
//                 {paragraph}
//               </p>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// }

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { analyzeBenefits } from '../lib/gemini';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ExtendedFormData } from '@/lib/types';

export function Benefits() {
  const location = useLocation();
  const category = location.state?.category;

  const [formData, setFormData] = useState<ExtendedFormData>({
    isStudent: '',
    institutionType: '',
    isUCStudent: '',
    financialAid: '',
    hasJob: '',
    jobTraining: '',
    housingStatus: '',
    needsHousingAssistance: '',
    hasInsurance: '',
    eligibleForHealthcare: '',
    healthcareNeeds: '',
    hasDependents: '',
    dependentsCount: '',
    incomeBracket: '',
  });
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const benefitsAnalysis = await analyzeBenefits({ ...formData, category });
      setResults(benefitsAnalysis);

      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
        ...formData,
        category,
        timestamp: serverTimestamp(),
        analysis: benefitsAnalysis,
      });
    } catch (error) {
      console.error('Error:', error);
      setResults('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8 p-4"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Let's Find Your Benefits
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Answer the questions below to receive personalized benefit recommendations.
        </p>
      </div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Example fields – add additional fields as necessary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Are you currently enrolled as a student?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={formData.isStudent === option}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isStudent: e.target.value }))
                  }
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What type of institution are you attending?
          </label>
          <select
            value={formData.institutionType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, institutionType: e.target.value }))
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
        {/* Add additional fields here (e.g., isUCStudent, financialAid, jobTraining, etc.) */}
        {/* … */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Find My Benefits'}
        </motion.button>
      </motion.form>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Personalized Benefits Analysis
          </h3>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            {results.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-600 dark:text-gray-400">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

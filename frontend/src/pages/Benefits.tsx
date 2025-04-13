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


// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { useLocation } from 'react-router-dom';
// import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';
// import { analyzeBenefits } from '../lib/gemini';
// import type { ExtendedFormData } from '@/lib/types';

// export function Benefits() {
//   const location = useLocation();
//   const category = location.state?.category;

//   const [profile, setProfile] = useState<ExtendedFormData | null>(null);
//   const [conversationHistory, setConversationHistory] = useState<string>("");
//   const [followUpInput, setFollowUpInput] = useState<string>("");
//   const [results, setResults] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (!auth.currentUser) return;
//     const fetchProfile = async () => {
//       try {
//         const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
//         if (userDoc.exists()) {
//           setProfile(userDoc.data() as ExtendedFormData);
//         }
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       }
//     };
//     fetchProfile();
//   }, []);

//   const handleInitialSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (!profile) {
//         throw new Error("Profile data not loaded");
//       }
//       const analysis = await analyzeBenefits({ ...profile, category }, conversationHistory);
//       setResults(analysis);
//       setConversationHistory(prev => prev + "\nGemini: " + analysis);

//       if (!auth.currentUser) throw new Error("User not authenticated");
//       await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
//         ...profile,
//         category,
//         timestamp: serverTimestamp(),
//         analysis: analysis,
//         conversationHistory: conversationHistory + "\nGemini: " + analysis,
//       });
//     } catch (error) {
//       console.error("Error:", error);
//       setResults("An error occurred. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFollowUpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (!profile) throw new Error("Profile data not loaded");
//       const updatedHistory = conversationHistory + "\nUser: " + followUpInput;
//       const analysis = await analyzeBenefits({ ...profile, category }, updatedHistory);
//       const newHistory = updatedHistory + "\nGemini: " + analysis;
//       setConversationHistory(newHistory);
//       setResults(analysis);
      
//       if (!auth.currentUser) throw new Error("User not authenticated");
//       await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
//         ...profile,
//         category,
//         timestamp: serverTimestamp(),
//         analysis: analysis,
//         conversationHistory: newHistory,
//       });
//       setFollowUpInput("");
//     } catch (error) {
//       console.error("Error:", error);
//       setResults("An error occurred. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!profile) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <p>Loading profile...</p>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-3xl mx-auto space-y-8 p-4"
//     >
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
//           Let's Find Your Benefits
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400">
//           Answer the questions below to receive personalized benefit recommendations.
//         </p>
//       </div>

//       {!results && (
//         <motion.form
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           onSubmit={handleInitialSubmit}
//           className="space-y-6"
//         >
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             disabled={loading}
//             className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? 'Analyzing...' : 'Find My Benefits'}
//           </motion.button>
//         </motion.form>
//       )}

//       {results && (
//         <>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg whitespace-pre-wrap"
//           >
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//               Your Personalized Benefits Analysis
//             </h3>
//             <div className="prose prose-blue dark:prose-invert max-w-none">
//               {results}
//             </div>
//           </motion.div>
//           <motion.form
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             onSubmit={handleFollowUpSubmit}
//             className="space-y-6"
//           >
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Ask a follow-up question for more details:
//               </label>
//               <input
//                 type="text"
//                 value={followUpInput}
//                 onChange={(e) => setFollowUpInput(e.target.value)}
//                 placeholder="For example: Tell me more about housing vouchers..."
//                 className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
//               />
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Analyzing...' : 'Send'}
//             </motion.button>
//           </motion.form>
//         </>
//       )}
//     </motion.div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { analyzeBenefits } from '../lib/gemini';
import type { ExtendedFormData, ProgramData } from '@/lib/types';

export function Benefits() {
  const location = useLocation();
  const category = location.state?.category;

  const [profile, setProfile] = useState<ExtendedFormData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string>("");
  const [followUpInput, setFollowUpInput] = useState<string>("");
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [formProgress, setFormProgress] = useState<{[field: string]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [formComplete, setFormComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as ExtendedFormData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!profile) {
        throw new Error("Profile data not loaded");
      }
      
      // Add specific data about education institution if applicable
      let enhancedProfile = { ...profile };
      if (profile.institutionType === "UC" && profile.isUCStudent) {
        enhancedProfile.specificInstitution = "University of California";
      } else if (profile.institutionType) {
        enhancedProfile.specificInstitution = profile.institutionType;
      }
      
      const analysis = await analyzeBenefits({ ...enhancedProfile, category }, conversationHistory);
      setResults(analysis);
      setConversationHistory(prev => prev + "\nGemini: " + analysis);

      if (!auth.currentUser) throw new Error("User not authenticated");
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
        ...enhancedProfile,
        category,
        timestamp: serverTimestamp(),
        analysis: analysis,
        conversationHistory: conversationHistory + "\nGemini: " + analysis,
      });
    } catch (error) {
      console.error("Error:", error);
      setResults("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If a program is selected, we're in form-filling mode
    if (selectedProgram) {
      handleFormInteraction();
      return;
    }
    
    // Otherwise, we're in regular follow-up mode
    setLoading(true);
    try {
      if (!profile) throw new Error("Profile data not loaded");
      
      // Extract potential program selection from input
      const programSelection = followUpInput.toLowerCase();
      const updatedHistory = conversationHistory + "\nUser: " + followUpInput;
      
      // Check if user is selecting a program to fill out
      if (programSelection.includes("help") && programSelection.includes("fill") || 
          programSelection.includes("select") || programSelection.includes("choose") ||
          programSelection.includes("form") || programSelection.includes("apply")) {
        
        // Start form filling process with Gemini's help
        const programRequest = `Based on our conversation, I'd like to help the user fill out a form for the program they mentioned. Please identify which program they're interested in and provide the initial form questions for: "${followUpInput}". If you can determine the program, format your response like this: PROGRAM_NAME: [name of program], FORM_DATA: [JSON structure with form fields], FIRST_QUESTION: [first question to ask user]`;
        
        const analysis = await analyzeBenefits({ ...profile, category }, updatedHistory + "\n" + programRequest);
        
        // Parse program data if available
        if (analysis.includes("PROGRAM_NAME:")) {
          const programName = analysis.split("PROGRAM_NAME:")[1].split(",")[0].trim();
          setSelectedProgram(programName);
          
          // Extract form data structure if available
          if (analysis.includes("FORM_DATA:")) {
            try {
              const formDataText = analysis.split("FORM_DATA:")[1].split("FIRST_QUESTION:")[0].trim();
              const formData = JSON.parse(formDataText);
              setProgramData(formData);
            } catch (e) {
              console.error("Error parsing form data:", e);
            }
          }
          
          // Extract first question
          if (analysis.includes("FIRST_QUESTION:")) {
            const firstQuestion = analysis.split("FIRST_QUESTION:")[1].trim();
            setCurrentQuestion(firstQuestion);
          }
          
          setConversationHistory(updatedHistory + "\nGemini: Great! I'll help you fill out the application for " + programName + ". Let's start with a few questions.");
          setResults(`I'll help you fill out the application for ${programName}. ${currentQuestion}`);
        } else {
          // Regular response if no program identified
          setConversationHistory(updatedHistory + "\nGemini: " + analysis);
          setResults(analysis);
        }
      } else {
        // Regular follow-up
        const analysis = await analyzeBenefits({ ...profile, category }, updatedHistory);
        const newHistory = updatedHistory + "\nGemini: " + analysis;
        setConversationHistory(newHistory);
        setResults(analysis);
      }
      
      if (!auth.currentUser) throw new Error("User not authenticated");
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
        ...profile,
        category,
        timestamp: serverTimestamp(),
        analysis: results,
        conversationHistory: conversationHistory,
      });
      setFollowUpInput("");
    } catch (error) {
      console.error("Error:", error);
      setResults("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormInteraction = async () => {
    setLoading(true);
    try {
      // Save the current answer
      const updatedFormProgress = {
        ...formProgress,
        [currentQuestion]: followUpInput
      };
      setFormProgress(updatedFormProgress);
      
      // Get the next question from Gemini
      const promptForNextQuestion = `The user is filling out a form for ${selectedProgram}. 
      They've answered the following questions: ${JSON.stringify(updatedFormProgress)}. 
      Their current answer to "${currentQuestion}" is "${followUpInput}".
      
      Based on their profile (${JSON.stringify(profile)}) and previous answers, 
      what's the next question we should ask? If the form is complete, respond with "FORM_COMPLETE".
      
      Format your response as: NEXT_QUESTION: [question] or FORM_COMPLETE`;
      
      const nextQuestionResponse = await analyzeBenefits({ ...profile, category }, promptForNextQuestion);
      
      if (nextQuestionResponse.includes("FORM_COMPLETE")) {
        // Form is complete, show summary
        setFormComplete(true);
        
        const formData = {
          program: selectedProgram,
          answers: updatedFormProgress,
          submittedAt: new Date().toISOString()
        };
        
        // Save form data to user's collection
        if (auth.currentUser) {
          await addDoc(collection(db, 'users', auth.currentUser.uid, 'formSubmissions'), formData);
          
          // Also update the user profile with any new information learned
          const userDoc = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userDoc, {
            recentFormSubmission: formData,
            lastSubmittedProgram: selectedProgram
          });
        }
        
        setResults(`Great! You've completed the application for ${selectedProgram}. 
        
Your answers have been saved. Here's a summary of what you've submitted:

${Object.entries(updatedFormProgress).map(([q, a]) => `${q}: ${a}`).join('\n')}

The application has been recorded. You'll be notified when there are updates on your application status.`);
      } else {
        // Extract next question
        let nextQuestion = "";
        if (nextQuestionResponse.includes("NEXT_QUESTION:")) {
          nextQuestion = nextQuestionResponse.split("NEXT_QUESTION:")[1].trim();
        } else {
          nextQuestion = nextQuestionResponse.trim();
        }
        
        setCurrentQuestion(nextQuestion);
        setResults(nextQuestion);
      }
      
      setFollowUpInput("");
    } catch (error) {
      console.error("Error in form interaction:", error);
      setResults("An error occurred processing your form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-8 p-4"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {selectedProgram ? `Applying for: ${selectedProgram}` : "Let's Find Your Benefits"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedProgram 
            ? "Answer the questions below to complete your application" 
            : "Answer the questions below to receive personalized benefit recommendations."}
        </p>
      </div>

      {!results && !selectedProgram && (
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleInitialSubmit}
          className="space-y-6"
        >
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
      )}

      {results && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedProgram 
                ? `${formComplete ? "Application Complete" : "Application Form"}`
                : "Your Personalized Benefits Analysis"}
            </h3>
            <div className="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap">
              {results}
            </div>
            
            {formComplete && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg"
              >
                <p className="font-medium text-green-800 dark:text-green-100">
                  Your application has been submitted successfully!
                </p>
              </motion.div>
            )}
          </motion.div>
          
          {!formComplete && (
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onSubmit={handleFollowUpSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedProgram 
                    ? "Your answer:" 
                    : "Ask a follow-up question for more details:"}
                </label>
                <input
                  type="text"
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder={selectedProgram 
                    ? "Type your answer here..." 
                    : "For example: Help me fill out the housing voucher application..."}
                  className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : selectedProgram ? 'Continue' : 'Send'}
              </motion.button>
            </motion.form>
          )}
        </>
      )}
    </motion.div>
  );
}
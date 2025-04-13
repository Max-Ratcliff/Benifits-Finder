// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { useLocation } from 'react-router-dom';
// import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';
// import { analyzeBenefits, processFormAnswer, generateFormSummary } from '../lib/gemini';
// import type { ExtendedFormData } from '@/lib/types';

// /**
//  * Benefits – recommend programs & guide the user through filling out an
//  * application.
//  *
//  * ✨ **New flow**
//  * 1. Once the user picks a program (by typing or clicking), we hide the previous
//  *    recommendations and ask: *“Would you like us to pre‑fill the form using
//  *    your saved info?”* (Yes / No).
//  * 2. If **Yes**, form questions may include pre‑filled suggestions. If **No**,
//  *    pre‑fill hints are suppressed, but the rest of the flow is unchanged.
//  *
//  * No existing functionality was removed.
//  */
// export function Benefits() {
//   const location = useLocation();
//   const category = location.state?.category;

//   const [profile, setProfile] = useState<ExtendedFormData | null>(null);
//   const [conversationHistory, setConversationHistory] = useState('');
//   const [followUpInput, setFollowUpInput] = useState('');
//   const [results, setResults] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
//   const [askPrefill, setAskPrefill] = useState(false);
//   const [disablePrefill, setDisablePrefill] = useState(false);
//   const [formProgress, setFormProgress] = useState<Record<string, string>>({});
//   const [currentQuestion, setCurrentQuestion] = useState('');
//   const [currentPrefill, setCurrentPrefill] = useState<string | null>(null);
//   const [formComplete, setFormComplete] = useState(false);

//   /* ----------------------------- Side‑effects ----------------------------- */
//   useEffect(() => {
//     if (!auth.currentUser) return;
//     (async () => {
//       try {
//         const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
//         if (userDoc.exists()) setProfile(userDoc.data() as ExtendedFormData);
//       } catch (err) {
//         console.error('Error fetching profile:', err);
//       }
//     })();
//   }, []);

//   /* ----------------------------- Utilities ----------------------------- */
//   const selectProgram = (program: string) => {
//     setSelectedProgram(program);
//     setAskPrefill(true);
//     setResults(`Would you like us to pre‑fill the ${program} application with the information we already have?`);
//   };

//   /* ---------------------------- Submissions ---------------------------- */
//   const handleInitialSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (!profile) throw new Error('Profile not loaded');
//       const analysis = await analyzeBenefits({ ...profile, category }, conversationHistory);
//       setResults(analysis);
//       setConversationHistory(prev => prev + '\nGemini: ' + analysis);
//       if (auth.currentUser) {
//         await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
//           ...profile,
//           category,
//           timestamp: serverTimestamp(),
//           analysis,
//           conversationHistory: conversationHistory + '\nGemini: ' + analysis,
//         });
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       setResults('An error occurred. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFollowUpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!profile) return;

//     // ---------------- FORM MODE ----------------
//     if (selectedProgram && !askPrefill) {
//       await submitAnswer(followUpInput);
//       setFollowUpInput('');
//       return;
//     }

//     // -------------- PROGRAM SELECTION --------------
//     const userMsg = followUpInput.trim();
//     if (!selectedProgram) {
//       // Detect intent to apply (simple heuristic)
//       const match = userMsg.match(/apply for (.+)/i);
//       if (match) {
//         selectProgram(match[1].trim());
//         setFollowUpInput('');
//         return;
//       }
//     }

//     // -------------- Normal follow‑up --------------
//     setLoading(true);
//     try {
//       const updatedHistory = conversationHistory + '\nUser: ' + userMsg;
//       const analysis = await analyzeBenefits({ ...profile, category }, updatedHistory);
//       setConversationHistory(updatedHistory + '\nGemini: ' + analysis);
//       setResults(analysis);
//       setFollowUpInput('');
//     } catch (err) {
//       console.error('Error:', err);
//       setResults('An error occurred. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* --------------------------- Prefill choice --------------------------- */
//   const handlePrefillChoice = async (usePrefill: boolean) => {
//     setAskPrefill(false);
//     setDisablePrefill(!usePrefill);
//     await startForm(selectedProgram!);
//   };

//   /* --------------------------- Form utilities --------------------------- */
//   const startForm = async (programName: string) => {
//     setLoading(true);
//     try {
//       const res = await processFormAnswer(programName, '', '', {}, profile!);
//       setCurrentQuestion(res.nextQuestion);
//       setCurrentPrefill(res.prefill || null);
//       setResults(res.nextQuestion);
//     } catch (err) {
//       console.error('Error starting form:', err);
//       setResults('Error starting the application. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitAnswer = async (answer: string) => {
//     setLoading(true);
//     try {
//       const nextProgress = { ...formProgress, [currentQuestion]: answer };
//       setFormProgress(nextProgress);
//       const res = await processFormAnswer(selectedProgram!, currentQuestion, answer, nextProgress, profile!);

//       if (!res.valid) {
//         setResults(`Please check your answer: ${res.feedback}`);
//       } else if (res.complete) {
//         setFormComplete(true);
//         const summary = await generateFormSummary(selectedProgram!, nextProgress, profile!);
//         setResults(summary);
//         if (auth.currentUser) {
//           await addDoc(collection(db, 'users', auth.currentUser.uid, 'formSubmissions'), {
//             program: selectedProgram,
//             answers: nextProgress,
//             submittedAt: serverTimestamp(),
//           });
//         }
//       } else {
//         setCurrentQuestion(res.nextQuestion);
//         setCurrentPrefill(res.prefill || null);
//         setResults(res.nextQuestion);
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       setResults('An error occurred. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------------------ Render ------------------------------ */
//   if (!profile) return <div>Loading profile...</div>;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8 p-4">
//       {/* Header */}
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
//           {selectedProgram ? `Applying for: ${selectedProgram}` : "Let's Find Your Benefits"}
//         </h2>
//         <p className="text-gray-600 dark:text-gray-400">
//           {selectedProgram ? 'Answer the questions to complete your application' : 'Find personalized benefit recommendations.'}
//         </p>
//       </div>

//       {/* Initial CTA */}
//       {!results && !selectedProgram && (
//         <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={handleInitialSubmit} className="space-y-6">
//           <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50">
//             {loading ? 'Analyzing...' : 'Find My Benefits'}
//           </motion.button>
//         </motion.form>
//       )}

//       {/* Prefill prompt */}
//       {askPrefill && (
//         <div className="space-y-4 p-6 rounded-lg bg-gray-900 border border-gray-700">
//           <p className="text-white text-lg">{results}</p>
//           <div className="flex gap-2">
//             <button onClick={() => handlePrefillChoice(true)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded">Yes, pre‑fill for me</button>
//             <button onClick={() => handlePrefillChoice(false)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded">No, I’ll fill it myself</button>
//           </div>
//         </div>
//       )}

//       {/* Analysis text or form */}
//       {!askPrefill && results && (
//         <>
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//               {selectedProgram ? (formComplete ? 'Application Complete' : 'Application Form') : 'Your Benefits Analysis'}
//             </h3>
//             <div className="prose prose-blue dark:text-white mb-2 max-w-none whitespace-pre-wrap">{results}</div>
//           </motion.div>

//           {/* Form / follow‑up input */}
//           {!formComplete && !askPrefill && (
//             <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={handleFollowUpSubmit} className="space-y-6">
//               {selectedProgram ? (
//                 <div>
//                   {currentPrefill && !disablePrefill ? (
//                     <div className="space-y-3 bg-gray-900 border border-gray-700 p-4 rounded-lg">
//                       <p className="text-white mb-1">{currentQuestion}</p>
//                       <input readOnly value={currentPrefill} className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 pointer-events-none" />
//                       <div className="flex gap-2 pt-2">
//                         <button type="button" onClick={() => submitAnswer(currentPrefill)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded">Yes</button>
//                         <button type="button" onClick={() => setCurrentPrefill(null)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded">No, let me enter a different value</button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-300 mb-1">{currentQuestion}</label>
//                       <input type="text" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} placeholder="Type your answer here..." className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white" />
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-300 mb-1">Ask a follow‑up question or enter a program name:</label>
//                   <input type="text" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} placeholder="E.g., Apply for Cal Grant" className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white" />
//                 </div>
//               )}

//               {/* Submit button appears only when needed */}
//               {(!currentPrefill || disablePrefill || !selectedProgram) && (
//                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50">
//                   {loading ? 'Processing...' : selectedProgram ? 'Submit Answer' : 'Send'}
//                 </motion.button>
//               )}
//             </motion.form>
//           )}
//         </>
//       )}
//     </motion.div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { auth, db } from '../lib/firebase';
import { analyzeBenefits, processFormAnswer, generateFormSummary } from '../lib/gemini';
import type { ExtendedFormData } from '../lib/types';


export function Benefits() {
  const location = useLocation();
  const category = location.state?.category;

  const [profile, setProfile] = useState<ExtendedFormData | null>(null);
  const [conversationHistory, setConversationHistory] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [askPrefill, setAskPrefill] = useState(false);
  const [disablePrefill, setDisablePrefill] = useState(false);
  const [formProgress, setFormProgress] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentPrefill, setCurrentPrefill] = useState<string | null>(null);
  const [formComplete, setFormComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  /* ----------------------------- Side‑effects ----------------------------- */
  useEffect(() => {
    if (!auth.currentUser) return;
    (async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) setProfile(userDoc.data() as ExtendedFormData);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    })();
  }, []);

  /* ----------------------------- Utilities ----------------------------- */
  const selectProgram = (program: string) => {
    setSelectedProgram(program);
    setAskPrefill(true);
    setResults(`Would you like us to pre-fill the ${program} application with the information we already have?`);
  };

  /* ---------------------------- PDF builder ---------------------------- */
  const buildPdf = async (program: string, answers: Record<string, string>, user: ExtendedFormData) => {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawLine = (text: string, y: number, size = 12) => {
      page.drawText(text, { x: 50, y, size, font, color: rgb(0, 0, 0) });
    };

    let cursor = height - 50;
    drawLine(`${program} Application`, cursor, 18);
    cursor -= 30;

    drawLine('Prefilled from your profile:', cursor, 14);
    cursor -= 20;
    Object.entries(user).forEach(([k, v]) => {
      drawLine(`${k}: ${String(v)}`, cursor);
      cursor -= 15;
      if (cursor < 60) {
        page = pdfDoc.addPage();
        cursor = height - 50;
      }
    });

    cursor -= 10;
    drawLine('Your answers:', cursor, 14);
    cursor -= 20;
    Object.entries(answers).forEach(([q, a]) => {
      drawLine(`${q}: ${a}`, cursor);
      cursor -= 15;
      if (cursor < 60) {
        page = pdfDoc.addPage();
        cursor = height - 50;
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  /* ---------------------------- Submissions ---------------------------- */
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!profile) throw new Error('Profile not loaded');
      const analysis = await analyzeBenefits({ ...profile, category }, conversationHistory);
      setResults(analysis);
      setConversationHistory(prev => prev + '\nGemini: ' + analysis);
      if (auth.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'submissions'), {
          ...profile,
          category,
          timestamp: serverTimestamp(),
          analysis,
          conversationHistory: conversationHistory + '\nGemini: ' + analysis,
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setResults('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // ---------------- FORM MODE ----------------
    if (selectedProgram && !askPrefill) {
      await submitAnswer(followUpInput);
      setFollowUpInput('');
      return;
    }

    // -------------- PROGRAM SELECTION --------------
    const userMsg = followUpInput.trim();
    if (!selectedProgram) {
      const match = userMsg.match(/apply for (.+)/i);
      if (match) {
        selectProgram(match[1].trim());
        setFollowUpInput('');
        return;
      }
    }

    // -------------- Normal follow‑up --------------
    setLoading(true);
    try {
      const updatedHistory = conversationHistory + '\nUser: ' + userMsg;
      const analysis = await analyzeBenefits({ ...profile, category }, updatedHistory);
      setConversationHistory(updatedHistory + '\nGemini: ' + analysis);
      setResults(analysis);
      setFollowUpInput('');
    } catch (err) {
      console.error('Error:', err);
      setResults('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- Prefill choice --------------------------- */
  const handlePrefillChoice = async (usePrefill: boolean) => {
    setAskPrefill(false);
    setDisablePrefill(!usePrefill);
    await startForm(selectedProgram!);
  };

  /* --------------------------- Form utilities --------------------------- */
  const startForm = async (programName: string) => {
    setLoading(true);
    try {
      const res = await processFormAnswer(programName, '', '', {}, profile!);
      setCurrentQuestion(res.nextQuestion);
      setCurrentPrefill(res.prefill || null);
      setResults(res.nextQuestion);
    } catch (err) {
      console.error('Error starting form:', err);
      setResults('Error starting the application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    setLoading(true);
    try {
      const nextProgress = { ...formProgress, [currentQuestion]: answer };
      setFormProgress(nextProgress);
      const res = await processFormAnswer(selectedProgram!, currentQuestion, answer, nextProgress, profile!);

      if (!res.valid) {
        setResults(`Please check your answer: ${res.feedback}`);
      } else if (res.complete) {
        setFormComplete(true);
        const summary = await generateFormSummary(selectedProgram!, nextProgress, profile!);
        setResults(summary);
        await buildPdf(selectedProgram!, nextProgress, profile!);
        if (auth.currentUser) {
          await addDoc(collection(db, 'users', auth.currentUser.uid, 'formSubmissions'), {
            program: selectedProgram,
            answers: nextProgress,
            submittedAt: serverTimestamp(),
          });
        }
      } else {
        setCurrentQuestion(res.nextQuestion);
        setCurrentPrefill(res.prefill || null);
        setResults(res.nextQuestion);
      }
    } catch (err) {
      console.error('Error:', err);
      setResults('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ Render ------------------------------ */
  if (!profile) return <div>Loading profile...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {selectedProgram ? `Applying for: ${selectedProgram}` : "Let's Find Your Benefits"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedProgram ? 'Answer the questions to complete your application' : 'Find personalized benefit recommendations.'}
        </p>
      </div>

      {/* Download link when done */}
      {downloadUrl && (
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
          <a href={downloadUrl} download={`${selectedProgram}-application.pdf`} className="text-green-800 dark:text-green-200 font-semibold underline">
            Download Your Completed Application (PDF)
          </a>
        </div>
      )}

      {/* Initial CTA */}
      {!results && !selectedProgram && (
        <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={handleInitialSubmit} className="space-y-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Find My Benefits'}
          </motion.button>
        </motion.form>
      )}

      {/* Prefill prompt */}
      {askPrefill && (
        <div className="space-y-4 p-6 rounded-lg bg-gray-900 border border-gray-700">
          <p className="text-white text-lg">{results}</p>
          <div className="flex gap-2">
            <button onClick={() => handlePrefillChoice(true)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded">Yes, pre‑fill for me</button>
            <button onClick={() => handlePrefillChoice(false)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded">No, I’ll fill it myself</button>
          </div>
        </div>
      )}

      {/* Analysis text or form */}
      {!askPrefill && results && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedProgram ? (formComplete ? 'Application Complete' : 'Application Form') : 'Your Benefits Analysis'}
            </h3>
            <div className="prose prose-blue dark:text-white mb-2 max-w-none whitespace-pre-wrap">
              {results}
            </div>
          </motion.div>

          {/* Form / follow‑up input */}
          {!formComplete && !askPrefill && (
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onSubmit={handleFollowUpSubmit}
              className="space-y-6"
            >
              {selectedProgram ? (
                <div>
                  {currentPrefill && !disablePrefill ? (
                    <div className="space-y-3 bg-gray-900 border border-gray-700 p-4 rounded-lg">
                      <p className="text-white mb-1">{currentQuestion}</p>
                      <input
                        readOnly
                        value={currentPrefill}
                        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 pointer-events-none"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => submitAnswer(currentPrefill)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPrefill(null)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded"
                        >
                          No, let me enter a different value
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">{currentQuestion}</label>
                      <input
                        type="text"
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ask a follow‑up question or enter a program name:
                  </label>
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="E.g., Apply for Cal Grant"
                    className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
                  />
                </div>
              )}

              {/* Submit button appears only when needed */}
              {(!currentPrefill || disablePrefill || !selectedProgram) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : selectedProgram ? 'Submit Answer' : 'Send'}
                </motion.button>
              )}
            </motion.form>
          )}
        </>
      )}
    </motion.div>
  );
}

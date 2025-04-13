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
  const [feedback, setFeedback] = useState<string>('');


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

  const selectProgram = (program: string) => {
    setSelectedProgram(program);
    setAskPrefill(true);
    setResults(`Would you like us to pre-fill the ${program} application with the information we already have?`);
  };

  // const buildPdf = async (program: string, answers: Record<string, string>, user: ExtendedFormData) => {
  //   const pdfDoc = await PDFDocument.create();
  
  //   // Constants for layout
  //   const PAGE_WIDTH = 612; // Standard letter width in points
  //   const PAGE_HEIGHT = 792; // Standard letter height in points
  //   const MARGIN = 50;
  //   const VALUE_X = 250; // X-position for values
  //   const TITLE_SIZE = 18;
  //   const SECTION_HEADER_SIZE = 14;
  //   const TEXT_SIZE = 12;
  //   const LINE_HEIGHT = 15;
  
  //   let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  //   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  //   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  //   let cursor = PAGE_HEIGHT - MARGIN;
  
  //   // Helper function to draw the title
  //   const drawTitle = (text: string) => {
  //     const textWidth = boldFont.widthOfTextAtSize(text, TITLE_SIZE);
  //     const x = (PAGE_WIDTH - textWidth) / 2; // Center the title
  //     page.drawText(text, {
  //       x,
  //       y: cursor,
  //       size: TITLE_SIZE,
  //       font: boldFont,
  //       color: rgb(0, 0, 0),
  //     });
  //     cursor -= TITLE_SIZE + 20; // Extra spacing after title
  //   };
  
  //   // Helper function to draw section headers
  //   const drawSectionHeader = (text: string) => {
  //     cursor -= 10; // Space before header
  //     if (cursor - SECTION_HEADER_SIZE < MARGIN) {
  //       page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  //       cursor = PAGE_HEIGHT - MARGIN;
  //     }
  //     page.drawText(text, {
  //       x: 50,
  //       y: cursor,
  //       size: SECTION_HEADER_SIZE,
  //       font: boldFont,
  //       color: rgb(0, 0, 0),
  //     });
  //     cursor -= SECTION_HEADER_SIZE + 10; // Space after header
  //   };
  
  //   // Helper function to draw label-value pairs
  //   const drawEntry = (label: string, value: string) => {
  //     if (cursor - TEXT_SIZE < MARGIN) {
  //       page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  //       cursor = PAGE_HEIGHT - MARGIN;
  //     }
  //     // Draw label
  //     page.drawText(label + ':', {
  //       x: 50,
  //       y: cursor,
  //       size: TEXT_SIZE,
  //       font,
  //       color: rgb(0, 0, 0),
  //     });
  //     // Draw value
  //     page.drawText(value, {
  //       x: VALUE_X,
  //       y: cursor,
  //       size: TEXT_SIZE,
  //       font,
  //       color: rgb(0, 0, 0),
  //     });
  //     // Draw underline under value
  //     page.drawLine({
  //       start: { x: VALUE_X, y: cursor - 2 },
  //       end: { x: PAGE_WIDTH - MARGIN, y: cursor - 2 },
  //       thickness: 1,
  //       color: rgb(0.5, 0.5, 0.5), // Gray underline
  //     });
  //     cursor -= LINE_HEIGHT;
  //   };
  
  //   // Helper function to draw horizontal lines
  //   const drawHorizontalLine = () => {
  //     if (cursor - 10 < MARGIN) {
  //       page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  //       cursor = PAGE_HEIGHT - MARGIN;
  //     }
  //     page.drawLine({
  //       start: { x: 50, y: cursor },
  //       end: { x: PAGE_WIDTH - 50, y: cursor },
  //       thickness: 1,
  //       color: rgb(0, 0, 0),
  //     });
  //     cursor -= 10;
  //   };
  
  //   // Build the PDF content
  //   drawTitle(`Application for ${program}`);
  //   drawSectionHeader('Prefilled from your profile');
  //   Object.entries(user).forEach(([key, value]) => {
  //     drawEntry(key, String(value));
  //   });
  //   drawHorizontalLine();
  //   drawSectionHeader('Your answers');
  //   Object.entries(answers).forEach(([question, answer]) => {
  //     drawEntry(question, answer);
  //   });
  
  //   // Save and generate download URL
  //   const pdfBytes = await pdfDoc.save();
  //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  //   const url = URL.createObjectURL(blob);
  //   setDownloadUrl(url);
  // };
  const buildPdf = async (program: string, answers: Record<string, string>, user: ExtendedFormData) => {
    const pdfDoc = await PDFDocument.create();
  
    // Layout constants - adjusted for government form style
    const PAGE_WIDTH = 612;  // Standard letter width in points (8.5 inches)
    const PAGE_HEIGHT = 792; // Standard letter height in points (11 inches)
    const MARGIN = 40;       // Smaller margins like government forms
    const LABEL_X = 30;      // X-position for labels, closer to left margin
    const VALUE_X = 250;     // X-position for values
    const TITLE_SIZE = 14;   // Smaller title size like government forms
    const HEADER_SIZE = 12;  // Font size for headers
    const TEXT_SIZE = 10;    // Smaller text size like government forms
    const LINE_HEIGHT = 20;  // Increased line height for form sections
    const CHECKBOX_SIZE = 12; // Size of checkboxes
  
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let cursor = PAGE_HEIGHT - MARGIN;
  
    // Helper function to draw page header
    const drawPageHeader = () => {
      // Draw state agency header
      page.drawText("STATE OF CALIFORNIA - HEALTH AND HUMAN SERVICES AGENCY", {
        x: MARGIN,
        y: PAGE_HEIGHT - 25,
        size: 8,
        font: boldFont,
      });
      
      page.drawText("CALIFORNIA DEPARTMENT OF SOCIAL SERVICES", {
        x: PAGE_WIDTH - MARGIN - 270,
        y: PAGE_HEIGHT - 25,
        size: 8,
        font: boldFont,
      });
      
      // Draw horizontal line under header
      page.drawLine({
        start: { x: MARGIN, y: PAGE_HEIGHT - 35 },
        end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 35 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      
      cursor = PAGE_HEIGHT - 55;
    };
  
    // Helper function to draw title
    const drawTitle = (text: string) => {
      page.drawText(text.toUpperCase(), {
        x: MARGIN,
        y: cursor,
        size: TITLE_SIZE,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      cursor -= TITLE_SIZE + 10;
    };
  
    // Helper function to draw instructions
    const drawInstructions = (text: string) => {
      const lines = splitTextIntoLines(text, font, TEXT_SIZE, PAGE_WIDTH - MARGIN * 2);
      lines.forEach(line => {
        page.drawText(line, {
          x: MARGIN,
          y: cursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        cursor -= TEXT_SIZE + 5;
      });
      cursor -= 5; // Extra space after instructions
    };
  
    // Helper function to draw section headers
    const drawSectionHeader = (text: string) => {
      if (cursor - HEADER_SIZE < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawPageHeader();
      }
      page.drawText(text, {
        x: MARGIN,
        y: cursor,
        size: HEADER_SIZE,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      cursor -= HEADER_SIZE + 10;
    };
  
    // Helper function to draw label-value pairs
    const drawFormField = (label: string, value: string, withCheckbox = false) => {
      if (cursor - TEXT_SIZE - 5 < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawPageHeader();
      }
      
      // Draw label
      page.drawText(`${label}:`, {
        x: LABEL_X,
        y: cursor,
        size: TEXT_SIZE,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      if (withCheckbox) {
        // Draw checkbox
        page.drawRectangle({
          x: VALUE_X - 30,
          y: cursor - 2,
          width: CHECKBOX_SIZE,
          height: CHECKBOX_SIZE,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        
        // Draw Yes text
        page.drawText("YES", {
          x: VALUE_X - 15,
          y: cursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // Draw second checkbox
        page.drawRectangle({
          x: VALUE_X + 30,
          y: cursor - 2,
          width: CHECKBOX_SIZE,
          height: CHECKBOX_SIZE,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        
        // Draw No text
        page.drawText("NO", {
          x: VALUE_X + 45,
          y: cursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        // If value is Yes or No, fill the appropriate checkbox
        if (value.toLowerCase() === "yes") {
          page.drawText("X", {
            x: VALUE_X - 24,
            y: cursor - 1,
            size: TEXT_SIZE,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
        } else if (value.toLowerCase() === "no") {
          page.drawText("X", {
            x: VALUE_X + 36,
            y: cursor - 1,
            size: TEXT_SIZE,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
        }
      } else {
        // Draw underline for value field
        page.drawLine({
          start: { x: VALUE_X, y: cursor - 2 },
          end: { x: PAGE_WIDTH - MARGIN, y: cursor - 2 },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
        
        // Draw value
        const formattedValue = formatValue(label, value);
        page.drawText(formattedValue, {
          x: VALUE_X,
          y: cursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      
      cursor -= LINE_HEIGHT;
    };
  
    // Helper function to draw horizontal dividers
    const drawDivider = () => {
      if (cursor - 10 < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        drawPageHeader();
      }
      page.drawLine({
        start: { x: MARGIN, y: cursor },
        end: { x: PAGE_WIDTH - MARGIN, y: cursor },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      cursor -= 20;
    };
  
    // Helper function to format values
    const formatValue = (label: string, value: string) => {
      if (label === 'createdAt' || label === 'updatedAt') {
        const timestamp = JSON.parse(value.replace('Timestamp(', '{').replace(')', '}'));
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
        return date.toLocaleDateString('en-US');
      }
      if (label.toLowerCase().includes('phone')) {
        const num = value.replace(/\D/g, '');
        if (num.length >= 10) {
          return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6, 10)}`;
        }
      }
      if (label.toLowerCase().includes('expense') || label.toLowerCase().includes('income')) {
        // Format as currency
        if (!isNaN(parseFloat(value))) {
          return `$${parseFloat(value).toFixed(2)}`;
        }
        return value.replace(/\\\$/g, '$');
      }
      return value;
    };
  
    // Helper function to split text into lines
    const splitTextIntoLines = (text: string, font: any, fontSize: number, maxWidth: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = words[0];
  
      for (let i = 1; i < words.length; i++) {
        const width = font.widthOfTextAtSize(`${currentLine} ${words[i]}`, fontSize);
        if (width <= maxWidth - (MARGIN * 2)) {
          currentLine += ` ${words[i]}`;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      
      lines.push(currentLine);
      return lines;
    };
  
    // Draw page header
    drawPageHeader();
  
    // Build PDF content
    drawTitle(`${program} Application Form`);
    
    // Instructions text
    const instructions = `This form can be used for ${program} application. Please fill out the following personal information. Fill out as much of this form as you can, sign on the last page, and submit it to complete your application. If you are without money for food, you may be able to get emergency benefits in three (3) days.`;
    drawInstructions(instructions);
    
    // Draw notice about answering all questions
    page.drawText("You need to try to answer all questions on this application form.", {
      x: MARGIN,
      y: cursor,
      size: TEXT_SIZE,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    cursor -= TEXT_SIZE + 15;
    
    // Draw personal information section
    drawSectionHeader("PERSONAL INFORMATION");
    
    // Draw form fields for the user profile data
    Object.entries(user).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        // Format labels nicely
        const label = key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        
        // Determine if this field should have checkboxes (yes/no questions)
        const isYesNoField = 
          typeof value === 'string' && 
          (value.toLowerCase() === 'yes' || value.toLowerCase() === 'no') && 
          (key.startsWith('is') || key.startsWith('has') || 
           key.includes('eligible') || key.includes('needs'));
        
        drawFormField(label, String(value), isYesNoField);
      }
    });
    
    drawDivider();
    
    // Draw application specific section
    drawSectionHeader(`${program.toUpperCase()} INFORMATION`);
    
    // Draw form fields for answers
    Object.entries(answers).forEach(([question, answer]) => {
      const isYesNoAnswer = answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'no';
      drawFormField(question, answer, isYesNoAnswer);
    });
    
    drawDivider();
    
    // Draw certification section
    drawSectionHeader("CERTIFICATION");
    
    const certificationText = "I certify under penalty of perjury under the laws of the State of California that the information I have provided in this application is true and correct to the best of my knowledge.";
    drawInstructions(certificationText);
    
    cursor -= 10;
    
    // Signature line
    page.drawText("SIGNATURE:", {
      x: LABEL_X,
      y: cursor,
      size: TEXT_SIZE,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawLine({
      start: { x: VALUE_X, y: cursor - 2 },
      end: { x: PAGE_WIDTH - MARGIN, y: cursor - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    cursor -= LINE_HEIGHT;
    
    // Date line
    page.drawText("DATE:", {
      x: LABEL_X,
      y: cursor,
      size: TEXT_SIZE,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawLine({
      start: { x: VALUE_X, y: cursor - 2 },
      end: { x: PAGE_WIDTH - MARGIN, y: cursor - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Add page numbers at the bottom
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const page = pdfDoc.getPage(i);
      page.drawText(`PAGE ${i + 1} OF ${totalPages}`, {
        x: PAGE_WIDTH - MARGIN - 100,
        y: MARGIN - 15,
        size: 8,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  
    // Save and generate download URL
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

    if (selectedProgram && !askPrefill) {
      await submitAnswer(followUpInput);
      setFollowUpInput('');
      return;
    }

    const userMsg = followUpInput.trim();
    if (!selectedProgram) {
      const match = userMsg.match(/apply for (.+)/i);
      if (match) {
        selectProgram(match[1].trim());
        setFollowUpInput('');
        return;
      }
    }

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

  const handlePrefillChoice = async (usePrefill: boolean) => {
    setAskPrefill(false);
    setDisablePrefill(!usePrefill);
    await startForm(selectedProgram!);
  };

  const startForm = async (programName: string) => {
    setLoading(true);
    try {
      const res = await processFormAnswer(programName, '', '', {}, profile!);
      setCurrentQuestion(res.nextQuestion);
      setCurrentPrefill(res.prefill || null);
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
        setFeedback(`Please check your answer: ${res.feedback}`);
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
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

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

      {/* Download Button */}
      {downloadUrl && (
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
          <a
            href={downloadUrl}
            download={`${selectedProgram}-application.pdf`}
            className="text-green-800 dark:text-green-200 font-semibold underline"
          >
            Download Your Completed Application (PDF)
          </a>
        </div>
      )}

      {!results && !selectedProgram && (
        <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={handleInitialSubmit} className="space-y-6">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Find My Benefits'}
          </motion.button>
        </motion.form>
      )}

      {askPrefill && (
        <div className="space-y-4 p-6 rounded-lg bg-gray-900 border border-gray-700">
          <p className="text-white text-lg">{results}</p>
          <div className="flex gap-2">
            <button onClick={() => handlePrefillChoice(true)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded">Yes, pre‑fill for me</button>
            <button onClick={() => handlePrefillChoice(false)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded">No, I’ll fill it myself</button>
          </div>
        </div>
      )}

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
              {/* {results} */}
              <div className="prose prose-blue dark:text-white mb-2 max-w-none whitespace-pre-wrap">
                {results}
              </div>
              {feedback && (
                <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-yellow-800 dark:text-yellow-200">
                  {feedback}
                </div>
              )}
            </div>
          </motion.div>

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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { auth, db } from '../lib/firebase';
import { analyzeBenefits, processFormAnswer, generateFormSummary } from '../lib/gemini';
import { updateUserProfileWithFormAnswers } from '../lib/profileUtils';
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
  const [isSkipping, setIsSkipping] = useState(false);


  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as ExtendedFormData);
        } else {
          console.warn('No user profile found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const selectProgram = (program: string) => {
    setSelectedProgram(program);
    setAskPrefill(true);
    setResults(`Would you like us to pre-fill the ${program} application with the information we already have?`);
  };

  const buildPdf = async (program: string, answers: Record<string, string>, user: ExtendedFormData) => {
    const pdfDoc = await PDFDocument.create();
  
    // Layout constants - adjusted for government form style
    const PAGE_WIDTH = 612;  // Standard letter width in points (8.5 inches)
    const PAGE_HEIGHT = 792; // Standard letter height in points (11 inches)
    const MARGIN = 40;       // Margins
    const LABEL_X = 30;      // X-position for labels, closer to left margin
    const VALUE_X = 250;     // X-position for values
    const TITLE_SIZE = 14;   // Title size
    const HEADER_SIZE = 12;  // Font size for headers
    const TEXT_SIZE = 10;    // Text size
    const LINE_HEIGHT = 20;  // Line height for form sections
    const CHECKBOX_SIZE = 12; // Size of checkboxes
    const CHECKBOX_SPACING = 20; // Space between checkboxes
  
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let cursor = PAGE_HEIGHT - MARGIN;
    let currentPage = 1;
    let totalPages = 1; // Will be updated later
  
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
  
    // Helper function to add a new page when needed
    const addNewPageIfNeeded = (spaceNeeded: number) => {
      if (cursor - spaceNeeded < MARGIN) {
        page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        currentPage++;
        totalPages = Math.max(totalPages, currentPage);
        drawPageHeader();
        return true;
      }
      return false;
    };
  
    // Helper function to draw title
    const drawTitle = (text: string) => {
      addNewPageIfNeeded(TITLE_SIZE + 15);
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
      const maxWidth = PAGE_WIDTH - (2 * MARGIN);
      const lines = splitTextIntoLines(text, font, TEXT_SIZE, maxWidth);
      
      // Check if we need a new page
      const totalHeight = lines.length * (TEXT_SIZE + 5) + 5;
      addNewPageIfNeeded(totalHeight);
      
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
      addNewPageIfNeeded(HEADER_SIZE + 15);
      page.drawText(text, {
        x: MARGIN,
        y: cursor,
        size: HEADER_SIZE,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      cursor -= HEADER_SIZE + 10;
    };
  
    // Helper function to draw a form field with checkbox
    const drawFormFieldWithCheckbox = (label: string, value: string) => {
      addNewPageIfNeeded(TEXT_SIZE + LINE_HEIGHT);
      
      // Split label into multiple lines if needed
      const maxLabelWidth = VALUE_X - LABEL_X - 10; // Leave some space between label and checkboxes
      const labelLines = splitTextIntoLines(label, font, TEXT_SIZE, maxLabelWidth);
      
      // Draw label lines
      let labelCursor = cursor;
      labelLines.forEach(line => {
        page.drawText(`${line}:`, {
          x: LABEL_X,
          y: labelCursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        labelCursor -= TEXT_SIZE + 5;
      });
      
      // Calculate positions for checkboxes to prevent overlap
      const yesCheckboxX = VALUE_X;
      const yesTextX = yesCheckboxX + CHECKBOX_SIZE + 5;
      const noCheckboxX = yesTextX + 30;
      const noTextX = noCheckboxX + CHECKBOX_SIZE + 5;
      
      // Draw YES checkbox
      page.drawRectangle({
        x: yesCheckboxX,
        y: cursor - 2,
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      
      // Draw YES text
      page.drawText("YES", {
        x: yesTextX,
        y: cursor,
        size: TEXT_SIZE,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Draw NO checkbox
      page.drawRectangle({
        x: noCheckboxX,
        y: cursor - 2,
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      
      // Draw NO text
      page.drawText("NO", {
        x: noTextX,
        y: cursor,
        size: TEXT_SIZE,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Mark the appropriate checkbox with X
      if (value.toLowerCase() === "yes") {
        page.drawText("X", {
          x: yesCheckboxX + CHECKBOX_SIZE/2 - 3,
          y: cursor,
          size: TEXT_SIZE,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      } else if (value.toLowerCase() === "no") {
        page.drawText("X", {
          x: noCheckboxX + CHECKBOX_SIZE/2 - 3,
          y: cursor,
          size: TEXT_SIZE,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      }
      
      // Update cursor position based on the number of label lines
      cursor -= Math.max(LINE_HEIGHT, labelLines.length * (TEXT_SIZE + 5));
    };
  
    // Helper function to draw regular form field with text input
    const drawFormFieldWithText = (label: string, value: string) => {
      // Split label into multiple lines if needed
      const maxLabelWidth = VALUE_X - LABEL_X - 10; // Leave some space between label and value
      const labelLines = splitTextIntoLines(label, font, TEXT_SIZE, maxLabelWidth);
      
      // Split value into multiple lines if needed
      const maxValueWidth = PAGE_WIDTH - MARGIN - VALUE_X - 10;
      const valueLines = splitTextIntoLines(value, font, TEXT_SIZE, maxValueWidth);
      
      // Calculate total height needed
      const totalHeight = Math.max(
        labelLines.length * (TEXT_SIZE + 5),
        valueLines.length * (TEXT_SIZE + 5)
      );
      
      addNewPageIfNeeded(totalHeight + 10);
      
      // Draw label lines
      let labelCursor = cursor;
      labelLines.forEach(line => {
        page.drawText(`${line}:`, {
          x: LABEL_X,
          y: labelCursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        labelCursor -= TEXT_SIZE + 5;
      });
      
      // Draw value lines
      let valueCursor = cursor;
      valueLines.forEach(line => {
        // Draw underline for each line of the value
        page.drawLine({
          start: { x: VALUE_X, y: valueCursor - 2 },
          end: { x: PAGE_WIDTH - MARGIN, y: valueCursor - 2 },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
        
        // Draw value text
        page.drawText(line, {
          x: VALUE_X,
          y: valueCursor,
          size: TEXT_SIZE,
          font: font,
          color: rgb(0, 0, 0),
        });
        valueCursor -= TEXT_SIZE + 5;
      });
      
      // Update cursor position based on the maximum number of lines
      cursor -= Math.max(
        labelLines.length * (TEXT_SIZE + 5),
        valueLines.length * (TEXT_SIZE + 5)
      ) + 5;
    };
  
    // Main form field drawing function that decides between checkbox and text
    const drawFormField = (label: string, value: string) => {
      // Determine if this field should have checkboxes (yes/no questions)
      const isYesNoField = 
        typeof value === 'string' && 
        (value.toLowerCase() === 'yes' || value.toLowerCase() === 'no');
      
      if (isYesNoField) {
        drawFormFieldWithCheckbox(label, value);
      } else {
        drawFormFieldWithText(label, value);
      }
    };
  
    // Helper function to draw horizontal dividers
    const drawDivider = () => {
      addNewPageIfNeeded(20);
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
      if (!value) return "";
      
      if (label === 'createdAt' || label === 'updatedAt' || label.toLowerCase().includes('date')) {
        if (value.includes('Timestamp')) {
          const timestamp = JSON.parse(value.replace('Timestamp(', '{').replace(')', '}'));
          const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
          return date.toLocaleDateString('en-US');
        } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Format YYYY-MM-DD dates
          const date = new Date(value);
          return date.toLocaleDateString('en-US');
        }
      }
      
      if (label.toLowerCase().includes('phone')) {
        const num = value.replace(/\D/g, '');
        if (num.length >= 10) {
          return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6, 10)}`;
        }
      }
      
      if (label.toLowerCase().includes('expense') || 
          label.toLowerCase().includes('income') || 
          label.toLowerCase().includes('cost') ||
          value.includes('$')) {
        // Format as currency
        if (value.startsWith('$')) {
          return value;
        } else if (!isNaN(parseFloat(value))) {
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
        if (width <= maxWidth) {
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
    
    // Draw application-specific section directly, skipping the personal info section
    drawSectionHeader(`${program.toUpperCase()} INFORMATION`);
    
    // Draw form fields for answers - these are the application-specific fields
    Object.entries(answers).forEach(([question, answer]) => {
      drawFormField(question, answer);
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
    
    // Calculate total pages
    totalPages = pdfDoc.getPageCount();
    
    // Add page numbers at the bottom of each page
    for (let i = 0; i < totalPages; i++) {
      const currentPage = pdfDoc.getPage(i);
      currentPage.drawText(`PAGE ${i + 1} OF ${totalPages}`, {
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
    setFeedback(''); // Clear any existing feedback
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
        
        // Update the user's profile with any collected information
        if (auth.currentUser) {
          try {
            // Store form answers in the user's profile to avoid re-entering in future forms
            const updatedProfile = await updateUserProfileWithFormAnswers(nextProgress, profile!);
            setProfile(updatedProfile);
            
            // Also store the complete form submission
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'formSubmissions'), {
              program: selectedProgram,
              answers: nextProgress,
              submittedAt: serverTimestamp(),
            });
          } catch (err) {
            console.error('Error updating user profile:', err);
            // Continue with PDF generation even if profile update fails
          }
        }
        
        await buildPdf(selectedProgram!, nextProgress, profile!);
      } else {
        // Update profile with the current answer even if form is not complete
        if (auth.currentUser) {
          try {
            const updatedProfile = await updateUserProfileWithFormAnswers({ [currentQuestion]: answer }, profile!);
            setProfile(updatedProfile);
          } catch (err) {
            console.error('Error updating user profile with current answer:', err);
          }
        }
        setCurrentQuestion(res.nextQuestion);
        setCurrentPrefill(res.prefill || null);
      }
    } catch (err) {
      console.error('Error processing answer:', err);
      setFeedback('An error occurred while processing your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle forced skipping when the user is stuck
  const forceSkipQuestion = async () => {
    setLoading(true);
    setFeedback('Skipping this question...');
    
    try {
      // Create a modified version of processFormAnswer results to force moving to next question
      const nextProgress = { ...formProgress, [currentQuestion]: "Skipped" };
      setFormProgress(nextProgress);
      
      // Make the API call but ignore validation errors
      const res = await processFormAnswer(selectedProgram!, currentQuestion, "Skipped", nextProgress, profile!);
      
      if (res.complete) {
        setFormComplete(true);
        const summary = await generateFormSummary(selectedProgram!, nextProgress, profile!);
        setResults(summary);
        await buildPdf(selectedProgram!, nextProgress, profile!);
      } else {
        // Always proceed to next question
        setCurrentQuestion(res.nextQuestion);
        setCurrentPrefill(res.prefill || null);
        setFeedback(''); // Clear feedback after successful skip
      }
    } catch (err) {
      console.error('Error during forced skip:', err);
      
      // If normal skip fails, try a more aggressive approach - just move to an empty question
      // This is a fallback in case the Gemini API is being too strict
      const nextQuestionGuess = `Question ${Object.keys(formProgress).length + 2}`; // Next question estimate
      setCurrentQuestion(nextQuestionGuess);
      setCurrentPrefill(null);
      setFeedback('Question skipped. Proceeding with application.');
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
            <button onClick={() => handlePrefillChoice(false)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded">No, I'll fill it myself</button>
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
              {results}
            </div>
            {feedback && (
              <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-yellow-800 dark:text-yellow-200">
                {feedback}
              </div>
            )}
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
                    Ask a followup question or enter a program name:
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
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : selectedProgram ? 'Submit Answer' : 'Send'}
                  </motion.button>
                  {selectedProgram && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => submitAnswer('SKIP')}
                      disabled={loading}
                      className="flex-1 py-4 px-6 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                      Skip
                    </motion.button>
                  )}
                </div>
              )}
            </motion.form>
          )}
        </>
      )}
    </motion.div>
  );
}
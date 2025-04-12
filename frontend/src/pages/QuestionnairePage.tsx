import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createUser, auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { email, password } = state || { email: "", password: "" };

  const [isStudent, setIsStudent] = useState("");
  const [hasJob, setHasJob] = useState("");
  const [hasDependents, setHasDependents] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isStudent || !hasJob || !hasDependents) {
      setError("Please answer all questions.");
      return;
    }
    try {
      // Create the account in Firebase Auth and Firestore
      await createUser(email, password, { isStudent, hasJob, hasDependents });
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <button
        onClick={() => navigate("/signup")}
        className="absolute top-4 left-4 text-white"
        aria-label="Back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-4xl font-bold mb-6">Tell Us About Yourself</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">
            Are you currently enrolled as a student?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="isStudent"
                  value={option}
                  checked={isStudent === option}
                  onChange={(e) => setIsStudent(e.target.value)}
                  required
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Do you currently have a job?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasJob"
                  value={option}
                  checked={hasJob === option}
                  onChange={(e) => setHasJob(e.target.value)}
                  required
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Do you have any dependents?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="hasDependents"
                  value={option}
                  checked={hasDependents === option}
                  onChange={(e) => setHasDependents(e.target.value)}
                  required
                  className="form-radio"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

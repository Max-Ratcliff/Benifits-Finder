import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { email, password } = state || { email: "", password: "" };
  
  const [isStudent, setIsStudent] = useState("");
  const [hasJob, setHasJob] = useState("");
  const [hasDependents, setHasDependents] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isStudent || !hasJob || !hasDependents) {
      setError("Please answer all questions.");
      return;
    }
    // Here you would typically call createUser with the credentials and profile data.
    // For example:
    // createUser(email, password, { isStudent, hasJob, hasDependents })
    //   .then(() => navigate("/home"))
    //   .catch((err) => setError(err.message));
    // For now, we'll navigate to "/home" as a placeholder.
    navigate("/home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-6">Tell Us About Yourself</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">
            Are you currently a student?
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={isStudent === option}
                  onChange={(e) => setIsStudent(e.target.value)}
                  className="form-radio"
                  required
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
                  value={option}
                  checked={hasJob === option}
                  onChange={(e) => setHasJob(e.target.value)}
                  className="form-radio"
                  required
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
                  value={option}
                  checked={hasDependents === option}
                  onChange={(e) => setHasDependents(e.target.value)}
                  className="form-radio"
                  required
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

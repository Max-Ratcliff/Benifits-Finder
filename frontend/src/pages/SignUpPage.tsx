import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GoogleLogo from "@/components/ui/googleLogo.png";
import { createUser, signInWithGoogle } from "@/lib/firebase";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await createUser(email, password, { isStudent: "", hasJob: "", hasDependents: "" });
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred with Google Sign Up");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <button
        onClick={() => navigate("/landing")}
        className="absolute top-4 left-4 text-white"
        aria-label="Back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-4xl font-bold mb-6">Create Account</h1>
      <div className="flex flex-col items-center mb-6">
        <img
          src={GoogleLogo}
          alt="Google Logo"
          className="h-12 w-auto mb-2"
          style={{marginBottom: '25px'}}
        />
        <button
          onClick={handleGoogleSignUp}
          className="w-[400%] max-w-md py-3 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
        >
          Sign Up with Google
        </button>
      </div>
      <div className="w-full max-w-md space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

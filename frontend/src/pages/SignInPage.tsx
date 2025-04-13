import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signInWithGoogle } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";
import GoogleLogo from "@/components/ui/googleLogo.png";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred with Google Sign In");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      {/* Back arrow */}
      <button
        onClick={() => navigate("/landing")}
        className="absolute top-4 left-4 text-white"
        aria-label="Back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="text-4xl font-bold mb-6">Sign In</h1>
      <div className="flex flex-col items-center mb-6">
        <img src={GoogleLogo} alt="Google Logo" className="h-12 w-auto" style={{ marginBottom: '25px' }} />
        <button
          onClick={handleGoogleSignIn}
          className="w-[400%] max-w-md py-3 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
        >
          Sign In with Google
        </button>
      </div>
      <form onSubmit={handleEmailSignIn} className="w-full max-w-md space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

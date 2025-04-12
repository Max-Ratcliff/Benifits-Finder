import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white scroll-smooth">
      <Navbar />
      <section className="flex flex-col items-center justify-center flex-grow text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Discover the Benefits You Deserve
        </h1>
        <p className="text-xl mb-8 max-w-xl">
          BenefitFinder uses AI to match you with the best government and school resources.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/signin")}
            className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
          >
            Sign In <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
          >
            Sign Up <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </section>
      <Footer />
      <style>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
      `}</style>
    </div>
  );
}

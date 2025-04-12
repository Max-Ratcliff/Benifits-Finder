// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { X, ArrowRight } from "lucide-react";
// // import logo from "@/components/ui/logo.png";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// export default function LandingPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isInView, setIsInView] = useState(false);
//   const [showLoginPrompt, setShowLoginPrompt] = useState(false);
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location.pathname]);

//   useEffect(() => {
//     setIsInView(true);
//   }, []);

//   useEffect(() => {
//     const visitHistory = JSON.parse(localStorage.getItem("visitHistory") || "{}");
//     const currentTime = new Date().getTime();
//     const oneWeek = 7 * 24 * 60 * 60 * 1000;
//     if (!visitHistory.count) {
//       visitHistory.count = 1;
//       visitHistory.lastVisit = currentTime;
//     } else if (currentTime - visitHistory.lastVisit < oneWeek) {
//       visitHistory.count += 1;
//       visitHistory.lastVisit = currentTime;
//     } else {
//       visitHistory.count = 1;
//       visitHistory.lastVisit = currentTime;
//     }
//     localStorage.setItem("visitHistory", JSON.stringify(visitHistory));
//     setShowLoginPrompt(visitHistory.count >= 2);
//   }, []);

//   useEffect(() => {
//     const shouldSkipToLogin = localStorage.getItem("skipToLogin") === "true";
//     if (shouldSkipToLogin) {
//       navigate("/login");
//     }
//   }, [navigate]);

//   const handleLoginPromptClick = () => {
//     localStorage.setItem("skipToLogin", "true");
//     navigate("/signup");
//   };

//   const handleDismissLoginPrompt = () => {
//     setShowLoginPrompt(false);
//   };

//   const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (email.trim()) {
//       navigate("/signup");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-gray-900 to-[#405cd4] text-white scroll-smooth">
//       <Navbar />

//       {showLoginPrompt && (
//         <div className="fixed top-20 right-6 z-50 bg-gray-900/80 backdrop-blur-md text-white rounded-lg shadow-xl p-4 max-w-sm transition-all duration-300 ease-in-out border border-white/20 animate-slideInRight">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-lg font-medium">Skip to login?</h3>
//             <button
//               onClick={handleDismissLoginPrompt}
//               className="text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800/50 p-1"
//               aria-label="Close"
//             >
//               <X size={18} />
//             </button>
//           </div>
//           <p className="text-gray-300 text-sm mb-3">
//             You've visited before. Go directly to login next time?
//           </p>
//           <button
//             onClick={handleLoginPromptClick}
//             className="flex items-center justify-between w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors shadow-md hover:shadow-lg"
//           >
//             Yes, skip to login
//             <ArrowRight size={16} className="ml-2" />
//           </button>
//         </div>
//       )}

//       <section className="relative pt-40 pb-32 overflow-hidden min-h-screen flex flex-col items-center justify-center">
//         <div className="absolute inset-0 z-0">
//           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjEuOSAyLjEgMi4xdjE5LjhjMCAxLjItLjkgMi4xLTIuMSAyLjFIMTYuMmMtMS4yIDAtMi4xLS45LTIuMS0yLjFWMjAuMWMwLTEuMi45LTIuMSAyLjEtMi4xaDE5Ljh6TTYwIDE4YzEuMiAwIDIuMS45IDIuMSAyLjF2MTkuOGMwIDEuMi0uOSAyLjEtMi4xIDIuMUg0MC4yYy0xLjIgMC0yLjEtLjktMi4xLTIuMVYyMC4xYzAtMS4yLjktMi4xIDIuMS0yLjFINjB6IiBzdHJva2U9InJnYmEoMTI2LDEyNiwxMjYsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
//           <div className="absolute top-1/4 -left-36 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] animate-blob animation-delay-2000"></div>
//           <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] animate-blob animation-delay-4000"></div>
//         </div>
//         <div className="relative z-10 text-center px-4">
//           {/* <img src={logo} alt="BenefitFinder Logo" className="mx-auto w-32 mb-8" /> */}
//           <h1 className="text-5xl md:text-6xl font-bold mb-4">
//             Discover the Benefits You Deserve
//           </h1>
//           <p className="text-xl mb-8 max-w-xl mx-auto">
//             BenefitFinder uses AI to match you with the best government and school resources.
//           </p>
//           <form onSubmit={handleEmailSubmit} className="flex justify-center gap-3 max-w-md mx-auto">
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="flex-grow bg-gray-900/50 backdrop-blur-sm border-gray-700 focus:border-blue-500 focus:ring-blue-500 transition-all"
//             />
//             <Button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
//               Get Started
//             </Button>
//           </form>
//         </div>
//       </section>

//       <Footer />

//       <style>{`
//         @keyframes blob {
//           0% { transform: translate(0, 0) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0, 0) scale(1); }
//         }
//         @keyframes slideInRight {
//           0% { transform: translateX(100%); opacity: 0; }
//           100% { transform: translateX(0); opacity: 1; }
//         }
//         .animate-blob { animation: blob 10s infinite; }
//         .animate-slideInRight { animation: slideInRight 0.5s forwards; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInView, setIsInView] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setIsInView(true);
  }, []);

  // When the form is submitted, navigate to the auth page
  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      navigate("/auth");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white scroll-smooth">
      <Navbar />

      <section className="relative pt-40 pb-32 overflow-hidden min-h-screen flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          {/* Optional: Use a subtle background pattern or animated elements if desired */}
          <div className="absolute inset-0 bg-black opacity-100"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Discover the Benefits You Deserve
          </h1>
          <p className="text-xl mb-8 max-w-xl mx-auto">
            BenefitFinder uses AI to match you with the best government and school resources.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex justify-center gap-3 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow bg-gray-800 backdrop-blur-sm border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Get Started <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
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
        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animate-slideInRight { animation: slideInRight 0.5s forwards; }
      `}</style>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black py-4 px-6 flex justify-between items-center">
      <div
        className="text-white text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        BenefitFinder
      </div>
      <button
        onClick={() => navigate("/auth")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
      >
        Sign In / Sign Up
      </button>
    </nav>
  );
};

export default Navbar;

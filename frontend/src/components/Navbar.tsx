import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-black py-4 px-6 flex justify-center">
      <div
        onClick={() => navigate("/landing")}
        className="text-white text-xl font-bold cursor-pointer"
      >
        BenefitFinder
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-4 text-center">
      <p className="text-sm">© {new Date().getFullYear()} BenefitFinder. All rights reserved.</p>
    </footer>
  );
};

export default Footer;

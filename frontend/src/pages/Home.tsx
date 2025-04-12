import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { School, Briefcase, Home as HomeIcon, Heart } from "lucide-react";

const categories = [
  {
    id: 'education',
    title: 'Education Support',
    icon: School,
    description: 'Find student loans, grants, and scholarship opportunities',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'employment',
    title: 'Employment Benefits',
    icon: Briefcase,
    description: 'Discover unemployment benefits and job training programs',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'housing',
    title: 'Housing Assistance',
    icon: HomeIcon,
    description: 'Learn about housing vouchers and rental assistance',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'healthcare',
    title: 'Healthcare Programs',
    icon: Heart,
    description: 'Explore Medicaid, Medicare, and other health benefits',
    gradient: 'from-purple-500 to-pink-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Home() {
  const navigate = useNavigate();
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.isStudent || !data.hasJob || !data.hasDependents) {
            setIncomplete(true);
          }
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-12">
      {incomplete && (
        <div className="bg-yellow-300 p-4 text-black text-center">
          Please{" "}
          <button
            className="underline"
            onClick={() => navigate("/settings")}
          >
            fill in your info
          </button>{" "}
          to receive personalized recommendations.
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          How can we help you today?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a category to explore available benefits and support programs tailored to your needs.
        </p>
      </motion.div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => navigate("/benefits", { state: { category: category.id } })}
          >
            <div className="h-full p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 dark:group-hover:opacity-10" />
              <div className="flex items-start gap-6 relative z-10">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${category.gradient} text-white`}>
                  <category.icon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-transparent bg-clip-text bg-gradient-to-r transition-all duration-300">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

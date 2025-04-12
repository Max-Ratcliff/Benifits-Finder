// // import React from 'react';
// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // import { ThemeProvider } from './contexts/ThemeContext';
// // import { AuthForm } from './components/AuthForm';
// // import { Layout } from './components/Layout';
// // import { Home } from './pages/Home';
// // import { Benefits } from './pages/Benefits';
// // import { Settings } from './pages/Settings';
// // import LandingPage from "./pages/LandingPage";

// // function App() {
// //   return (
// //     <BrowserRouter>
// //       <ThemeProvider>
// //         <Routes>
// //           <Route path="/" element={<LandingPage />} />
// //           <Route path="/auth" element={<AuthForm />} />
// //           <Route path="/home" element={<Layout><Home /></Layout>} />
// //           <Route path="/benefits" element={<Layout><Benefits /></Layout>} />
// //           <Route path="/settings" element={<Layout><Settings /></Layout>} />
// //           <Route path="*" element={<Navigate to="/" replace />} />
// //         </Routes>
// //       </ThemeProvider>
// //     </BrowserRouter>
// //   );
// // }

// // export default App

// import React from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ThemeProvider } from "./contexts/ThemeContext";
// import { AuthForm } from "./components/AuthForm";
// import { Layout } from "./components/Layout";
// import { Home } from "./pages/Home";
// import { Benefits } from "./pages/Benefits";
// import { Settings } from "./pages/Settings";
// import LandingPage from "./pages/LandingPage";

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/auth" element={<AuthForm />} />
//           <Route path="/home" element={<Layout><Home /></Layout>} />
//           <Route path="/benefits" element={<Layout><Benefits /></Layout>} />
//           <Route path="/settings" element={<Layout><Settings /></Layout>} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import { Home } from "./pages/Home";
import { Benefits } from "./pages/Benefits";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/benefits" element={<Layout><Benefits /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

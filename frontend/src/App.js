import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { CharacterProvider } from "./context/CharacterContext";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import AdminWordPage from "./pages/AdminWordPage";
import AdminMainPage from "./pages/AdminMainPage";
import AdminUserPage from "./pages/AdminUserPage";
import WordListPage from "./pages/WordListPage";
import QuizPage from "./pages/QuizPage";
import QuizResultPage from "./pages/QuizResultPage";
import WrongNotePage from "./pages/WrongNotePage";
import WrongNoteQuizPage from "./pages/WrongNoteQuizPage";
import ShopPage from "./pages/ShopPage";
import StatsPage from "./pages/StatsPage";
import EndingPage from "./pages/EndingPage";
import LandingPage from "./pages/LandingPage";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<PrivateRoute><MainPage /></PrivateRoute>} />
          <Route path="/words" element={<PrivateRoute><WordListPage /></PrivateRoute>} />
          <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminMainPage /></PrivateRoute>} />
          <Route path="/admin/words" element={<PrivateRoute adminOnly><AdminWordPage /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUserPage /></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
          <Route path="/quiz/result" element={<PrivateRoute><QuizResultPage /></PrivateRoute>} />
          <Route path="/wrong-notes" element={<PrivateRoute><WrongNotePage /></PrivateRoute>} />
          <Route path="/wrong-notes/quiz" element={<PrivateRoute><WrongNoteQuizPage /></PrivateRoute>} />
          <Route path="/shop" element={<PrivateRoute><ShopPage /></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
          <Route path="/ending" element={<PrivateRoute><EndingPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CharacterProvider>
          <AnimatedRoutes />
        </CharacterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
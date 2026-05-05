import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CharacterProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/words"
              element={
                <PrivateRoute>
                  <WordListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/mypage"
              element={
                <PrivateRoute>
                  <MyPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminMainPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/words"
              element={
                <PrivateRoute adminOnly>
                  <AdminWordPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute adminOnly>
                  <AdminUserPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/quiz"
              element={
                <PrivateRoute>
                  <QuizPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/quiz/result"
              element={
                <PrivateRoute>
                  <QuizResultPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CharacterProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

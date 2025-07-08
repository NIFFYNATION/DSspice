import AuthForm from '../components/auth/AuthForm';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background py-16 px-4 transition-colors duration-300`}>
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-10 md:p-14 mx-auto transition-colors duration-300 ${darkMode ? 'bg-dark-background text-dark-text-primary' : 'bg-white text-text-primary'}`}>
        <AuthForm initialMode="signup" onAuthSuccess={() => navigate('/')} />
      </div>
    </div>
  );
} 
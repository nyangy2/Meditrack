import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import OtcMeds from './pages/OtcMeds';
import InteractionCheck from './pages/InteractionCheck';
import Lens from './pages/Lens';
import MyPage from './pages/MyPage';
import HeaderFooterLayout from './components/HeaderFooterLayout';
import SidebarLayout from './components/SidebarkLayout';
import LoginSuccess from './pages/KaKaoRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import SymptomPage from './pages/SymptomPage'; // 추가된 import
import { MedicationProvider } from './context/medication-context';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { SymptomProvider } from './context/symptom-context'; // 경로 수정
import MyMedications from './pages/MyMedications';
import MedicationReminders from './pages/Medication-Reminders';

function App() {
  return (
    <Router>
      <Routes>
        {/* 카카오 로그인 콜백 */}
        <Route path="/login/success" element={<LoginSuccess />} />

        {/* 보호된 경로들 (SidebarLayout + 로그인 검사) */}
        <Route
          path="/otc-meds"
          element={
            <ProtectedRoute>
              <SidebarLayout><OtcMeds /></SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptom-search"
          element={
            <ProtectedRoute>
              <SymptomProvider>
                <SidebarLayout><SymptomPage /></SidebarLayout>
              </SymptomProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <SidebarLayout><MyPage /></SidebarLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interaction-check"
          element={
            <ProtectedRoute>
              <MedicationProvider>
                <SidebarLayout><InteractionCheck /></SidebarLayout>
              </MedicationProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lens"
          element={
            <ProtectedRoute>
              <MedicationProvider>
                <SidebarLayout><Lens /></SidebarLayout>
              </MedicationProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MedicationProvider>
                <SidebarLayout><Dashboard /></SidebarLayout>
              </MedicationProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-medications"
          element={
            <ProtectedRoute>
              <MedicationProvider>
                <SidebarLayout><MyMedications /></SidebarLayout>
              </MedicationProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medication-reminders"
          element={
            <ProtectedRoute>
              <MedicationProvider>
                <SidebarLayout><MedicationReminders /></SidebarLayout>
              </MedicationProvider>
            </ProtectedRoute>
          }
        />

        {/* 공개 경로들 (Header + Footer만 있음) */}
        <Route path="/" element={<HeaderFooterLayout><HomePage /></HeaderFooterLayout>} />
        <Route path="/login" element={<HeaderFooterLayout><Login /></HeaderFooterLayout>} />
        <Route path="/register" element={<HeaderFooterLayout><Register /></HeaderFooterLayout>} />
      </Routes>
    </Router>
  );
}

export default App;

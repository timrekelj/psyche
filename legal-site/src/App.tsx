import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/terms" replace />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<Navigate to="/terms" replace />} />
            </Routes>
        </Layout>
    );
}

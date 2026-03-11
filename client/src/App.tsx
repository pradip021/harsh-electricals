import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuotationProvider } from './context/QuotationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AddEditQuotation from './pages/AddEditQuotation';
import ViewQuotation from './pages/ViewQuotation';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuotationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/add" element={
                  <ProtectedRoute>
                    <AddEditQuotation />
                  </ProtectedRoute>
                } />
                <Route path="/edit/:id" element={
                  <ProtectedRoute>
                    <AddEditQuotation />
                  </ProtectedRoute>
                } />
                <Route path="/view/:id" element={
                  <ProtectedRoute>
                    <ViewQuotation />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </QuotationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

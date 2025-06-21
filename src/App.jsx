import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import RouteTransition from './components/common/RouteTransition';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Landing from './pages/Landing';
import Directory from './pages/Directory';
import AdvisorProfile from './pages/AdvisorProfile';
import WriteReview from './pages/WriteReview';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AdvisorRegistration from './pages/AdvisorRegistration';
import FirebaseAuthAction from './pages/FirebaseAuthAction';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Skip Navigation Link */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-700 text-white px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <Layout>
            <RouteTransition>
              <main id="main-content" tabIndex="-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/directory" element={<Directory />} />
                  <Route path="/advisor/:crdNumber" element={<AdvisorProfile />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/__auth/action" element={<FirebaseAuthAction />} />

                  {/* Protected routes */}
                  <Route
                    path="/write-review/:crdNumber"
                    element={
                      <ProtectedRoute>
                        <WriteReview />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />

                  {/* Advisor registration route */}
                  <Route
                    path="/advisor-registration"
                    element={
                      <PrivateRoute>
                        <AdvisorRegistration />
                      </PrivateRoute>
                    }
                  />

                  {/* Advisor profile route */}
                  <Route path="/advisors/:id" element={<AdvisorProfile />} />

                  {/* Fallback routes */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </main>
            </RouteTransition>
          </Layout>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
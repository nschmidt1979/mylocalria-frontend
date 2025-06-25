import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import Layout from './shared/components/layout/Layout';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AdminRoute } from './features/auth/components/AdminRoute';
import RouteTransition from './shared/components/common/RouteTransition';
import PrivateRoute from './features/auth/components/PrivateRoute';

// Pages
import Landing from './pages/Landing';
import Directory from './features/search/pages/Directory';
import AdvisorProfile from './features/advisors/pages/AdvisorProfile';
import WriteReview from './features/reviews/pages/WriteReview';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Dashboard from './features/dashboard/pages/Dashboard';
import Profile from './features/profile/pages/Profile';
import AdminDashboard from './features/dashboard/pages/AdminDashboard';
import NotFound from './pages/NotFound';
import AdvisorRegistration from './features/advisors/pages/AdvisorRegistration';
import FirebaseAuthAction from './features/auth/pages/FirebaseAuthAction';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <RouteTransition>
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
            </RouteTransition>
          </Layout>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
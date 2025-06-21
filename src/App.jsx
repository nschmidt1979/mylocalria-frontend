import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import RouteTransition from './components/common/RouteTransition';

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

// Helper component to redirect from old advisor URL format to new one
function AdvisorRedirect() {
  const { id } = useParams();
  return <Navigate to={`/advisor/${id}`} replace />;
}

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
                    <ProtectedRoute>
                      <AdvisorRegistration />
                    </ProtectedRoute>
                  }
                />

                {/* Redirect old advisor profile route to new one */}
                <Route path="/advisors/:id" element={<AdvisorRedirect />} />

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
import '@testing-library/jest-dom';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Firebase
jest.mock('./firebase', () => ({
  auth: {},
  db: {},
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [
    new URLSearchParams(),
    jest.fn()
  ],
}));

// Mock AuthContext
jest.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: null,
    user: null,
    logout: jest.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock geolocation service
jest.mock('./services/geolocationService', () => ({
  getCurrentLocation: jest.fn(() => 
    Promise.resolve({ latitude: 40.7128, longitude: -74.0060 })
  ),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};
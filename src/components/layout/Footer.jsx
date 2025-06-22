import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand Section - Full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <i className="fas fa-chart-line text-xl sm:text-2xl text-white mr-2"></i>
              <span className="text-lg sm:text-xl font-display font-bold text-white">MyLocalRIA</span>
            </div>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              Helping Washington investors find and evaluate local registered investment advisers since 2023.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook text-lg"></i>
              </a>
            </div>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/ria-101" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  RIA 101 Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-calculator" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Fee Calculator
                </Link>
              </li>
              <li>
                <Link 
                  to="/interview-questions" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Interview Questions
                </Link>
              </li>
              <li>
                <Link 
                  to="/glossary" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Glossary
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/team" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link 
                  to="/methodology" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link 
                  to="/disclosures" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Disclosures
                </Link>
              </li>
              <li>
                <Link 
                  to="/advisor-guidelines" 
                  className="text-sm text-gray-400 hover:text-white transition-colors block py-2 px-2 -mx-2 rounded-md hover:bg-gray-700 min-h-[44px] flex items-center"
                >
                  Advisor Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} MyLocalRIA. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Not affiliated with the SEC or Washington State DFI. Data from public sources reviewed quarterly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
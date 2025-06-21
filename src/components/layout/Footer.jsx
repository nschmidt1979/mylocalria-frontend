import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800" role="contentinfo">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center">
              <i className="fas fa-chart-line text-2xl text-white mr-2" aria-hidden="true"></i>
              <span className="text-xl font-display font-bold text-white">MyLocalRIA</span>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Helping Washington investors find and evaluate local registered investment advisers since 2023.
            </p>
            <div className="mt-4 flex space-x-6" aria-label="Social media links">
              <a 
                href="https://twitter.com/mylocalria" 
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md p-1"
                aria-label="Follow us on Twitter"
              >
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
              <a 
                href="https://linkedin.com/company/mylocalria" 
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md p-1"
                aria-label="Follow us on LinkedIn"
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </a>
              <a 
                href="https://facebook.com/mylocalria" 
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md p-1"
                aria-label="Follow us on Facebook"
              >
                <i className="fab fa-facebook" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  to="/ria-101" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  RIA 101 Guide
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-calculator" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Fee Calculator
                </Link>
              </li>
              <li>
                <Link 
                  to="/interview-questions" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Interview Questions
                </Link>
              </li>
              <li>
                <Link 
                  to="/glossary" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Glossary
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/team" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link 
                  to="/methodology" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link 
                  to="/disclosures" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Disclosures
                </Link>
              </li>
              <li>
                <Link 
                  to="/advisor-guidelines" 
                  className="text-sm text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                >
                  Advisor Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} MyLocalRIA. All rights reserved.
          </p>
          <p className="text-sm text-gray-300 mt-4 md:mt-0">
            Not affiliated with the SEC or Washington State DFI. Data from public sources reviewed quarterly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
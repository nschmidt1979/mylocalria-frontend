import { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchTips = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const tips = [
    {
      title: 'Use Location Search',
      description: 'Enter your city or zip code to find advisors near you. You can also adjust the search radius to expand or narrow your results.',
      icon: '📍',
    },
    {
      title: 'Filter by Specialization',
      description: 'Look for advisors who specialize in your specific needs, such as retirement planning, tax planning, or investment management.',
      icon: '🎯',
    },
    {
      title: 'Check Certifications',
      description: 'Verify advisor credentials by looking for important certifications like CFP®, CFA, or CPA.',
      icon: '🏆',
    },
    {
      title: 'Compare Advisors',
      description: 'Use the comparison feature to evaluate up to three advisors side by side based on their services, fees, and reviews.',
      icon: '⚖️',
    },
    {
      title: 'Read Reviews',
      description: 'Browse through client reviews to get insights into the advisor\'s communication style, expertise, and client satisfaction.',
      icon: '⭐',
    },
    {
      title: 'Save Your Search',
      description: 'Save your search criteria to quickly find advisors that match your requirements in the future.',
      icon: '💾',
    },
  ];

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-blue-900">Search Tips</h3>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-blue-400 hover:text-blue-600 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          Show tips to find the right advisor
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <span className="text-2xl mr-3">{tip.icon}</span>
              <div>
                <h4 className="text-sm font-medium text-blue-900">{tip.title}</h4>
                <p className="mt-1 text-sm text-blue-700">{tip.description}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Show less
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchTips; 
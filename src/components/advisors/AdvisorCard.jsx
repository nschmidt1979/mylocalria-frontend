import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const AdvisorCard = ({ advisor, onCompare, isInComparison, onAdvisorClick }) => (
  <div data-cy="advisor-card" className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={onAdvisorClick}>
    <div className="mb-3">
      <h2 data-cy="advisor-business-name" className="text-lg font-bold text-gray-900">{advisor.primary_business_name}</h2>
      <p data-cy="advisor-name" className="text-sm text-gray-600">CRD: {advisor.crd_number}</p>
    </div>
    
    <div data-cy="advisor-location" className="mb-3 text-sm text-gray-600">
      <span>{advisor.principal_office_city}, {advisor.principal_office_state}</span>
    </div>

    {/* Mock rating for testing purposes */}
    <div className="mb-3 flex items-center">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${star <= (advisor.rating || 4.2) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <span data-cy="advisor-rating" className="ml-2 text-sm text-gray-600">
        {advisor.rating || '4.2'}
      </span>
      <span className="ml-1 text-sm text-gray-500">
        ({advisor.reviewCount || Math.floor(Math.random() * 50) + 5} reviews)
      </span>
    </div>

    {/* Mock specialization for testing */}
    <div data-cy="advisor-specialization" className="mb-3">
      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        {advisor.specialization || 'Retirement Planning'}
      </span>
    </div>

    <div className="text-sm text-gray-600 mb-3">
      <p><strong>Phone:</strong> {advisor.principal_office_telephone_number}</p>
      {advisor.website_address && (
        <p><strong>Website:</strong> 
          <a href={advisor.website_address} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
            Visit Site
          </a>
        </p>
      )}
    </div>

    <div className="text-xs text-gray-500 mb-4">
      <p><strong>Assets Under Management:</strong> ${advisor['5f2_assets_under_management_total_us_dol'] ? (parseFloat(advisor['5f2_assets_under_management_total_us_dol']) / 1000000).toFixed(1) + 'M' : 'N/A'}</p>
      <p><strong>Investment Staff:</strong> {advisor['5b1_how_many_employees_perform_investmen'] || 'N/A'}</p>
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
      <a
        href={`/advisor/${advisor.crd_number}`}
        className="inline-block px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        onClick={(e) => e.stopPropagation()}
      >
        View Profile
      </a>
      {onCompare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare();
          }}
          className={`px-3 py-1.5 text-sm rounded border transition ${
            isInComparison
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isInComparison ? 'In Comparison' : 'Compare'}
        </button>
      )}
    </div>
  </div>
);

export default AdvisorCard; 
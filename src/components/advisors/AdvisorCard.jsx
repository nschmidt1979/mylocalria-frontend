import React from 'react';
import { Link } from 'react-router-dom';

const AdvisorCard = ({ advisor }) => (
  <article className="p-4 bg-white rounded shadow" aria-labelledby={`advisor-${advisor.id}-name`}>
    <header>
      <h3 id={`advisor-${advisor.id}-name`} className="text-lg font-bold text-gray-900 mb-2">
        {advisor.primary_business_name}
      </h3>
    </header>
    
    <div className="space-y-2 text-sm text-gray-700">
      <div>
        <span className="font-medium text-gray-900">CRD Number:</span>
        <span className="ml-1">{advisor.crd_number}</span>
      </div>
      
      <div>
        <span className="font-medium text-gray-900">Address:</span>
        <address className="ml-1 not-italic">
          {advisor.principal_office_address_1}
          {advisor.principal_office_address_2 ? `, ${advisor.principal_office_address_2}` : ''}
          , {advisor.principal_office_city}, {advisor.principal_office_state} {advisor.principal_office_postal_code}
        </address>
      </div>
      
      <div>
        <span className="font-medium text-gray-900">Phone:</span>
        <a 
          href={`tel:${advisor.principal_office_telephone_number}`}
          className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          aria-label={`Call ${advisor.primary_business_name} at ${advisor.principal_office_telephone_number}`}
        >
          {advisor.principal_office_telephone_number}
        </a>
      </div>
      
      {advisor.website_address && (
        <div>
          <span className="font-medium text-gray-900">Website:</span>
          <a 
            href={advisor.website_address} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-1 text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            aria-label={`Visit ${advisor.primary_business_name} website (opens in new tab)`}
          >
            {advisor.website_address}
          </a>
        </div>
      )}
      
      <div>
        <span className="font-medium text-gray-900">Investment Employees:</span>
        <span className="ml-1">{advisor['5b1_how_many_employees_perform_investmen'] || 'Not specified'}</span>
      </div>
      
      <div>
        <span className="font-medium text-gray-900">Assets Under Management:</span>
        <div className="ml-1 mt-1">
          <div>Number: {advisor['5f2_assets_under_management_total_number'] || 'Not specified'}</div>
          <div>Amount: ${advisor['5f2_assets_under_management_total_us_dol'] ? 
            Number(advisor['5f2_assets_under_management_total_us_dol']).toLocaleString() : 
            'Not specified'}</div>
        </div>
      </div>
      
      <div>
        <span className="font-medium text-gray-900">Status Effective Date:</span>
        <time className="ml-1" dateTime={advisor.status_effective_date}>
          {advisor.status_effective_date ? 
            new Date(advisor.status_effective_date).toLocaleDateString() : 
            'Not specified'}
        </time>
      </div>
    </div>
    
    <footer className="mt-4">
      <Link
        to={`/advisor/${advisor.crd_number}`}
        className="inline-block px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`View detailed profile for ${advisor.primary_business_name}`}
      >
        View Profile
      </Link>
    </footer>
  </article>
);

export default AdvisorCard; 
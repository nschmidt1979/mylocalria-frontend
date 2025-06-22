import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, PhoneIcon, GlobeAltIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const AdvisorCard = ({ advisor }) => {
  // Format address for display
  const formatAddress = () => {
    const parts = [
      advisor.principal_office_city,
      advisor.principal_office_state,
      advisor.principal_office_postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Format assets under management
  const formatAUM = (aum) => {
    if (!aum || aum === 0) return null;
    const num = Number(aum);
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const address = formatAddress();
  const phone = formatPhone(advisor.principal_office_telephone_number);
  const aum = formatAUM(advisor['5f2_assets_under_management_total_us_dol']);

  return (
    <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200">
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
            <span className="line-clamp-2 sm:line-clamp-1">
              {advisor.primary_business_name}
            </span>
          </h3>
          <p className="text-sm text-gray-500">
            CRD: {advisor.crd_number}
          </p>
        </div>
      </div>

      {/* Key Information */}
      <div className="space-y-3 mb-5">
        {address && (
          <div className="flex items-start space-x-2">
            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 leading-relaxed">
              {address}
            </span>
          </div>
        )}
        
        {phone && (
          <div className="flex items-center space-x-2">
            <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a 
              href={`tel:${advisor.principal_office_telephone_number}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {phone}
            </a>
          </div>
        )}

        {advisor.website_address && (
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a 
              href={advisor.website_address}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium truncate"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg sm:text-xl font-semibold text-gray-900">
            {advisor['5b1_how_many_employees_perform_investmen'] || '—'}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            Advisors
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-semibold text-gray-900">
            {aum || '—'}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            Assets Under Management
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/advisor/${advisor.crd_number}`}
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-3 px-4 rounded-lg transition-colors duration-200 min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        View Profile
      </Link>
    </div>
  );
};

export default AdvisorCard; 
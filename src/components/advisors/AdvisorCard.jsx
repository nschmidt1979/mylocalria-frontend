import React from 'react';
import { StarIcon, MapPinIcon, PhoneIcon, GlobeAltIcon, BuildingOfficeIcon, BanknotesIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { 
  formatCurrency, 
  formatAssetsUnderManagement, 
  formatAccountMinimum, 
  formatProfessionalDesignations,
  formatCustodians,
  formatFeeStructure,
  formatDiscretionaryAuthority,
  formatPerformanceFees,
  formatBusinessName,
  formatPhoneNumber,
  getDisplayUrl,
  formatWebsiteUrl,
  validateAdvisorData
} from '../../utils/advisorFormatters';

const AdvisorCard = ({ advisor, onCompare, isInComparison, onAdvisorClick }) => {
  const validation = validateAdvisorData(advisor);
  const displayName = formatBusinessName(advisor.primary_business_name);
  
  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    if (onAdvisorClick) {
      onAdvisorClick(advisor);
    }
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(advisor);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {displayName}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{advisor.principal_office_city}, {advisor.principal_office_state}</span>
            </div>
          </div>
          
          {/* Rating and Compare Button */}
          <div className="flex flex-col items-end gap-2 ml-4">
            {advisor.averageRating > 0 && (
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {advisor.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({advisor.reviewCount})
                </span>
              </div>
            )}
            
            <button
              onClick={handleCompareClick}
              className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                isInComparison
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {isInComparison ? 'In Comparison' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <ChartBarIcon className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">AUM</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatAssetsUnderManagement(advisor['5f2_assets_under_management_total_us_dol'])}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <BanknotesIcon className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Minimum</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {formatAccountMinimum(advisor.account_minimum)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="px-6 pb-4 space-y-3">
        {/* Professional Designations */}
        {advisor.rep_professional_designations && advisor.rep_professional_designations.length > 0 && (
          <div className="flex items-start">
            <AcademicCapIcon className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">
                Professional Designations
              </span>
              <span className="text-sm text-gray-900">
                {formatProfessionalDesignations(advisor.rep_professional_designations)}
              </span>
            </div>
          </div>
        )}

        {/* Fee Structure */}
        {advisor.fees && advisor.fees.length > 0 && (
          <div className="flex items-start">
            <BanknotesIcon className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">
                Fee Structure
              </span>
              <span className="text-sm text-gray-900">
                {formatFeeStructure(advisor.fees)}
                {advisor.performance_fees && (
                  <span className="text-xs text-orange-600 ml-2">+ Performance fees</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Custodians */}
        {advisor.custodians && advisor.custodians.length > 0 && (
          <div className="flex items-start">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1">
                Custodians
              </span>
              <span className="text-sm text-gray-900">
                {formatCustodians(advisor.custodians)}
              </span>
            </div>
          </div>
        )}

        {/* Authority Type */}
        {advisor.discretionary_authority !== null && advisor.discretionary_authority !== undefined && (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              advisor.discretionary_authority 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formatDiscretionaryAuthority(advisor.discretionary_authority)}
            </span>
            
            {advisor.verified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                Verified
              </span>
            )}
            
            {advisor.feeOnly && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
                Fee-Only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          {advisor.principal_office_telephone_number && (
            <a 
              href={`tel:${advisor.principal_office_telephone_number}`}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <PhoneIcon className="h-4 w-4 mr-1" />
              <span>{formatPhoneNumber(advisor.principal_office_telephone_number)}</span>
            </a>
          )}
          
          {advisor.website_address && (
            <a 
              href={formatWebsiteUrl(advisor.website_address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              <span>{getDisplayUrl(advisor.website_address)}</span>
            </a>
          )}
        </div>

        {/* Data Completeness Indicator */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  validation.completeness >= 80 ? 'bg-green-500' :
                  validation.completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${validation.completeness}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {validation.completeness}% complete
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onAdvisorClick) {
                onAdvisorClick(advisor);
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorCard; 
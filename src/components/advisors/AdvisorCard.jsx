import React from 'react';
import { Link } from 'react-router-dom';

const AdvisorCard = ({ advisor }) => {
  const cleanFirmName = (name) => {
    return name?.replace(/,?\s*(llc|inc)\.?$/i, '').trim() || '';
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '$0';
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  const firmName = cleanFirmName(toTitleCase(advisor.primary_business_name));
  const location = `${toTitleCase(advisor.principal_office_city)}, ${advisor.principal_office_state?.toUpperCase()}`;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold">{firmName}</h3>
    <p className="text-sm text-gray-600 mb-2"><strong>CRD:</strong> {advisor.crd_number}</p>
    <p className="text-sm text-gray-600 mb-2"><strong>Location:</strong> {location}</p>
    {advisor.principal_office_telephone_number && (
      <p className="text-sm text-gray-600 mb-2"><strong>Phone:</strong> {advisor.principal_office_telephone_number}</p>
    )}
    {advisor.website_address && (
      <p className="text-sm text-gray-600 mb-2">
        <strong>Website:</strong> <a href={advisor.website_address} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{advisor.website_address}</a>
      </p>
    )}
    {advisor['5f2_assets_under_management_total_us_dol'] && (
      <p className="text-sm text-gray-600 mb-2"><strong>Assets Under Management:</strong> {formatCurrency(advisor['5f2_assets_under_management_total_us_dol'])}</p>
    )}
    <div className="mt-4">
      <Link
        to={`/advisor/${advisor.id}`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        View Profile
      </Link>
         </div>
   </div>
 );
};

export default AdvisorCard; 
import React from 'react';

const AdvisorCard = ({ advisor }) => (
  <div className="p-4 bg-white rounded shadow">
    <h2 className="text-lg font-bold">{advisor.primary_business_name}</h2>
    <p><strong>CRD Number:</strong> {advisor.crd_number}</p>
    <p><strong>Address:</strong> {advisor.principal_office_address_1}{advisor.principal_office_address_2 ? `, ${advisor.principal_office_address_2}` : ''}, {advisor.principal_office_city}, {advisor.principal_office_state} {advisor.principal_office_postal_code}</p>
    <p><strong>Phone:</strong> {advisor.principal_office_telephone_number}</p>
    <p><strong>Website:</strong> <a href={advisor.website_address} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{advisor.website_address}</a></p>
    <p><strong>Employees Performing Investment:</strong> {advisor['5b1_how_many_employees_perform_investmen']}</p>
    <p><strong>Assets Under Management (Number):</strong> {advisor['5f2_assets_under_management_total_number']}</p>
    <p><strong>Assets Under Management (USD):</strong> {advisor['5f2_assets_under_management_total_us_dol']}</p>
    <p><strong>Status Effective Date:</strong> {advisor.status_effective_date}</p>
    <div className="mt-4">
      <a
        href={`/advisors/${advisor.id}`}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        View Profile
      </a>
    </div>
  </div>
);

export default AdvisorCard; 
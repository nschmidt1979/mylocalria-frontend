import React from 'react';

const AdviserProfile = () => {
  // TODO: Replace placeholder data with Firestore data fetch
  const profile = {
    primary_business_name: 'Sample Adviser LLC',
    principal_office_address_1: '123 Main St',
    principal_office_address_2: '',
    principal_office_city: 'Seattle',
    principal_office_state: 'WA',
    principal_office_postal_code: '98101',
    principal_office_telephone_number: '(206) 555-1234',
    status_effective_date: '2024-01-01',
    website_address: 'https://sampleadviser.com',
    crd_number: '123456',
    '5b1_how_many_employees_perform_investmen': 5,
    '5f2_assets_under_management_total_number': 120,
    '5f2_assets_under_management_total_us_dol': '$50,000,000',
    account_minimum: '$100,000',
    custodians: 'Fidelity, Schwab',
    discretionary_authority: 'Yes',
    fees: '1% of AUM',
    investment_summary: 'Comprehensive financial planning and investment management.',
    other_business_activities: 'Tax planning',
    performance_fee_rate: 'N/A',
    performance_fees: 'No',
    fee_notes: 'No hidden fees.',
    disciplinary_disclosures: 'None',
    rep_name: 'Jane Doe',
    rep_crd_number: '654321',
    rep_education: 'MBA, CFP',
    rep_business_experience: '10 years in wealth management',
    rep_disciplinary_information: 'None',
    rep_other_business_activities: 'Volunteer financial literacy coach',
    rep_other_legal_events: 'None',
    rep_professional_designations: 'CFP, CFA',
    logo_url: 'https://via.placeholder.com/100',
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Adviser Profile</h1>
      {/* Basic Information */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><strong>Primary Business Name:</strong> {profile.primary_business_name}</div>
          <div><strong>Address 1:</strong> {profile.principal_office_address_1}</div>
          <div><strong>Address 2:</strong> {profile.principal_office_address_2}</div>
          <div><strong>City:</strong> {profile.principal_office_city}</div>
          <div><strong>State:</strong> {profile.principal_office_state}</div>
          <div><strong>Postal Code:</strong> {profile.principal_office_postal_code}</div>
          <div><strong>Phone:</strong> {profile.principal_office_telephone_number}</div>
          <div><strong>Status Effective Date:</strong> {profile.status_effective_date}</div>
          <div><strong>Website:</strong> <a href={profile.website_address} className="text-blue-600 underline">{profile.website_address}</a></div>
        </div>
      </section>
      {/* Key Data */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Key Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><strong>CRD Number:</strong> {profile.crd_number}</div>
          <div><strong>Employees Performing Investment:</strong> {profile['5b1_how_many_employees_perform_investmen']}</div>
          <div><strong>Assets Under Management (Total):</strong> {profile['5f2_assets_under_management_total_number']}</div>
          <div><strong>Assets Under Management (USD):</strong> {profile['5f2_assets_under_management_total_us_dol']}</div>
          <div><strong>Account Minimum:</strong> {profile.account_minimum}</div>
          <div><strong>Custodians:</strong> {profile.custodians}</div>
        </div>
      </section>
      {/* Services and Fees */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Services and Fees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><strong>Discretionary Authority:</strong> {profile.discretionary_authority}</div>
          <div><strong>Fees:</strong> {profile.fees}</div>
          <div><strong>Investment Summary:</strong> {profile.investment_summary}</div>
          <div><strong>Other Business Activities:</strong> {profile.other_business_activities}</div>
          <div><strong>Performance Fee Rate:</strong> {profile.performance_fee_rate}</div>
          <div><strong>Performance Fees:</strong> {profile.performance_fees}</div>
          <div><strong>Fee Notes:</strong> {profile.fee_notes}</div>
        </div>
      </section>
      {/* Disclosures */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Disclosures</h2>
        <div><strong>Disciplinary Disclosures:</strong> {profile.disciplinary_disclosures}</div>
      </section>
      {/* Representative Information */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Representative Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><strong>Name:</strong> {profile.rep_name}</div>
          <div><strong>CRD Number:</strong> {profile.rep_crd_number}</div>
          <div><strong>Education:</strong> {profile.rep_education}</div>
          <div><strong>Business Experience:</strong> {profile.rep_business_experience}</div>
          <div><strong>Disciplinary Information:</strong> {profile.rep_disciplinary_information}</div>
          <div><strong>Other Business Activities:</strong> {profile.rep_other_business_activities}</div>
          <div><strong>Other Legal Events:</strong> {profile.rep_other_legal_events}</div>
          <div><strong>Professional Designations:</strong> {profile.rep_professional_designations}</div>
        </div>
      </section>
      {/* Logo */}
      <section className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Logo</h2>
        <img src={profile.logo_url} alt="Adviser Logo" className="mx-auto rounded shadow w-24 h-24" />
      </section>
    </div>
  );
};

export default AdviserProfile; 
// Mock data service to simulate Firestore data for testing RIA filters
export const mockAdvisorsData = [
  {
    id: 'advisor-1',
    crd_number: '12345',
    primary_business_name: 'Cascade Partners Financial',
    principal_office_city: 'Seattle',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 25000000, // $25M
    account_minimum: 100000, // $100K
    custodians: ['Charles Schwab', 'Fidelity'],
    discretionary_authority: true,
    fees: ['Assets Under Management (AUM)', 'Hourly'],
    performance_fees: false,
    rep_professional_designations: ['CFP', 'CFA'],
    averageRating: 4.5,
    reviewCount: 12,
    verified: true,
    feeOnly: false,
    specializations: ['Retirement Planning', 'Investment Management'],
    certifications: ['CFP', 'CFA'],
  },
  {
    id: 'advisor-2',
    crd_number: '23456',
    primary_business_name: 'Pacific Northwest Wealth Management',
    principal_office_city: 'Bellevue',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 150000000, // $150M
    account_minimum: 250000, // $250K
    custodians: ['TD Ameritrade', 'E*TRADE'],
    discretionary_authority: false,
    fees: ['Assets Under Management (AUM)'],
    performance_fees: true,
    rep_professional_designations: ['ChFC', 'CLU'],
    averageRating: 4.2,
    reviewCount: 8,
    verified: true,
    feeOnly: true,
    specializations: ['Estate Planning', 'Tax Planning'],
    certifications: ['ChFC', 'CLU'],
  },
  {
    id: 'advisor-3',
    crd_number: '34567',
    primary_business_name: 'Evergreen Financial Advisors',
    principal_office_city: 'Spokane',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 75000000, // $75M
    account_minimum: 50000, // $50K
    custodians: ['Vanguard', 'Interactive Brokers'],
    discretionary_authority: true,
    fees: ['Hourly', 'Project-Based'],
    performance_fees: false,
    rep_professional_designations: ['CPA', 'PFS'],
    averageRating: 4.8,
    reviewCount: 25,
    verified: false,
    feeOnly: false,
    specializations: ['Retirement Planning', 'Education Planning'],
    certifications: ['CPA', 'PFS'],
  },
  {
    id: 'advisor-4',
    crd_number: '45678',
    primary_business_name: 'Sound Financial Planning',
    principal_office_city: 'Tacoma',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 5000000, // $5M
    account_minimum: 25000, // $25K
    custodians: ['Pershing', 'LPL Financial'],
    discretionary_authority: false,
    fees: ['Retainer', 'Commission'],
    performance_fees: true,
    rep_professional_designations: ['AAMS', 'CRPC'],
    averageRating: 3.9,
    reviewCount: 6,
    verified: true,
    feeOnly: true,
    specializations: ['Insurance Planning', 'Debt Management'],
    certifications: ['AAMS', 'CRPC'],
  },
  {
    id: 'advisor-5',
    crd_number: '56789',
    primary_business_name: 'Northwest Investment Management',
    principal_office_city: 'Vancouver',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 500000000, // $500M
    account_minimum: 1000000, // $1M
    custodians: ['Raymond James', 'Ameriprise'],
    discretionary_authority: true,
    fees: ['Assets Under Management (AUM)', 'Performance-Based'],
    performance_fees: true,
    rep_professional_designations: ['CIMA', 'CPWA'],
    averageRating: 4.7,
    reviewCount: 18,
    verified: true,
    feeOnly: false,
    specializations: ['Wealth Management', 'Investment Management'],
    certifications: ['CIMA', 'CPWA'],
  },
  {
    id: 'advisor-6',
    crd_number: '67890',
    primary_business_name: 'Rainier Wealth Advisors',
    principal_office_city: 'Kent',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 12000000, // $12M
    account_minimum: 75000, // $75K
    custodians: ['Charles Schwab', 'Vanguard'],
    discretionary_authority: true,
    fees: ['Hybrid'],
    performance_fees: false,
    rep_professional_designations: ['CFP', 'RMA'],
    averageRating: 4.3,
    reviewCount: 14,
    verified: false,
    feeOnly: true,
    specializations: ['Tax Planning', 'Estate Planning'],
    certifications: ['CFP', 'RMA'],
  },
  {
    id: 'advisor-7',
    crd_number: '78901',
    primary_business_name: 'Olympic Financial Group',
    principal_office_city: 'Everett',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 35000000, // $35M
    account_minimum: 500000, // $500K
    custodians: ['Fidelity', 'TD Ameritrade'],
    discretionary_authority: false,
    fees: ['Assets Under Management (AUM)', 'Hourly'],
    performance_fees: true,
    rep_professional_designations: ['FRM', 'CEBS'],
    averageRating: 4.1,
    reviewCount: 9,
    verified: true,
    feeOnly: false,
    specializations: ['Retirement Planning', 'Insurance Planning'],
    certifications: ['FRM', 'CEBS'],
  },
  {
    id: 'advisor-8',
    crd_number: '89012',
    primary_business_name: 'Puget Sound Advisory',
    principal_office_city: 'Renton',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 85000000, // $85M
    account_minimum: 150000, // $150K
    custodians: ['Interactive Brokers', 'E*TRADE'],
    discretionary_authority: true,
    fees: ['Project-Based', 'Commission'],
    performance_fees: false,
    rep_professional_designations: ['AEP', 'CAP'],
    averageRating: 4.6,
    reviewCount: 21,
    verified: true,
    feeOnly: true,
    specializations: ['Education Planning', 'Wealth Management'],
    certifications: ['AEP', 'CAP'],
  },
  {
    id: 'advisor-9',
    crd_number: '90123',
    primary_business_name: 'Columbia River Financial',
    principal_office_city: 'Yakima',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 2000000, // $2M
    account_minimum: 10000, // $10K
    custodians: ['LPL Financial', 'Pershing'],
    discretionary_authority: false,
    fees: ['Hourly', 'Retainer'],
    performance_fees: true,
    rep_professional_designations: ['CWS'],
    averageRating: 3.7,
    reviewCount: 4,
    verified: false,
    feeOnly: false,
    specializations: ['Debt Management', 'Tax Planning'],
    certifications: ['CWS'],
  },
  {
    id: 'advisor-10',
    crd_number: '01234',
    primary_business_name: 'Emerald City Advisors',
    principal_office_city: 'Seattle',
    principal_office_state: 'WA',
    '5f2_assets_under_management_total_us_dol': 1200000000, // $1.2B
    account_minimum: 2000000, // $2M
    custodians: ['Raymond James', 'Charles Schwab'],
    discretionary_authority: true,
    fees: ['Assets Under Management (AUM)'],
    performance_fees: true,
    rep_professional_designations: ['CFA', 'CIMA', 'CPWA'],
    averageRating: 4.9,
    reviewCount: 32,
    verified: true,
    feeOnly: false,
    specializations: ['Wealth Management', 'Investment Management', 'Estate Planning'],
    certifications: ['CFA', 'CIMA', 'CPWA'],
  }
];

// Mock service functions
export const mockFilterAdvisors = (filters) => {
  let results = [...mockAdvisorsData];

  // Apply filters
  if (filters.principalOfficeCity) {
    results = results.filter(advisor => 
      advisor.principal_office_city === filters.principalOfficeCity
    );
  }

  if (filters.assetsUnderManagement) {
    const [min, max] = filters.assetsUnderManagement.includes('-') 
      ? filters.assetsUnderManagement.split('-').map(v => v === '+' ? Infinity : parseFloat(v))
      : [parseFloat(filters.assetsUnderManagement.replace('+', '')), Infinity];
    
    results = results.filter(advisor => {
      const aum = advisor['5f2_assets_under_management_total_us_dol'];
      return aum >= min && (max === Infinity || aum < max);
    });
  }

  if (filters.accountMinimum) {
    const [min, max] = filters.accountMinimum.includes('-') 
      ? filters.accountMinimum.split('-').map(v => v === '+' ? Infinity : parseFloat(v))
      : [parseFloat(filters.accountMinimum.replace('+', '')), Infinity];
    
    results = results.filter(advisor => {
      const minimum = advisor.account_minimum;
      return minimum >= min && (max === Infinity || minimum < max);
    });
  }

  if (filters.custodians?.length > 0) {
    results = results.filter(advisor => 
      advisor.custodians.some(custodian => filters.custodians.includes(custodian))
    );
  }

  if (filters.discretionaryAuthority && filters.discretionaryAuthority !== 'both') {
    const hasDiscretionary = filters.discretionaryAuthority === 'true';
    results = results.filter(advisor => 
      advisor.discretionary_authority === hasDiscretionary
    );
  }

  if (filters.fees?.length > 0) {
    results = results.filter(advisor => 
      advisor.fees.some(fee => filters.fees.includes(fee))
    );
  }

  if (filters.performanceFees) {
    results = results.filter(advisor => advisor.performance_fees === true);
  }

  if (filters.professionalDesignations?.length > 0) {
    results = results.filter(advisor => 
      advisor.rep_professional_designations.some(designation => 
        filters.professionalDesignations.includes(designation)
      )
    );
  }

  if (filters.minRating) {
    results = results.filter(advisor => 
      advisor.averageRating >= parseFloat(filters.minRating)
    );
  }

  if (filters.verifiedOnly) {
    results = results.filter(advisor => advisor.verified === true);
  }

  if (filters.feeOnly) {
    results = results.filter(advisor => advisor.feeOnly === true);
  }

  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    results = results.filter(advisor =>
      advisor.primary_business_name.toLowerCase().includes(queryLower) ||
      advisor.specializations.some(spec => spec.toLowerCase().includes(queryLower)) ||
      advisor.certifications.some(cert => cert.toLowerCase().includes(queryLower))
    );
  }

  return results;
};

// Get unique values for filter options
export const getFilterOptions = () => {
  const cities = [...new Set(mockAdvisorsData.map(a => a.principal_office_city))].sort();
  const custodians = [...new Set(mockAdvisorsData.flatMap(a => a.custodians))].sort();
  const fees = [...new Set(mockAdvisorsData.flatMap(a => a.fees))].sort();
  const designations = [...new Set(mockAdvisorsData.flatMap(a => a.rep_professional_designations))].sort();
  
  return {
    cities,
    custodians,
    fees,
    designations,
    aumRanges: [
      { value: '0-10000000', label: 'Under $10M', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] < 10000000).length },
      { value: '10000000-50000000', label: '$10M - $50M', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] >= 10000000 && a['5f2_assets_under_management_total_us_dol'] < 50000000).length },
      { value: '50000000-100000000', label: '$50M - $100M', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] >= 50000000 && a['5f2_assets_under_management_total_us_dol'] < 100000000).length },
      { value: '100000000-500000000', label: '$100M - $500M', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] >= 100000000 && a['5f2_assets_under_management_total_us_dol'] < 500000000).length },
      { value: '500000000-1000000000', label: '$500M - $1B', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] >= 500000000 && a['5f2_assets_under_management_total_us_dol'] < 1000000000).length },
      { value: '1000000000+', label: 'Over $1B', count: mockAdvisorsData.filter(a => a['5f2_assets_under_management_total_us_dol'] >= 1000000000).length }
    ],
    accountMinimumRanges: [
      { value: '0-25000', label: 'Under $25K', count: mockAdvisorsData.filter(a => a.account_minimum < 25000).length },
      { value: '25000-100000', label: '$25K - $100K', count: mockAdvisorsData.filter(a => a.account_minimum >= 25000 && a.account_minimum < 100000).length },
      { value: '100000-250000', label: '$100K - $250K', count: mockAdvisorsData.filter(a => a.account_minimum >= 100000 && a.account_minimum < 250000).length },
      { value: '250000-500000', label: '$250K - $500K', count: mockAdvisorsData.filter(a => a.account_minimum >= 250000 && a.account_minimum < 500000).length },
      { value: '500000-1000000', label: '$500K - $1M', count: mockAdvisorsData.filter(a => a.account_minimum >= 500000 && a.account_minimum < 1000000).length },
      { value: '1000000+', label: 'Over $1M', count: mockAdvisorsData.filter(a => a.account_minimum >= 1000000).length }
    ]
  };
};
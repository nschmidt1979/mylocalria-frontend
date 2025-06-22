// Utility functions for formatting advisor data

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Not specified';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Not specified';

  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
};

export const formatAssetsUnderManagement = (amount) => {
  if (!amount) return 'Not disclosed';
  return `${formatCurrency(amount)} AUM`;
};

export const formatAccountMinimum = (amount) => {
  if (!amount) return 'No minimum';
  if (amount === 0) return 'No minimum';
  return `${formatCurrency(amount)} minimum`;
};

export const formatProfessionalDesignations = (designations) => {
  if (!designations || !Array.isArray(designations) || designations.length === 0) {
    return 'None listed';
  }
  
  // Sort designations by importance/recognition
  const priorityOrder = ['CFA', 'CFP', 'CPA', 'ChFC', 'CLU', 'CIMA', 'CPWA', 'PFS', 'AAMS', 'CRPC'];
  
  const sorted = designations.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
  
  return sorted.join(', ');
};

export const formatCustodians = (custodians) => {
  if (!custodians || !Array.isArray(custodians) || custodians.length === 0) {
    return 'Not specified';
  }
  
  if (custodians.length === 1) {
    return custodians[0];
  } else if (custodians.length === 2) {
    return custodians.join(' & ');
  } else {
    return `${custodians[0]} & ${custodians.length - 1} others`;
  }
};

export const formatFeeStructure = (fees) => {
  if (!fees || !Array.isArray(fees) || fees.length === 0) {
    return 'Fee structure not disclosed';
  }
  
  // Abbreviate common fee types for display
  const feeMap = {
    'Assets Under Management (AUM)': 'AUM-based',
    'Hourly': 'Hourly',
    'Project-Based': 'Project-based',
    'Retainer': 'Retainer',
    'Commission': 'Commission',
    'Hybrid': 'Hybrid',
    'Performance-Based': 'Performance-based'
  };
  
  const mappedFees = fees.map(fee => feeMap[fee] || fee);
  
  if (mappedFees.length === 1) {
    return mappedFees[0];
  } else if (mappedFees.length === 2) {
    return mappedFees.join(' & ');
  } else {
    return `${mappedFees[0]} & ${mappedFees.length - 1} others`;
  }
};

export const formatDiscretionaryAuthority = (hasDiscretionary) => {
  if (hasDiscretionary === null || hasDiscretionary === undefined) {
    return 'Not specified';
  }
  return hasDiscretionary ? 'Discretionary' : 'Non-Discretionary';
};

export const formatPerformanceFees = (hasPerformanceFees) => {
  if (hasPerformanceFees === null || hasPerformanceFees === undefined) {
    return 'Not specified';
  }
  return hasPerformanceFees ? 'Charges performance fees' : 'No performance fees';
};

export const formatBusinessName = (name) => {
  if (!name) return 'Unnamed Advisor';
  
  // Clean up common business name suffixes for display
  return name
    .replace(/\b(LLC|L\.L\.C\.|Inc\.|Incorporated|Corp\.|Corporation|LLP|L\.L\.P\.)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if formatting fails
};

export const formatAddress = (advisor) => {
  const parts = [];
  
  if (advisor.principal_office_address_1) {
    parts.push(advisor.principal_office_address_1);
  }
  
  if (advisor.principal_office_address_2) {
    parts.push(advisor.principal_office_address_2);
  }
  
  const cityStateZip = [];
  if (advisor.principal_office_city) {
    cityStateZip.push(advisor.principal_office_city);
  }
  if (advisor.principal_office_state) {
    cityStateZip.push(advisor.principal_office_state);
  }
  if (advisor.principal_office_postal_code) {
    cityStateZip.push(advisor.principal_office_postal_code);
  }
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join('\n');
};

export const formatWebsiteUrl = (url) => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

export const getDisplayUrl = (url) => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(formatWebsiteUrl(url));
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '');
  }
};

// Validation functions
export const validateAdvisorData = (advisor) => {
  const issues = [];
  
  if (!advisor.primary_business_name) {
    issues.push('Missing business name');
  }
  
  if (!advisor.principal_office_city || !advisor.principal_office_state) {
    issues.push('Incomplete address information');
  }
  
  if (!advisor['5f2_assets_under_management_total_us_dol']) {
    issues.push('Assets under management not disclosed');
  }
  
  if (!advisor.rep_professional_designations || advisor.rep_professional_designations.length === 0) {
    issues.push('No professional designations listed');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    completeness: Math.max(0, 100 - (issues.length * 20)) // Rough completeness score
  };
};

// Filter helper functions
export const getAUMRange = (amount) => {
  if (!amount || amount <= 0) return 'Not disclosed';
  
  if (amount < 10000000) return 'Under $10M';
  if (amount < 50000000) return '$10M - $50M';
  if (amount < 100000000) return '$50M - $100M';
  if (amount < 500000000) return '$100M - $500M';
  if (amount < 1000000000) return '$500M - $1B';
  return 'Over $1B';
};

export const getAccountMinimumRange = (amount) => {
  if (!amount || amount <= 0) return 'No minimum';
  
  if (amount < 25000) return 'Under $25K';
  if (amount < 100000) return '$25K - $100K';
  if (amount < 250000) return '$100K - $250K';
  if (amount < 500000) return '$250K - $500K';
  if (amount < 1000000) return '$500K - $1M';
  return 'Over $1M';
};
// SEO Utility Functions for MyLocalRIA

// Base site configuration
export const SITE_CONFIG = {
  name: 'MyLocalRIA',
  title: 'MyLocalRIA - Find Your Perfect Financial Advisor',
  description: 'Connect with trusted, fiduciary financial advisors in your area. Read reviews, compare services, and make an informed decision.',
  url: 'https://mylocalria.com',
  defaultImage: 'https://mylocalria.com/og-default-image.jpg',
  twitterHandle: '@MyLocalRIA',
  keywords: [
    'financial advisor',
    'investment advisor', 
    'wealth management',
    'fiduciary',
    'financial planning',
    'RIA',
    'registered investment advisor'
  ]
};

// Text formatting utilities
export const cleanFirmName = (name) => {
  if (!name) return '';
  return name.replace(/,?\s*(llc|inc)\.?$/i, '').trim();
};

export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

export const formatCurrency = (value) => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return '$0';
  return num.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  });
};

export const formatNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString('en-US');
};

// SEO-specific utilities
export const createPageTitle = (title, includeBase = true) => {
  if (!title) return SITE_CONFIG.title;
  return includeBase ? `${title} | ${SITE_CONFIG.name}` : title;
};

export const createCanonicalUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
};

export const createKeywords = (additionalKeywords = []) => {
  return [...SITE_CONFIG.keywords, ...additionalKeywords]
    .filter(Boolean)
    .join(', ');
};

// Structured data generators
export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_CONFIG.name,
  "url": SITE_CONFIG.url,
  "description": SITE_CONFIG.description,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${SITE_CONFIG.url}/directory?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_CONFIG.url}/#organization`,
  "name": SITE_CONFIG.name,
  "url": SITE_CONFIG.url,
  "logo": `${SITE_CONFIG.url}/logo.png`,
  "description": SITE_CONFIG.description,
  "sameAs": [
    "https://twitter.com/MyLocalRIA",
    "https://facebook.com/MyLocalRIA",
    "https://linkedin.com/company/mylocalria"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@mylocalria.com"
  }
});

export const createFinancialServiceSchema = (advisor, stats = {}) => {
  const firmName = cleanFirmName(toTitleCase(advisor.primary_business_name));
  const location = `${toTitleCase(advisor.principal_office_city)}, ${advisor.principal_office_state?.toUpperCase()}`;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": firmName,
    "description": `${firmName} is a financial advisor in ${location} with CRD #${advisor.crd_number}`,
    "url": `${SITE_CONFIG.url}/advisor/${advisor.id}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": advisor.principal_office_address_1,
      "addressLocality": toTitleCase(advisor.principal_office_city),
      "addressRegion": advisor.principal_office_state?.toUpperCase(),
      "postalCode": advisor.principal_office_postal_code,
      "addressCountry": "US"
    },
    "identifier": {
      "@type": "PropertyValue",
      "name": "CRD Number",
      "value": advisor.crd_number
    },
    "serviceType": "Financial Advisory Services",
    "areaServed": {
      "@type": "City",
      "name": toTitleCase(advisor.principal_office_city),
      "containedInPlace": {
        "@type": "State",
        "name": advisor.principal_office_state?.toUpperCase()
      }
    }
  };

  // Add optional fields
  if (advisor.principal_office_telephone_number) {
    schema.telephone = advisor.principal_office_telephone_number;
  }

  if (advisor.website_address) {
    schema.url = advisor.website_address;
  }

  if (stats.totalReviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": stats.averageRating.toFixed(1),
      "reviewCount": stats.totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  if (advisor['5f2_assets_under_management_total_us_dol']) {
    schema.additionalProperty = {
      "@type": "PropertyValue",
      "name": "Assets Under Management",
      "value": formatCurrency(advisor['5f2_assets_under_management_total_us_dol'])
    };
  }

  return schema;
};

export const createBreadcrumbSchema = (breadcrumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": createCanonicalUrl(crumb.url)
  }))
});

export const createCollectionPageSchema = (title, description, advisors, totalResults) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": title,
  "description": description,
  "url": createCanonicalUrl('/directory'),
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": totalResults,
    "itemListElement": advisors.slice(0, 10).map((advisor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "FinancialService",
        "name": cleanFirmName(toTitleCase(advisor.primary_business_name)),
        "url": createCanonicalUrl(`/advisor/${advisor.id}`)
      }
    }))
  }
});

// Page-specific SEO data generators
export const generateLandingPageSEO = () => ({
  title: "Find Your Perfect Financial Advisor",
  description: "Connect with trusted, fiduciary financial advisors in your area. Read verified reviews, compare services, fees, and credentials to make an informed decision.",
  keywords: createKeywords(),
  url: "/",
  type: "website",
  structuredData: createWebsiteSchema(),
  breadcrumbs: [{ name: "Home", url: "/" }]
});

export const generateAdvisorProfileSEO = (advisor, stats = {}) => {
  if (!advisor) return {};

  const firmName = cleanFirmName(toTitleCase(advisor.primary_business_name));
  const location = `${toTitleCase(advisor.principal_office_city)}, ${advisor.principal_office_state?.toUpperCase()}`;
  const title = `${firmName} - Financial Advisor in ${location}`;
  
  let description = `${firmName} is a financial advisor in ${location} with CRD #${advisor.crd_number}.`;
  
  if (advisor['5f2_assets_under_management_total_us_dol']) {
    description += ` Managing ${formatCurrency(advisor['5f2_assets_under_management_total_us_dol'])} in assets.`;
  }
  
  if (stats.totalReviews > 0) {
    description += ` Rated ${stats.averageRating.toFixed(1)}/5 stars from ${stats.totalReviews} reviews.`;
  }
  
  description += ' Contact for financial planning and investment management services.';

  const keywords = createKeywords([
    advisor.principal_office_city?.toLowerCase(),
    advisor.principal_office_state?.toLowerCase(),
    `financial advisor ${advisor.principal_office_city?.toLowerCase()}`,
    `investment advisor ${advisor.principal_office_state?.toLowerCase()}`
  ]);

  return {
    title,
    description,
    keywords,
    url: `/advisor/${advisor.id}`,
    type: "article",
    structuredData: createFinancialServiceSchema(advisor, stats),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Directory", url: "/directory" },
      { name: firmName, url: `/advisor/${advisor.id}` }
    ]
  };
};

export const generateDirectorySEO = (filters = {}, advisors = [], totalResults = 0) => {
  let title = "Find Financial Advisors";
  let description = "Search and compare trusted financial advisors. Read reviews, compare fees, and find the perfect advisor for your needs.";
  
  if (filters.location) {
    title = `Financial Advisors in ${filters.location}`;
    description = `Find trusted financial advisors in ${filters.location}. Compare services, read reviews, and connect with local investment professionals.`;
  }
  
  if (filters.query) {
    title = `${filters.query} - Financial Advisor Search`;
    description = `Search results for "${filters.query}" financial advisors. Compare credentials, services, and client reviews.`;
  }

  const keywords = createKeywords([
    'financial advisor directory',
    'find financial advisor',
    'investment advisor search',
    filters.location && `financial advisor ${filters.location}`,
    filters.query
  ]);

  return {
    title,
    description,
    keywords,
    url: '/directory',
    type: "website",
    structuredData: createCollectionPageSchema(title, description, advisors, totalResults),
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Financial Advisor Directory", url: "/directory" }
    ]
  };
};

// Image alt text generators
export const generateImageAlt = (type, data = {}) => {
  switch (type) {
    case 'advisor-logo':
      return `${data.firmName || 'Financial advisor'} company logo`;
    case 'advisor-photo':
      return `Professional photo of ${data.advisorName || 'financial advisor'}`;
    case 'placeholder':
      return 'Placeholder image for financial advisor profile';
    default:
      return 'Image';
  }
};

// URL and link utilities
export const createAdvisorProfileUrl = (advisorId) => `/advisor/${advisorId}`;
export const createDirectoryUrl = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const queryString = params.toString();
  return `/directory${queryString ? `?${queryString}` : ''}`;
};

// Validation utilities
export const validateSEOData = (seoData) => {
  const errors = [];
  
  if (!seoData.title || seoData.title.length < 10) {
    errors.push('Title should be at least 10 characters long');
  }
  
  if (!seoData.description || seoData.description.length < 50) {
    errors.push('Description should be at least 50 characters long');
  }
  
  if (seoData.title && seoData.title.length > 60) {
    errors.push('Title should be under 60 characters for optimal display');
  }
  
  if (seoData.description && seoData.description.length > 160) {
    errors.push('Description should be under 160 characters for optimal display');
  }
  
  return errors;
};
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Generate sitemap for advisor profiles
export const generateAdvisorSitemap = async () => {
  const advisorsRef = collection(db, 'state_adv_part_1_data');
  const advisorsQuery = query(advisorsRef, limit(10000)); // Limit to prevent huge sitemaps
  
  try {
    const snapshot = await getDocs(advisorsQuery);
    const advisors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${advisors.map(advisor => {
  const lastmod = new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>https://mylocalria.com/advisor/${advisor.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return sitemapXml;
  } catch (error) {
    console.error('Error generating advisor sitemap:', error);
    return null;
  }
};

// Generate main sitemap index
export const generateSitemapIndex = () => {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mylocalria.com/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mylocalria.com/advisor-sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  return sitemapIndex;
};

// Helper function to clean and format URLs
export const createCanonicalUrl = (path) => {
  const baseUrl = 'https://mylocalria.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Generate breadcrumb structured data
export const generateBreadcrumbs = (breadcrumbItems) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": createCanonicalUrl(item.url)
    }))
  };
};

// Generate organization structured data
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mylocalria.com/#organization",
    "name": "MyLocalRIA",
    "url": "https://mylocalria.com",
    "logo": "https://mylocalria.com/logo.png",
    "description": "Find and connect with trusted financial advisors in your area",
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
  };
};
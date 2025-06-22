import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHelmet = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  structuredData,
  canonical,
  noindex = false,
  nofollow = false,
  localBusiness,
  breadcrumbs
}) => {
  const siteTitle = 'MyLocalRIA - Find Your Perfect Financial Advisor';
  const siteDescription = 'Connect with trusted, fiduciary financial advisors in your area. Read reviews, compare services, and make an informed decision.';
  const siteUrl = 'https://mylocalria.com';
  const defaultImage = `${siteUrl}/og-default-image.jpg`;

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const fullDescription = description || siteDescription;
  const fullImage = image || defaultImage;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : fullUrl;

  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="MyLocalRIA" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@MyLocalRIA" />

      {/* Additional Meta Tags */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Local Business Structured Data */}
      {localBusiness && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${siteUrl}/#organization`,
            "name": localBusiness.name,
            "url": siteUrl,
            "address": localBusiness.address,
            "telephone": localBusiness.telephone,
            "email": localBusiness.email,
            "description": localBusiness.description,
            "areaServed": localBusiness.areaServed,
            "priceRange": localBusiness.priceRange,
            "image": localBusiness.image || fullImage
          })}
        </script>
      )}

      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": crumb.name,
              "item": `${siteUrl}${crumb.url}`
            }))
          })}
        </script>
      )}
    </Helmet>
  );
};

SEOHelmet.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  structuredData: PropTypes.object,
  canonical: PropTypes.string,
  noindex: PropTypes.bool,
  nofollow: PropTypes.bool,
  localBusiness: PropTypes.object,
  breadcrumbs: PropTypes.array
};

export default SEOHelmet;
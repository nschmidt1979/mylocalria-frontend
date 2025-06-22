import React, { useState, useEffect } from 'react';
import { validateSEOData } from '../../utils/seoUtils';

const SEOValidator = () => {
  const [validationResults, setValidationResults] = useState([]);
  const [currentPageSEO, setCurrentPageSEO] = useState(null);

  useEffect(() => {
    // Extract current page SEO data
    const extractPageSEO = () => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
      const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
      const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
      const ogDescription = document.querySelector('meta[property="og:description"]')?.content || '';
      const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
      const ogUrl = document.querySelector('meta[property="og:url"]')?.content || '';
      const twitterCard = document.querySelector('meta[name="twitter:card"]')?.content || '';
      const structuredData = [];

      // Extract JSON-LD structured data
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          structuredData.push(data);
        } catch (e) {
          console.error('Invalid JSON-LD:', e);
        }
      });

      return {
        title,
        description,
        keywords,
        canonical,
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        twitterCard,
        structuredData
      };
    };

    const seoData = extractPageSEO();
    setCurrentPageSEO(seoData);

    // Validate SEO data
    const errors = validateSEOData(seoData);
    
    // Additional checks
    const additionalChecks = [];

    // Check for missing alt attributes
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      additionalChecks.push({
        type: 'warning',
        message: `${imagesWithoutAlt.length} images found without alt attributes`
      });
    }

    // Check for multiple H1 tags
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length > 1) {
      additionalChecks.push({
        type: 'warning',
        message: `Multiple H1 tags found (${h1Tags.length}). Consider using only one H1 per page.`
      });
    } else if (h1Tags.length === 0) {
      additionalChecks.push({
        type: 'error',
        message: 'No H1 tag found. Every page should have exactly one H1 tag.'
      });
    }

    // Check for broken internal links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    let brokenLinks = 0;
    internalLinks.forEach(link => {
      // This is a simplified check - in a real implementation, you'd make HTTP requests
      if (link.href.includes('undefined') || link.href.includes('null')) {
        brokenLinks++;
      }
    });
    if (brokenLinks > 0) {
      additionalChecks.push({
        type: 'error',
        message: `${brokenLinks} potentially broken internal links found`
      });
    }

    // Check OpenGraph completeness
    if (!seoData.ogTitle || !seoData.ogDescription || !seoData.ogImage) {
      additionalChecks.push({
        type: 'warning',
        message: 'Incomplete OpenGraph tags. Missing title, description, or image.'
      });
    }

    // Check structured data
    if (structuredData.length === 0) {
      additionalChecks.push({
        type: 'warning',
        message: 'No structured data found on this page.'
      });
    }

    const allResults = [
      ...errors.map(error => ({ type: 'error', message: error })),
      ...additionalChecks
    ];

    setValidationResults(allResults);
  }, []);

  const getStatusColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'error':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">SEO Validator</h2>

      {/* Validation Results */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
          {validationResults.length === 0 ? (
            <div className="flex items-center p-4 bg-green-50 text-green-700 rounded-md">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All SEO checks passed! 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-md ${getStatusColor(result.type)}`}
                >
                  <div className="flex-shrink-0 mr-3">
                    {getStatusIcon(result.type)}
                  </div>
                  <div className="text-sm">{result.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Page SEO Data */}
        {currentPageSEO && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Page SEO Data</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                  {currentPageSEO.title || 'Not set'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Length: {currentPageSEO.title?.length || 0} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                  {currentPageSEO.description || 'Not set'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Length: {currentPageSEO.description?.length || 0} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Keywords</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                  {currentPageSEO.keywords || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border break-all">
                  {currentPageSEO.canonical || 'Not set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">OpenGraph Data</label>
                <div className="bg-white p-2 rounded border text-sm space-y-1">
                  <div><strong>Title:</strong> {currentPageSEO.ogTitle || 'Not set'}</div>
                  <div><strong>Description:</strong> {currentPageSEO.ogDescription || 'Not set'}</div>
                  <div><strong>Image:</strong> {currentPageSEO.ogImage || 'Not set'}</div>
                  <div><strong>URL:</strong> {currentPageSEO.ogUrl || 'Not set'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter Card</label>
                <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                  {currentPageSEO.twitterCard || 'Not set'}
                </p>
              </div>

              {currentPageSEO.structuredData && currentPageSEO.structuredData.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Structured Data</label>
                  <div className="bg-white p-2 rounded border">
                    {currentPageSEO.structuredData.map((data, index) => (
                      <div key={index} className="text-sm mb-2">
                        <strong>Type:</strong> {data['@type'] || 'Unknown'}
                        {data.name && <div><strong>Name:</strong> {data.name}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Tools */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick SEO Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">Google Rich Results Test</h4>
                <p className="text-sm text-gray-600">Test structured data</p>
              </div>
            </a>

            <a
              href="https://developers.facebook.com/tools/debug/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">Facebook Debugger</h4>
                <p className="text-sm text-gray-600">Test OpenGraph tags</p>
              </div>
            </a>

            <a
              href="https://cards-dev.twitter.com/validator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">Twitter Card Validator</h4>
                <p className="text-sm text-gray-600">Test Twitter Cards</p>
              </div>
            </a>

            <a
              href="https://pagespeed.web.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium text-gray-900">PageSpeed Insights</h4>
                <p className="text-sm text-gray-600">Test Core Web Vitals</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOValidator;
import React, { useState } from 'react';
import { generateAdvisorSitemap, generateSitemapIndex } from '../../services/sitemapService';
import LoadingSpinner from '../common/LoadingSpinner';

const SitemapGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapXml, setSitemapXml] = useState('');
  const [sitemapType, setSitemapType] = useState('advisors');
  const [message, setMessage] = useState('');

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      let xml = '';
      
      if (sitemapType === 'advisors') {
        xml = await generateAdvisorSitemap();
      } else if (sitemapType === 'index') {
        xml = generateSitemapIndex();
      }

      if (xml) {
        setSitemapXml(xml);
        setMessage(`${sitemapType === 'index' ? 'Sitemap index' : 'Advisor sitemap'} generated successfully!`);
      } else {
        setMessage('Failed to generate sitemap. Please try again.');
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setMessage('Error generating sitemap. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sitemapType === 'index' ? 'sitemap-index.xml' : 'advisor-sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(sitemapXml).then(() => {
      setMessage('Sitemap copied to clipboard!');
    }).catch(() => {
      setMessage('Failed to copy sitemap to clipboard.');
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sitemap Generator</h2>
      
      <div className="space-y-6">
        {/* Sitemap Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sitemap Type
          </label>
          <select
            value={sitemapType}
            onChange={(e) => setSitemapType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="advisors">Advisor Profiles Sitemap</option>
            <option value="index">Sitemap Index</option>
          </select>
        </div>

        {/* Generate Button */}
        <div>
          <button
            onClick={handleGenerateSitemap}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Generating...
              </>
            ) : (
              'Generate Sitemap'
            )}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Sitemap Preview and Actions */}
        {sitemapXml && (
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={handleDownloadSitemap}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download XML
              </button>
              
              <button
                onClick={handleCopySitemap}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Sitemap XML
              </label>
              <textarea
                value={sitemapXml}
                readOnly
                rows={20}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Select the type of sitemap you want to generate</li>
            <li>Click "Generate Sitemap" to create the XML</li>
            <li>Download the XML file or copy to clipboard</li>
            <li>Upload the sitemap to your website's public directory</li>
            <li>Submit the sitemap URL to Google Search Console</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;
import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const SearchExport = ({ advisors, filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [error, setError] = useState(null);

  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Name',
        'Company',
        'Location',
        'Rating',
        'Review Count',
        'Specializations',
        'Certifications',
        'Fee Structure',
        'Contact Email',
        'Phone',
        'Website',
      ];

      // Prepare CSV rows
      const rows = advisors.map(advisor => [
        advisor.name,
        advisor.company,
        advisor.location,
        advisor.averageRating,
        advisor.reviewCount,
        advisor.specializations?.join('; '),
        advisor.certifications?.join('; '),
        advisor.feeStructure,
        advisor.email,
        advisor.phone,
        advisor.website,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `advisor-search-results-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export CSV file. Please try again.');
      console.error('Export error:', err);
    }
  };

  const exportToJSON = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        filters,
        advisors: advisors.map(advisor => ({
          name: advisor.name,
          company: advisor.company,
          location: advisor.location,
          rating: advisor.averageRating,
          reviewCount: advisor.reviewCount,
          specializations: advisor.specializations,
          certifications: advisor.certifications,
          feeStructure: advisor.feeStructure,
          contact: {
            email: advisor.email,
            phone: advisor.phone,
            website: advisor.website,
          },
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `advisor-search-results-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export JSON file. Please try again.');
      console.error('Export error:', err);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      if (exportFormat === 'csv') {
        await exportToCSV();
      } else if (exportFormat === 'json') {
        await exportToJSON();
      }
    } catch (err) {
      setError('Export failed. Please try again.');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Export Results</h3>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              disabled={isExporting || !advisors.length}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  {exportFormat === 'csv' ? (
                    <TableCellsIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                  )}
                  Export {exportFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="p-6">
        <div className="text-sm text-gray-500">
          <p className="mb-2">
            Export your search results to {exportFormat.toUpperCase()} format. The exported file will include:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Advisor details (name, company, location)</li>
            <li>Ratings and reviews</li>
            <li>Specializations and certifications</li>
            <li>Fee structure</li>
            <li>Contact information</li>
            {exportFormat === 'json' && <li>Search filters used</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchExport; 
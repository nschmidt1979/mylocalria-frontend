import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const SearchResultsExport = ({ advisors, filters, onClose }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState([
    'name',
    'location',
    'specialization',
    'rating',
    'experience',
    'certifications',
    'feeStructure',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const availableFields = [
    { id: 'name', label: 'Name', category: 'Basic Info' },
    { id: 'location', label: 'Location', category: 'Basic Info' },
    { id: 'specialization', label: 'Specialization', category: 'Basic Info' },
    { id: 'rating', label: 'Rating', category: 'Performance' },
    { id: 'experience', label: 'Years of Experience', category: 'Performance' },
    { id: 'certifications', label: 'Certifications', category: 'Performance' },
    { id: 'feeStructure', label: 'Fee Structure', category: 'Financial' },
    { id: 'minFee', label: 'Minimum Fee', category: 'Financial' },
    { id: 'maxFee', label: 'Maximum Fee', category: 'Financial' },
    { id: 'responseTime', label: 'Response Time', category: 'Performance' },
    { id: 'availability', label: 'Availability', category: 'Performance' },
    { id: 'languages', label: 'Languages', category: 'Basic Info' },
    { id: 'education', label: 'Education', category: 'Basic Info' },
    { id: 'firm', label: 'Firm Name', category: 'Basic Info' },
    { id: 'website', label: 'Website', category: 'Contact' },
    { id: 'email', label: 'Email', category: 'Contact' },
    { id: 'phone', label: 'Phone', category: 'Contact' },
    { id: 'address', label: 'Address', category: 'Contact' },
    { id: 'reviews', label: 'Number of Reviews', category: 'Performance' },
    { id: 'lastActive', label: 'Last Active', category: 'Performance' },
  ];

  const fieldCategories = [...new Set(availableFields.map(field => field.category))];

  const handleFieldToggle = (fieldId) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = (category) => {
    const categoryFields = availableFields
      .filter(field => field.category === category)
      .map(field => field.id);
    
    setSelectedFields(prev => {
      const hasAllFields = categoryFields.every(field => prev.includes(field));
      if (hasAllFields) {
        return prev.filter(field => !categoryFields.includes(field));
      } else {
        return [...new Set([...prev, ...categoryFields])];
      }
    });
  };

  const generateCSV = () => {
    const headers = selectedFields.map(fieldId => {
      const field = availableFields.find(f => f.id === fieldId);
      return field ? field.label : fieldId;
    });

    const rows = advisors.map(advisor => {
      return selectedFields.map(fieldId => {
        switch (fieldId) {
          case 'name':
            return `"${advisor.name}"`;
          case 'location':
            return `"${advisor.location}"`;
          case 'specialization':
            return `"${advisor.specialization.join(', ')}"`;
          case 'rating':
            return advisor.averageRating;
          case 'experience':
            return advisor.yearsOfExperience;
          case 'certifications':
            return `"${advisor.certifications.join(', ')}"`;
          case 'feeStructure':
            return `"${advisor.feeStructure}"`;
          case 'minFee':
            return advisor.minFee;
          case 'maxFee':
            return advisor.maxFee;
          case 'responseTime':
            return `"${advisor.responseTime}"`;
          case 'availability':
            return `"${advisor.availability.join(', ')}"`;
          case 'languages':
            return `"${advisor.languages.join(', ')}"`;
          case 'education':
            return `"${advisor.education.join(', ')}"`;
          case 'firm':
            return `"${advisor.firm}"`;
          case 'website':
            return `"${advisor.website}"`;
          case 'email':
            return `"${advisor.email}"`;
          case 'phone':
            return `"${advisor.phone}"`;
          case 'address':
            return `"${advisor.address}"`;
          case 'reviews':
            return advisor.reviewCount;
          case 'lastActive':
            return `"${new Date(advisor.lastActive).toLocaleDateString()}"`;
          default:
            return '';
        }
      });
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generatePDF = async () => {
    // In a real implementation, this would use a PDF generation library
    // For now, we'll just return a message
    return 'PDF generation would be implemented here';
  };

  const generateExcel = async () => {
    // In a real implementation, this would use an Excel generation library
    // For now, we'll just return a message
    return 'Excel generation would be implemented here';
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let content;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case 'csv':
          content = generateCSV();
          filename = 'advisor_search_results.csv';
          mimeType = 'text/csv';
          break;
        case 'pdf':
          content = await generatePDF();
          filename = 'advisor_search_results.pdf';
          mimeType = 'application/pdf';
          break;
        case 'excel':
          content = await generateExcel();
          filename = 'advisor_search_results.xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      setError('Failed to export search results');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Export Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-5 sm:px-6">
        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Export Format
          </label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                exportFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              CSV
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                exportFormat === 'pdf'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              PDF
            </button>
            <button
              onClick={() => setExportFormat('excel')}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                exportFormat === 'excel'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TableCellsIcon className="h-5 w-5 mr-2" />
              Excel
            </button>
          </div>
        </div>

        {/* Field Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Fields to Export
          </label>
          <div className="space-y-4">
            {fieldCategories.map(category => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{category}</h3>
                  <button
                    onClick={() => handleSelectAll(category)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {availableFields
                      .filter(field => field.category === category)
                      .every(field => selectedFields.includes(field.id))
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableFields
                    .filter(field => field.category === category)
                    .map(field => (
                      <label
                        key={field.id}
                        className="inline-flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={loading || selectedFields.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading || selectedFields.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Results
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Search results exported successfully!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsExport; 
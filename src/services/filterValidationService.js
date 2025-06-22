// Filter validation and error handling service

export class FilterValidationError extends Error {
  constructor(message, field, code) {
    super(message);
    this.name = 'FilterValidationError';
    this.field = field;
    this.code = code;
  }
}

export class FirebaseQueryError extends Error {
  constructor(message, queryInfo, originalError) {
    super(message);
    this.name = 'FirebaseQueryError';
    this.queryInfo = queryInfo;
    this.originalError = originalError;
  }
}

// Validation rules for each filter field
const VALIDATION_RULES = {
  principalOfficeCity: {
    required: false,
    type: 'string',
    maxLength: 100,
    allowedValues: null // Any string is allowed
  },
  assetsUnderManagement: {
    required: false,
    type: 'string',
    pattern: /^(\d+(-\d+)?|\d+\+)$/,
    allowedValues: [
      '0-10000000',
      '10000000-50000000', 
      '50000000-100000000',
      '100000000-500000000',
      '500000000-1000000000',
      '1000000000+'
    ]
  },
  accountMinimum: {
    required: false,
    type: 'string',
    pattern: /^(\d+(-\d+)?|\d+\+)$/,
    allowedValues: [
      '0-25000',
      '25000-100000',
      '100000-250000', 
      '250000-500000',
      '500000-1000000',
      '1000000+'
    ]
  },
  custodians: {
    required: false,
    type: 'array',
    maxItems: 10,
    itemType: 'string',
    allowedValues: [
      'Charles Schwab',
      'Fidelity',
      'TD Ameritrade',
      'E*TRADE',
      'Interactive Brokers',
      'Vanguard',
      'Pershing',
      'LPL Financial',
      'Raymond James',
      'Ameriprise'
    ]
  },
  discretionaryAuthority: {
    required: false,
    type: 'string',
    allowedValues: ['true', 'false', 'both']
  },
  fees: {
    required: false,
    type: 'array',
    maxItems: 10,
    itemType: 'string',
    allowedValues: [
      'Assets Under Management (AUM)',
      'Hourly',
      'Project-Based',
      'Retainer',
      'Commission',
      'Hybrid'
    ]
  },
  performanceFees: {
    required: false,
    type: 'boolean'
  },
  professionalDesignations: {
    required: false,
    type: 'array',
    maxItems: 20,
    itemType: 'string',
    allowedValues: [
      'CFA', 'CFP', 'ChFC', 'CLU', 'CPA', 'PFS', 'AAMS', 'CRPC',
      'CIMA', 'CPWA', 'RMA', 'FRM', 'CEBS', 'AEP', 'CAP', 'CWS'
    ]
  }
};

// Firebase query complexity limits
const QUERY_LIMITS = {
  maxWhereClauuses: 10,
  maxArrayContainsAny: 10,
  maxRangeQueries: 1, // Firebase limitation
  maxOrderByFields: 2
};

class FilterValidationService {
  constructor() {
    this.validationErrors = [];
    this.warnings = [];
  }

  // Validate individual filter values
  validateFilter(filterName, value) {
    const rule = VALIDATION_RULES[filterName];
    if (!rule) {
      throw new FilterValidationError(
        `Unknown filter: ${filterName}`,
        filterName,
        'UNKNOWN_FILTER'
      );
    }

    // Check if value is provided when required
    if (rule.required && (value === null || value === undefined || value === '')) {
      throw new FilterValidationError(
        `${filterName} is required`,
        filterName,
        'REQUIRED_FIELD'
      );
    }

    // Skip validation if value is empty and not required
    if (!value && !rule.required) {
      return true;
    }

    // Type validation
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new FilterValidationError(
            `${filterName} must be a string`,
            filterName,
            'INVALID_TYPE'
          );
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          throw new FilterValidationError(
            `${filterName} exceeds maximum length of ${rule.maxLength}`,
            filterName,
            'MAX_LENGTH_EXCEEDED'
          );
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          throw new FilterValidationError(
            `${filterName} has invalid format`,
            filterName,
            'INVALID_FORMAT'
          );
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          throw new FilterValidationError(
            `${filterName} must be an array`,
            filterName,
            'INVALID_TYPE'
          );
        }
        if (rule.maxItems && value.length > rule.maxItems) {
          throw new FilterValidationError(
            `${filterName} exceeds maximum items of ${rule.maxItems}`,
            filterName,
            'MAX_ITEMS_EXCEEDED'
          );
        }
        if (rule.itemType) {
          for (const item of value) {
            if (typeof item !== rule.itemType) {
              throw new FilterValidationError(
                `${filterName} items must be of type ${rule.itemType}`,
                filterName,
                'INVALID_ITEM_TYPE'
              );
            }
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new FilterValidationError(
            `${filterName} must be a boolean`,
            filterName,
            'INVALID_TYPE'
          );
        }
        break;
    }

    // Allowed values validation
    if (rule.allowedValues) {
      if (rule.type === 'array') {
        const invalidItems = value.filter(item => !rule.allowedValues.includes(item));
        if (invalidItems.length > 0) {
          throw new FilterValidationError(
            `${filterName} contains invalid values: ${invalidItems.join(', ')}`,
            filterName,
            'INVALID_VALUES'
          );
        }
      } else {
        if (!rule.allowedValues.includes(value)) {
          throw new FilterValidationError(
            `${filterName} has invalid value: ${value}`,
            filterName,
            'INVALID_VALUE'
          );
        }
      }
    }

    return true;
  }

  // Validate all filters in a filter object
  validateFilters(filters) {
    this.validationErrors = [];
    this.warnings = [];

    for (const [filterName, value] of Object.entries(filters)) {
      // Skip null, undefined, empty strings, and empty arrays
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        continue;
      }

      try {
        this.validateFilter(filterName, value);
      } catch (error) {
        if (error instanceof FilterValidationError) {
          this.validationErrors.push(error);
        } else {
          this.validationErrors.push(new FilterValidationError(
            `Unexpected validation error for ${filterName}: ${error.message}`,
            filterName,
            'UNEXPECTED_ERROR'
          ));
        }
      }
    }

    return {
      isValid: this.validationErrors.length === 0,
      errors: this.validationErrors,
      warnings: this.warnings
    };
  }

  // Validate Firebase query complexity
  validateQueryComplexity(filters) {
    let whereClauseCount = 0;
    let arrayContainsAnyCount = 0;
    let rangeQueryCount = 0;

    for (const [filterName, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        continue;
      }

      whereClauseCount++;

      // Count array-contains-any queries
      if (['custodians', 'fees', 'professionalDesignations'].includes(filterName)) {
        arrayContainsAnyCount++;
      }

      // Count range queries (Firebase allows only one per query)
      if (['assetsUnderManagement', 'accountMinimum'].includes(filterName)) {
        rangeQueryCount++;
      }
    }

    const complexityIssues = [];

    if (whereClauseCount > QUERY_LIMITS.maxWhereClauuses) {
      complexityIssues.push(`Too many filter conditions (${whereClauseCount}/${QUERY_LIMITS.maxWhereClauuses})`);
    }

    if (arrayContainsAnyCount > QUERY_LIMITS.maxArrayContainsAny) {
      complexityIssues.push(`Too many array-contains-any queries (${arrayContainsAnyCount}/${QUERY_LIMITS.maxArrayContainsAny})`);
    }

    if (rangeQueryCount > QUERY_LIMITS.maxRangeQueries) {
      complexityIssues.push(`Too many range queries (${rangeQueryCount}/${QUERY_LIMITS.maxRangeQueries}). Consider using only one range filter at a time.`);
    }

    return {
      isValid: complexityIssues.length === 0,
      issues: complexityIssues,
      metrics: {
        whereClauseCount,
        arrayContainsAnyCount,
        rangeQueryCount
      }
    };
  }

  // Optimize filter order for Firebase performance
  optimizeFilterOrder(filters) {
    const optimizedFilters = {};
    
    // Process in order of selectivity (most selective first)
    const filterOrder = [
      'principalOfficeCity', // Usually very selective
      'assetsUnderManagement', // Numeric range, good selectivity
      'accountMinimum', // Numeric range, good selectivity  
      'discretionaryAuthority', // Boolean, moderate selectivity
      'performanceFees', // Boolean, moderate selectivity
      'professionalDesignations', // Array, variable selectivity
      'custodians', // Array, moderate selectivity
      'fees' // Array, lower selectivity
    ];

    for (const filterName of filterOrder) {
      if (filters[filterName] !== null && filters[filterName] !== undefined && 
          filters[filterName] !== '' && 
          !(Array.isArray(filters[filterName]) && filters[filterName].length === 0)) {
        optimizedFilters[filterName] = filters[filterName];
      }
    }

    return optimizedFilters;
  }

  // Generate user-friendly error messages
  getErrorMessages() {
    return this.validationErrors.map(error => ({
      field: error.field,
      message: this.getUserFriendlyMessage(error),
      code: error.code
    }));
  }

  getUserFriendlyMessage(error) {
    const fieldLabels = {
      principalOfficeCity: 'Principal Office City',
      assetsUnderManagement: 'Assets Under Management',
      accountMinimum: 'Account Minimum',
      custodians: 'Custodians',
      discretionaryAuthority: 'Investment Authority Type',
      fees: 'Fee Structure',
      performanceFees: 'Performance Fees',
      professionalDesignations: 'Professional Designations'
    };

    const fieldLabel = fieldLabels[error.field] || error.field;

    switch (error.code) {
      case 'REQUIRED_FIELD':
        return `${fieldLabel} is required.`;
      case 'INVALID_TYPE':
        return `${fieldLabel} has an invalid format.`;
      case 'INVALID_VALUE':
      case 'INVALID_VALUES':
        return `Please select a valid option for ${fieldLabel}.`;
      case 'MAX_LENGTH_EXCEEDED':
        return `${fieldLabel} is too long.`;
      case 'MAX_ITEMS_EXCEEDED':
        return `Too many options selected for ${fieldLabel}.`;
      case 'INVALID_FORMAT':
        return `${fieldLabel} format is not valid.`;
      default:
        return error.message;
    }
  }

  // Performance monitoring
  measureQueryPerformance(startTime, endTime, resultCount, filters) {
    const duration = endTime - startTime;
    const activeFilters = Object.keys(filters).filter(key => 
      filters[key] !== null && filters[key] !== undefined && 
      filters[key] !== '' && !(Array.isArray(filters[key]) && filters[key].length === 0)
    ).length;

    return {
      duration,
      resultCount,
      activeFilters,
      avgTimePerResult: resultCount > 0 ? duration / resultCount : 0,
      isSlowQuery: duration > 2000, // Consider > 2s as slow
      metrics: {
        timestamp: new Date().toISOString(),
        filters: Object.keys(filters),
        complexityScore: activeFilters * 10 + (resultCount > 100 ? 50 : 0)
      }
    };
  }
}

// Singleton instance
export const filterValidationService = new FilterValidationService();

// Helper functions for common validations
export const isValidCityName = (city) => {
  return typeof city === 'string' && city.length > 0 && city.length <= 100;
};

export const isValidAUMRange = (range) => {
  const validRanges = ['0-10000000', '10000000-50000000', '50000000-100000000', 
                       '100000000-500000000', '500000000-1000000000', '1000000000+'];
  return validRanges.includes(range);
};

export const isValidAccountMinimumRange = (range) => {
  const validRanges = ['0-25000', '25000-100000', '100000-250000', 
                       '250000-500000', '500000-1000000', '1000000+'];
  return validRanges.includes(range);
};

export const sanitizeFilterValue = (value, filterType) => {
  if (value === null || value === undefined) return null;
  
  switch (filterType) {
    case 'string':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    case 'array':
      return Array.isArray(value) ? value.filter(item => item !== null && item !== undefined && item !== '') : [];
    case 'boolean':
      return Boolean(value);
    default:
      return value;
  }
};

export { FilterValidationService };
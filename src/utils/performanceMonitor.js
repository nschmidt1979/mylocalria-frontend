/**
 * Performance Monitoring Utility for Firebase/Firestore Operations
 * Tracks query performance, costs, and provides optimization insights
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.queryHistory = [];
    this.maxHistorySize = 1000;
    this.enabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  /**
   * Start timing a Firestore operation
   * @param {string} operationType - Type of operation (read, write, query)
   * @param {string} collection - Collection name
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Timer object
   */
  startTimer(operationType, collection, metadata = {}) {
    if (!this.enabled) return { end: () => {} };

    const startTime = performance.now();
    const id = `${operationType}_${collection}_${Date.now()}_${Math.random()}`;

    return {
      id,
      end: (documentCount = 0, error = null) => {
        this.endTimer(id, {
          operationType,
          collection,
          metadata,
          startTime,
          documentCount,
          error
        });
      }
    };
  }

  /**
   * End timing and record metrics
   * @param {string} id - Timer ID
   * @param {Object} data - Operation data
   */
  endTimer(id, data) {
    if (!this.enabled) return;

    const endTime = performance.now();
    const duration = endTime - data.startTime;

    const metric = {
      id,
      operationType: data.operationType,
      collection: data.collection,
      duration,
      documentCount: data.documentCount,
      startTime: new Date(Date.now() - duration),
      endTime: new Date(),
      error: data.error,
      metadata: data.metadata,
      cost: this.estimateCost(data.operationType, data.documentCount),
      performance: this.categorizePerformance(duration, data.operationType),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.recordMetric(metric);
    this.logMetric(metric);
  }

  /**
   * Record metric in memory
   * @param {Object} metric - Metric data
   */
  recordMetric(metric) {
    // Add to history
    this.queryHistory.unshift(metric);
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.pop();
    }

    // Update aggregated metrics
    const key = `${metric.operationType}_${metric.collection}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        count: 0,
        totalDuration: 0,
        totalDocuments: 0,
        totalCost: 0,
        errors: 0,
        lastExecuted: null
      });
    }

    const stats = this.metrics.get(key);
    stats.count++;
    stats.totalDuration += metric.duration;
    stats.totalDocuments += metric.documentCount;
    stats.totalCost += metric.cost;
    stats.lastExecuted = metric.endTime;
    if (metric.error) stats.errors++;
  }

  /**
   * Log metric to console in development
   * @param {Object} metric - Metric data
   */
  logMetric(metric) {
    if (process.env.NODE_ENV !== 'development') return;

    const color = metric.error ? 'red' : metric.performance === 'slow' ? 'orange' : 'green';
    
    console.groupCollapsed(
      `%c🔥 Firestore ${metric.operationType} - ${metric.collection} (${metric.duration.toFixed(2)}ms)`,
      `color: ${color}; font-weight: bold;`
    );
    
    console.log('Duration:', `${metric.duration.toFixed(2)}ms`);
    console.log('Documents:', metric.documentCount);
    console.log('Estimated Cost:', `$${metric.cost.toFixed(6)}`);
    console.log('Performance:', metric.performance);
    
    if (metric.error) {
      console.error('Error:', metric.error);
    }
    
    if (metric.metadata && Object.keys(metric.metadata).length > 0) {
      console.log('Metadata:', metric.metadata);
    }
    
    // Performance warnings
    if (metric.performance === 'slow') {
      console.warn('⚠️ Slow query detected. Consider optimization.');
    }
    
    if (metric.documentCount > 100) {
      console.warn('⚠️ Large result set. Consider pagination.');
    }
    
    console.groupEnd();
  }

  /**
   * Estimate cost of Firestore operation
   * @param {string} operationType - Operation type
   * @param {number} documentCount - Number of documents
   * @returns {number} Estimated cost in USD
   */
  estimateCost(operationType, documentCount) {
    // Firestore pricing (as of 2024)
    const pricing = {
      read: 0.00000036,    // $0.36 per 100,000 reads
      write: 0.0000018,    // $1.80 per 100,000 writes
      delete: 0.0000018,   // $1.80 per 100,000 deletes
    };

    const baseOperation = operationType.toLowerCase();
    let rate = 0;

    if (baseOperation.includes('read') || baseOperation.includes('get') || baseOperation.includes('query')) {
      rate = pricing.read;
    } else if (baseOperation.includes('write') || baseOperation.includes('set') || baseOperation.includes('add') || baseOperation.includes('update')) {
      rate = pricing.write;
    } else if (baseOperation.includes('delete')) {
      rate = pricing.delete;
    }

    return rate * Math.max(documentCount, 1); // Minimum 1 operation
  }

  /**
   * Categorize performance
   * @param {number} duration - Duration in milliseconds
   * @param {string} operationType - Operation type
   * @returns {string} Performance category
   */
  categorizePerformance(duration, operationType) {
    const thresholds = {
      read: { fast: 100, slow: 500 },
      write: { fast: 200, slow: 1000 },
      query: { fast: 200, slow: 800 }
    };

    const category = operationType.toLowerCase().includes('write') ? 'write' :
                    operationType.toLowerCase().includes('query') ? 'query' : 'read';
    
    const threshold = thresholds[category];
    
    if (duration < threshold.fast) return 'fast';
    if (duration < threshold.slow) return 'medium';
    return 'slow';
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    const summary = {
      totalOperations: this.queryHistory.length,
      totalCost: 0,
      averageDuration: 0,
      operationTypes: {},
      collections: {},
      performance: { fast: 0, medium: 0, slow: 0 },
      errors: 0,
      timeRange: {
        start: null,
        end: null
      }
    };

    if (this.queryHistory.length === 0) return summary;

    // Calculate totals and averages
    let totalDuration = 0;
    const operationCounts = {};
    const collectionCounts = {};

    this.queryHistory.forEach(metric => {
      summary.totalCost += metric.cost;
      totalDuration += metric.duration;
      
      if (metric.error) summary.errors++;
      
      summary.performance[metric.performance]++;
      
      operationCounts[metric.operationType] = (operationCounts[metric.operationType] || 0) + 1;
      collectionCounts[metric.collection] = (collectionCounts[metric.collection] || 0) + 1;
      
      if (!summary.timeRange.start || metric.startTime < summary.timeRange.start) {
        summary.timeRange.start = metric.startTime;
      }
      if (!summary.timeRange.end || metric.endTime > summary.timeRange.end) {
        summary.timeRange.end = metric.endTime;
      }
    });

    summary.averageDuration = totalDuration / this.queryHistory.length;
    summary.operationTypes = operationCounts;
    summary.collections = collectionCounts;

    return summary;
  }

  /**
   * Get optimization recommendations
   * @returns {Array} Array of recommendation objects
   */
  getRecommendations() {
    const recommendations = [];
    const summary = this.getSummary();

    // High cost warning
    if (summary.totalCost > 0.01) {
      recommendations.push({
        type: 'cost',
        priority: 'high',
        message: `High Firestore costs detected ($${summary.totalCost.toFixed(4)}). Consider implementing caching or reducing query frequency.`,
        impact: 'Reduce costs by 30-50%'
      });
    }

    // Slow queries
    if (summary.performance.slow > summary.totalOperations * 0.1) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Multiple slow queries detected. Review query patterns and add appropriate indexes.',
        impact: 'Improve user experience and reduce costs'
      });
    }

    // Large result sets
    const largeQueries = this.queryHistory.filter(m => m.documentCount > 50);
    if (largeQueries.length > 0) {
      recommendations.push({
        type: 'pagination',
        priority: 'medium',
        message: `${largeQueries.length} queries returning large result sets. Implement pagination.`,
        impact: 'Reduce bandwidth and improve performance'
      });
    }

    // Error rate
    if (summary.errors > summary.totalOperations * 0.05) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'High error rate detected. Review error handling and retry logic.',
        impact: 'Improve application reliability'
      });
    }

    // Frequent queries to same collection
    Object.entries(summary.collections).forEach(([collection, count]) => {
      if (count > 20) {
        recommendations.push({
          type: 'caching',
          priority: 'medium',
          message: `Frequent queries to '${collection}' collection (${count} times). Consider caching.`,
          impact: 'Reduce query costs and improve performance'
        });
      }
    });

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.queryHistory = [];
  }

  /**
   * Export metrics data
   * @returns {Object} Exported metrics
   */
  export() {
    return {
      summary: this.getSummary(),
      recommendations: this.getRecommendations(),
      queryHistory: this.queryHistory,
      metrics: Object.fromEntries(this.metrics)
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Wrapper for Firestore read operations
 * @param {Function} operation - Firestore operation
 * @param {string} collection - Collection name
 * @param {Object} metadata - Additional metadata
 * @returns {Promise} Operation result
 */
export const monitorRead = async (operation, collection, metadata = {}) => {
  const timer = performanceMonitor.startTimer('read', collection, metadata);
  
  try {
    const result = await operation();
    const documentCount = result?.docs?.length || (result?.exists ? 1 : 0) || 0;
    timer.end(documentCount);
    return result;
  } catch (error) {
    timer.end(0, error);
    throw error;
  }
};

/**
 * Wrapper for Firestore write operations
 * @param {Function} operation - Firestore operation
 * @param {string} collection - Collection name
 * @param {Object} metadata - Additional metadata
 * @returns {Promise} Operation result
 */
export const monitorWrite = async (operation, collection, metadata = {}) => {
  const timer = performanceMonitor.startTimer('write', collection, metadata);
  
  try {
    const result = await operation();
    timer.end(1);
    return result;
  } catch (error) {
    timer.end(0, error);
    throw error;
  }
};

/**
 * Wrapper for Firestore query operations
 * @param {Function} operation - Firestore operation
 * @param {string} collection - Collection name
 * @param {Object} metadata - Additional metadata
 * @returns {Promise} Operation result
 */
export const monitorQuery = async (operation, collection, metadata = {}) => {
  const timer = performanceMonitor.startTimer('query', collection, metadata);
  
  try {
    const result = await operation();
    const documentCount = result?.docs?.length || 0;
    timer.end(documentCount);
    return result;
  } catch (error) {
    timer.end(0, error);
    throw error;
  }
};

export default performanceMonitor;
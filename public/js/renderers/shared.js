/**
 * Shared UI Components and Utilities
 *
 * This module provides common UI components and utilities used across the Cardano Explorer:
 * - SVG icons for UI elements
 * - Reusable UI components (detail rows, hash elements, error messages)
 * - Loading state components
 * - Formatting utilities (re-exported from utils.js)
 *
 * @module renderers/shared
 */

// Constants
export const SVG_ICONS = {
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`,
  rightArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 18l6-6-6-6"/>
  </svg>`,
  leftArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M15 18l-6-6 6-6"/>
  </svg>`,
  checkmark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 6L9 17l-5-5"/>
  </svg>`,
};

// Import formatting utilities
import { formatAda, formatDate } from '../utils.js';

/**
 * Renders a detail row with label and value
 * @param {string} label - Label text
 * @param {string} value - Value text or HTML content
 * @returns {string} HTML string for detail row
 */
export const renderDetailRow = (label, value) => `
  <div class="detail-row">
    <span class="detail-label">${label}</span>
    <span class="detail-value">${value}</span>
  </div>
`;

/**
 * Creates a hash element with label and copy functionality
 * @param {string} hash - Hash value
 * @param {string} label - Label text
 * @returns {string} HTML string for hash element with copy button
 */
export const createHashElement = (hash, label) => `
  <div class="hash-container">
    <span class="hash-label">${label}</span>
    <div class="hash-value" title="${hash}">${hash}</div>
    <button class="copy-btn" data-hash="${hash}" title="Copy ${label}">${SVG_ICONS.copy}</button>
  </div>
`;

/**
 * Renders an error message with optional details and retry button
 * @param {string} message - The error message
 * @param {string} [details=''] - Optional error details
 * @returns {string} HTML string for error message
 */
export const renderError = (message, details = '') => `
  <div class="error-container" role="alert">
    <div class="error-icon">⚠️</div>
    <div class="error-content">
      <h3 class="error-title">${message}</h3>
      ${details ? `<p class="error-details">${details}</p>` : ''}
      <button class="retry-btn" onclick="window.location.reload()">
        Try Again
      </button>
    </div>
  </div>
`;

/**
 * Renders a loading spinner with customizable message
 * @param {string} [message='Loading...'] - Loading message to display
 * @returns {string} HTML string for loading state
 */
export const renderLoading = (message = 'Loading...') => `
  <div class="loading" role="status">
    <div class="spinner"></div>
    <span>${message}</span>
  </div>
`;

// Re-export formatting utilities
export { formatAda, formatDate };

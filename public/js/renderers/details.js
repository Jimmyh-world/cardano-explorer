/**
 * Details Renderer
 *
 * Manages the display of detailed blockchain information:
 * - Block summaries and transactions
 * - Transaction details and I/O
 * - Asset information
 * - Navigation elements
 * - Loading and error states
 *
 * @module renderers/details
 */

import { formatDate, formatAda } from '../utils.js';

const SVG_ICONS = {
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

// Common UI Elements
const createHashElement = (hash, label) => `
  <div class="hash-container">
    <span class="hash-label">${label}</span>
    <div class="hash-value-container">
      <span class="hash-value" title="${hash}">${hash}</span>
      <button class="copy-btn" data-hash="${hash}" title="Copy ${label}">${SVG_ICONS.copy}</button>
    </div>
  </div>
`;

const renderDetailRow = (label, value) => `
  <div class="detail-row">
    <span class="detail-label">${label}</span>
    <span class="detail-value">${value}</span>
  </div>
`;

// Transaction Rendering
const renderTransactionList = (transactions) => {
  if (!transactions?.length)
    return '<div class="no-data">No transactions in this block</div>';

  const transactionItems = transactions
    .map(
      (tx) => `
    <div class="transaction-item" data-tx-hash="${tx.hash}">
      ${createHashElement(tx.hash, 'Transaction Hash')}
      <div class="transaction-details">
        ${renderDetailRow('Time', formatDate(tx.block_time))}
        ${renderDetailRow('Input/Output Count', `${tx.inputs}/${tx.outputs}`)}
        ${renderDetailRow('Total Output', `${formatAda(tx.output_amount)} ₳`)}
        ${renderDetailRow('Fees', `${formatAda(tx.fees)} ₳`)}
      </div>
      <button class="view-tx-btn action-btn" data-tx-hash="${tx.hash}">
        View Details ${SVG_ICONS.rightArrow}
      </button>
    </div>
  `
    )
    .join('');

  return `
    <div class="transaction-list">
      <h3 class="section-title">Transactions (${transactions.length})</h3>
      ${transactionItems}
    </div>
  `;
};

// Block Rendering
const renderBlockSummary = (block) => `
  <div class="block-summary">
    ${renderDetailRow('Block Height', block.height.toLocaleString())}
    ${createHashElement(block.hash, 'Block Hash')}
    ${renderDetailRow('Slot', block.slot.toLocaleString())}
    ${renderDetailRow('Time', formatDate(block.time))}
    ${
      block.tx_count > 0
        ? `<div class="detail-row clickable" id="view-transactions" role="button" tabindex="0">
          <span class="detail-label">Transactions</span>
          <span class="detail-value">${block.tx_count.toLocaleString()} ${
            SVG_ICONS.rightArrow
          }</span>
         </div>`
        : renderDetailRow('Transactions', '0')
    }
    ${renderDetailRow('Size', `${block.size.toLocaleString()} bytes`)}
    ${renderDetailRow('Epoch', block.epoch)}
    ${renderDetailRow('Fees', `${formatAda(block.fees)} ₳`)}
  </div>
`;

// Transaction I/O Rendering
const renderIOItem = (item, index, type) => {
  const isInput = type === 'Inputs';
  const amount = formatAda(item.amount);

  return `
    <div class="io-item">
      <div class="io-item-header">
        <span class="io-index">${index + 1}</span>
        <span class="io-amount">${amount} ₳</span>
      </div>
      <div class="io-item-details">
        ${
          isInput
            ? `
          <div class="io-source">
            <span class="label">From TX:</span>
            <a href="?type=transaction&hash=${item.tx_hash}" class="hash-link">${item.tx_hash}</a>
            <span class="output-index">#${item.output_index}</span>
          </div>`
            : ''
        }
        <div class="io-address">
          <span class="label">Address:</span>
          <a href="?type=address&hash=${item.address}" class="address-link">${
    item.address
  }</a>
        </div>
        ${!isInput && item.assets?.length ? renderAssets(item.assets) : ''}
      </div>
    </div>
  `;
};

const renderAssets = (assets) => `
  <div class="io-assets">
    <span class="label">Assets:</span>
    <div class="asset-list">
      ${assets
        .map(
          (asset) => `
        <div class="asset-item">
          <span class="asset-policy">${asset.unit.slice(0, 56)}</span>
          <span class="asset-name">${asset.unit.slice(56)}</span>
          <span class="asset-amount">${asset.quantity}</span>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
`;

const renderIOSection = (type, items, count, total) => `
  <div class="io-section ${type.toLowerCase()}-section">
    <div class="io-header">
      <h3 class="section-title">${
        SVG_ICONS[type === 'Inputs' ? 'rightArrow' : 'leftArrow']
      } ${type} (${count})</h3>
      <div class="io-total">${formatAda(total)} ₳</div>
    </div>
    <div class="io-list">
      ${items.map((item, index) => renderIOItem(item, index, type)).join('')}
    </div>
  </div>
`;

const renderTransactionIO = (transaction) => `
  <div class="transaction-io">
    ${renderIOSection(
      'Inputs',
      transaction.utxos.inputs,
      transaction.inputs,
      transaction.input_amount
    )}
    ${renderIOSection(
      'Outputs',
      transaction.utxos.outputs,
      transaction.outputs,
      transaction.output_amount
    )}
  </div>
`;

// Main Export Functions
export const renderBlockDetails = (block, transactions = null) => {
  try {
    if (transactions) {
      document.getElementById('contextual-nav').innerHTML = `
        <button class="back-btn action-btn" id="back-to-block">
          ${SVG_ICONS.leftArrow} Back to Block
        </button>
      `;

      return `
        <div class="block-details">
          <div class="block-header">
            <h3 class="section-title">Block #${block.height.toLocaleString()} Transactions</h3>
            ${createHashElement(block.hash, 'Block Hash')}
          </div>
          ${renderTransactionList(transactions)}
        </div>
      `;
    }

    document.getElementById('contextual-nav').innerHTML = '';
    return `
      <div class="block-details">
        <h3 class="section-title">Block Summary</h3>
        ${renderBlockSummary(block)}
      </div>
    `;
  } catch (error) {
    console.error('Error rendering block details:', error);
    return renderError('Failed to render block details');
  }
};

export const renderTransactionDetails = (transaction) => {
  try {
    document.getElementById('contextual-nav').innerHTML = `
      <button class="back-btn action-btn" id="back-to-transactions">
        ${SVG_ICONS.leftArrow} Back to Block
      </button>
    `;

    const totalValue = formatAda(transaction.output_amount);
    const fee = formatAda(transaction.fees);
    const totalWithFees = formatAda(
      (BigInt(transaction.output_amount) + BigInt(transaction.fees)).toString()
    );

    return `
      <div class="transaction-details">
        <div class="transaction-header">
          <h3 class="section-title">Transaction Overview</h3>
          ${createHashElement(transaction.hash, 'Transaction Hash')}
        </div>
        <div class="transaction-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Status</div>
              <div class="summary-value status-confirmed">
                ${SVG_ICONS.checkmark} Confirmed
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Block</div>
              <div class="summary-value">
                <a href="?hash=${
                  transaction.block
                }&type=block" class="hash-link">${transaction.block}</a>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Timestamp</div>
              <div class="summary-value">${formatDate(
                transaction.block_time
              )}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Value</div>
              <div class="summary-value highlight">${totalValue} ₳</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Fee</div>
              <div class="summary-value">${fee} ₳</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Value + Fees</div>
              <div class="summary-value">${totalWithFees} ₳</div>
            </div>
          </div>
        </div>
        ${renderTransactionIO(transaction)}
      </div>
    `;
  } catch (error) {
    console.error('Error rendering transaction details:', error);
    return renderError('Failed to render transaction details');
  }
};

export const renderError = (message) => `
  <div class="error-message">
    ${message}
  </div>
`;

export const renderLoading = () => `
  <div class="loading">
    Loading...
  </div>
`;

export const updateDetailType = (element, block) => {
  if (element && block) {
    element.textContent = `Block #${block.height.toLocaleString()}`;
  }
};

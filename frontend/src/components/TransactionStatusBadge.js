import React from 'react';
import PropTypes from 'prop-types';

/**
 * Visual indicator for transaction status
 * 
 * @param {Object} props - Component properties
 * @param {string} props.status - Current transaction status
 */
const TransactionStatusBadge = ({ status }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`${statusColors[status]} px-3 py-1 rounded-full text-sm`}>
      {status.toUpperCase()}
    </span>
  );
};

TransactionStatusBadge.propTypes = {
  status: PropTypes.oneOf([
    'draft', 'active', 'completed', 'cancelled'
  ]).isRequired
};

export default TransactionStatusBadge;
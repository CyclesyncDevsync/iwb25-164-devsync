import React, { forwardRef } from 'react';
import { USER_ROLES } from '../../constants';

export interface UserRoleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  showAdmin?: boolean;
  showAgent?: boolean;
  error?: string;
}

const UserRoleSelect = forwardRef<HTMLSelectElement, UserRoleSelectProps>(
  ({ showAdmin = false, showAgent = false, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-status-rejected focus:ring-status-rejected/30 focus:border-status-rejected' : ''}
            ${className}`}
          {...props}
        >
          {showAdmin && (
            <option value={USER_ROLES.ADMIN}>Administrator</option>
          )}
          {showAgent && (
            <option value={USER_ROLES.AGENT}>Field Agent</option>
          )}
          <option value={USER_ROLES.SUPPLIER}>Supplier</option>
          <option value={USER_ROLES.BUYER}>Buyer</option>
        </select>
        {error && (
          <p className="mt-1 text-xs text-status-rejected">{error}</p>
        )}
      </div>
    );
  }
);

UserRoleSelect.displayName = 'UserRoleSelect';

export { UserRoleSelect };

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'cases',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate numbered pages with smart ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always include 1
      pages.push(1);

      if (safeCurrentPage > 3) {
        pages.push('...');
      }

      // Middle window
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always include last
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`bg-white px-4 py-3 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs ${className}`}>
      {/* Left: Results Information & Rows per page */}
      <div className="flex flex-wrap items-center gap-3 text-slate-600">
        <div>
          Showing <span className="font-bold text-slate-900">{startItem}</span> to{' '}
          <span className="font-bold text-slate-900">{endItem}</span> of{' '}
          <span className="font-bold text-slate-900">{totalItems}</span> {itemLabel}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              aria-label="Select number of items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center space-x-1" role="navigation" aria-label="Pagination Navigation">
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className={`p-1.5 rounded-lg border transition-colors ${
            safeCurrentPage === 1
              ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
          }`}
          title="First Page"
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className={`p-1.5 rounded-lg border transition-colors ${
            safeCurrentPage === 1
              ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
          }`}
          title="Previous Page"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 select-none">
                  •••
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded-lg font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                } cursor-pointer`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === totalPages}
          className={`p-1.5 rounded-lg border transition-colors ${
            safeCurrentPage === totalPages
              ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
          }`}
          title="Next Page"
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage === totalPages}
          className={`p-1.5 rounded-lg border transition-colors ${
            safeCurrentPage === totalPages
              ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
              : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
          }`}
          title="Last Page"
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

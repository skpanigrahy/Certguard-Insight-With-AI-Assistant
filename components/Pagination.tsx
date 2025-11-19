import React from 'react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-light-text-secondary dark:text-text-secondary">
                Showing <span className="font-medium text-light-text-primary dark:text-text-primary">1</span> to <span className="font-medium text-light-text-primary dark:text-text-primary">{totalItems}</span> of <span className="font-medium text-light-text-primary dark:text-text-primary">{totalItems}</span> results
            </div>
        </div>
    );
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage - halfPagesToShow <= 1) {
        endPage = Math.min(totalPages, maxPagesToShow);
    }

    if (currentPage + halfPagesToShow >= totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
            pageNumbers.push('...');
        }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-light-text-secondary dark:text-text-secondary">
        Showing <span className="font-medium text-light-text-primary dark:text-text-primary">{startItem}</span> to <span className="font-medium text-light-text-primary dark:text-text-primary">{endItem}</span> of <span className="font-medium text-light-text-primary dark:text-text-primary">{totalItems}</span> results
      </div>
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-light-highlight dark:border-highlight bg-light-secondary dark:bg-secondary text-sm font-medium text-light-text-secondary dark:text-text-secondary hover:bg-light-highlight dark:hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pageNumbers.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border border-light-highlight dark:border-highlight text-sm font-medium
                ${page === currentPage ? 'z-10 bg-accent text-white border-accent' : 'bg-light-secondary dark:bg-secondary text-light-text-secondary dark:text-text-secondary hover:bg-light-highlight dark:hover:bg-highlight'}`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="relative inline-flex items-center px-4 py-2 border border-light-highlight dark:border-highlight bg-light-secondary dark:bg-secondary text-sm font-medium text-light-text-secondary dark:text-text-secondary">
              ...
            </span>
          )
        )}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-light-highlight dark:border-highlight bg-light-secondary dark:bg-secondary text-sm font-medium text-light-text-secondary dark:text-text-secondary hover:bg-light-highlight dark:hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
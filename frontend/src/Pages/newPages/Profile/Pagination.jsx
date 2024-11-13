import React, { useState, useRef, useEffect } from 'react';
import './Pagination.css';

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [inputPage, setInputPage] = useState("");
  const popupRef = useRef(null);

  const handleClick = (page) => {
    onPageChange(page);
  };

  const handleEllipsisClick = () => {
    setShowPopup(true);
  };

  const handleGoClick = () => {
    const page = parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
    setShowPopup(false);
    setInputPage("");
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 4;
  
    // Always show the first page
    pageNumbers.push(1);
  
    if (totalPages <= maxVisiblePages) {
      // If total pages are within max visible, show all pages
      for (let i = 2; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
  
    // Calculate start and end dynamically based on currentPage
    const startPage = Math.max(2, currentPage - 2);  // Start from 2 pages before the current page
    const endPage = currentPage >= totalPages - 2 ? totalPages - 1 : currentPage + 2;
  
    // Add ellipsis after the first page if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }
  
    // Add pages from startPage to endPage
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    // Add ellipsis before the last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }
  
    // Always show the last page
    pageNumbers.push(totalPages);
  
    return pageNumbers;
  };
  
  return (
    <div className="pagination">
      <button
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-arrow"
      >
        &laquo;
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" ? handleClick(page) : handleEllipsisClick()}
          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-arrow"
      >
        &raquo;
      </button>

      {/* Popup for entering a page number */}
      {showPopup && (
        <div className="pagination-popup" ref={popupRef}>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder=""
            className="pagination-input"
          />
          <button onClick={handleGoClick} className="pagination-go-button">
            Go
          </button>
          <button onClick={() => setShowPopup(false)} className="pagination-close-button">
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

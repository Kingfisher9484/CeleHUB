import React from 'react';
import './LoadingCard.css'; // Make sure this CSS file exists

const LoadingCard = () => {
  return (
    <div className="loading-card">
      <div className="loading-img shimmer"></div>
      <div className="loading-details">
        <div className="loading-line shimmer short" />
        <div className="loading-line shimmer medium" />
        <div className="loading-line shimmer long" />
      </div>
    </div>
  );
};

export default LoadingCard;
/**import LoadingCard from './LoadingCard';
 * 
function ExamplePage() {
  return (
    <div className="loading-wrapper">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}


{isLoading ? (
  <LoadingCard />
) : (
  <ActualCardComponent />
)}
 */
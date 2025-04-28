import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import './showStar.css';

const ShowStar = ({ eventId }) => {
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchAverage = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'ratings'));
        const eventRatings = querySnapshot.docs
          .filter((doc) => doc.data().eventId === eventId)
          .map((doc) => doc.data().rating);
        
        if (eventRatings.length > 0) {
          const avg = eventRatings.reduce((a, b) => a + b, 0) / eventRatings.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    fetchAverage();
  }, [eventId]);

  const roundedRating = Math.round(avgRating);

  return (
    <div className="show-star-rating">
      <div className="stars">      <p className="show-average-text">{avgRating} / 5</p>
      {[1, 2, 3, 4, 5].map((star) => (<span key={star}className={`star ${star <= roundedRating ? 'filled' : ''}`}>★</span>))}</div>
    </div>
  );
};

export default ShowStar;

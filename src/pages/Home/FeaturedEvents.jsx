import React, { useRef, useEffect, useState } from "react";
import './FeaturedEvents.css';

const FeaturedEvents = () => {
    const scrollRef = useRef(null);
        const [activeIndex, setActiveIndex] = useState(0);
    
        useEffect(() => {
            const handleScroll = () => {
                const scrollX = scrollRef.current.scrollLeft;
                const containerWidth = scrollRef.current.offsetWidth;
                const cardWidth = containerWidth / 3; // Assuming 3 cards visible at a time
                const index = Math.round(scrollX / cardWidth);
                setActiveIndex(index);
            };
    
            const scrollElement = scrollRef.current;
            scrollElement.addEventListener("scroll", handleScroll);
            return () => scrollElement.removeEventListener("scroll", handleScroll);
        }, []);

  return (

    <section className="featured-events">
                 <h2 className="section-title">Explore Our Events</h2>
                 <div className="events-list" ref={scrollRef}>
                     {[
                        "Birthday", "Engagement", "Marriage", "Party", "Anniversary", "Festival", "Lightings", "Way"
                    ].map((event, index) => (
                        <div
                            className={`home-event-card ${activeIndex === index ? "active" : ""}`}
                            key={index}
                        >
                            <img className="home-event-img"
                                src={`/images/${event.toLowerCase()}.jpg`}
                                alt={event}
                            />
                            <div className="featured-event-info">
                            <h3 className="home-event-h3">{event}</h3>
                            <button className="view-btn" onClick={() => window.location.href = '/auth'}>Book Now</button>
            </div>
                            
                        </div>
                    ))}
                </div>
            </section>
  );
};

export default FeaturedEvents;

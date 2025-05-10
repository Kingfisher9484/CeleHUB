import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <h2 className="section-title">Why Choose Us?</h2>
      <div className="features-list">
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h3>Wide Range of Events</h3>
          <p>We offer a variety of events for all occasions, from birthdays to corporate events.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>Expert Planning</h3>
          <p>Our team of professionals ensures a flawless event experience from start to finish.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <h3>Easy Booking & Payment</h3>
          <p>Book your event with just a few clicks and pay securely online through various payment methods.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fas fa-star"></i>
          </div>
          <h3>Customer Satisfaction</h3>
          <p>We pride ourselves on customer satisfaction, with hundreds of happy clients.</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

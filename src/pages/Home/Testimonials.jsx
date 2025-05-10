import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: "Sarah Williams",
    message: "The event we booked was amazing! Everything went smoothly, and our guests had an unforgettable time.",
    rating: 5,
    image: "/images/user1.jpg"
  },
  {
    id: 2,
    name: "John Doe",
    message: "A wonderful experience. I highly recommend this platform for planning your next big event.",
    rating: 4,
    image: "/images/user2.jpg"
  },
  {
    id: 3,
    name: "Emily Davis",
    message: "Great selection of events and fantastic service. Couldn’t have asked for a better experience.",
    rating: 5,
    image: "/images/user3.jpg"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2 className="section-title">What Our Clients Say</h2>
      <div className="testimonials-list">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="testimonial-card">
            <img src={testimonial.image} alt={testimonial.name} className="testimonial-img" />
            <div className="testimonial-content">
              <p className="testimonial-message">"{testimonial.message}"</p>
              <div className="testimonial-footer">
                <h3>{testimonial.name}</h3>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <span key={index} className="star">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;

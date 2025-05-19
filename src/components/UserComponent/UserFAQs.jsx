import React, { useState } from "react";
import "../../components/FAQs.css"; // Style this file as needed

export default function UserFAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "Q) How do I create an account?", answer: "Ans:- To create an account, go to the sign-up page and fill in your details." },
    { question: "Q) How can I reset my password?", answer: "Ans:- Click on 'Forgot Password' on the login page and follow the steps." },
    { question: "Q) What is CeleHub?", answer: "Ans:- CeleHub is a platform connecting fans with celebrities through exclusive content." },
    { question: "Q) How do I contact support?", answer: "Ans:- You can contact support via email at support@celehub.com." },
    { question: "Q) Is CeleHub free to use?", answer: "Ans:- CeleHub offers both free and premium membership plans." },

    // Dashboard related questions
    { question: "Q) How do I update my profile?", answer: "Ans:- Navigate to the dashboard, click on 'Profile' and edit your information." },
    { question: "Q) Can I change my role from user to admin?", answer: "Ans:- Only authorized individuals can be admins. Contact support for role updates." },
    { question: "Q) How can I view my purchase history?", answer: "Ans:- Go to your dashboard and click on 'Purchase History' to see past transactions." },
    { question: "Q) How do I cancel my subscription?", answer: "Ans:- In the dashboard under 'Subscription', select 'Cancel Plan' and follow instructions." },
    { question: "Q) Where do I see notifications?", answer: "Ans:- Notifications are available in the top-right bell icon of your dashboard." }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-h2">Frequently Asked Questions</h2>
      <div className="faq-accordion">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <button
              className={`faq-question ${openIndex === index ? "open" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="arrow">{openIndex === index ? "▲" : "▼"}</span>
            </button>
            <div className={`faq-answer-wrapper ${openIndex === index ? "open" : ""}`}>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

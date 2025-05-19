import React, { useState } from "react";
import "../../components/FAQs.css"; // Same style structure as before

export default function AdminFAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Q) How do I upload a new payment scanner?",
      answer: "Ans:- Navigate to the 'Payment Settings' section in the admin dashboard and use the upload form to add a new scanner image with details."
    },
    {
      question: "Q) Can I update the admin passkey?",
      answer: "Ans:- Yes, go to the 'Security' section and use the passkey update form. Only one global passkey is allowed."
    },
    {
      question: "Q) How do I add or remove offers?",
      answer: "Ans:- In the 'Offers' section, you can create, edit, or delete offers. Offers are auto-deleted after their expiry date."
    },
    {
      question: "Q) How can I manage FAQs?",
      answer: "Ans:- Navigate to the 'FAQs Manager' to add, update, or delete questions shown on the user dashboard."
    },
    {
      question: "Q) How do I monitor user activity?",
      answer: "Ans:- Use the 'Analytics' or 'User Logs' section to view activity data like sign-ins, purchases, and more."
    },
    {
      question: "Q) Can I change user roles (user ↔ admin)?",
      answer: "Ans:- Yes, in the 'Users' tab, select a user and toggle their role using the 'Change Role' option."
    },
    {
      question: "Q) How do I reset a user’s password manually?",
      answer: "Ans:- Find the user in the 'Users' section and use the 'Reset Password' action. The user will receive a reset email."
    },
    {
      question: "Q) How do I view feedback or support requests?",
      answer: "Ans:- Go to the 'Feedback' tab to view user-submitted queries, bug reports, or feature requests."
    },
    {
      question: "Q) Can I manage content uploaded by celebrities?",
      answer: "Ans:- Yes, the 'Celeb Manager' section lets you review and approve or remove uploaded content."
    },
    {
      question: "Q) How do I view revenue reports?",
      answer: "Ans:- Go to the 'Finance' section to see daily, monthly, and custom revenue reports including payment methods used."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-h2">Admin Dashboard FAQs</h2>
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

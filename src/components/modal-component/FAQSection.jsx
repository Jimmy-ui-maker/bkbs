"use client";

import { useState } from "react";

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      q: "What classes does Bright Kingdom British School offer?",
      a: "We provide education from Creche to Basic 6 with a strong emphasis on academics and extracurricular activities and special evening tutorial classes for Common Entrance, Cambridge CheckPoint, JSCE, WASCE & NECO, Jamb and Coding classes.",
    },
    {
      q: "Where is the school located?",
      a: "Our school is located in a serene and accessible area, designed to create a safe learning environment for learners located at Phase 3, Zakoyi-Bmuko-Dutse, FCT Abuja.",
    },
    {
      q: "What is the admission process?",
      a: "Parents can pick up admission forms from the school office or apply online. Entrance assessments are conducted for placement.",
    },
    {
      q: "Do you offer extracurricular activities?",
      a: "Yes, lerners can subscribes to Sports, Music, Arts, STEM, Chess, Keyboard (Piano), Mandarin, Bale dance and leadership programs.",
    },
    {
      q: "What curriculum does the school follow?",
      a: "We combine British and Nigerian curricula to prepare learners for both local and international opportunities.",
    },
    {
      q: "Are there school transportation services?",
      a: "Yes, we provide safe and reliable transportation services for learners across designated routes.",
    },
    {
      q: "Does the school provide lunch?",
      a: "Nutritious meals are available in our cafeteria to promote healthy eating habits.",
    },
    {
      q: "What measures are in place for student safety?",
      a: "We maintain 24/7 security, and strict visitor policies to ensure a safe environment.",
    },
    {
      q: "How can parents communicate with teachers?",
      a: "Parents can reach teachers through scheduled meetings, via emails, or through our parent-portal communication system.",
    },
    {
      q: "How can we contact the school?",
      a: (
        <>
          Phone 1 : <a href="tel:08087258344">08087258344</a> <br />
          Phone 2 : <a href="tel:08137725649">08137725649</a> <br />
          Phone 3 : <a href="tel:07038122394">07038122394</a> <br />
          WhatsApp 1 : <a href="https://wa.me/2347038122394">
            07038122394
          </a>{" "}
          <br />
          WhatsApp 2 : <a href="https://wa.me/2348087258344">
            08087258344
          </a>{" "}
          <br />
          <div className="d-flex justify-content-start">
            <span>Email : </span>
            <a
              href="mailto:brightkingdombritishschool@gmail.com"
              className="text-truncate"
            >
               brightkingdombritishschool@gmail.com
            </a>
          </div>
        </>
      ),
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="mb-5 shadow-sm  py-4 login-card">
      <h2 className="fw-bold text-center mb-4">Frequently Asked Questions</h2>
      <div className="container faq-container ">
        {faqs.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">{item.q}</div>
            {activeIndex === index && (
              <div className="faq-answer">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

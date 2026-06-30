"use client";

import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

interface ContactFormProps {
  minimal?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ minimal = false }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    source: "",
    interest: "",
    message: ""
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        source: "",
        interest: "",
        message: ""
      });
      // Reset form status message
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 1000);
  };

  const sourceOptions = [
    { value: "Social Media", label: "Social Media" },
    { value: "Search Engine", label: "Search Engine (Google, etc.)" },
    { value: "Friend Referral", label: "Friend or Family Referral" },
    { value: "Press Article", label: "News / Press Article" },
    { value: "Other", label: "Other" }
  ];

  const interestOptions = [
    { value: "Yoga Academy (Teacher Training)", label: "Yoga Academy (Teacher Training)" },
    { value: "Yoga Retreats", label: "Yoga Retreats" },
    { value: "Mumbai Studio Classes", label: "Mumbai Studio Classes" },
    { value: "Pre-recorded Online Courses", label: "Pre-recorded Online Courses" },
    { value: "Corporate Wellness Programs", label: "Corporate Wellness Programs" }
  ];

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input 
          id="form-name"
          name="name" 
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Full Name" 
        />
        <Input 
          id="form-phone"
          name="phone" 
          required
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone Number" 
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input 
          id="form-email"
          name="email" 
          type="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address" 
        />
        <Input 
          id="form-subject"
          name="subject" 
          required
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="Subject" 
        />
      </div>

      {/* Select 1 */}
      <Select 
        id="form-source"
        name="source"
        required
        value={formData.source}
        onChange={handleInputChange}
        options={sourceOptions}
        placeholderOption="How did you hear about us?"
      />

      {/* Select 2 */}
      <Select 
        id="form-interest"
        name="interest"
        required
        value={formData.interest}
        onChange={handleInputChange}
        options={interestOptions}
        placeholderOption="I am Interested In?"
      />

      {/* Message */}
      <div className="relative group">
        <textarea 
          name="message" 
          id="form-message"
          required
          rows={4}
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Write a message" 
          className="w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors resize-none placeholder:text-text-muted/60"
        ></textarea>
      </div>

      <div className="text-center pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          variant="primary"
          size="lg"
        >
          {isSubmitting ? "Sending..." : "Submit"}
        </Button>
      </div>
    </form>
  );

  const successMessage = (
    <div className="bg-[#EBF7F7] border border-deep-teal/30 p-8 rounded-lg text-center space-y-4 max-w-xl mx-auto animate-fadeIn">
      <div className="w-16 h-16 bg-deep-teal text-white rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">✓</div>
      <h3 className="font-serif text-2xl font-bold text-deep-teal">Message Sent!</h3>
      <p className="text-text-muted text-[16px]">
        Thank you for reaching out, we appreciate your interest in Yog Love. Our team will get back to you shortly.
      </p>
    </div>
  );

  if (minimal) {
    return formSubmitted ? successMessage : formFields;
  }

  return (
    <section id="contact" className="w-full bg-warm-cream py-20 lg:py-32 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-deep-teal inline-block relative pb-3">
            Contact Us
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-[1.5px] bg-deep-teal"></span>
          </h2>
        </div>
        {formSubmitted ? successMessage : formFields}
      </div>
    </section>
  );
};
export default ContactForm;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { EmailBuilder } from './NewEmail';
import "../style/EmailForm.css";

const EmailForm = ({ API_KEY, emailAddress }) => {
  const [priorityChange, setPriorityChange] = useState(false);
  const [isDraft, setIsDraft] = useState(false); // New state for tracking draft status
  const [formData, setFormData] = useState({
    fromAddress: '',
    subject: '',
    receiverEmail: '',
    toAddress: [],
    body: '',
    attachments: [],
    priority: 'medium',
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const isFormNotEmpty = () => {
    const { subject, receiverEmail, toAddress, body, attachments } = formDataRef.current;
    return (
      subject.length > 0 ||
      receiverEmail.length > 0 ||
      toAddress.length > 0 ||
      body.length > 0 ||
      attachments.length > 0 ||
      priorityChange
    );
  };

  // Handling form submission when the component unmounts
  useEffect(() => {
    return () => {
      if (isFormNotEmpty()) {
        handleSubmit(true); // Call handleSubmit with isDraft true when the form is not empty
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePriorityChange = (e) => {
    setPriorityChange(true);
    setFormData((prevData) => ({
      ...prevData,
      priority: e.target.value,
    }));
  };

  const handleAddRecipient = () => {
    if (formData.receiverEmail.trim() !== '') {
      setFormData((prevData) => ({
        ...prevData,
        toAddress: [...prevData.toAddress, formData.receiverEmail.trim()],
        receiverEmail: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        const fileObject = {
          name: file.name,
          type: file.type,
          size: `${file.size}`,
          content: fileContent,
        };
        setFormData((prevData) => ({
          ...prevData,
          attachments: [...prevData.attachments, fileObject],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteAttachment = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      attachments: prevData.attachments.filter((_, i) => i !== index),
    }));
  };

  const sendEmailToBackend = async (emailData) => {
    try {
      const response = await axios.post('http://localhost:8080/sendEmail', emailData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY.current}`,
        },
      });

      if (response.status === 200) {
        console.log("Email sent successfully!");
      } else {
        console.error("Error sending email");
      }
    } catch (error) {
      console.error("Error during email sending:", error);
      alert('Something went wrong. Please try again later.');
    }
  };

  const handleSubmit = (isDraftSubmit = false) => {
    setIsDraft(isDraftSubmit); // Set draft status before sending

    const emailBuilder = new EmailBuilder();
    const email = emailBuilder
      .setFromAddress(emailAddress.current)
      .setSubject(formData.subject)
      .setBody(formData.body);

    formData.toAddress.forEach((address) => emailBuilder.addToAddress(address));
    formData.attachments.forEach((attachment) => emailBuilder.addAttachment(attachment));
    emailBuilder.setPriority(formData.priority);
    emailBuilder.setIsDraft(isDraftSubmit); // Pass isDraft to EmailBuilder

    const emailObject = emailBuilder.build();
    sendEmailToBackend(emailObject);

    // Reset form data after submission
    setFormData({
      fromAddress: '',
      subject: '',
      receiverEmail: '',
      toAddress: [],
      body: '',
      attachments: [],
      priority: 'medium',
    });
  };

  return (
    <form className="email-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }}>
      <h2>Send Email</h2>
      <div className="form-group">
        <label htmlFor="receiverEmail">Receiver's Email</label>
        <input
          type="email"
          id="receiverEmail"
          name="receiverEmail"
          value={formData.receiverEmail}
          onChange={handleChange}
          placeholder="Enter recipient's email"
        />
        <button type="button" onClick={handleAddRecipient} className="add-recipient-btn">
          Add Recipient
        </button>
        {formData.toAddress.length > 0 && (
          <ul className="recipient-list">
            {formData.toAddress.map((email, index) => (
              <li key={index}>{email}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="subject">Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter subject"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="body">Email Body</label>
        <textarea
          id="body"
          name="body"
          value={formData.body}
          onChange={handleChange}
          placeholder="Enter email body"
          rows="6"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="priority">Email Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handlePriorityChange}
          className={`priority-dropdown ${formData.priority}`}
        >
          <option value="high" className="high-priority">High</option>
          <option value="medium" className="medium-priority">Medium</option>
          <option value="low" className="low-priority">Low</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="attachments">Attachments</label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          onChange={handleFileChange}
          accept="*/*"
          multiple
        />
        {formData.attachments.length > 0 && (
          <ul className="attachment-list">
            {formData.attachments.map((attachment, index) => (
              <li key={index}>
                {attachment.name} 
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(index)}
                  className="delete-attachment-btn"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="submit-btn">
        Send Email
      </button>
    </form>
  );
};

export default EmailForm;

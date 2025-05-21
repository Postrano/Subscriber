"use client";
import React, { useState } from "react";

import emailjs from 'emailjs-com';


export default function BasicPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    tele: "",
    proofOfBusiness: null,
    birNumber: "",
    proofOfTax: null,
    proofOfBAT: null,
    userExcelFile: null,
    receipt: null,
    bankName: "",
    accountName: "",
    referenceNumber: "",
      planType: "",
   numberOfUsers: ""
  });

  const validateStep1 = () => {
    return (
      formData.proofOfBusiness &&
      formData.proofOfTax &&
      formData.proofOfBAT &&
      formData.planType &&
      formData.numberOfUsers > 0
    );
  };
  

  const validateStep2 = () => paymentMethod !== "";

  const validateStep3 = () => {
    if (paymentMethod === "gcash") {
      return formData.receipt !== null;
    } else if (paymentMethod === "bank") {
      return formData.bankName && formData.accountName && formData.referenceNumber;
    }
    return false;
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setStep(3);
  };

  const handleSubmitPayment = () => {
    setPaymentSubmitted(true);
    sendEmail();  // <-- Add this line to send the email
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };


  const totalAmount =
  formData.planType && formData.numberOfUsers
    ? parseInt(formData.planType) * parseInt(formData.numberOfUsers)
    : 0;



    // Your sendEmail function
  const sendEmail = () => {
    if (!formData.email || formData.email.trim() === '') {
      alert('Please enter a valid email address.');
      return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      alert('Please enter a valid email address format.');
      return;
    }
    
    const templateParams = {
      to_name: formData.contactPerson,
      to_email: formData.email,
      company_name: formData.companyName,
      plan_type: formData.planType === "200" ? "Basic - ₱200/user" : "Premium - ₱360/user",
      number_of_users: formData.numberOfUsers,
      total_amount: `₱${totalAmount.toLocaleString()}`,
      logo_url: 'http://localhost:3000/images/ineo.png' // <-- your image path here
    };
    
    emailjs.send(
      'service_df18cj1',        // Service ID
      'template_sr5q1os',       // Template ID
      templateParams,
      '8nV8GppQ82RWajpEo'       // ✅ Public Key
    )
    .then((result) => {
      console.log('Email sent successfully!', result.text);
      alert('Payment confirmation email sent!');
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    });
  };


    

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white py-10 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <img
            src="/images/ineo2.png"
            alt="Logo"
            className="h-16 sm:h-20 border border-black rounded-full"
          />
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Back Button */}
        {!paymentSubmitted && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => {
                if (step === 1) {
                  window.location.href = "/";
                } else {
                  setStep(step - 1);
                }
              }}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              &larr; Back
            </button>
          </div>
        )}

        {/* Payment Submitted Message */}
        {paymentSubmitted ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Payment Submitted Successfully!
            </h2>
            <p>You will receive an email confirming your payment shortly.</p>
          </div>
        ) : (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
                <div className="space-y-4">
                  {[
                    { label: "Company Name", name: "companyName", type: "text" },
                    { label: "Person to Contact", name: "contactPerson", type: "text" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone Number", name: "phone", type: "tel" },
                    { label: "Telephone Number", name: "tele", type: "tel" },
                   
                    {
                      label: "Type of Plan",
                      name: "planType",
                      type: "select",
                      options: [
                        { label: "Basic - ₱200/user", value: "200" },
                        { label: "Premium - ₱360/user", value: "360" }
                      ]
                    },
                    {
                      label: "Number of Users",
                      name: "numberOfUsers",
                      type: "number"
                    }
                    
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block mb-1 font-medium">{field.label}</label>
                      {field.type === "select" ? (
                        <select
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full border px-3 py-2 rounded"
                          required
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full border px-3 py-2 rounded"
                          placeholder={`Enter ${field.label}`}
                          required
                        />
                      )}
                    </div>
                  ))}

              <div>
                <label className="block mb-1 font-medium">Upload User Information </label>

                {/* Download CSV Template as Text Link */}
                

                {/* File Upload Input */}
                <input
                  type="file"
                  name="userCsvFile"
                  onChange={handleFileChange}
                  className="w-full border px-3 py-2 rounded"
                  accept=".csv"
                  required
                />

                <p className="text-sm text-gray-600 mt-1">
                  Format: <strong>fullname, email, department, position</strong><br />
                  <em>Minimum of 5 users required.</em>
                  <a
                  href="/files/USERS INFORMATION(Sheet1).csv"  // Adjusted path for public access
                  download="users-information.csv"     // Forces file download
                  className="text-blue-500 underline cursor-pointer mb-2 inline-block"
                >
                  Download template file
                </a>
                </p>
              </div>


                  <div>
                    <label className="block font-medium">Proof of Business</label>
                    <input
                      type="file"
                      name="proofOfBusiness"
                      onChange={handleFileChange}
                      className="mt-1 border rounded w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Proof of Tax</label>
                    <input
                      type="file"
                      name="proofOfTax"
                      onChange={handleFileChange}
                      className="mt-1 border rounded w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Proof of BAT</label>
                    <input
                      type="file"
                      name="proofOfBAT"
                      onChange={handleFileChange}
                      className="mt-1 border rounded w-full"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className={`mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                    !validateStep1() && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!validateStep1()}
                >
                  Next
                </button>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Payment Method</h2>
                <button
                  onClick={() => handlePaymentSelect("gcash")}
                  className="w-full mb-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                >
                  Pay with GCash
                </button>
                <button
                  onClick={() => handlePaymentSelect("bank")}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded"
                >
                  Pay with Bank Account
                </button>
              </div>
            )}

            {/* Step 3 - GCash */}
            {step === 3 && paymentMethod === "gcash" && (

              
              <div>

              <div className="mb-4 p-4 border rounded bg-gray-50">
                <h3 className="font-semibold mb-2">Payment Summary</h3>
                <p>
                  Plan Type:{" "}
                  {formData.planType === "200" ? "Basic - ₱200/user" : "Premium - ₱360/user"}
                </p>
                <p>Number of Users: {formData.numberOfUsers}</p>
                <p className="font-bold text-lg">
                  Total Amount: ₱{totalAmount.toLocaleString()}
                </p>
              </div>

                <h2 className="text-xl font-semibold mb-4">GCash Payment</h2>
                <p className="mb-2">Scan the QR code below using your GCash app:</p>
                <img
                  src="/gcash_qr.png"
                  alt="GCash QR Code"
                  className="w-64 h-64 mx-auto mb-6 border rounded shadow"
                />
                <div>
                  <label className="block font-medium">Upload Payment Receipt</label>
                  <input
                    type="file"
                    name="receipt"
                    onChange={handleFileChange}
                    className="mt-1 border rounded w-full"
                    required
                  />
                </div>
                <button
                  onClick={handleSubmitPayment}
                  className={`mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                    !validateStep3() && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!validateStep3()}
                >
                  Submit Payment
                </button>
              </div>
            )}

            {/* Step 3 - Bank */}
            {step === 3 && paymentMethod === "bank" && (
              <div>
                <div className="mb-4 p-4 border rounded bg-gray-50">
                  <h3 className="font-semibold mb-2">Payment Summary</h3>
                  <p>
                    Plan Type:{" "}
                    {formData.planType === "200" ? "Basic - ₱200/user" : "Premium - ₱360/user"}
                  </p>
                  <p>Number of Users: {formData.numberOfUsers}</p>
                  <p className="font-bold text-lg">
                    Total Amount: ₱{totalAmount.toLocaleString()}
                  </p>
                </div>

                <h2 className="text-xl font-semibold mb-4">Bank Payment Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="mt-1 border rounded w-full"
                      placeholder="Enter Bank Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Account Name</label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      className="mt-1 border rounded w-full"
                      placeholder="Enter Account Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Reference Number</label>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      className="mt-1 border rounded w-full"
                      placeholder="Enter Reference Number"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitPayment}
                  className={`mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                    !validateStep3() && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!validateStep3()}
                >
                  Submit Payment
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


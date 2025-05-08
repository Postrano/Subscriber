"use client";
import React, { useState } from "react";

export default function BasicPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tele:'',
    birNumber: '',
    proofOfTax: null,
    proofOfBAT: null,
    userExcelFile: null,
  });
  

  // Validate form data for each step
  const validateStep1 = () => {
    return formData.birNumber && formData.proofOfTax && formData.proofOfBAT;
  };

  const validateStep2 = () => {
    return paymentMethod !== "";
  };

  const validateStep3 = () => {
    if (paymentMethod === "gcash") {
      return formData.receipt !== null;
    } else if (paymentMethod === "bank") {
      return (
        formData.bankName &&
        formData.accountName &&
        formData.referenceNumber
      );
    }
    return false;
  };

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setStep(3);
  };

  const handleSubmitPayment = () => {
    setPaymentSubmitted(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white  justify-center  gap-10 py-40 ">
    <div className="max-w-2xl mx-auto p-4 relative border rounded-2xl bg-white text-black border-gray-200 rounded shadow">
      {/* Logo */}
      <div className="flex items-center mb-6">
  <div className="flex-grow border-t border-gray-300"></div>
  <img
    src="/images/ineo2.png"
    alt="Logo"
    className="h-20 border border-black rounded-full mx-4"
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

      {/* Success message when payment is submitted */}
      {paymentSubmitted && (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            Payment Submitted Successfully!
          </h2>
          <p>You will receive an email confirming your payment shortly.</p>
        </div>
      )}

    {/* Step 1: Document upload */}
{step === 1 && !paymentSubmitted && (
  <div>
    <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
    <div className="space-y-4">
      {/* New Fields */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Company Name</label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Company Name"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Person to Contact</label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Contact Person"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Email"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Phone Number"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Telephone Number</label>
        <input
          type="phone number"
          name="tele"
          value={formData.tele}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter Phone Number"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Upload Excel File</label>
        <input
          type="file"
          name="userExcelFile"
          onChange={handleFileChange}
          required
          className="w-full border px-3 py-2 rounded"
          accept=".xls,.xlsx"
        />
        <p className="text-sm text-gray-600 mt-1">
          Upload an Excel file for user accounts. Required format:
          <br />
          <strong>fullname, email, department, position, Minimum of 5 users required.</strong><br />
        </p>
      </div>

      {/* Existing Fields */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">BIR Number</label>
        <input
          type="text"
          name="birNumber"
          value={formData.birNumber}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          placeholder="Enter BIR"
        />
      </div>

      <div>
        <label className="block font-medium">Proof of Tax</label>
        <input
          type="file"
          name="proofOfTax"
          onChange={handleFileChange}
          required
          className="mt-1 border rounded w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Proof of BAT</label>
        <input
          type="file"
          name="proofOfBAT"
          onChange={handleFileChange}
          required
          className="mt-1 border rounded w-full"
        />
      </div>
    </div>

    <button
      onClick={() => setStep(2)}
      className={`mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${!validateStep1() && "opacity-50 cursor-not-allowed"}`}
      disabled={!validateStep1()}
    >
      Next
    </button>
  </div>
)}


      {/* Step 2: Payment method selection */}
      {step === 2 && !paymentSubmitted && (
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

      {/* Step 3: GCash payment details */}
      {step === 3 && paymentMethod === "gcash" && !paymentSubmitted && (
        <div>
          <h2 className="text-xl font-semibold mb-4">GCash Payment</h2>
          <p className="mb-2">
            Scan the QR code below using your GCash app:
          </p>
          <img
            src="/gcash_qr.png"
            alt="GCash QR Code"
            className="w-64 h-64 mx-auto mb-4 border rounded"
          />
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Upload Screenshot of Receipt
            </label>
            <input
              type="file"
              name="receipt"
              onChange={handleFileChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            onClick={handleSubmitPayment}
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${!validateStep3() && "opacity-50 cursor-not-allowed"}`}
            disabled={!validateStep3()}
          >
            Submit Payment
          </button>
        </div>
      )}

      {/* Step 3: Bank payment details */}
      {step === 3 && paymentMethod === "bank" && !paymentSubmitted && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitPayment();
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Bank Payment</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Account Name</label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Reference Number</label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${!validateStep3() && "opacity-50 cursor-not-allowed"}`}
            disabled={!validateStep3()}
          >
            Submit Payment
          </button>
        </form>
      )}
    </div>
    </div>
  );
}

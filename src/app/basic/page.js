"use client";
import React, { useState } from "react";

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
    birNumber: "",
    proofOfTax: null,
    proofOfBAT: null,
    userExcelFile: null,
    receipt: null,
    bankName: "",
    accountName: "",
    referenceNumber: ""
  });

  const validateStep1 = () => {
    return formData.birNumber && formData.proofOfTax && formData.proofOfBAT;
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
                    { label: "BIR Number", name: "birNumber", type: "text" }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block mb-1 font-medium">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        placeholder={`Enter ${field.label}`}
                        required
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block mb-1 font-medium">Upload Excel File</label>
                    <input
                      type="file"
                      name="userExcelFile"
                      onChange={handleFileChange}
                      className="w-full border px-3 py-2 rounded"
                      accept=".xls,.xlsx"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Format: <strong>fullname, email, department, position</strong><br />
                      <em>Minimum of 5 users required.</em>
                    </p>
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
                <h2 className="text-xl font-semibold mb-4">GCash Payment</h2>
                <p className="mb-2">Scan the QR code below using your GCash app:</p>
                <img
                  src="/gcash_qr.png"
                  alt="GCash QR Code"
                  className="w-64 h-64 mx-auto mb-4 border rounded"
                />
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Upload Screenshot of Receipt</label>
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
                  className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitPayment();
                }}
              >
                <h2 className="text-xl font-semibold mb-4">Bank Payment</h2>
                {[
                  { label: "Bank Name", name: "bankName" },
                  { label: "Account Name", name: "accountName" },
                  { label: "Reference Number", name: "referenceNumber" }
                ].map((field) => (
                  <div className="mb-4" key={field.name}>
                    <label className="block mb-1 font-medium">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded"
                      required
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
                    !validateStep3() && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!validateStep3()}
                >
                  Submit Payment
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

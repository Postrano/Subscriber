"use client";
import React, { useState, useEffect } from "react";


import emailjs from 'emailjs-com';
import { db }from '../../../script/firebaseConfig';
import { collection, addDoc, serverTimestamp} from 'firebase/firestore';


export default function BasicPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [basicUserCount, setBasicUserCount] = useState(0);
  const [premiumUserCount, setPremiumUserCount] = useState(0);

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
    userCsvFile: null,
    receipt: null,
    bankName: "",
    accountName: "",
    referenceNumber: "",
    basicUsers: "",
    premiumUsers: "",
  });

  // Calculate total amount
  useEffect(() => {
   const basic = parseInt(formData.basicUsers) || 0;
const premium = parseInt(formData.premiumUsers) || 0;

    setTotalAmount(basic * 200 + premium * 360);
  }, [formData.basicUsers, formData.premiumUsers]);

  // Fetch user plan counts
 useEffect(() => {
  const fetchUserCounts = async () => {
    try {
      const response = await fetch("/api/user-plan-counts");
      const text = await response.text(); // Get raw response
      console.log("Raw response:", text); // 🔍 Log it
      const data = JSON.parse(text);      // Try to parse
      setBasicUserCount(data.basic);
      setPremiumUserCount(data.premium);
    } catch (error) {
      console.error("Failed to fetch user counts", error);
    }
  };
  fetchUserCounts();
}, []);


  const validateStep1 = () =>
    formData.proofOfBusiness &&
    formData.proofOfTax &&
    formData.proofOfBAT &&
  (parseInt(formData.basicUsers || 0) > 0 || parseInt(formData.premiumUsers || 0) > 0);


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

  const handleSubmitPayment = async () => {
    try {
      await addDoc(collection(db, "subscription"), {
        companyName: formData.companyName || "",
        contactPerson: formData.contactPerson || "",
        email: formData.email || "",
        phone: formData.phone || "",
        tele: formData.tele || "",
      basicUsers: parseInt(formData.basicUsers) || 0,
      premiumUsers: parseInt(formData.premiumUsers) || 0,

        paymentMethod,
        bankName: formData.bankName || "",
        accountName: formData.accountName || "",
        referenceNumber: formData.referenceNumber || "",
        totalAmount,
        timestamp: serverTimestamp(),
      });
      sendEmail();
      setPaymentSubmitted(true);
    } catch (error) {
      console.error("Error submitting payment: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const sendEmail = () => {
    if (
      !formData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      alert("Please enter a valid email address.");
      return;
    }

    const templateParams = {
      to_name: formData.contactPerson,
      to_email: formData.email,
      company_name: formData.companyName,
      basic_users: formData.basicUsers,
      premium_users: formData.premiumUsers,
      total_amount: `₱${totalAmount.toLocaleString()}`,
      logo_url: "http://localhost:3000/images/ineo.png",
    };

    emailjs
      .send(
        "service_df18cj1",
        "template_sr5q1os",
        templateParams,
        "8nV8GppQ82RWajpEo"
      )
      .then((result) => {
        console.log("Email sent successfully!", result.text);
        alert("Payment confirmation email sent!");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send email. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white py-10 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-md">
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <img src="/images/i-neo.jpg" alt="Logo" className="h-16 sm:h-20  " />
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {!paymentSubmitted && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => step === 1 ? window.location.href = "/" : setStep(step - 1)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              &larr; Back
            </button>
          </div>
        )}

        {paymentSubmitted ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              Payment Submitted Successfully!
            </h2>
            <p>You will receive an email confirming your payment shortly.</p>
          </div>
        ) : (
          <>
           {step === 1 && (
  <>
    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Upload Company & User Details</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { label: "Company Name", name: "companyName" },
        { label: "Contact Person", name: "contactPerson" },
        { label: "Email", name: "email", type: "email" },
        { label: "Phone", name: "phone" },
        { label: "Telephone", name: "tele" },
        { label: "Number of Basic Users (₱200/user)", name: "basicUsers", type: "number" },
        { label: "Number of Premium Users (₱360/user)", name: "premiumUsers", type: "number" },
      ].map(({ label, name, type = "text" }) => (
        <div key={name}>
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
      ))}
    </div>

    {/* CSV Upload */}
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">Upload User Information (CSV)</label>
      <input
        type="file"
        name="userCsvFile"
        onChange={handleFileChange}
        accept=".csv"
        className="block w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
        required
      />
      <p className="text-sm text-gray-500 mt-1">
        Format: <strong>fullname, email, department, position, plan</strong><br />
        Minimum 5 users required.
        <a
          href="/files/USERS INFORMATION(Sheet1).csv"
          download
          className="ml-2 text-blue-500 underline"
        >
          Download template
        </a>
      </p>
    </div>

    {/* Business Proofs */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
      {["proofOfBusiness", "proofOfTax", "proofOfBAT"].map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
          <input
            type="file"
            name={field}
            onChange={handleFileChange}
            className="block w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>
      ))}
    </div>

    {/* Continue Button */}
    <div className="mt-8 flex justify-center">
      <button
        onClick={() => validateStep1() ? setStep(2) : alert("Please complete all fields and upload required files.")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all"
      >
        Continue to Payment
      </button>
    </div>
  </>
)}


            {step === 2 && (
  <div className="flex flex-col items-center justify-center ">
    <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
      <button
        onClick={() => handlePaymentSelect("gcash")}
        className="bg-purple-500 text-white px-6 py-3 rounded shadow-md hover:bg-purple-600"
      >
        Pay via GCash
      </button>
      <button
        onClick={() => handlePaymentSelect("bank")}
        className="bg-green-500 text-white px-6 py-3 rounded shadow-md hover:bg-green-600"
      >
        Pay via Bank
      </button>
    </div>
  </div>
)}


      {step === 3 && (
  <div className="flex flex-col items-center justify-center  px-4">
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Payment Details</h2>

      {/* Display Basic and Premium user counts */}
      <div className="mb-4 space-y-1 text-center">
        <p className="font-medium">
          Basic Users:{" "}
          <span className="text-blue-600 font-semibold">{formData.basicUsers}</span>
        </p>
        <p className="font-medium">
          Premium Users:{" "}
          <span className="text-purple-600 font-semibold">{formData.premiumUsers}</span>
        </p>
        <p className="mb-4 font-medium">
          Total Payment:{" "}
          <span className="text-green-700 font-bold">
            ₱{totalAmount.toLocaleString()}
          </span>
        </p>
      </div>

      {/* GCash Fields */}
      {paymentMethod === "gcash" && (
        <div className="mb-6">
          <label className="block mb-1 font-medium">Upload GCash Receipt</label>
          <input
            type="file"
            name="receipt"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            onClick={handleSubmitPayment}
            className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Submit GCash Payment
          </button>
        </div>
      )}

      {/* Bank Fields */}
      {paymentMethod === "bank" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2 text-center">Bank Payment Details</h3>

          <div>
            <label className="block font-medium">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName || ""}
              onChange={handleChange}
              className="mt-1 border rounded w-full px-3 py-2"
              placeholder="Enter Bank Name"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Account Name</label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName || ""}
              onChange={handleChange}
              className="mt-1 border rounded w-full px-3 py-2"
              placeholder="Enter Account Name"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Reference Number</label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber || ""}
              onChange={handleChange}
              className="mt-1 border rounded w-full px-3 py-2"
              placeholder="Enter Reference Number"
              required
            />
          </div>

          <button
            onClick={handleSubmitPayment}
            className={`mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              !validateStep3() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!validateStep3()}
          >
            Submit Bank Payment
          </button>
        </div>
      )}
    </div>
  </div>
)}

       </>
        )}
      </div>
    </div>
  );
}
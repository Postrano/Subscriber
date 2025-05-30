"use client";

import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { db, storage } from "../../../script/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Papa from "papaparse";

export default function BasicPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0)
  const [basicUserCount, setBasicUserCount] = useState(0);
  const [premiumUserCount, setPremiumUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState("1"); // Default: 1 month


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
    proofOfPayment: null,
    manualUsers: Array(5).fill({
      fullname: "",
      email: "",
      department: "",
      position: "",
      plan: "",
    duration: 1,

    }),
  });

  // Calculate total amount dynamically
useEffect(() => {
  const basic = parseInt(formData.basicUsers) || 0;
  const premium = parseInt(formData.premiumUsers) || 0;
  const total = (basic * 200 + premium * 360) * duration;
  setTotalAmount(total);
}, [formData.basicUsers, formData.premiumUsers, duration]);

  // Fetch current user plan counts
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await fetch("/api/user-plan-counts");
        const text = await response.text();
        console.log("Raw response:", text);
        const data = JSON.parse(text);
        setBasicUserCount(data.basic);
        setPremiumUserCount(data.premium);
      } catch (error) {
        console.error("Failed to fetch user counts", error);
      }
    };
    fetchUserCounts();
  }, []);

  // Upload file to Firebase and get download URL
  const uploadAndGetUrl = async (file, path, label, companyName) => {
    if (!file) return null;

    // Slugify company name to remove problematic characters and lowercase it
    const cleanCompanyName = companyName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const fileExtension = file.name.split(".").pop();
    const fileName = `${cleanCompanyName}_${label}.${fileExtension}`;
    const fileRef = ref(storage, `${path}/${fileName}`);

    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const processCSVAndSaveUsers = async (file, subscriptionId) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async function (results) {
          const users = results.data;

          try {
            for (const user of users) {
              const fullName = user.fullname || "";
              const email = user.email || "";
              const department = user.department || "";
              const position = user.position || "";
              const plan =
                user.plan?.toLowerCase() === "premium" ? "premium" : "basic";

              const userData = {
                fullName,
                email,
                department,
                position,
                plan,
                timestamp: serverTimestamp(),
              };

              // Save under subscription/{subscriptionId}/user_information/
              const userInfoRef = collection(
                db,
                "subscription",
                subscriptionId,
                "user_information"
              );
              await addDoc(userInfoRef, userData);
            }

            resolve(true);
          } catch (err) {
            console.error("Error saving user:", err);
            reject(err);
          }
        },
        error: function (error) {
          console.error("CSV parsing error:", error);
          reject(error);
        },
      });
    });
  };

  const saveUsersToSubcollection = async (parentId, users) => {
    const userPromises = users.map((user) =>
      addDoc(collection(db, "companies", parentId, "users"), user)
    );
    await Promise.all(userPromises);
  };

  const handleManualChange = (e, index, field) => {
    const value = e.target.value;

    setFormData((prevData) => {
      const updatedUsers = [...(prevData.manualUsers || Array(5).fill({}))];
      updatedUsers[index] = {
        ...updatedUsers[index],
        [field]: value,
      };

      return {
        ...prevData,
        manualUsers: updatedUsers,
      };
    });
  };

  // Step validation functions
  const validateStep1 = () =>
    formData.proofOfBusiness &&
    formData.proofOfTax &&
    formData.proofOfBAT &&
    (parseInt(formData.basicUsers || 0) > 0 ||
      parseInt(formData.premiumUsers || 0) > 0);

  const validateStep3 = () => {
    if (paymentMethod === "gcash") {
      return formData.receipt !== null && formData.receipt !== "";
    } else if (paymentMethod === "bank") {
      return (
        formData.bankName.trim() !== null &&
        formData.accountName.trim() !== null &&
        formData.referenceNumber.trim() !== null &&
        formData.proofOfPayment !== null && // or !== ""
        formData.proofOfPayment !== "" // double check what the initial type/value is
      );
    }
    return false;
  };

  // Payment selection and submission
  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setStep(3);
  };

  const handleSubmitPayment = async () => {
    setIsLoading(true); // Start loading
    const safeUpload = async (file, folder, filename, company) => {
      if (!file) return null;
      console.log(`Uploading ${filename} in ${folder} for ${company}...`);
      const url = await uploadAndGetUrl(file, folder, filename, company);
      console.log(`Uploaded ${filename} URL:`, url);
      return url;
    };
    try {
      const proofOfBusinessUrl = await safeUpload(
        formData.proofOfBusiness,
        "proofs",
        "proofOfBusiness",
        formData.companyName
      );
      const proofOfTaxUrl = await safeUpload(
        formData.proofOfTax,
        "proofs",
        "proofOfTax",
        formData.companyName
      );
      const proofOfBATUrl = await safeUpload(
        formData.proofOfBAT,
        "proofs",
        "proofOfBAT",
        formData.companyName
      );
      const userCsvFileUrl = await safeUpload(
        formData.userCsvFile,
        "csv",
        "userList",
        formData.companyName
      );

      let receiptUrl = null;
      if (paymentMethod === "gcash") {
        receiptUrl = await safeUpload(
          formData.receipt,
          "receipts",
          "gcashReceipt",
          formData.companyName
        );
      }

      let proofOfPaymentUrl = null;
      if (paymentMethod === "bank") {
        proofOfPaymentUrl = await safeUpload(
          formData.proofOfPayment,
          "proofs",
          "bankProof",
          formData.companyName
        );
      }

      // Save subscription data first and get subscriptionRef
      const subscriptionRef = await addDoc(collection(db, "subscription"), {
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
        proofOfBusinessUrl,
        proofOfTaxUrl,
        proofOfBATUrl,
        userCsvFileUrl,
        receiptUrl,
        timestamp: serverTimestamp(),
        proofOfPayment: proofOfPaymentUrl,
        duration: parseInt(duration),

      });

      // ✅ Process CSV and save users with subscription ID
      await processCSVAndSaveUsers(formData.userCsvFile, subscriptionRef.id);

      sendEmail();
      setPaymentSubmitted(true);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Error submitting payment, please try again.");
    }
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] ?? null; // safer access, null if no file

    if (!file) {
      // If no file selected, clear the field in state
      setFormData((prev) => ({
        ...prev,
        [name]: null,
      }));
      return;
    }

    if (name === "userCsvFile") {
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        const users = lines.slice(1).map((line) => {
          const [fullname, email, department, position, plan] = line
            .split(",")
            .map((field) => field.trim());
          return { fullname, email, department, position, plan };
        });

        setFormData((prev) => ({
          ...prev,
          [name]: file,
          manualUsers: users,
        }));
      };

      reader.readAsText(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  // Email confirmation
  const sendEmail = () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
        // alert("Payment confirmation email sent!");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send email. Please try again.");
      });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#b4c9da] to-[#73c4fd] py-10 px-4 sm:px-6 lg:px-8 text-black bg-cover bg-center"
      style={{ backgroundImage: "url('/images/building3.jpg')" }}
    >
      <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-[#ffffff] border border-gray-200 rounded-2xl shadow-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 space-x-4">
          <div className="flex-grow border-t border-[#d1d5db]"></div>
          <img src="/images/i-neo.jpg" alt="Logo" className="h-16 sm:h-20" />
          <div className="flex-grow border-t border-[#d1d5db]"></div>
        </div>

        {/* Payment Status */}
        {paymentSubmitted ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4 text-[#22c55e]">
              Payment Submitted Successfully!
            </h2>
            <p>You will receive an email confirming your payment shortly.</p>
          </div>
        ) : (
          <>
            {/* Render Step 1 (Upload Details) */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-center text-[#1f2937]">
                  Upload Company & User Details
                </h2>
                {/* Back Button */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "Company Name", name: "companyName" },
                    { label: "Contact Person", name: "contactPerson" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone", name: "phone" },
                    { label: "Telephone", name: "tele" },
                    {
                      label: "Number of Basic Users (₱200/user)",
                      name: "basicUsers",
                      type: "number",
                    },
                    {
                      label: "Number of Premium Users (₱360/user)",
                      name: "premiumUsers",
                      type: "number",
                    },
                  ].map(({ label, name, type = "text" }) => (
                    <div key={name}>
                      <label
                        htmlFor={name}
                        className="block text-sm font-medium text-[#1f2937] mb-1"
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="w-full border border-[#d1d5db] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#60a5fa]"
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Manual Input (up to 5 users) */}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-[#1f2937] mb-2">
                    Enter users manually or through CSV upload
                  </label>

                  {/* Scrollable Container */}
                  <div className="max-h-[350px] overflow-y-auto border rounded-lg p-3">
                    {(formData.manualUsers?.length > 0
                      ? formData.manualUsers
                      : Array.from({ length: 5 }, () => ({}))
                    ).map((user, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 mb-3">
                        <input
                          type="text"
                          name={`fullname_${index}`}
                          placeholder="Full Name"
                          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
                          value={user.fullname || ""}
                          onChange={(e) =>
                            handleManualChange(e, index, "fullname")
                          }
                        />
                        <input
                          type="email"
                          name={`email_${index}`}
                          placeholder="Email"
                          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
                          value={user.email || ""}
                          onChange={(e) =>
                            handleManualChange(e, index, "email")
                          }
                        />
                        <input
                          type="text"
                          name={`department_${index}`}
                          placeholder="Department"
                          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
                          value={user.department || ""}
                          onChange={(e) =>
                            handleManualChange(e, index, "department")
                          }
                        />
                        <input
                          type="text"
                          name={`position_${index}`}
                          placeholder="Position"
                          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
                          value={user.position || ""}
                          onChange={(e) =>
                            handleManualChange(e, index, "position")
                          }
                        />
                        <input
                          type="text"
                          name={`plan_${index}`}
                          placeholder="Plan"
                          className="border border-[#d1d5db] rounded-lg px-3 py-2 text-sm"
                          value={user.plan || ""}
                          onChange={(e) => handleManualChange(e, index, "plan")}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-[#6B7280] mt-1">
                    You can enter manually or upload a CSV. If more than 5 users
                    are provided in the CSV, this section will grow with scroll.
                  </p>
                </div>

                {/* CSV Upload */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-[#1f2937] mb-1">
                    Upload User Information (CSV)
                  </label>
                  <input
                    type="file"
                    name="userCsvFile"
                    onChange={handleFileChange}
                    accept=".csv"
                    className="block w-full border border-[#d1d5db] rounded-lg px-4 py-2 text-sm"
                    required
                  />

                  {/* File name preview */}
                  <p className="text-sm mt-1 text-[#1f2937]">
                    {formData.userCsvFile?.name &&
                      `Selected file: ${formData.userCsvFile.name}`}
                  </p>

                  <p className="text-sm text-[#6B7280] mt-1">
                    Format:{" "}
                    <strong>fullname, email, department, position, plan</strong>
                    <br />
                    Minimum 5 users required.
                    <a
                      href="/files/USERS INFORMATION(Sheet1).csv"
                      download
                      className="ml-2 text-[#3B82F6] underline"
                    >
                      Download template
                    </a>
                  </p>
                </div>

                {/* Business Proofs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                  {["proofOfBusiness", "proofOfTax", "proofOfBAT"].map(
                    (field) => {
                      const labelText = field
                        .replace(/([A-Z])/g, " $1") // Add spaces
                        .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

                      return (
                        <div key={field}>
                          <label
                            htmlFor={field}
                            className="block text-sm font-medium text-[#374151] mb-1"
                          >
                            {labelText}
                          </label>
                          <input
                            type="file"
                            id={field}
                            name={field}
                            onChange={handleFileChange}
                            className="block w-full border border-[#D1D5DB] rounded-lg px-4 py-2 text-sm"
                            required
                          />
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Back Button */}
                <div className="mt-6 flex justify-start">
                  <button
                    type="button"
                    onClick={() =>
                      step === 1
                        ? (window.location.href = "/")
                        : setStep(step - 1)
                    }
                    className="text-[#2563eb] underline text-sm font-medium"
                  >
                    &larr; Back
                  </button>
                </div>
                {/* Continue Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={async () => {
                      if (!validateStep1()) {
                        alert(
                          "Please complete all fields and upload required files."
                        );
                        return;
                      }

                      try {
                        const users = formData.manualUsers;
                        const companyId = "your_company_id_here"; // Get this from context, state, or generate

                        await saveUsersToSubcollection(companyId, users);

                        setStep(2);
                      } catch (error) {
                        console.error("Error saving users:", error);
                        alert("An error occurred while saving user data.");
                      }
                    }}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-semibold px-6 py-2 rounded-lg shadow transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <div>
                <div className="flex flex-col items-center justify-center ">
                  <h2 className="text-xl font-bold mb-4">
                    Select Payment Method
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    {/* <button
        onClick={() => handlePaymentSelect("gcash")}
        className="bg-purple-500 text-white px-6 py-3 rounded shadow-md hover:bg-purple-600"
      >
        Pay via GCash
      </button> */}
                    {/* Back Button */}

                    <button
                      onClick={() => handlePaymentSelect("bank")}
                      className="bg-[#22C55E] text-[#FFFFFF] px-6 py-3 rounded shadow-md hover:bg-[#16A34A]"
                    >
                      Pay via Bank
                    </button>
                  </div>
                </div>
                {/* Back Button */}
                <div className="mt-6 flex justify-start">
                  <button
                    type="button"
                    onClick={() =>
                      step === 1
                        ? (window.location.href = "/")
                        : setStep(step - 1)
                    }
                    className="text-[#2563eb] underline text-sm font-medium"
                  >
                    &larr; Back
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex flex-col items-center justify-center  px-4">
                  <div className="w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-center">
                      Payment Details
                    </h2>
                <div className="mb-4 text-center">
                  <label className="block mb-1 font-medium">Subscription Duration</label>
                 <select
  value={formData.duration}
  onChange={(e) => {
    const value = parseInt(e.target.value);
    setDuration(value);
    setFormData({ ...formData, duration: value });
  }}
  className="w-full border px-3 py-2 rounded text-center"
>
  <option value={1}>1 Month</option>
  <option value={6}>6 Months</option>
  <option value={12}>1 Year</option>
</select>

                </div>

                    {/* Display Basic and Premium user counts */}
                    <div className="mb-4 space-y-1 text-center">
                      <p className="font-medium">
                        Basic Users:{" "}
                        <span className="text-[#2563EB] font-semibold">
                          {formData.basicUsers}
                        </span>
                      </p>
                      <p className="font-medium">
                        Premium Users:{" "}
                        <span className="text-[#7C3AED] font-semibold">
                          {formData.premiumUsers}
                        </span>
                      </p>
                      <p className="mb-4 font-medium">
                        Total Payment:{" "}
                        <span className="text-[#15803D] font-bold">
                          ₱{totalAmount.toLocaleString()}
                        </span>
                      </p>
                    </div>

                    {/* GCash Fields */}
                    {paymentMethod === "gcash" && (
                      <div className="mb-6">
                        <label className="block mb-1 font-medium">
                          Upload GCash Receipt
                        </label>
                        <input
                          type="file"
                          name="receipt"
                          onChange={handleFileChange}
                          className="w-full border px-3 py-2 rounded"
                          required={paymentMethod === "gcash"} // only required if paymentMethod is gcash
                        />

                        <button
                          onClick={handleSubmitPayment}
                          className="mt-4 w-full bg-[#7C3AED] text-[#fffff] px-4 py-2 rounded hover:bg-[#5B21B6]"
                        >
                          Submit GCash Payment
                        </button>
                      </div>
                    )}

                    {/* Bank Fields */}
                    {paymentMethod === "bank" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-center">
                          Bank Payment Details
                        </h3>

                        <div className="border p-4 rounded bg-[#F9FAFB]">
                          <p>
                            <span className="font-semibold">BPI:</span>{" "}
                            0061-0008-83
                          </p>
                          <p>
                            <span className="font-semibold">
                              Security Bank:
                            </span>{" "}
                            00007-0416-901
                          </p>
                          <p>
                            <span className="font-semibold">Union Bank:</span>{" "}
                            00-156-0012-010
                          </p>
                        </div>

                        <div>
                          <label className="block font-medium">
                            Upload Proof of Payment
                          </label>
                          <input
                            type="file"
                            name="proofOfPayment"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="mt-1 w-full  border border-[#D1D5DB] rounded-lg"
                            required
                          />
                        </div>

                        <button
                          onClick={handleSubmitPayment}
                          className={`mt-6 w-full bg-[#2563EB] text-white px-4 py-2 rounded hover:bg-[#1D4ED8] ${
                            !validateStep3()
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={!validateStep3()}
                        >
                          Submit Bank Payment
                        </button>
                        {isLoading && (
                          <div className="flex justify-center items-center py-4">
                            <svg
                              className="animate-spin h-6 w-6 text-[#2563EB]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                            <span className="ml-2 text-[#2563EB] font-medium">
                              Processing...
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-start">
                  <button
                    type="button"
                    onClick={() =>
                      step === 1
                        ? (window.location.href = "/")
                        : setStep(step - 1)
                    }
                    className="text-[#2563eb] underline text-sm font-medium"
                  >
                    &larr; Back
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

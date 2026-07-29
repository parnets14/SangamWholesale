import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ArrowLeft, Check, Loader2 } from "lucide-react";

const steps = ["Location", "Address", "Timings", "GST"];
const timeOptions = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
];
const lunchOptions = [
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
];

const defaultWeekly = {
  Sunday: "open",
  Monday: "open",
  Tuesday: "open",
  Wednesday: "open",
  Thursday: "open",
  Friday: "open",
  Saturday: "open",
};

const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore
const GOOGLE_MAPS_API_KEY = "AIzaSyAHFoepvVjrlMUctcC4wn_VRpOznZBzmhA";

const Address = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editAddress = location.state?.address;
  const isEdit = !!editAddress;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    shopName: "",
    shopNoRoad: "",
    areaName: "",
    pincode: "",
    city: "",
    deliveryContact: "",
    saveAddressAs: "",
    selectedTime: "",
    weeklySchedule: defaultWeekly,
    lunchStart: "",
    lunchEnd: "",
    gstOption: "i_want_gst",
    gstin: "",
    latitude: "",
    longitude: "",
  });
  const [gstVerified, setGstVerified] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Auto-detect location on mount (if not editing)
  useEffect(() => {
    if (isEdit && editAddress) {
      setFormData({
        shopName: editAddress.shopName || "",
        shopNoRoad: editAddress.shopNumber || "",
        areaName: editAddress.areaName || "",
        pincode: editAddress.pincode || "",
        city: editAddress.city || "",
        deliveryContact: editAddress.deliveryContact || "",
        saveAddressAs: editAddress.saveAddressAs || "",
        selectedTime: editAddress.shopOpenTime || "",
        weeklySchedule: editAddress.openClosedDays || defaultWeekly,
        lunchStart: editAddress.lunchTime?.lunchStart || "",
        lunchEnd: editAddress.lunchTime?.lunchEnd || "",
        gstOption: editAddress.gstOption || "i_want_gst",
        gstin: editAddress.gstin || "",
        latitude: editAddress.latitude || editAddress.location?.latitude || "",
        longitude:
          editAddress.longitude || editAddress.location?.longitude || "",
      });
    } else {
      // Only auto-detect if not editing
      if (!formData.latitude || !formData.longitude) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setFormData((f) => ({
                ...f,
                latitude: pos.coords.latitude.toFixed(6),
                longitude: pos.coords.longitude.toFixed(6),
              }));
            },
            () => {
              setFormData((f) => ({
                ...f,
                latitude: DEFAULT_LOCATION.latitude,
                longitude: DEFAULT_LOCATION.longitude,
              }));
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setFormData((f) => ({
            ...f,
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          }));
        }
      }
    }
    // eslint-disable-next-line
  }, [isEdit, editAddress]);

  // Step validation
  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0:
        if (!formData.latitude || !formData.longitude)
          newErrors.location = "Location required";
        break;
      case 1:
        if (!formData.shopName.trim())
          newErrors.shopName = "Shop name is required";
        if (!formData.shopNoRoad.trim())
          newErrors.shopNoRoad = "Shop number & road is required";
        if (!formData.areaName.trim())
          newErrors.areaName = "Area name is required";
        if (
          !formData.pincode.trim() ||
          formData.pincode.length !== 6 ||
          isNaN(formData.pincode)
        )
          newErrors.pincode = "Valid 6-digit pincode is required";
        if (!formData.saveAddressAs.trim())
          newErrors.saveAddressAs = "Address label is required";
        break;
      case 2:
        if (!formData.selectedTime)
          newErrors.selectedTime = "Please select a time";
        if (!formData.lunchStart && formData.lunchEnd)
          newErrors.lunchStart = "Please select lunch start time";
        if (formData.lunchStart && !formData.lunchEnd)
          newErrors.lunchEnd = "Please select lunch end time";
        break;
      case 3:
        if (formData.gstOption === "i_want_gst" && !formData.gstin.trim())
          newErrors.gstin = "GSTIN is required";
        else if (formData.gstOption === "i_want_gst" && !gstVerified)
          newErrors.gstin = "Please verify GSTIN";
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation
  const handleNext = () => {
    if (validateStep()) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigate(-1);
  };

  // GST verification (simulate)
  const verifyGST = async () => {
    if (!formData.gstin.trim()) return;
    setGstVerifying(true);
    setTimeout(() => {
      setGstVerifying(false);
      setGstVerified(true);
    }, 1500);
  };

  // Save address
  const handleFinish = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    const addressData = {
      shopName: formData.shopName,
      shopNumber: formData.shopNoRoad,
      areaName: formData.areaName,
      pincode: formData.pincode,
      city: formData.city,
      town: formData.city,
      deliveryContact: formData.deliveryContact,
      saveAddress: true,
      default: true,
      shopOpenTime: formData.selectedTime,
      openClosedDays: formData.weeklySchedule,
      lunchTime: {
        lunchStart: formData.lunchStart,
        lunchEnd: formData.lunchEnd,
      },
      location: { latitude: formData.latitude, longitude: formData.longitude },
      saveAddressAs: formData.saveAddressAs,
      gstOption: formData.gstOption,
      gstin: formData.gstin,
    };
    try {
      let response, data;
      if (isEdit && editAddress && editAddress._id) {
        response = await fetch(
          `https://sangamwholesale.com/api/addresses/${editAddress._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          }
        );
        data = await response.json();
      } else {
        response = await fetch(
          "https://sangamwholesale.com/api/addresses/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          }
        );
        data = await response.json();
      }
      setIsLoading(false);
      if (data.success) {
        navigate("/profile", { state: { addressSaved: true } });
      } else {
        setErrors({ api: data.message || "Failed to save address" });
      }
    } catch (error) {
      setIsLoading(false);
      setErrors({ api: "Failed to save address. Please try again." });
    }
  };

  // Google Maps iframe URL
  const mapLat = formData.latitude || DEFAULT_LOCATION.latitude;
  const mapLng = formData.longitude || DEFAULT_LOCATION.longitude;
  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${mapLat},${mapLng}&zoom=16&maptype=roadmap&markers=color:red%7C${mapLat},${mapLng}`;

  // Step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <label className="block font-semibold">
              Location (auto-detected or enter manually)
            </label>
            <div className="w-full h-64 rounded overflow-hidden border">
              <iframe
                title="Google Map"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                ref={mapRef}
              ></iframe>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className={`border rounded px-3 py-2 flex-1 ${
                  errors.location ? "border-red-500" : ""
                }`}
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, latitude: e.target.value }))
                }
              />
              <input
                type="text"
                className={`border rounded px-3 py-2 flex-1 ${
                  errors.location ? "border-red-500" : ""
                }`}
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, longitude: e.target.value }))
                }
              />
            </div>
            <div className="text-xs text-gray-500">
              You can drag the marker on Google Maps (in a separate tab) to get
              coordinates, or use your current location.
            </div>
            {errors.location && (
              <div className="text-red-500 text-sm">{errors.location}</div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Shop Name</label>
              <input
                className={`border rounded px-3 py-2 w-full ${
                  errors.shopName ? "border-red-500" : ""
                }`}
                value={formData.shopName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, shopName: e.target.value }))
                }
                placeholder="Shop Name on the Board"
              />
              {errors.shopName && (
                <div className="text-red-500 text-sm">{errors.shopName}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold">Shop No & Road</label>
              <input
                className={`border rounded px-3 py-2 w-full ${
                  errors.shopNoRoad ? "border-red-500" : ""
                }`}
                value={formData.shopNoRoad}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, shopNoRoad: e.target.value }))
                }
                placeholder="Shop No & Road"
              />
              {errors.shopNoRoad && (
                <div className="text-red-500 text-sm">{errors.shopNoRoad}</div>
              )}
            </div>
            <div>
              <label className="block font-semibold">Area Name</label>
              <input
                className={`border rounded px-3 py-2 w-full ${
                  errors.areaName ? "border-red-500" : ""
                }`}
                value={formData.areaName}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, areaName: e.target.value }))
                }
                placeholder="Area Name"
              />
              {errors.areaName && (
                <div className="text-red-500 text-sm">{errors.areaName}</div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold">Pincode</label>
                <input
                  className={`border rounded px-3 py-2 w-full ${
                    errors.pincode ? "border-red-500" : ""
                  }`}
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, pincode: e.target.value }))
                  }
                  placeholder="Pincode"
                  maxLength={6}
                />
                {errors.pincode && (
                  <div className="text-red-500 text-sm">{errors.pincode}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block font-semibold">City / Town</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="City / Town"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold">Delivery Contact</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={formData.deliveryContact}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    deliveryContact: e.target.value,
                  }))
                }
                placeholder="Contact"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block font-semibold">Save Address As</label>
              <input
                className={`border rounded px-3 py-2 w-full ${
                  errors.saveAddressAs ? "border-red-500" : ""
                }`}
                value={formData.saveAddressAs}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, saveAddressAs: e.target.value }))
                }
                placeholder="Home, Office, Other"
              />
              {errors.saveAddressAs && (
                <div className="text-red-500 text-sm">
                  {errors.saveAddressAs}
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Select Time</label>
              <select
                className={`border rounded px-3 py-2 w-full ${
                  errors.selectedTime ? "border-red-500" : ""
                }`}
                value={formData.selectedTime}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, selectedTime: e.target.value }))
                }
              >
                <option value="">Select Time</option>
                {timeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.selectedTime && (
                <div className="text-red-500 text-sm">
                  {errors.selectedTime}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold">Open/Closed Days</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formData.weeklySchedule).map((day) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-20">{day}</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={formData.weeklySchedule[day]}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          weeklySchedule: {
                            ...f.weeklySchedule,
                            [day]: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold">Lunch Start</label>
                <select
                  className={`border rounded px-3 py-2 w-full ${
                    errors.lunchStart ? "border-red-500" : ""
                  }`}
                  value={formData.lunchStart}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, lunchStart: e.target.value }))
                  }
                >
                  <option value="">Lunch Start</option>
                  {lunchOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.lunchStart && (
                  <div className="text-red-500 text-sm">
                    {errors.lunchStart}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block font-semibold">Lunch End</label>
                <select
                  className={`border rounded px-3 py-2 w-full ${
                    errors.lunchEnd ? "border-red-500" : ""
                  }`}
                  value={formData.lunchEnd}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, lunchEnd: e.target.value }))
                  }
                >
                  <option value="">Lunch End</option>
                  {lunchOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.lunchEnd && (
                  <div className="text-red-500 text-sm">{errors.lunchEnd}</div>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">GST Option</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.gstOption === "i_want_gst"}
                    onChange={() =>
                      setFormData((f) => ({ ...f, gstOption: "i_want_gst" }))
                    }
                  />
                  I want GST invoice
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.gstOption === "i_do_not_want_gst"}
                    onChange={() =>
                      setFormData((f) => ({
                        ...f,
                        gstOption: "i_do_not_want_gst",
                      }))
                    }
                  />
                  I do not want GST invoice
                </label>
              </div>
            </div>
            {formData.gstOption === "i_want_gst" && (
              <div>
                <label className="block font-semibold">GSTIN</label>
                <div className="flex gap-2">
                  <input
                    className={`border rounded px-3 py-2 flex-1 ${
                      errors.gstin ? "border-red-500" : ""
                    }`}
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, gstin: e.target.value }))
                    }
                    placeholder="Enter GSTIN"
                  />
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={verifyGST}
                    disabled={gstVerifying || !formData.gstin}
                  >
                    {gstVerifying ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : gstVerified ? (
                      <Check size={18} />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
                {errors.gstin && (
                  <div className="text-red-500 text-sm">{errors.gstin}</div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-xl mx-auto w-full py-8 px-4">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="mr-2 p-2 rounded hover:bg-gray-200"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-bold">
            {isEdit ? "Edit Address" : "Add Address"}
          </h2>
        </div>
        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center gap-2 ${
                  idx === currentStep
                    ? "text-red-600 font-bold"
                    : "text-gray-400"
                }`}
              >
                {idx + 1}. {step}
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {renderStep()}
        </div>
        {errors.api && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errors.api}
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold"
          >
            Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded bg-red-600 text-white font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className={`px-6 py-2 rounded bg-red-600 text-white font-semibold ${
                isLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : isEdit
                ? "Update Address"
                : "Save Address"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;

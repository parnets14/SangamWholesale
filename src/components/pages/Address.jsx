import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ArrowLeft, Check, Loader2, Search } from "lucide-react";

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
  const [locationSearch, setLocationSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const mapRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Load Google Maps JS API with Places library
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map once loaded and lat/lng available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const lat = parseFloat(formData.latitude) || DEFAULT_LOCATION.latitude;
    const lng = parseFloat(formData.longitude) || DEFAULT_LOCATION.longitude;
    const center = { lat, lng };

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: "Drag to set location",
      });

      // Update coords when marker is dragged
      marker.addListener("dragend", (e) => {
        const newLat = e.latLng.lat().toFixed(6);
        const newLng = e.latLng.lng().toFixed(6);
        setFormData((f) => ({ ...f, latitude: newLat, longitude: newLng }));
        reverseGeocode(e.latLng.lat(), e.latLng.lng());
      });

      mapInstanceRef.current = { map, marker };
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    } else {
      // Update existing marker position
      const pos = new window.google.maps.LatLng(lat, lng);
      mapInstanceRef.current.marker.setPosition(pos);
      mapInstanceRef.current.map.panTo(pos);
    }
  // eslint-disable-next-line
  }, [mapLoaded, formData.latitude, formData.longitude]);

  // Reverse geocode to fill search box label
  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setLocationSearch(results[0].formatted_address);
      }
    });
  }, []);

  // Search suggestions via Places Autocomplete
  const handleLocationSearchChange = (e) => {
    const value = e.target.value;
    setLocationSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }
    searchDebounceRef.current = setTimeout(() => {
      if (!autocompleteServiceRef.current) return;
      setIsFetchingSuggestions(true);
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          setIsFetchingSuggestions(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 350);
  };

  // When user selects a suggestion — fetch place details and set lat/lng
  const handleSelectSuggestion = (placeId, description) => {
    setLocationSearch(description);
    setSuggestions([]);
    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      { placeId, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const lat = place.geometry.location.lat().toFixed(6);
          const lng = place.geometry.location.lng().toFixed(6);
          setFormData((f) => ({ ...f, latitude: lat, longitude: lng }));
        }
      }
    );
  };

  // Detect current location button
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData((f) => ({ ...f, latitude: lat, longitude: lng }));
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setIsDetectingLocation(false);
      },
      () => setIsDetectingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };


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

  // Step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <label className="block font-semibold text-gray-700">
              Search your shop location
            </label>

            {/* Search box */}
            <div className="relative">
              <div className="flex items-center border rounded-lg px-3 py-2 gap-2 bg-white shadow-sm">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  className="flex-1 outline-none text-sm"
                  placeholder="Search area, street, landmark..."
                  value={locationSearch}
                  onChange={handleLocationSearchChange}
                  autoComplete="off"
                />
                {isFetchingSuggestions && (
                  <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
                )}
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.place_id}
                      className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm border-b last:border-0"
                      onClick={() => handleSelectSuggestion(s.place_id, s.description)}
                    >
                      <MapPin size={15} className="text-red-500 mt-0.5 shrink-0" />
                      <span>{s.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Detect current location */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
            >
              {isDetectingLocation ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
              {isDetectingLocation ? "Detecting..." : "Use my current location"}
            </button>

            {/* Interactive map */}
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg overflow-hidden border shadow-sm"
              style={{ minHeight: 256 }}
            />

            {!mapLoaded && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Loading map...
              </div>
            )}

            {/* Coord display */}
            {formData.latitude && formData.longitude && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                📍 {formData.latitude}, {formData.longitude} — you can also drag the pin to adjust
              </div>
            )}

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
              className="px-6 py-2 rounded text-white font-semibold"
              style={{ backgroundColor: '#702834' }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className={`px-6 py-2 rounded text-white font-semibold ${
                isLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: '#702834' }}
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

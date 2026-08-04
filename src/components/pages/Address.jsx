import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ArrowLeft, Check, Loader2, Search, Navigation } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchInputRef = useRef(null);
  const [autoFilledFields, setAutoFilledFields] = useState([]);

  // Load Google Maps JS API
  useEffect(() => {
    const scriptId = "google-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
      setMapLoaded(true);
    } else {
      const existing = document.getElementById(scriptId);
      existing.addEventListener("load", () => setMapLoaded(true));
    }
  }, []);

  // Extract address components from Google geocode result
  const extractAddressComponents = (results) => {
    const components = results[0]?.address_components || [];
    let pincode = "";
    let city = "";
    let areaName = "";

    for (const comp of components) {
      if (comp.types.includes("postal_code")) {
        pincode = comp.long_name;
      }
      if (
        comp.types.includes("locality") ||
        comp.types.includes("administrative_area_level_3")
      ) {
        city = comp.long_name;
      }
      if (
        comp.types.includes("sublocality_level_1") ||
        comp.types.includes("sublocality") ||
        comp.types.includes("neighborhood")
      ) {
        areaName = comp.long_name;
      }
    }

    // fallback city
    if (!city) {
      const cityComp = components.find((c) =>
        c.types.includes("administrative_area_level_2")
      );
      if (cityComp) city = cityComp.long_name;
    }

    return { pincode, city, areaName };
  };

  // Reverse geocode lat/lng to fill address fields
  const reverseGeocode = useCallback(
    (lat, lng) => {
      if (!geocoderRef.current && window.google) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode(
        { location: { lat: parseFloat(lat), lng: parseFloat(lng) } },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const { pincode, city, areaName } = extractAddressComponents(results);
            const filled = [];
            setFormData((f) => {
              const updates = {};
              if (pincode) { updates.pincode = pincode; filled.push("pincode"); }
              if (city) { updates.city = city; filled.push("city"); }
              if (areaName) { updates.areaName = areaName; filled.push("areaName"); }
              return { ...f, ...updates };
            });
            setAutoFilledFields(filled);
          }
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Initialize map when loaded and on step 0
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    // Don't re-init if already initialized
    if (mapInstanceRef.current) return;
    const lat = parseFloat(formData.latitude) || DEFAULT_LOCATION.latitude;
    const lng = parseFloat(formData.longitude) || DEFAULT_LOCATION.longitude;
    const mapOptions = {
      center: { lat, lng },
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    };
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      title: "Drag to adjust location",
      animation: window.google.maps.Animation.DROP,
    });
    markerRef.current = marker;

    // Update coords on drag
    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat().toFixed(6);
      const newLng = e.latLng.lng().toFixed(6);
      setFormData((f) => ({ ...f, latitude: newLat, longitude: newLng }));
      reverseGeocode(newLat, newLng);
    });

    // Also allow clicking map to move marker
    map.addListener("click", (e) => {
      const newLat = e.latLng.lat().toFixed(6);
      const newLng = e.latLng.lng().toFixed(6);
      marker.setPosition(e.latLng);
      setFormData((f) => ({ ...f, latitude: newLat, longitude: newLng }));
      reverseGeocode(newLat, newLng);
    });

    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    geocoderRef.current = new window.google.maps.Geocoder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, reverseGeocode]);

  useEffect(() => {
    if (mapLoaded && currentStep === 0) {
      // Reset map instance when returning to step 0
      mapInstanceRef.current = null;
      setTimeout(initMap, 150);
    }
  }, [mapLoaded, currentStep, initMap]);

  // When coords change externally (geolocation), pan map
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const pos = { lat, lng };
        mapInstanceRef.current.panTo(pos);
        markerRef.current.setPosition(pos);
      }
    }
  }, [formData.latitude, formData.longitude]);

  // Search autocomplete
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim() || !autocompleteServiceRef.current) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: val, componentRestrictions: { country: "in" } },
      (predictions, status) => {
        setSearchLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSearchResults(predictions);
        } else {
          setSearchResults([]);
        }
      }
    );
  };

  const handleSelectPlace = (placeId, description) => {
    setSearchQuery(description);
    setSearchResults([]);
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const newLat = loc.lat().toFixed(6);
        const newLng = loc.lng().toFixed(6);
        const { pincode, city, areaName } = extractAddressComponents(results);
        const filled = [];
        setFormData((f) => {
          const updates = { latitude: newLat, longitude: newLng };
          if (pincode) { updates.pincode = pincode; filled.push("pincode"); }
          if (city) { updates.city = city; filled.push("city"); }
          if (areaName) { updates.areaName = areaName; filled.push("areaName"); }
          return { ...f, ...updates };
        });
        setAutoFilledFields(filled);
      }
    });
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocating(false);
          const newLat = pos.coords.latitude.toFixed(6);
          const newLng = pos.coords.longitude.toFixed(6);
          setFormData((f) => ({
            ...f,
            latitude: newLat,
            longitude: newLng,
          }));
          reverseGeocode(newLat, newLng);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
    }
  };

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
    if (validateStep()) {
      // When moving from Location step to Address step, reverse geocode the selected coords
      if (currentStep === 0 && formData.latitude && formData.longitude) {
        reverseGeocode(formData.latitude, formData.longitude);
      }
      setCurrentStep(currentStep + 1);
    }
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
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-base">
              Search your shop location
            </h3>

            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#702834]">
                <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="flex-1 outline-none text-sm bg-transparent"
                  placeholder="Search area, street, landmark..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  autoComplete="off"
                />
                {searchLoading && (
                  <Loader2 size={16} className="animate-spin text-gray-400 ml-2" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b last:border-b-0 flex items-start gap-2"
                      onClick={() => handleSelectPlace(result.place_id, result.description)}
                    >
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-snug">{result.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Use Current Location */}
            <button
              type="button"
              className="flex items-center gap-2 text-[#702834] font-medium text-sm hover:underline"
              onClick={handleUseCurrentLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Navigation size={16} />
              )}
              {locating ? "Detecting location..." : "Use my current location"}
            </button>

            {/* Coordinates Display */}
            {formData.latitude && formData.longitude && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={13} className="text-[#702834]" />
                <span>
                  {parseFloat(formData.latitude).toFixed(4)},{" "}
                  {parseFloat(formData.longitude).toFixed(4)} —{" "}
                  <span className="text-gray-400">you can also drag the pin to adjust</span>
                </span>
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
                <div className="text-red-500 text-sm">{errors.saveAddressAs}</div>
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
          {/* Map — kept always in DOM so Google Maps doesn't re-inject into wrong step */}
          <div
            ref={mapRef}
            style={{ height: currentStep === 0 ? "260px" : "0px", overflow: "hidden", marginTop: currentStep === 0 ? "12px" : "0" }}
            className={`w-full rounded-lg border shadow-sm transition-all ${currentStep === 0 ? "block" : "hidden"}`}
          >
            {!mapLoaded && currentStep === 0 && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ height: "260px" }}>
                <Loader2 className="animate-spin text-gray-400" size={28} />
              </div>
            )}
          </div>
          {/* Coordinates — shown only on step 0 */}
          {currentStep === 0 && formData.latitude && formData.longitude && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-3">
              <MapPin size={13} className="text-[#702834]" />
              <span>
                {parseFloat(formData.latitude).toFixed(4)},{" "}
                {parseFloat(formData.longitude).toFixed(4)} —{" "}
                <span className="text-gray-400">you can also drag the pin to adjust</span>
              </span>
            </div>
          )}
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

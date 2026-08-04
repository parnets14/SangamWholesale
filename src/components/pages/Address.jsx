import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, ArrowLeft, Check, Loader2, Search, Navigation } from "lucide-react";

const steps = ["Location", "Address", "Timings", "GST"];
const timeOptions = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM","03:00 PM",
];
const lunchOptions = [
  "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM","03:00 PM",
];
const defaultWeekly = {
  Sunday:"open", Monday:"open", Tuesday:"open", Wednesday:"open",
  Thursday:"open", Friday:"open", Saturday:"open",
};

const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 };
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
    shopName: "", shopNoRoad: "", areaName: "", pincode: "", city: "",
    deliveryContact: "", saveAddressAs: "", selectedTime: "",
    weeklySchedule: defaultWeekly, lunchStart: "", lunchEnd: "",
    gstOption: "i_want_gst", gstin: "", latitude: "", longitude: "",
  });
  const [gstVerified, setGstVerified] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Single map ref — used only inside case 0
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompleteServiceRef = useRef(null);

  // Load Google Maps script once
  useEffect(() => {
    const scriptId = "google-maps-script";
    if (window.google?.maps) { setMapLoaded(true); return; }
    if (document.getElementById(scriptId)) {
      document.getElementById(scriptId).addEventListener("load", () => setMapLoaded(true));
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Extract pincode / city / areaName from geocode result
  const extractAddressComponents = (results) => {
    const comps = results[0]?.address_components || [];
    let pincode = "", city = "", areaName = "";
    for (const c of comps) {
      if (c.types.includes("postal_code")) pincode = c.long_name;
      if (c.types.includes("locality") || c.types.includes("administrative_area_level_3"))
        city = c.long_name;
      if (c.types.includes("sublocality_level_1") || c.types.includes("sublocality") || c.types.includes("neighborhood"))
        areaName = c.long_name;
    }
    if (!city) {
      const fb = comps.find((c) => c.types.includes("administrative_area_level_2"));
      if (fb) city = fb.long_name;
    }
    return { pincode, city, areaName };
  };

  // Reverse geocode and fill form fields
  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;
    if (!geocoderRef.current) geocoderRef.current = new window.google.maps.Geocoder();
    geocoderRef.current.geocode(
      { location: { lat: parseFloat(lat), lng: parseFloat(lng) } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          const { pincode, city, areaName } = extractAddressComponents(results);
          setFormData((f) => ({
            ...f,
            ...(pincode ? { pincode } : {}),
            ...(city ? { city } : {}),
            ...(areaName ? { areaName } : {}),
          }));
        }
      }
    );
  }, []);

  // Init map — runs when mapLoaded and we are on step 0
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;
    if (mapInstanceRef.current) return; // already initialized
    const lat = parseFloat(formData.latitude) || DEFAULT_LOCATION.latitude;
    const lng = parseFloat(formData.longitude) || DEFAULT_LOCATION.longitude;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng }, zoom: 16,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });
    const marker = new window.google.maps.Marker({
      position: { lat, lng }, map, draggable: true,
      animation: window.google.maps.Animation.DROP,
    });
    marker.addListener("dragend", (e) => {
      const nLat = e.latLng.lat().toFixed(6);
      const nLng = e.latLng.lng().toFixed(6);
      setFormData((f) => ({ ...f, latitude: nLat, longitude: nLng }));
      reverseGeocode(nLat, nLng);
    });
    map.addListener("click", (e) => {
      const nLat = e.latLng.lat().toFixed(6);
      const nLng = e.latLng.lng().toFixed(6);
      marker.setPosition(e.latLng);
      setFormData((f) => ({ ...f, latitude: nLat, longitude: nLng }));
      reverseGeocode(nLat, nLng);
    });
    mapInstanceRef.current = map;
    markerRef.current = marker;
    if (!geocoderRef.current)
      geocoderRef.current = new window.google.maps.Geocoder();
    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
  }, [mapLoaded, reverseGeocode]); // eslint-disable-line

  // Mount map when on step 0 and maps loaded
  useEffect(() => {
    if (mapLoaded && currentStep === 0) {
      mapInstanceRef.current = null; // reset so initMap re-runs on back navigation
      setTimeout(initMap, 100);
    }
  }, [mapLoaded, currentStep, initMap]);

  // Pan existing map when coords change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && formData.latitude && formData.longitude) {
      const pos = { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) };
      mapInstanceRef.current.panTo(pos);
      markerRef.current.setPosition(pos);
    }
  }, [formData.latitude, formData.longitude]);

  // Search autocomplete
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim() || !autocompleteServiceRef.current) { setSearchResults([]); return; }
    setSearchLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: val, componentRestrictions: { country: "in" } },
      (predictions, status) => {
        setSearchLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions)
          setSearchResults(predictions);
        else setSearchResults([]);
      }
    );
  };

  // Select a place from dropdown
  const handleSelectPlace = (placeId, description) => {
    setSearchQuery(description);
    setSearchResults([]);
    if (!window.google) return;
    if (!geocoderRef.current) geocoderRef.current = new window.google.maps.Geocoder();
    geocoderRef.current.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const nLat = loc.lat().toFixed(6);
        const nLng = loc.lng().toFixed(6);
        const { pincode, city, areaName } = extractAddressComponents(results);
        setFormData((f) => ({
          ...f, latitude: nLat, longitude: nLng,
          ...(pincode ? { pincode } : {}),
          ...(city ? { city } : {}),
          ...(areaName ? { areaName } : {}),
        }));
      }
    });
  };

  // Use current location
  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const nLat = pos.coords.latitude.toFixed(6);
        const nLng = pos.coords.longitude.toFixed(6);
        setFormData((f) => ({ ...f, latitude: nLat, longitude: nLng }));
        reverseGeocode(nLat, nLng);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Pre-fill on edit OR auto-detect on new
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
        longitude: editAddress.longitude || editAddress.location?.longitude || "",
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setFormData((f) => ({
            ...f,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          })),
          () => setFormData((f) => ({
            ...f,
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          })),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setFormData((f) => ({
          ...f, latitude: DEFAULT_LOCATION.latitude, longitude: DEFAULT_LOCATION.longitude,
        }));
      }
    }
  }, []); // eslint-disable-line

  // Validation
  const validateStep = () => {
    const e = {};
    if (currentStep === 0 && (!formData.latitude || !formData.longitude)) e.location = "Location required";
    if (currentStep === 1) {
      if (!formData.shopName.trim()) e.shopName = "Shop name is required";
      if (!formData.shopNoRoad.trim()) e.shopNoRoad = "Shop number & road is required";
      if (!formData.areaName.trim()) e.areaName = "Area name is required";
      if (!formData.pincode.trim() || formData.pincode.length !== 6 || isNaN(formData.pincode))
        e.pincode = "Valid 6-digit pincode is required";
      if (!formData.saveAddressAs.trim()) e.saveAddressAs = "Address label is required";
    }
    if (currentStep === 2) {
      if (!formData.selectedTime) e.selectedTime = "Please select a time";
      if (!formData.lunchStart && formData.lunchEnd) e.lunchStart = "Please select lunch start time";
      if (formData.lunchStart && !formData.lunchEnd) e.lunchEnd = "Please select lunch end time";
    }
    if (currentStep === 3) {
      if (formData.gstOption === "i_want_gst" && !formData.gstin.trim()) e.gstin = "GSTIN is required";
      else if (formData.gstOption === "i_want_gst" && !gstVerified) e.gstin = "Please verify GSTIN";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 0) reverseGeocode(formData.latitude, formData.longitude);
      setCurrentStep((s) => s + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else navigate(-1);
  };

  const verifyGST = () => {
    if (!formData.gstin.trim()) return;
    setGstVerifying(true);
    setTimeout(() => { setGstVerifying(false); setGstVerified(true); }, 1500);
  };

  const handleFinish = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    const addressData = {
      shopName: formData.shopName, shopNumber: formData.shopNoRoad,
      areaName: formData.areaName, pincode: formData.pincode,
      city: formData.city, town: formData.city,
      deliveryContact: formData.deliveryContact,
      saveAddress: true, default: true,
      shopOpenTime: formData.selectedTime, openClosedDays: formData.weeklySchedule,
      lunchTime: { lunchStart: formData.lunchStart, lunchEnd: formData.lunchEnd },
      location: { latitude: formData.latitude, longitude: formData.longitude },
      saveAddressAs: formData.saveAddressAs,
      gstOption: formData.gstOption, gstin: formData.gstin,
    };
    try {
      let response, data;
      if (isEdit && editAddress?._id) {
        response = await fetch(`https://sangamwholesale.com/api/addresses/${editAddress._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
      } else {
        response = await fetch("https://sangamwholesale.com/api/addresses/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        });
      }
      data = await response.json();
      setIsLoading(false);
      if (data.success) navigate("/profile", { state: { addressSaved: true } });
      else setErrors({ api: data.message || "Failed to save address" });
    } catch {
      setIsLoading(false);
      setErrors({ api: "Failed to save address. Please try again." });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Search your shop location</h3>

            {/* Search bar */}
            <div className="relative">
              <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#702834]">
                <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  className="flex-1 outline-none text-sm bg-transparent"
                  placeholder="Search area, street, landmark..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  autoComplete="off"
                />
                {searchLoading && <Loader2 size={16} className="animate-spin text-gray-400 ml-2" />}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
                  {searchResults.map((r) => (
                    <button key={r.place_id} type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b last:border-0 flex items-start gap-2"
                      onClick={() => handleSelectPlace(r.place_id, r.description)}>
                      <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-gray-700 leading-snug">{r.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current location button */}
            <button type="button" onClick={handleUseCurrentLocation} disabled={locating}
              className="flex items-center gap-2 text-[#702834] font-medium text-sm hover:underline disabled:opacity-60">
              {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {locating ? "Detecting location..." : "Use my current location"}
            </button>

            {/* map is rendered outside renderStep so it stays in DOM — see below */}
            {errors.location && <div className="text-red-500 text-sm">{errors.location}</div>}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Name</label>
              <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.shopName ? "border-red-500" : "border-gray-300"}`}
                value={formData.shopName} onChange={(e) => setFormData((f) => ({ ...f, shopName: e.target.value }))}
                placeholder="Shop Name on the Board" />
              {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
            </div>

            {/* Shop No & Road */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shop No & Road</label>
              <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.shopNoRoad ? "border-red-500" : "border-gray-300"}`}
                value={formData.shopNoRoad} onChange={(e) => setFormData((f) => ({ ...f, shopNoRoad: e.target.value }))}
                placeholder="Shop No & Road" />
              {errors.shopNoRoad && <p className="text-red-500 text-xs mt-1">{errors.shopNoRoad}</p>}
            </div>

            {/* Area Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Area Name</label>
              <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.areaName ? "border-red-500" : "border-gray-300"}`}
                value={formData.areaName} onChange={(e) => setFormData((f) => ({ ...f, areaName: e.target.value }))}
                placeholder="Area Name" />
              {errors.areaName && <p className="text-red-500 text-xs mt-1">{errors.areaName}</p>}
            </div>

            {/* Pincode + City side by side — no map here */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.pincode ? "border-red-500" : "border-gray-300"}`}
                  value={formData.pincode} onChange={(e) => setFormData((f) => ({ ...f, pincode: e.target.value }))}
                  placeholder="Pincode" maxLength={6} inputMode="numeric" />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City / Town</label>
                <input className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834]"
                  value={formData.city} onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                  placeholder="City / Town" />
              </div>
            </div>

            {/* Delivery Contact */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Delivery Contact</label>
              <input className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834]"
                value={formData.deliveryContact} onChange={(e) => setFormData((f) => ({ ...f, deliveryContact: e.target.value }))}
                placeholder="Contact number" maxLength={10} inputMode="numeric" />
            </div>

            {/* Save Address As */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Save Address As</label>
              <input className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.saveAddressAs ? "border-red-500" : "border-gray-300"}`}
                value={formData.saveAddressAs} onChange={(e) => setFormData((f) => ({ ...f, saveAddressAs: e.target.value }))}
                placeholder="e.g. Home, Office, Other" />
              {errors.saveAddressAs && <p className="text-red-500 text-xs mt-1">{errors.saveAddressAs}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Open Time</label>
              <select className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.selectedTime ? "border-red-500" : "border-gray-300"}`}
                value={formData.selectedTime} onChange={(e) => setFormData((f) => ({ ...f, selectedTime: e.target.value }))}>
                <option value="">Select Time</option>
                {timeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {errors.selectedTime && <p className="text-red-500 text-xs mt-1">{errors.selectedTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Open / Closed Days</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(formData.weeklySchedule).map((day) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-24 text-sm text-gray-600">{day}</span>
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={formData.weeklySchedule[day]}
                      onChange={(e) => setFormData((f) => ({ ...f, weeklySchedule: { ...f.weeklySchedule, [day]: e.target.value } }))}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lunch Start</label>
                <select className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.lunchStart ? "border-red-500" : "border-gray-300"}`}
                  value={formData.lunchStart} onChange={(e) => setFormData((f) => ({ ...f, lunchStart: e.target.value }))}>
                  <option value="">Lunch Start</option>
                  {lunchOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.lunchStart && <p className="text-red-500 text-xs mt-1">{errors.lunchStart}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lunch End</label>
                <select className={`border rounded-lg px-3 py-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.lunchEnd ? "border-red-500" : "border-gray-300"}`}
                  value={formData.lunchEnd} onChange={(e) => setFormData((f) => ({ ...f, lunchEnd: e.target.value }))}>
                  <option value="">Lunch End</option>
                  {lunchOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {errors.lunchEnd && <p className="text-red-500 text-xs mt-1">{errors.lunchEnd}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">GST Option</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formData.gstOption === "i_want_gst"}
                    onChange={() => setFormData((f) => ({ ...f, gstOption: "i_want_gst" }))} />
                  I want GST invoice
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formData.gstOption === "i_do_not_want_gst"}
                    onChange={() => setFormData((f) => ({ ...f, gstOption: "i_do_not_want_gst" }))} />
                  I do not want GST invoice
                </label>
              </div>
            </div>
            {formData.gstOption === "i_want_gst" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN</label>
                <div className="flex gap-2">
                  <input className={`border rounded-lg px-3 py-2.5 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#702834] ${errors.gstin ? "border-red-500" : "border-gray-300"}`}
                    value={formData.gstin} onChange={(e) => setFormData((f) => ({ ...f, gstin: e.target.value }))}
                    placeholder="Enter GSTIN" />
                  <button type="button" onClick={verifyGST} disabled={gstVerifying || !formData.gstin}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60">
                    {gstVerifying ? <Loader2 className="animate-spin" size={18} /> : gstVerified ? <Check size={18} /> : "Verify"}
                  </button>
                </div>
                {errors.gstin && <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>}
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-xl mx-auto w-full py-8 px-4">

        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="mr-2 p-2 rounded hover:bg-gray-200">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-bold">{isEdit ? "Edit Address" : "Add Address"}</h2>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-1 text-sm ${idx === currentStep ? "text-[#702834] font-bold" : idx < currentStep ? "text-green-600 font-medium" : "text-gray-400"}`}>
                {idx < currentStep ? <Check size={14} /> : <span>{idx + 1}.</span>}
                {step}
              </div>
              {idx < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          {renderStep()}

          {/* Map always stays in DOM to avoid Google Maps re-init issues.
              Visible only on step 0 via CSS — never removed from DOM */}
          <div
            ref={mapRef}
            style={{ height: currentStep === 0 ? 260 : 0, marginTop: currentStep === 0 ? 16 : 0, overflow: "hidden", visibility: currentStep === 0 ? "visible" : "hidden", pointerEvents: currentStep === 0 ? "auto" : "none" }}
            className="w-full rounded-lg border shadow-sm transition-all"
          >
            {!mapLoaded && currentStep === 0 && (
              <div className="w-full flex items-center justify-center bg-gray-100" style={{ height: 260 }}>
                <Loader2 className="animate-spin text-gray-400" size={28} />
              </div>
            )}
          </div>

          {/* Coords hint — only step 0 */}
          {currentStep === 0 && formData.latitude && formData.longitude && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded px-3 py-2 mt-3">
              <MapPin size={12} className="text-[#702834]" />
              {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              <span className="text-gray-400 ml-1">— drag the pin to adjust</span>
            </div>
          )}

          {errors.api && <p className="text-red-500 text-sm mt-3">{errors.api}</p>}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button onClick={handleBack}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-50">
              Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button onClick={handleNext}
              className="flex-1 bg-[#702834] text-white rounded-lg py-3 font-normal hover:bg-[#5a1f28]">
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} disabled={isLoading}
              className="flex-1 bg-[#702834] text-white rounded-lg py-3 font-medium hover:bg-[#5a1f28] disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Address"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Address;

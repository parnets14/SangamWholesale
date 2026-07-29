import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, UserCircle2, AlertCircle } from "lucide-react";

export default function About() {
  const [expandedBio, setExpandedBio] = useState(null);
  const [founders, setFounders] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [foundersLoading, setFoundersLoading] = useState(true);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [foundersError, setFoundersError] = useState("");
  const [leadersError, setLeadersError] = useState("");

  // Relative URLs work in both dev (Vite proxy → localhost:1083) and production
  const FOUNDERS_API_URL = "/api/Founder";
  const LEADERS_API_URL = "/api/Team";

  // Fetch founders from API
  useEffect(() => {
    fetchFounders();
    fetchLeaders();
  }, []);

  const fetchFounders = async () => {
    try {
      setFoundersLoading(true);
      setFoundersError("");
      // cache: 'no-store' bypasses the browser cache so we always get fresh JSON
      const response = await fetch(FOUNDERS_API_URL, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setFounders(Array.isArray(data) ? data : []);
      } else {
        setFoundersError("Failed to fetch founders data");
      }
    } catch (error) {
      setFoundersError("Error connecting to server");
      console.error("Founders fetch error:", error);
    } finally {
      setFoundersLoading(false);
    }
  };

  const fetchLeaders = async () => {
    try {
      setLeadersLoading(true);
      setLeadersError("");
      const response = await fetch(LEADERS_API_URL, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setLeaders(Array.isArray(data) ? data : []);
      } else {
        setLeadersError("Failed to fetch Team data");
      }
    } catch (error) {
      setLeadersError("Error connecting to server");
      console.error("Leaders fetch error:", error);
    } finally {
      setLeadersLoading(false);
    }
  };

  // In dev, images are proxied via Vite; in production they're served directly
  const BASE_URL = "";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/kyc.avif";
    if (imagePath.startsWith("http")) return imagePath;
    // backend saves as "founders/filename.jpg" or "team/filename.jpg"
    // static middleware serves uploads/ at root, so URL is /founders/filename.jpg
    return `${BASE_URL}/${imagePath}`;
  };

  const toggleBioExpansion = (index, type) => {
    setExpandedBio(
      expandedBio === `${type}-${index}` ? null : `${type}-${index}`
    );
  };

  const renderProfileCard = (profile, index, type) => {
    const isExpanded = expandedBio === `${type}-${index}`;
    const bio = profile.description || profile.bio || "";
    const truncatedBio = bio.length > 300 ? `${bio.slice(0, 300)}...` : bio;

    return (
      <div
        key={`${type}-${index}`}
        className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 mt-16 transform transition-all duration-300 hover:shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-center p-6">
          <div className="mb-4 md:mb-0 md:mr-6">
            <img
              src={getImageUrl(profile.image)}
              alt={profile.name}
              className="w-32 h-32 object-cover rounded-full border-4 border-green-100 shadow-md transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.src = "/kyc.avif"; // fallback image
              }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              {profile.name}
            </h3>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
              {isExpanded ? bio : truncatedBio}
            </p>
            {bio.length > 300 && (
              <button
                onClick={() => toggleBioExpansion(index, type)}
                className="text-green-600 hover:text-green-800 transition-colors flex items-center font-medium"
              >
                {isExpanded ? "Show Less" : "Read More"}
                {isExpanded ? (
                  <ChevronUp className="ml-2 w-4 h-4" />
                ) : (
                  <ChevronDown className="ml-2 w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title, data, loading, error, retryFunction, type) => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
        {title}
      </h2>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading {title.toLowerCase()}...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button
            onClick={retryFunction}
            className="ml-auto text-white px-4 py-2 rounded transition-colors"
            style={{ backgroundColor: '#702834' }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <UserCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>
            No {title.toLowerCase()} found. Please add {title.toLowerCase()}{" "}
            through the admin panel.
          </p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div>
          {data.map((item, index) => renderProfileCard(item, index, type))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-green-50 min-h-screen mt-16">
      {/* Hero Section */}
      <div className="text-white py-20 px-4" style={{ background: 'linear-gradient(135deg, #F44400, #d63a00)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 transform transition-all duration-500 hover:scale-105">
            Transforming Ubook Distribution
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">
            Empowering Bookstores, Publishers, and Readers Through Technology
          </p>
        </div>
      </div>

      {/* Company Overview */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="bg-white shadow-xl rounded-xl p-8 text-center transform transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-green-800 mb-6">
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            At uBook, we are reimagining the traditional book supply chain. By
            combining technology, data-driven logistics, and intelligent
            procurement, we make book sourcing simpler, faster, and more
            cost-effective for every stakeholder in the publishing ecosystem.
            <br />
            <br />
            uBook was founded with a clear mission: to transform the way books
            are distributed, accessed, and sold across India by empowering small
            bookstores, educators, and independent publishers through
            technology.
            <br />
            <br />
            As India's leading B2B book distribution platform, uBook connects
            thousands of retailers, libraries, schools, and institutions with
            top publishers and distributors — all through a single, seamless
            digital ecosystem.
          </p>
        </div>
      </div>

      {/* Founders Section */}
      <div className="bg-white py-16 px-4">
        {renderSection(
          "Founders",
          founders,
          foundersLoading,
          foundersError,
          fetchFounders,
          "founder"
        )}
      </div>

      {/* Team Section */}
      <div className="bg-green-50 py-16 px-4">
        {renderSection(
          "Our Team",
          leaders,
          leadersLoading,
          leadersError,
          fetchLeaders,
          "leader"
        )}
      </div>

      {/* Values Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-green-50 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Innovation
              </h3>
              <p className="text-gray-600">
                Continuously pushing boundaries to create better solutions for
                the book distribution ecosystem.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Accessibility
              </h3>
              <p className="text-gray-600">
                Making books and education accessible to everyone, everywhere in
                India.
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Partnership
              </h3>
              <p className="text-gray-600">
                Building strong relationships with bookstores, publishers, and
                educational institutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

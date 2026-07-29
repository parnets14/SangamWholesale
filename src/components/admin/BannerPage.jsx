import { useState, useEffect } from "react";
import Modal from "react-modal";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

Modal.setAppElement("#root");

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFiles: [],
    imageUrls: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const API_BASE_URL = "/api/banners";

  const getToken = () => localStorage.getItem("adminToken");

  // Fetch all banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsPageLoading(true);
      const response = await fetch(API_BASE_URL, { cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
        // Backend returns { count, banners } — extract the array
        setBanners(Array.isArray(data) ? data : (data.banners ?? []));
      } else if (response.status === 404) {
        setBanners([]);
      } else {
        console.error("Failed to fetch banners");
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      imageFiles: files, // Replace with new files
      imageUrls: urls, // Replace with new URLs
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const newImageUrls = [...prev.imageUrls];
      const newImageFiles = [...prev.imageFiles];

      newImageUrls.splice(index, 1);
      newImageFiles.splice(index, 1);

      return {
        ...prev,
        imageUrls: newImageUrls,
        imageFiles: newImageFiles,
      };
    });
  };

  const openModal = (banner = null) => {
    if (banner) {
      setCurrentBanner(banner);
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        imageFiles: [],
        imageUrls: banner.images || [],
      });
    } else {
      setCurrentBanner(null);
      setFormData({
        title: "",
        description: "",
        imageFiles: [],
        imageUrls: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Clean up object URLs
    formData.imageUrls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      // Append all image files with the field name "image"
      formData.imageFiles.forEach((file) => {
        formDataToSend.append("image", file);
      });

      let response;
      if (currentBanner) {
        // Update existing banner
        response = await fetch(`${API_BASE_URL}/${currentBanner._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formDataToSend,
        });
      } else {
        // Create new banner
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formDataToSend,
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log("Banner saved successfully:", result);

        // Refresh the banners list
        await fetchBanners();
        closeModal();
      } else {
        const errorData = await response.json();
        console.error("Error saving banner:", errorData);
        alert(`Error: ${errorData.error || "Failed to save banner"}`);
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (banner) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/${banner._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        if (response.ok) {
          console.log("Banner deleted successfully");
          // Refresh the banners list
          await fetchBanners();
        } else {
          const errorData = await response.json();
          console.error("Error deleting banner:", errorData);
          alert(`Error: ${errorData.error || "Failed to delete banner"}`);
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        alert("Network error. Please check your connection.");
      }
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith("http")) return imagePath;
    return `/${imagePath}`;
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Banner Management</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No banners found</div>
          <button
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="relative">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {banner.images && banner.images.length > 0 ? (
                    banner.images.slice(0, 4).map((imagePath, index) => (
                      <img
                        key={index}
                        src={getImageUrl(imagePath)}
                        alt={`banner-${index}`}
                        className="h-24 w-full object-cover rounded"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 w-full h-24 bg-gray-100 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                {banner.images && banner.images.length > 4 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    +{banner.images.length - 4} more
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{banner.title}</h3>
                {banner.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {banner.images?.length || 0} images
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => openModal(banner)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit Banner */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel="Banner Form"
      >
        <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {currentBanner ? "Edit Banner" : "Add New Banner"}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded h-20"
                placeholder="Enter banner description..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Banner Images *
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
                required={!currentBanner && formData.imageFiles.length === 0}
              />
              <div className="text-xs text-gray-500 mt-1">
                You can select up to 10 images
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Preview:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url.startsWith("blob:") ? url : getImageUrl(url)}
                          alt={`preview-${index}`}
                          className="h-20 w-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading
                  ? "Saving..."
                  : currentBanner
                  ? "Update Banner"
                  : "Create Banner"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: transparent;
          outline: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BannerPage;

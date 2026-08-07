import { useState, useEffect } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

Modal.setAppElement("#root");

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
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

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsPageLoading(true);
      const response = await fetch(API_BASE_URL, { cache: "no-store" });

      if (response.ok) {
        const data = await response.json();
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
      imageFiles: files,
      imageUrls: urls,
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const newImageUrls = [...prev.imageUrls];
      const newImageFiles = [...prev.imageFiles];
      newImageUrls.splice(index, 1);
      newImageFiles.splice(index, 1);
      return { ...prev, imageUrls: newImageUrls, imageFiles: newImageFiles };
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
      setFormData({ title: "", description: "", imageFiles: [], imageUrls: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    formData.imageUrls.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formData.imageFiles.forEach((file) => {
        formDataToSend.append("image", file);
      });

      let response;
      if (currentBanner) {
        response = await fetch(`${API_BASE_URL}/${currentBanner._id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formDataToSend,
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formDataToSend,
        });
      }

      if (response.ok) {
        await fetchBanners();
        closeModal();
      } else {
        const errorData = await response.json();
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
          await fetchBanners();
        } else {
          const errorData = await response.json();
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
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
        <p className="text-sm text-gray-500 mt-1">Add, edit or remove homepage banners.</p>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          + Add New Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No banners found</div>
          <button
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: "#702834" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
          >
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image Count</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {banner.images && banner.images.length > 0 ? (
                        <img
                          src={getImageUrl(banner.images[0])}
                          alt={banner.title}
                          className="w-20 h-14 object-cover rounded"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                      ) : (
                        <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{banner.title}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm max-w-xs truncate">{banner.description}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{banner.images?.length || 0} images</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setViewItem(banner)}
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openModal(banner)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{viewItem.title}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</p>
                <p className="text-gray-800 font-medium">{viewItem.title}</p>
              </div>
              {viewItem.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{viewItem.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Images ({viewItem.images?.length || 0})
                </p>
                {viewItem.images && viewItem.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {viewItem.images.map((imgPath, index) => (
                      <img
                        key={index}
                        src={getImageUrl(imgPath)}
                        alt={`Banner image ${index + 1}`}
                        className="w-full h-32 object-cover rounded border border-gray-100"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No images</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewItem(null)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
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
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
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
              <label className="block text-gray-700 mb-2">Banner Images *</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
                required={!currentBanner && formData.imageFiles.length === 0}
              />
              <div className="text-xs text-gray-500 mt-1">You can select up to 10 images</div>

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
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
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
                className="px-4 py-2 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#702834" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
              >
                {isLoading ? "Saving..." : currentBanner ? "Update Banner" : "Create Banner"}
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

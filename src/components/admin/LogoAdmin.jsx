import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const LogoAdmin = () => {
  const [logos, setLogos] = useState([
    { id: 1, image: PLACEHOLDER_IMAGE }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [formData, setFormData] = useState({ image: null });
  const [previewImage, setPreviewImage] = useState('');

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this logo?")) {
      setLogos(logos.filter(logo => logo.id !== id));
    }
  };

  const handleEdit = (logo) => {
    setCurrentLogo(logo);
    setFormData({ image: null });
    setPreviewImage(logo.image);
    setIsModalOpen(true);
  };

  const handleView = (logo) => {
    setViewItem(logo);
  };

  const handleAddNew = () => {
    setCurrentLogo(null);
    setFormData({ image: null });
    setPreviewImage('');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!formData.image && !currentLogo) return;
    const imageUrl = formData.image ? previewImage : currentLogo?.image;

    if (currentLogo) {
      setLogos(logos.map(logo =>
        logo.id === currentLogo.id ? { ...logo, image: imageUrl } : logo
      ));
    } else {
      const newLogo = {
        id: Math.max(...logos.map(l => l.id), 0) + 1,
        image: imageUrl
      };
      setLogos([...logos, newLogo]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Logo Management</h1>
        <p className="text-sm text-gray-500 mt-1">Update the app logo displayed across the platform.</p>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddNew}
          className="px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: "#702834" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a1f29")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#702834")}
        >
          + Add New Logo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">No logos found</td>
                </tr>
              ) : (
                logos.map((logo) => (
                  <tr key={logo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={logo.image}
                        alt={`Logo ${logo.id}`}
                        className="w-20 h-12 object-contain"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">Logo #{logo.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(logo)}
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white px-3 py-1 rounded text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(logo)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(logo.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setViewItem(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">Logo #{viewItem.id}</h3>
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 flex justify-center max-h-[70vh] overflow-y-auto">
              <img
                src={viewItem.image}
                alt={`Logo ${viewItem.id}`}
                className="max-w-full max-h-64 object-contain rounded border border-gray-100"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setViewItem(null)} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {currentLogo ? 'Edit Logo' : 'Add New Logo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Logo Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {previewImage && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-24 h-auto object-contain border border-gray-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#702834] hover:bg-[#5a1f29] text-white rounded transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoAdmin;

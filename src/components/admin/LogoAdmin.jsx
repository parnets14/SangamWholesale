import React, { useState } from 'react';
import { PLACEHOLDER_IMAGE } from "../../utils/placeholderImage";

const LogoAdmin = () => {
  // Dummy data
  const [logos, setLogos] = useState([
    { id: 1, image: PLACEHOLDER_IMAGE }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [formData, setFormData] = useState({ image: null });
  const [previewImage, setPreviewImage] = useState('');

  const handleDelete = (id) => {
    setLogos(logos.filter(logo => logo.id !== id));
  };

  const handleEdit = (logo) => {
    setCurrentLogo(logo);
    setFormData({ image: null });
    setPreviewImage(logo.image);
    setIsModalOpen(true);
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
    // In a real app, you would upload the image file to your server here
    // For this example, we'll just use the preview URL directly
    if (!formData.image && !currentLogo) return;
    
    const imageUrl = formData.image ? previewImage : currentLogo?.image;

    if (currentLogo) {
      // Update existing logo
      setLogos(logos.map(logo => 
        logo.id === currentLogo.id ? { ...logo, image: imageUrl } : logo
      ));
    } else {
      // Add new logo
      const newLogo = {
        id: Math.max(...logos.map(l => l.id), 0) + 1,
        image: imageUrl
      };
      setLogos([...logos, newLogo]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Logo Management</h2>
      
      <button 
        onClick={handleAddNew} 
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-6 transition-colors"
      >
        Add New Logo
      </button>
      
      <div className="space-y-4">
        {logos.map(logo => (
          <div key={logo.id} className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg">
            <img 
              src={logo.image} 
              alt="Logo" 
              className="w-24 h-auto object-contain" 
            />
            <div className="flex-grow">
              <p className="text-gray-600">Logo #{logo.id}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(logo)} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(logo.id)} 
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {currentLogo ? 'Edit Logo' : 'Add New Logo'}
            </h3>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
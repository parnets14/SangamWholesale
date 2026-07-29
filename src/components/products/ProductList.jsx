// // import React from 'react';
// // import { useCart } from '../cart/CartContext';

// // export default function ProductList({ products, onBack }) {
// //   const { addToCart } = useCart();

// //   return (
// //     <div>
// //       <button 
// //         onClick={onBack}
// //         className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
// //       >
// //         ← Back to Subcategories
// //       </button>
      
// //       <div className="grid grid-cols-4 gap-4">
// //         {products.map(product => (
// //           <div key={product.id} className="border rounded-lg p-4 shadow-sm">
// //             <img 
// //               src={"/g4.avif"} 
// //               alt={product.name} 
// //               className="w-full h-40 object-cover mb-2 rounded"
// //             />
// //             <h3 className="font-medium">{product.name}</h3>
// //             <p className="text-gray-600">${product.price}</p>
// //             <button
// //               onClick={() => addToCart(product)}
// //               className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
// //             >
// //               Add to Cart
// //             </button>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
// import React from 'react';
// import { motion } from 'framer-motion';
// import { ChevronLeft, ShoppingCart } from 'lucide-react';
// import { useCart } from '../cart/CartContext';

// const ProductList = ({ subcategory, onBack }) => {
//   const { addToCart } = useCart();

//   return (
//     <div className="space-y-6">
//       <button 
//         onClick={onBack}
//         className="flex items-center text-green-700 hover:text-green-900 mb-4"
//       >
//         <ChevronLeft size={18} className="mr-1" />
//         Back to Subcategories
//       </button>
      
//       <h2 className="text-xl font-bold text-green-800">{subcategory.name}</h2>
      
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {subcategory.products.map(product => (
//           <motion.div
//             key={product.id}
//             whileHover={{ y: -5 }}
//             className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100"
//           >
             
//             <div className="p-4">
//             <span className="text-xl">{product.icon}</span>
            
//               <h3 className="font-semibold text-lg text-green-900">{product.name}</h3>
//               <p className="text-green-700 text-sm mt-1">{product.description}</p>
//               <div className="flex justify-between items-center mt-4">
//                 <span className="font-bold text-green-800">₹{product.price}</span>
//                 <button
//                   onClick={() => addToCart(product)}
//                   className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
//                 >
//                   <ShoppingCart size={18} />
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductList;
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../cart/CartContext';

const ProductList = ({ subcategory, onBack }) => {
  const { addToCart } = useCart();

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-green-700 hover:text-green-900 mb-4"
      >
        <ChevronLeft size={18} className="mr-1" />
        Back to Subcategories
      </button>
      
      <h2 className="text-xl font-bold text-green-800">{subcategory.name}</h2>

      {/* Scrollable area for product cards */}
      <div className="max-h-[520px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subcategory.products.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100"
            >
              <div className="p-4">
                {/* <span className="text-xl">{product.icon}</span> */}
                 {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md mb-2 mt-2"
                  />
                )} 
                <h3 className="font-semibold text-lg text-green-900">{product.name}</h3>
                <p className="text-green-700 text-sm mt-1">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-green-800">₹{product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;

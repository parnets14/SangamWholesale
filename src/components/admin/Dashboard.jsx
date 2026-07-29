import React from "react";
import { Link } from "react-router-dom";

const summaryCards = [
  {
    title: "Categories",
    icon: "🗂️",
    link: "/admin/category",
    color: "bg-blue-100 text-blue-800",
    count: "-",
  },
  {
    title: "Subcategories",
    icon: "📂",
    link: "/admin/subcategory",
    color: "bg-green-100 text-green-800",
    count: "-",
  },
  {
    title: "Products",
    icon: "🛍️",
    link: "/admin/product",
    color: "bg-purple-100 text-purple-800",
    count: "-",
  },
  {
    title: "Orders",
    icon: "📦",
    link: "/admin/orders",
    color: "bg-yellow-100 text-yellow-800",
    count: "-",
  },
  {
    title: "Return Orders",
    icon: "🔄",
    link: "/admin/return-orders",
    color: "bg-pink-100 text-pink-800",
    count: "-",
  },
  {
    title: "Users",
    icon: "👤",
    link: "/admin/User",
    color: "bg-gray-100 text-gray-800",
    count: "-",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {summaryCards.map((card) => (
            <Link to={card.link} key={card.title} className="block">
              <div className={`p-6 rounded-xl shadow-sm hover:shadow-md transition duration-200 ${card.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">{card.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{card.count}</h3>
                  </div>
                  <span className="text-3xl">{card.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

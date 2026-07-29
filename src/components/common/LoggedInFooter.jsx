import React from 'react';

const LoggedInFooter = () => {
  return (
    <footer className="bg-gray-900 text-white text-center p-4 mt-auto">
      <p>&copy; {new Date().getFullYear()} MyApp | Logged-in Footer</p>
    </footer>
  );
};

export default LoggedInFooter;

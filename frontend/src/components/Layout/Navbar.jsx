// import { Link } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";

// const Navbar = () => {
//   const { user, logout } = useAuth();

//   return (
//     <nav className="bg-white shadow-sm border-b">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/dashboard" className="flex-shrink-0">
//               <h1 className="text-xl font-bold text-indigo-600">TaskHive</h1>
//             </Link>
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               <Link
//                 to="/dashboard"
//                 className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
//               >
//                 Dashboard
//               </Link>
//               <Link
//                 to="/teams"
//                 className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
//               >
//                 Teams
//               </Link>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <span className="text-gray-700">Welcome, {user?.name}</span>
//             <button
//               onClick={logout}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X } from "lucide-react"; // Optional: Lucide icons for menu

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indigo-600">TaskHive</h1>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex sm:space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/teams"
              className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Teams
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4 space-y-2">
          <Link
            to="/dashboard"
            className="block text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/teams"
            className="block text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Teams
          </Link>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

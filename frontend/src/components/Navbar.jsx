import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            BlogSpace
          </Link>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <span className="text-gray-700">Welcome, <span className="font-semibold">{user.username}</span></span>
                <Link to="/blogs" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Blogs
                </Link>
                <button
                  onClick={() => logout(navigate)}
                  className="btn btn-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
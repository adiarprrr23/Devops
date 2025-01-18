import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function BlogDetail() {
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { token, user } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchBlogDetails();
      hasFetched.current = true;
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
      setBlog(response.data);
    } catch (error) {
      setError('Error fetching blog details');
      console.error('Error fetching blog:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like blogs');
      return;
    }
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlog(response.data);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="bg-white rounded-2xl shadow-sm p-8">
        <Link to="/blogs" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Blogs
        </Link>

        {blog.thumbnail && (
          <img src={blog.thumbnail} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            {blog.topic.name}
          </span>
          <span className="text-gray-500">
            by {blog.author.username}
          </span>
          <span className="text-gray-500">
            {blog.updatedAt !== blog.createdAt
              ? `Updated ${new Date(blog.updatedAt).toLocaleDateString()}`
              : `Created ${new Date(blog.createdAt).toLocaleDateString()}`}
          </span>
        </div>

        <div className="prose prose-indigo max-w-none mb-8">
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>

        <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {blog.views || 0} views
          </div>
          
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              user && blog.likes?.includes(user.id)
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill={user && blog.likes?.includes(user.id) ? "currentColor" : "none"}
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            {blog.likes?.length || 0} likes
          </button>

          {user && blog.author._id === user.id && (
            <div className="ml-auto flex gap-3">
              <Link
                to={`/blogs/edit/${blog._id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default BlogDetail;
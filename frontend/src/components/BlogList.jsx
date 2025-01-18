import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
    fetchTopics();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/blogs");
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const incrementViewCount = async (blog_id) => {
    const viewedBlogs = JSON.parse(localStorage.getItem("viewedBlogs")) || {};
    if (!viewedBlogs[blog_id + user.id]) {
      try {
        await axios.post(`http://localhost:5000/api/blogs/${blog_id}/view`);
        viewedBlogs[blog_id + user.id] = true;
        localStorage.setItem("viewedBlogs", JSON.stringify(viewedBlogs));
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/topics");
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      alert("Please login to like blogs");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlogs(blogs.map((blog) => (blog._id === id ? response.data : blog)));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const filteredBlogs = selectedTopic
    ? blogs.filter((blog) => blog.topic._id === selectedTopic)
    : blogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Blogs</h2>
        <Link
          to="/blogs/create"
          className="btn btn-primary inline-flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create New Blog
        </Link>
      </div>

      <div className="mb-8">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Topics</option>
          {topics.map((topic) => (
            <option key={topic._id} value={topic._id}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBlogs.map((blog) => (
          <article
            key={blog._id}
            className="card transition-transform transform hover:scale-105 hover:shadow-xl rounded-lg overflow-hidden bg-white shadow-lg border border-gray-100"
          >
            {blog.thumbnail && (
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                {blog.title}
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {blog.topic.name}
                </span>
                <span className="text-sm text-gray-500">
                  by {blog.author.username}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
            </div>
            <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">
                  {blog.updatedAt !== blog.createdAt
                    ? `Updated ${new Date(blog.updatedAt).toLocaleDateString()}`
                    : `Created ${new Date(
                        blog.createdAt
                      ).toLocaleDateString()}`}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {blog.views || 0} views
                  </span>
                  <button
                    onClick={() => handleLike(blog._id)}
                    className={`text-sm flex items-center gap-1 transition-colors ${
                      user && blog.likes?.includes(user.id)
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill={
                        user && blog.likes?.includes(user.id)
                          ? "currentColor"
                          : "none"
                      }
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
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link
                  to={`/blogs/${blog._id}`}
                  state={{ incrementView: true }}
                  className="btn btn-secondary py-1 px-3"
                >
                  Read More
                </Link>
                {user && blog.author._id === user.id && (
                  <>
                    <Link
                      to={`/blogs/edit/${blog._id}`}
                      className="btn btn-secondary py-1 px-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="btn btn-danger py-1 px-3"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No blogs found</p>
        </div>
      )}
    </div>
  );
}

export default BlogList;
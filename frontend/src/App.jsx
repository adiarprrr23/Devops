import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import BlogList from './components/BlogList';
import BlogCreate from './components/BlogCreate';
import BlogEdit from './components/BlogEdit';
import BlogDetail from './components/BlogDetail';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/blogs/create" element={<BlogCreate />} />
              <Route path="/blogs/edit/:id" element={<BlogEdit />} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
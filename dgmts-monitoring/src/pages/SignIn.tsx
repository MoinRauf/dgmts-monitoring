import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import logo from '../assets/logo.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  username: string;
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('json-users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      toast.success('Login successful!');
      setTimeout(() => navigate('/projects'), 2000);
    } else {
      toast.error('Invalid email or password!');
    }
  };

  return (
    <div className="page">
      <ToastContainer />
      <Header />
      {/* <Navbar /> */}
      <div className="content">
        <h2>Sign In</h2>
        <div className="form-container">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="submit-btn" onClick={handleSignIn}>
            Sign In
          </button>
        </div>

        <div className="centered-logo">
          <img
            src={logo}
            alt="DGMTS Logo"
            style={{
              position: 'fixed',
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30vw',
              opacity: 0.1,
              zIndex: -1,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      <footer>© 2025 DGMTS. All rights reserved.</footer>
    </div>
  );
};

export default SignIn;

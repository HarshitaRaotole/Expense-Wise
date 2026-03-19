import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext'; 

const Layout = ({ children, theme, toggleTheme }) => {
  const { user } = useAuth(); // If no user, this is null
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      
      {/* SIDEBAR LOGIC: Only render if user exists! */}
      {user && (
        <>
          <div className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
          <Sidebar user={user} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        </>
      )}

      <div className="main-wrapper">
        <Navbar user={user} toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />

        <div className="page-content" id="scrollable-page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
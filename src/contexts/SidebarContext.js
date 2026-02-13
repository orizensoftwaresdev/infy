// src/contexts/SidebarContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the SidebarContext
export const SidebarContext = createContext();

// Create the SidebarProvider component
export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Toggle function can also be useful
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, handleClose, handleOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to easily consume the SidebarContext
export const useSidebarContext = () => useContext(SidebarContext);
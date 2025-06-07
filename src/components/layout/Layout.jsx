import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Header from '../Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`app-layout ${theme}`} data-theme={theme}>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
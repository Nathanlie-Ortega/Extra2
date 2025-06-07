// src/pages/Pages.jsx - COMPLETELY CLEAN VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Cuisine from "./Cuisine";
import Searched from "./Searched";
import Recipe from "./Recipe";
import AuthPage from "./AuthPage";
import Category from "../components/Category";
import Search from "../components/Search";
import Header from "../components/Header";

const Pages = () => {
    return (
        <Router>
            <Header />
            <div className="pages-container">
                <Routes>
                    {/* ORIGINAL ROUTES - Keep exactly as they were */}
                    <Route path="/" element={[<Search />, <Category />, <Home />]} />
                    <Route path="/cuisine/:type" element={[<Search />, <Category />, <Cuisine />]} />
                    <Route path="/searched/:search" element={[<Search />, <Category />, <Searched />]} />
                    <Route path="/searched/:search/recipe/:name" element={<Recipe />} />
                    <Route path="/cuisine/:type/recipe/:name" element={<Recipe />} />
                    <Route path="/recipe/:name" element={<Recipe />} />
                    
                    {/* LOGIN ROUTE - Use your existing AuthPage */}
                    <Route path="/login" element={<AuthPage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default Pages;
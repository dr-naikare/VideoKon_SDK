// src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCookie } from '@/lib/cookie'; // Adjust the path as needed

const PrivateRoute = ({ children }) => {
    const token = getCookie('token');
    console.log('Token from cookie:', token);
    
    if (!token) {
        console.log('No token found in cookies. Redirecting to login page');
        return <Navigate to="/login" />;
    }

    console.log('Token found in cookies. Rendering children');
    return children;
};

export default PrivateRoute;

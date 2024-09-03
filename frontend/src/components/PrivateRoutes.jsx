import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    

    if (!token) {

        console.log('No token found. Redirecting to login page');
        return <Navigate to="/login" />;
    }

    console.log('Token found. Rendering children');

    return children;
};

export default PrivateRoute;
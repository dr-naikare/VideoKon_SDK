// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCookie, setCookie } from '@/lib/cookie'; // Adjust the path as needed
import {jwtDecode} from 'jwt-decode'; // Correct import
import axios from 'axios';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize with null to handle loading state

    useEffect(() => {
        const checkToken = async () => {
            const token = getCookie('accesstoken');
            const refreshToken = getCookie('refreshtoken');

            if (!token) {
                console.log('No access token found in cookies. Redirecting to login page');
                setIsAuthenticated(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    console.log('Access token expired. Attempting to refresh token');
                    const response = await axios.post('http://localhost:5000/api/auth/refresh-token', { token: refreshToken });

                    if (response.status === 200) {
                        setCookie('accesstoken', response.data.token, { path: '/' });
                        setIsAuthenticated(true);
                    } else {
                        console.log('Failed to refresh token. Redirecting to login page');
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('Access token is valid. Rendering children');
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.log('Error decoding token or refreshing token:', error);
                setIsAuthenticated(false);
            }
        };

        checkToken();
    }, []);

    if (isAuthenticated === null) {
        // Optionally, you can return a loading spinner or some placeholder here
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        console.log('User is not authenticated. Redirecting to login page');
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
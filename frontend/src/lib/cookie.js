

import Cookies from 'js-cookie';

/**
 * Retrieves a cookie value by name.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} The value of the cookie or null if not found.
 */
export const getCookie = (name) => {
    return Cookies.get(name) || null;
};

/**
 * Sets a cookie with given name, value and options.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {object} [options] - Optional parameters (expires, path, etc.).
 */
export const setCookie = (name, value, options = {}) => {
    Cookies.set(name, value, options);
};

/**
 * Deletes a cookie by name.
 * @param {string} name - The name of the cookie to delete.
 */
export const deleteCookie = (name) => {
    Cookies.remove(name, { path: '/' });
};

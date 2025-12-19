
import { useRef } from "react";

// export const API_URL = "http://localhost:3000/api";
export const API_URL = "/api";

export const HEADERS_JSON = (token) => { 
    let header = { "Content-Type": "application/json" };
    if (token) { header["Authorization"] = `Bearer: ${token}`; }
    return header;  
};

// currently unused
export function DEBOUNCE (func, delay = 250) {
    const timer = useRef(null);
    return (...args) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            func(...args);
        }, delay);
    }
};

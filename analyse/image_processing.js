/**
 * Research-level utility functions for medical image processing and data handling
 * This module provides core functionality for loading, converting, and encoding 
 * medical imaging data in tuberculosis detection research.
 * 
 * Key components:
 * - JSON data loading for configuration and metadata
 * - Base62 encoding for compact hash representation
 * - Image to grayscale matrix conversion for analysis
 * 
 * These functions support the primary analysis pipeline by providing
 * data I/O operations and image preprocessing capabilities.
 */


/**
 * Asynchronously loads JSON data from a remote URL
 * Used for loading configuration files, metadata, and pre-trained model parameters
 * 
 * @param {string} url - The URL to fetch JSON data from
 * @returns {Promise<Object>} - Parsed JSON data from the response
 * @throws {Error} - If network request fails or JSON parsing fails
 */
const readfile = async(url)=>{
    const res = await fetch(url)
    const data = await res.json()
    return data
}


/**
 * Encodes integers into Base62 representation for compact hash storage
 * Base62 encoding uses characters [0-9A-Za-z] providing high information density
 * Fixed-length encoding ensures consistent hash sizes for indexing and comparison
 * 
 * Research application: Converts numerical hash values to compact string representations
 * for efficient storage and database indexing in medical imaging research.
 * 
 * @param {number} number - The integer to encode (non-negative)
 * @param {number} length - Target length of encoded string (default: 12)
 * @returns {string} - Base62 encoded string of specified length
 */
function intToBase62(number, length = 12) {
    /**
     * Converts a number to Base62 encoding with fixed length
     */
    const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    let n = number;
    
    // Convert to Base62
    do {
        result = base62Chars[n % 62] + result;
        n = Math.floor(n / 62);
    } while (n > 0);
    
    // Pad with leading zeros to ensure fixed length
    while (result.length < length) {
        result = '0' + result;
    }
    
    // Trim to exact length if needed
    return result.length > length ? result.slice(-length) : result;
}


/**
 * Converts an image from URL to a grayscale intensity matrix
 * Implements standard luminance conversion (ITU-R BT.601) for medical imaging
 * Returns a 2D array where each element represents pixel intensity (0-255)
 * 
 * Research significance: 
 * - Standardizes input for perceptual hashing algorithms
 * - Removes color information to focus on structural features
 * - Provides numerical representation for mathematical analysis
 * 
 * Processing pipeline:
 * 1. Load image with CORS handling
 * 2. Render to hidden canvas
 * 3. Extract RGBA pixel data
 * 4. Convert to grayscale using luminance weights
 * 5. Construct 2D intensity matrix
 * 
 * @param {string} imageUrl - URL of the image to convert
 * @returns {Promise<number[][]>} - 2D matrix of grayscale intensity values
 * @throws {Error} - If image loading fails
 */
function imageToGrayscaleMatrix(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Handle cross-origin issues
        
        img.onload = function() {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions to match the image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);
            
            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Create the grayscale matrix
            const matrix = [];
            
            for (let y = 0; y < canvas.height; y++) {
                const row = [];
                for (let x = 0; x < canvas.width; x++) {
                    // Calculate the index in the data array
                    const idx = (y * canvas.width + x) * 4;
                    
                    // Extract RGB values
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Calculate grayscale value (using luminance formula)
                    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                    
                    // Add to row
                    row.push(gray);
                }
                // Add row to matrix
                matrix.push(row);
            }
            
            resolve(matrix);
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
    });
}
export {readfile , imageToGrayscaleMatrix}
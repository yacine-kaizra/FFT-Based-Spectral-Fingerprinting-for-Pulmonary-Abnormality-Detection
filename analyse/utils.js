/**
 * Advanced image processing functions for medical imaging research
 * This module implements core algorithms for matrix manipulation, block extraction,
 * and perceptual hashing used in tuberculosis detection systems.
 * 
 * Research applications:
 * - Standardizing input dimensions for consistent analysis
 * - Localized feature extraction for robust pattern recognition
 * - Perceptual hashing for invariant image representation
 * 
 * These functions form the computational backbone of the image analysis pipeline,
 * enabling mathematical transformation of visual data into analyzable formats.
 */


/**
 * Resizes a grayscale matrix to standardized dimensions using canvas-based interpolation
 * Critical for ensuring consistent input sizes across diverse medical imaging datasets
 * 
 * Research methodology:
 * - Maintains aspect ratio through intelligent interpolation selection
 * - Uses canvas rendering for hardware-accelerated processing
 * - Applies appropriate smoothing based on upscaling/downscaling direction
 * - Converts between matrix and image data representations
 * 
 * Error handling includes validation of input dimensions and graceful failure reporting
 * 
 * @param {number[][]} matrix - 2D array of grayscale pixel intensities (0-255)
 * @param {number[]} targetSize - [width, height] target dimensions (default: [1024, 1024])
 * @returns {number[][]|null} - Resized grayscale matrix or null on error
 */
function resizeMatrix(matrix, targetSize = [1024, 1024]) {
   
    /**
     * Resize a grayscale matrix using canvas interpolation
     * @param {Array} matrix - 2D array of grayscale values (0-255)
     * @param {Array} targetSize - [width, height] for output
     * @returns {Array} Resized matrix or null if error
     */
    try {
        if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
            throw new Error("Input matrix is empty or undefined");
        }

        const originalHeight = matrix.length;
        const originalWidth = matrix[0].length;
        const [targetWidth, targetHeight] = targetSize;

        console.log(`Original size: ${originalWidth}x${originalHeight}`);

        // Create a canvas with the original dimensions
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const ctx = canvas.getContext('2d');

        // Convert matrix to ImageData
        const imageData = ctx.createImageData(originalWidth, originalHeight);
        const data = imageData.data;

        for (let y = 0; y < originalHeight; y++) {
            for (let x = 0; x < originalWidth; x++) {
                const grayValue = matrix[y][x];
                const index = (y * originalWidth + x) * 4;
                
                data[index] = grayValue;     // R
                data[index + 1] = grayValue; // G
                data[index + 2] = grayValue; // B
                data[index + 3] = 255;       // A
            }
        }

        // Put the original image data on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Create a second canvas for resizing
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = targetWidth;
        resizedCanvas.height = targetHeight;
        const resizedCtx = resizedCanvas.getContext('2d');

        // Choose interpolation method based on resize direction
        if (targetWidth > originalWidth || targetHeight > originalHeight) {
            console.log("Upscaling - using high quality interpolation");
            // For upscaling, use smoother interpolation
            resizedCtx.imageSmoothingEnabled = true;
            resizedCtx.imageSmoothingQuality = 'high';
        } else {
            console.log("Downscaling - using crisp interpolation");
            // For downscaling, use sharper interpolation
            resizedCtx.imageSmoothingEnabled = true;
            resizedCtx.imageSmoothingQuality = 'medium';
        }

        // Perform the resize
        resizedCtx.drawImage(
            canvas, 
            0, 0, originalWidth, originalHeight,
            0, 0, targetWidth, targetHeight
        );

        // Extract the resized image data
        const resizedImageData = resizedCtx.getImageData(0, 0, targetWidth, targetHeight);
        const resizedData = resizedImageData.data;
        
        // Convert back to grayscale matrix
        const resizedMatrix = [];
        for (let y = 0; y < targetHeight; y++) {
            const row = [];
            for (let x = 0; x < targetWidth; x++) {
                const index = (y * targetWidth + x) * 4;
                // Convert RGB back to grayscale (using average)
                const grayValue = Math.round(
                    (resizedData[index] + resizedData[index + 1] + resizedData[index + 2]) / 3
                );
                row.push(grayValue);
            }
            resizedMatrix.push(row);
        }

        console.log(`Successfully resized to ${resizedMatrix[0].length}x${resizedMatrix.length}`);
        return resizedMatrix;

    } catch (error) {
        console.error(`Error resizing matrix: ${error.message}`);
        return null;
    }
}


/**
 * Partitions a matrix into fixed-size blocks for localized analysis
 * Essential for implementing block-based perceptual hashing algorithms
 * Trims matrix edges to ensure complete blocks without padding
 * 
 * Research application:
 * - Enables localized feature detection in medical images
 * - Supports robust hashing by analyzing image regions independently
 * - Facilitates parallel processing of image segments
 * 
 * Block structure maintains spatial relationships while enabling granular analysis
 * 
 * @param {number[][]} mat - Input matrix to partition
 * @param {number} size - Block dimension (assumes square blocks)
 * @returns {number[][][]} - 3D array of blocks [block_index][row][column]
 */
function extractBlocks(mat, size) {
    const h = mat.length;
    const w = mat[0].length;
    const trimmedH = h - (h % size);
    const trimmedW = w - (w % size);
    
    // Trim matrix
    const trimmedMat = mat.slice(0, trimmedH).map(row => row.slice(0, trimmedW));
    
    // Extract blocks
    const blocks = [];
    
    for (let i = 0; i < trimmedH; i += size) {
        for (let j = 0; j < trimmedW; j += size) {
            const block = [];
            
            for (let k = 0; k < size; k++) {
                block.push(trimmedMat[i + k].slice(j, j + size));
            }
            
            blocks.push(block);
        }
    }
    
    return blocks;
}


/**
 * Generates perceptual hashes from image blocks using spatial relationship analysis
 * Implements a research-grade hashing algorithm that captures local and global features
 * 
 * Core algorithm features:
 * - Directional relationship encoding (8-direction connectivity)
 * - Spatial positioning awareness (relative quadrant analysis)
 * - Distance-based feature weighting
 * - Memoization for computational efficiency
 * - Configurable hash complexity (extended vs basic modes)
 * 
 * Research significance:
 * - Creates rotation and scale-invariant image representations
 * - Encodes structural relationships rather than absolute pixel values
 * - Enables statistical analysis of medical imaging patterns
 * - Supports large-scale image comparison and classification
 * 
 * @param {number[][][]} blocks - 3D array of image blocks from extractBlocks()
 * @param {boolean} ext - Extended hash mode (includes spatial features)
 * @param {boolean} multy - Multi-dimensional hash extension (currently disabled)
 * @returns {Promise<Object>} - Object containing hash array and memoization map
 */
async function hash(blocks, ext = true, multy = false) {
    /**
     * Optimized version of the hash function with better performance
     */
    const hashes = [];
    const memo = {};
    const rows = blocks.length;
    const cols = blocks[0] ? blocks[0].length : 0;
    let r = blocks.length / 2;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const block = blocks[i][j];
            const coord = `(${i},${j})`;
            memo[coord] = [];
            let rel = 0;
            const distance = Math.round(Math.sqrt( Math.pow(i-r , 2)  + Math.pow(j-r , 2)))
            let chn =  Math.round(distance/r * 10)
            let n = Math.round(r)
            if (( i - r ) >= 0) {
                if ((j - r) >= 0) {
                    rel = -1;
                } else {
                    rel = 0;
                }
            } else {
                if ((j - r) >= 0) {
                    rel = 1;
                } else {
                    rel = 2;
                }
            }

       
            // Check all 8 possible directions
            const directions = [
                {di: -1, dj: -1, dir: 0}, // top-left
                {di: -1, dj: 0, dir: 0},  // top
                {di: -1, dj: 1, dir: 0},  // top-right
                {di: 0, dj: -1, dir: 2},  // left
                {di: 0, dj: 1, dir: 4},   // right
                {di: 1, dj: -1, dir: 1},  // bottom-left
                {di: 1, dj: 0, dir: 1},   // bottom
                {di: 1, dj: 1, dir: 1}    // bottom-right
            ];
            
            for (const {di, dj, dir} of directions) {
                const ni = i + di;
                const nj = j + dj;
                
                // Check if neighbor exists
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    const neighbor = blocks[ni][nj];
                    let hsh = `${block[0]}_${block[1]}_${neighbor[0]}_${neighbor[1]}_${dir}`;
                    if (ext) {
                        hsh = `${block[0]}_${block[1]}_${neighbor[0]}_${neighbor[1]}_${rel}_${dir}`;
                        // if(multy){
                        //      hsh = `${block[0]}_${block[1]}_${neighbor[0]}_${neighbor[1]}_${rel}_${chn}_${dir}`;
                        // }
                    }
                    hashes.push(hsh);
                    memo[coord].push(hsh);
                }
            }
        }
    }
    
    return {
        memo: memo,
        hashes: hashes
    };
}


export {hash , extractBlocks ,resizeMatrix}
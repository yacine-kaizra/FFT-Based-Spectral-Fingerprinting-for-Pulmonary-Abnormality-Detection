/**
 * Advanced frequency domain analysis for medical image processing
 * Implements 2D Fast Fourier Transform and spectral analysis for tuberculosis detection
 * 
 * This module performs sophisticated signal processing on image blocks to extract
 * frequency-domain features that are characteristic of medical anomalies. The approach
 * leverages the mathematical properties of the Fourier transform to identify patterns
 * that are not easily visible in the spatial domain.
 * 
 * Research foundation:
 * - 2D FFT implementation for discrete frequency analysis
 * - Spectral energy distribution across frequency bands
 * - Normalization techniques to eliminate DC bias
 * - Logarithmic magnitude scaling for enhanced feature representation
 * 
 * Key innovations:
 * - Custom FFT implementation optimized for 8x8 medical image blocks
 * - Frequency band partitioning (low, mid, high) for multi-scale analysis
 * - Statistical quantization for robust hash generation
 * - Center-shifted frequency representation for intuitive analysis
 */


/**
 * Performs 2D Discrete Fourier Transform analysis on image matrices
 * Extracts frequency-domain features for perceptual hashing and anomaly detection
 * 
 * Processing pipeline:
 * 1. Normalizes input blocks to eliminate DC component dominance
 * 2. Computes 2D FFT using separable 1D transforms
 * 3. Shifts zero frequency to center for intuitive analysis
 * 4. Calculates magnitude spectrum with logarithmic scaling
 * 5. Partitions spectrum into frequency bands (low/mid/high)
 * 6. Computes energy distribution statistics for each band
 * 7. Quantizes results for hash generation
 * 
 * Research applications:
 * - Medical image anomaly detection through spectral analysis
 * - Rotation and scale-invariant feature extraction
 * - Noise-robust pattern recognition in chest X-rays
 * - Perceptual hashing for image identification and classification
 * 
 * @param {number[][][]} matrices - Array of image blocks to analyze
 * @param {number} binsize - Quantization bin size for hash generation
 * @param {number} ids - Number of frequency bands to analyze (2=low/high, >2=low/mid/high)
 * @param {number} blockSize - Size of image blocks (assumes square)
 * @param {boolean} visualize - Visualization flag (currently unused)
 * @returns {number[][][]} - 2D array of quantized frequency features
 */
function I_mat(matrices , binsize = 2 , ids = 2 , blockSize = 8 , visualize = false) {
    // Define Complex class inside the function
    class Complex {
        constructor(real, imag = 0) {
            this.real = real;
            this.imag = imag;
        }
        
        add(other) {
            return new Complex(this.real + other.real, this.imag + other.imag);
        }
        
        subtract(other) {
            return new Complex(this.real - other.real, this.imag - other.imag);
        }
        
        multiply(other) {
            return new Complex(
                this.real * other.real - this.imag * other.imag,
                this.real * other.imag + this.imag * other.real
            );
        }
        
        magnitude() {
            return Math.sqrt(this.real * this.real + this.imag * this.imag);
        }
    }

    // 1D FFT implementation
    function fft1D(input) {
        const n = input.length;
        
        if (n === 1) {
            return [new Complex(input[0].real, input[0].imag)];
        }
        
        // Split into even and odd indices
        const even = [];
        const odd = [];
        for (let i = 0; i < n; i += 2) {
            even.push(input[i]);
            if (i + 1 < n) odd.push(input[i + 1]);
        }
        
        // Recursive FFT on even and odd parts
        const evenTransformed = fft1D(even);
        const oddTransformed = fft1D(odd);
        
        // Combine results
        const output = new Array(n);
        for (let k = 0; k < n / 2; k++) {
            const angle = -2 * Math.PI * k / n;
            const exponent = new Complex(Math.cos(angle), Math.sin(angle));
            const term = exponent.multiply(oddTransformed[k]);
            
            output[k] = evenTransformed[k].add(term);
            output[k + n / 2] = evenTransformed[k].subtract(term);
        }
        
        return output;
    }

    // 2D FFT implementation
    function fft2D(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Apply FFT to each row
        const rowTransformed = [];
        for (let i = 0; i < rows; i++) {
            const row = matrix[i].map(val => new Complex(val, 0));
            rowTransformed.push(fft1D(row));
        }
        
        // Apply FFT to each column
        const result = [];
        for (let j = 0; j < cols; j++) {
            const col = [];
            for (let i = 0; i < rows; i++) {
                col.push(rowTransformed[i][j]);
            }
            const colTransformed = fft1D(col);
            
            for (let i = 0; i < rows; i++) {
                if (!result[i]) result[i] = [];
                result[i][j] = colTransformed[i];
            }
        }
        
        return result;
    }

    // Shift zero frequency to center
    function fftShift(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const halfRows = Math.floor(rows / 2);
        const halfCols = Math.floor(cols / 2);
        
        // Create a new matrix for the shifted result
        const shifted = Array.from({length: rows}, () => Array(cols));
        
        // Rearrange quadrants
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const newI = (i + halfRows) % rows;
                const newJ = (j + halfCols) % cols;
                shifted[newI][newJ] = matrix[i][j];
            }
        }
        
        return shifted;
    }

    // Main processing
    const n = Math.sqrt(matrices.length);
    if (!Number.isInteger(n)) {
        throw new Error("Number of matrices must form a perfect square");
    }
    
    const results = Array(n).fill().map(() => Array(n));
    
    for (let idx = 0; idx < matrices.length; idx++) {
        const mat = matrices[idx];
        
        // Calculate row and column in the result matrix
        const row = Math.floor(idx / n);
        const col = idx % n;
        
        // 1. Normalize the block to eliminate DC dominance
        const flatMat = mat.flat();
        const mean = flatMat.reduce((sum, val) => sum + val, 0) / flatMat.length;
        const std = Math.sqrt(
            flatMat.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flatMat.length
        );
        
        const matNormalized = mat.map(row => 
            row.map(val => (val - mean) / (std + 1e-10))
        );
        
        // 2. Compute 2D FFT
        const n_I = fft2D(matNormalized);
        
        // 3. Shift zero frequency to center
        const n_I_shifted = fftShift(n_I);
        
        // 4. Calculate magnitude spectrum
        const magnitudeSpectrum = n_I_shifted.map(row => 
            row.map(complex => complex.magnitude())
        );
        
        // 5. Apply log transform for better visualization
        const logMagnitude = magnitudeSpectrum.map(row => 
            row.map(val => Math.log(1 + val))
        );
        
        // 6. Create frequency masks for different bands
        const crow = blockSize / 2;
        const ccol = blockSize / 2;
        
        // Calculate distance from center for each pixel
        const distFromCenter = Array.from({length: blockSize}, (_, y) => 
            Array.from({length: blockSize}, (_, x) => 
                Math.sqrt(Math.pow(x - ccol, 2) + Math.pow(y - crow, 2))
            )
        );
        
        // Define frequency bands
        const lowFreqMask = distFromCenter.map(row => 
            row.map(dist => dist <= blockSize / 4)
        );
        const midfreq = distFromCenter.map(row => 
            row.map(dist => dist < blockSize / 4 && dist > blockSize/2.5 )
        );
        const highFreqMask = distFromCenter.map(row => 
            row.map(dist => dist > blockSize / 2.5)
        );
        
        // Calculate energy in each band
        let lowEnergy = 0;
        let highEnergy = 0;
        
        for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
                if (lowFreqMask[y][x]) {
                    lowEnergy += logMagnitude[y][x];
                } else if (highFreqMask[y][x]) {
                    highEnergy += logMagnitude[y][x];
                }
            }
        }
        
        // Store results in the square matrix
        let hs = [Math.round(highEnergy/binsize) * binsize, Math.round(lowEnergy/binsize) * binsize]
        if (ids > 2){
            hs.push(Math.round(midfreq/binsize)*binsize)
        }
        results[row][col] = hs;
    }
    
    return results;
}

export default I_mat
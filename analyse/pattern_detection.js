import { analyze } from "./pattern";

import { readfile } from "./image_processing";
/**
 * Medical image anomaly detection using cluster analysis and machine learning
 * This module implements tuberculosis detection through statistical pattern recognition
 * and spatial clustering algorithms applied to perceptual hash analysis.
 * 
 * Core detection pipeline:
 * 1. Image analysis generates spatial hash features
 * 2. Hash features are scored against trained model data
 * 3. Binary activation matrix represents suspicious regions
 * 4. Cluster analysis identifies meaningful anomaly patterns
 * 5. Weighted scoring provides diagnostic confidence metric
 * 
 * Research foundation: Connected component analysis with distance-weighted scoring
 * for medical imaging anomaly detection.
 */


/**
 * Identifies and analyzes connected components (clusters) in binary grid data
 * Implements depth-first search for cluster detection with spatial weighting
 * 
 * Research methodology:
 * - Uses 4-connectivity for medical image region analysis
 * - Applies distance-weighted scoring (center-weighted detection)
 * - Filters clusters by minimum size to reduce noise
 * - Computes diagnostic score based on cluster characteristics
 * 
 * Scoring algorithm: 
 * score = Σ( (cluster_size * 0.4) / (distance_from_center * 0.6) ) * 100
 * This emphasizes central anomalies while de-weighting edge artifacts
 * 
 * @param {number[][]} grid - Binary matrix (0=normal, 1=suspicious)
 * @param {number} minSize - Minimum cluster size to consider (default: 1)
 * @returns {Object} - Cluster analysis results {count, sizes, totalSize, score}
 */
function findclusters(grid, minSize = 1) {
    if (!grid || grid.length === 0) return { count: 0, sizes: [], totalSize: 0 };
    
    const rows = grid.length;
    const cols = grid[0].length;
    const sizes = [];
    let score = 0
    let n = Math.round(rows/2) , m = Math.round(cols/2)
    const computedist = (x ,y)=>{
        return Math.round( Math.sqrt(Math.pow(x - m,2) +Math.pow(y-n , 2)) )
    }
    let count = 0;
    let totalSize = 0;

    function dfs(i, j) {
        if (i < 0 || i >= rows || j < 0 || j >= cols || grid[i][j] !== 1) return 0;
        
        grid[i][j] = 0; // Mark as visited by changing to 0
        let size = 1;
        
        // Check all 4 directions
        size += dfs(i + 1, j); // down
        size += dfs(i - 1, j); // up  
        size += dfs(i, j + 1); // right
        size += dfs(i, j - 1); // left
        
        return size;
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === 1) {
                const islandSize = dfs(i, j);
                if (islandSize >= minSize) {
                    score += Math.round( (islandSize *0.4) /(computedist(j,i) * 0.6) ) * 100 
                    sizes.push(islandSize);
                    totalSize += islandSize;
                    count++;
                }
            }
        }
    }

    return { count, sizes, totalSize , score };
}


/**
 * Converts linear array data into square matrix representation
 * Essential for reconstructing spatial grid from flattened analysis results
 * 
 * Research application: 
 * Transforms 1D hash analysis results back into 2D spatial representation
 * for cluster analysis and visualization of anomaly patterns in medical images
 * 
 * @param {number[]} mat - Linear array of analysis results
 * @returns {number[][]} - Square matrix representation
 */
const getgrid = (mat) => {
    let n = Math.floor(Math.sqrt(mat.length));
    let matrix = [];
    let temp = [...mat]; // Create a copy to avoid modifying the original array
    
    for (let i = 0; i < temp.length; i += n) {
        matrix.push(temp.slice(i, i + n));
    }
    return matrix;
};


/**
 * Primary tuberculosis detection function implementing trained model inference
 * Core diagnostic algorithm that applies machine learning model to new images
 * 
 * Research workflow:
 * 1. Analyze input image to generate perceptual hash features
 * 2. Score each hash feature against pre-trained statistical model
 * 3. Generate binary activation matrix based on classification threshold
 * 4. Apply cluster analysis to identify significant anomaly patterns
 * 5. Compute weighted diagnostic score with timing metrics
 * 
 * Performance metrics include execution time for system optimization
 * 
 * @param {string} url - URL of medical image to analyze
 * @param {number} ac - Analysis accuracy parameter
 * @param {number} itm - Iteration multiplier for robustness
 * @param {boolean} et - Extended analysis mode
 * @returns {Promise<number>} - Diagnostic confidence score (higher = more suspicious)
 */
let data = await readfile('/data.json')
const detect = async (url, ac = 2, itm = 2, et = false) => {
    let startTime = Date.now(); // Record start time
    
    let { memo } = await analyze(url, ac, itm, et);
    let keys = Object.keys(memo);
    let matrix = [];
    
    keys.forEach(key => {
        let hashes = memo[key];
        let score = { "0": 0, "1": 0 };
        
        hashes.forEach(el => {
            score["0"] += data[el] ? data[el]["0"] : 0;
            score["1"] += data[el] ? data[el]["1"] : 0;
        });
        
        if (score[1] == 0 || 0.9 < score["0"] / score["1"]) {
            matrix.push(0);
        } else {
            matrix.push(1);
        }
    });
    
    matrix = getgrid(matrix);
    let cls = findclusters(matrix, 7);
    
    let endTime = Date.now(); // Record end time
    let detectionTime = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log(cls.score, detectionTime.toFixed(2) + "s");
    return { score :cls.score , similar: cls.count , processingTime : detectionTime.toFixed(2)}
};
export {detect}
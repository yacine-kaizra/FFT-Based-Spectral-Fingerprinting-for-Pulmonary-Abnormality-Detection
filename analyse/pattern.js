import { hash  ,extractBlocks ,  resizeMatrix } from "./utils";
import { imageToGrayscaleMatrix } from "./image_processing";
import I_mat from "./fft";
/**
 * Research-level implementation for tuberculosis detection using image hashing
 * This module implements an algorithmic approach for TB detection from chest X-rays
 * using perceptual hashing techniques and statistical analysis.
 * 
 * Methodology:
 * 1. Images are converted to grayscale matrices
 * 2. Matrices are resized and divided into blocks
 * 3. Perceptual hashes are generated using discrete cosine transforms
 * 4. Hashes are filtered to remove noise patterns (3+ zeros/ones in first 4 bits)
 * 5. Statistical analysis is performed to build a classification model
 * 
 * Dataset Structure:
 * - Tuberculosis images: ./Tuberculosis/Tuberculosis-{index}.png (dts=true)
 * - Normal images: ./Normal/Normal-{index}.png (dts=true)
 * - Alternative dataset paths available for dts=false
 */

/**
 * Filters hash strings based on bit patterns in the first four positions
 * Research rationale: Hashes with 3+ identical bits in first 4 positions 
 * are considered noise and excluded from analysis to improve signal-to-noise ratio
 * 
 * @param {string} inputString - Hash string with underscore-separated values
 * @returns {boolean} - True if hash should be excluded (3+ zeros or ones in first 4 positions)
 */
function hasThreeZerosInFirstFour(inputString) {
  // Split the string by underscores to get an array of number strings
  const parts = inputString.split('_');
  
  // Check if we have at least 4 parts (for the first four numbers)
  if (parts.length < 4) {
    return false; // Not enough numbers to check
  }
  
  // Extract the first four number strings and convert them to numbers
  const firstFour = parts.slice(0, 4).map(part => parseInt(part, 10));
  
  // Count how many zeros are in the first four numbers
  const zeroCount = firstFour.filter(num => num === 0).length;
    const oneCount = firstFour.filter(num => num === 1).length
  // Return true if there are 3 or more zeros, false otherwise
  return zeroCount >= 3 || oneCount >= 3;
}

/**
 * Exports JavaScript objects as downloadable JSON files
 * Used for saving trained model data and analysis results
 * 
 * @param {Object} object - The data object to serialize and download
 * @param {string} filename - Base filename for the downloaded JSON file
 */
function downloadObjectAsJson(object, filename) {
  // Convert object to JSON string with pretty formatting
  const jsonString = JSON.stringify(object, null, 2);
  
  // Create a Blob (file-like object)
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'data.json';
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Main data processing pipeline for tuberculosis image analysis
 * Trains a classification model by analyzing image hashes from two datasets:
 * 1. Normal chest X-rays (index 1-160, step 2)
 * 2. Tuberculosis chest X-rays (index 1-600, step 10)
 * 
 * Research parameters:
 * - accuracy: DCT quantization level (higher = more precise)
 * - itm: Iteration multiplier for hash generation
 * - ext: Extended hash generation mode
 * - dts: Dataset path selector (true=primary, false=alternative)
 * 
 * @param {boolean} dts - Dataset path configuration flag
 * @param {number} accuracy - DCT quantization precision parameter
 * @param {number} itm - Iteration multiplier for hash robustness
 * @param {boolean} ext - Extended hash generation mode
 * @returns {Promise<void>} - Resolves when analysis and download complete
 */


const setData = async ( dts = true , accuracy = 2 , itm = 2 ,ext = false )=>{
    let hashes = {}

    let basetb = (index)=> dts ? `./Tuberculosis/Tuberculosis-${index}.png` : `./Dataset of Tuberculosis Chest X-rays Images/TB Chest X-rays/TB.${index}.jpg`
    let basenr = (index)=> dts? `./Normal/Normal-${index}.png`:  `./Dataset of Tuberculosis Chest X-rays Images/Normal Chest X-rays/others (${index}).jpg`
    for (let index = 1; index <  160; index+= 2) {
        try {
        let url = basenr(index)
        let hashed = (await analyze(url ,accuracy , itm ,ext)).hashes
        hashed.forEach(e=>{
            if(!hasThreeZerosInFirstFour(e)){
               if( hashes[e]) {
                     hashes[e]['0']=  hashes[e]['0']+1
                }else{
                    hashes[e] = {
                        '0' :1,
                        "1" : 0
                    }
                }
            }
            
        })
        console.log('done normal  ,' +index )
        } catch (error) {
            console.log('missed' ,index)
        }
    }
     for (let index = 1; index < 600; index +=10 ) {
       try {
         let url = basetb(index)
        let hashed = (await analyze(url)).hashes
        hashed.forEach(e=>{
            if(!hasThreeZerosInFirstFour(e)){
                if( hashes[e]) {
                     hashes[e]['1']=  hashes[e]['1']+1
                }else{
                    hashes[e] = {
                        '0' :0,
                        "1" :1
                    }
                }
            }
        })
        
        console.log('done tb ,' + index )
       } catch (error) {
        console.log('missed index' , index)
       }
    }
    downloadObjectAsJson(hashes , 'data')
}

/**
 * Core image analysis pipeline implementing perceptual hashing
 * Process flow:
 * 1. Load image from URL and convert to grayscale matrix
 * 2. Resize matrix to standard dimensions
 * 3. Extract 8x8 blocks for localized analysis
 * 4. Apply intensity matrix transformation
 * 5. Generate perceptual hash using DCT-based algorithm
 * 
 * @param {string} url - Image URL for analysis
 * @param {number} accuracy - DCT quantization accuracy (default: 2)
 * @param {number} itm - Iteration multiplier (default: 2)
 * @param {boolean} ext - Extended mode flag (default: false)
 * @param {boolean} ml - Machine learning mode flag (default: false)
 * @returns {Promise<Object>} - Analysis results including hash array
 */
const analyze = async (url , accuracy = 2 , itm =2, ext = false , ml = false)=>{
    let matrix =  await imageToGrayscaleMatrix(url)
    let mat = resizeMatrix(matrix)
    let blocks = extractBlocks(mat , 8 )
    let analyzed = I_mat(blocks , accuracy , itm)
    let hashed = (await hash(analyzed , ext, false))
    return hashed
}
export {analyze  , setData}
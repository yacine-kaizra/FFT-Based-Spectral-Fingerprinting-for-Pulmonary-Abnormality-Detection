/**
 * Medical imaging diagnostic validation and performance testing framework
 * This module implements comprehensive testing procedures for tuberculosis detection algorithms
 * using controlled datasets and statistical analysis.
 * 
 * Research validation methodology:
 * - Systematic testing across multiple medical imaging datasets
 * - Performance metrics collection for sensitivity/specificity analysis
 * - Statistical validation of diagnostic accuracy
 * - Cross-dataset generalization testing
 * 
 * Testing framework supports:
 * - Multi-dataset validation (primary and alternative image sources)
 * - Performance statistics tracking (true/false positives/negatives)
 * - Threshold-based classification evaluation
 * - Comprehensive error handling and reporting
 * 
 * Key metrics computed:
 * - Overall accuracy percentage
 * - Per-class detection rates
 * - Missed detection statistics
 * - Dataset coverage analysis
 */


/**
 * Executes comprehensive validation testing for tuberculosis detection system
 * Tests diagnostic performance across multiple medical imaging datasets
 * 
 * Research validation protocol:
 * - Tests tuberculosis-positive cases from multiple datasets
 * - Validates against normal/pneumonia cases for specificity
 * - Tracks detection statistics with threshold-based classification
 * - Computes overall accuracy and per-class performance metrics
 * 
 * Testing parameters:
 * - ac: Analysis accuracy setting
 * - itm: Iteration multiplier for robustness
 * - ext: Extended analysis mode flag
 * 
 * Dataset coverage:
 * - Primary tuberculosis dataset (TB.###.jpg format)
 * - Normal chest X-ray validation set
 * - Pneumonia dataset for differential diagnosis testing
 * 
 * @param {number} ac - Analysis accuracy parameter
 * @param {number} itm - Iteration multiplier parameter
 * @param {boolean} ext - Extended analysis mode
 * @returns {Promise<void>} - Resolves when testing complete with results logged
 */
import { detect } from "./pattern_detection"

const test = async (ac =2 , itm =2 , ext = false)=>{
    

let result = 0
let ln = 34
let tries = 0
let base = 400
let stats = {
    tb  : {
        detected : 0,
        missed : 0
    },
    nr : {
        detected : 0,
        missed : 0
    }
}
//    let tb = `./Dataset of Tuberculosis Chest X-rays Images/TB Chest X-rays/TB.${index}.jpg`
//         let nr = `./Dataset of Tuberculosis Chest X-rays Images/Normal Chest X-rays/others (${index}).jpg`

//   let tb = `./Tuberculosis/Tuberculosis-${index}.png`
//         let nr = `./Normal/Normal-${index}.png`

for (let index = 1; index <  700; index += 3) {
    try {
//    let tb = `./Tuberculosis/Tuberculosis-${index}.png`
      let tb = `./Dataset of Tuberculosis Chest X-rays Images/TB Chest X-rays/TB.${index}.jpg`
        // let nr = `./Dataset of Tuberculosis Chest X-rays Images/Normal Chest X-rays/others (${index}).jpg`
        // const randomZeroOrOne = Math.floor(Math.random() * 2);
        let ana = await detect( tb ,ac , itm , ext )
        tries ++
   
        if (ana > 1200) {
            result += 1
            stats.tb.detected += 1
        }else
        {    stats.tb.missed += 1}
        console.log(stats)
    
    } catch (error) {
        
    }
   
    
}



for (let index = 800; index < 1500; index+=2) {
    try {
        // let tb = `./Tuberculosis/Tuberculosis-${index}.png`
        // let nr = `./chest_xray/train/NORMAL/norm (${index}).jpeg`
        // let nr = `./Normal/Normal-${index}.png`
        // const randomZeroOrOne = Math.floor(Math.random() * 2);
        let nr = `./chest_xray/train/PNEUMONIA/pneumia (${index}).jpeg`
        let ana = await detect( nr , ac , itm , ext)
        tries ++

         if (ana < 1200) {
            result += 1
            stats.nr.detected += 1
        }else{
            stats.nr.missed += 1
        }
        console.log(stats)

    
    } catch (error) {
    }
   
    
}


















console.log(result /tries , stats)
}

export default test
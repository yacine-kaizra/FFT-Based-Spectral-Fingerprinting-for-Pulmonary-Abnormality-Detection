# Amak: AI for Tuberculosis Chest X-ray Analysis

## Project Purpose

Amak is a modular toolkit for automated tuberculosis (TB) detection in chest X-ray images. It leverages advanced image processing, frequency-domain analysis, and perceptual hashing to deliver robust, explainable results for researchers and clinicians.

---

## How the Code Works

### 1. Data Structure

- **Datasets:**  
  - `Dataset of Tuberculosis Chest X-rays Images/` (TB and normal images)
  - `Normal/` (additional normal images)

### 2. Main Analysis Pipeline

#### a. Image Loading & Preprocessing

- Images are loaded and converted to grayscale matrices using `imageToGrayscaleMatrix` ([`analyse/image_processing.js`](analyse/image_processing.js)).
- Matrices are resized to standard dimensions for consistent analysis (`resizeMatrix` in [`analyse/utils.js`](analyse/utils.js)).

#### b. Block Extraction

- Each image matrix is partitioned into blocks for localized feature analysis (`extractBlocks` in [`analyse/utils.js`](analyse/utils.js)).

#### c. Frequency-Domain Feature Extraction

- Each block undergoes FFT (Fast Fourier Transform) to extract spectral features ([`analyse/fft.js`](analyse/fft.js)).
- Spectral energy is computed across frequency bands (low/high, or low/mid/high) for multi-scale anomaly detection.

#### d. Perceptual Hashing & Filtering

- Quantized frequency features are hashed for robust pattern representation (`hash` in [`analyse/utils.js`](analyse/utils.js)).
- Hashes are filtered to exclude noise patterns (e.g., hashes with 3+ identical bits in first 4 positions, see `hasThreeZerosInFirstFour` in [`analyse/pattern.js`](analyse/pattern.js)).

#### e. Pattern Detection & Model Inference

- Hashes are scored against trained statistical models for TB detection ([`detect` in `analyse/pattern_detection.js`](analyse/pattern_detection.js)).
- Cluster analysis and spatial weighting are used to improve diagnostic accuracy.

#### f. Statistical Analysis & Validation

- Batch testing and validation are performed using [`analyse/test.js`](analyse/test.js), which computes accuracy, sensitivity, and specificity across datasets.

#### g. Results & Export

- Results can be exported as JSON for further research (`downloadObjectAsJson` in [`analyse/pattern.js`](analyse/pattern.js)).
- Processing time and diagnostic scores are displayed in the UI.

---

## For New Contributors

- **Start with [`analyse/index.js`](analyse/index.js):**  
  Orchestrates the workflow and UI integration.
- **Explore [`analyse/pattern_detection.js`](analyse/pattern_detection.js):**  
  Contains the main TB detection logic and model inference.
- **Check [`analyse/fft.js`](analyse/fft.js) and [`analyse/utils.js`](analyse/utils.js):**  
  For feature extraction and block processing.
- **Validate with [`analyse/test.js`](analyse/test.js):**  
  For batch testing and performance metrics.

---

## Research Rationale

- **Block-wise and Frequency Analysis:**  
  TB lesions often manifest as subtle, localized changes. Block-wise FFT captures these efficiently.
- **Perceptual Hashing:**  
  Robust against noise, compression, and minor variations.
- **Statistical Validation:**  
  All results are statistically validated and visualized for transparency.

---

## Attribution

If you wish to add your name, include it at the end of this README under an "Attribution" section, for example:

```
## Attribution

Made by KAIZRA YACINE
```

---

## References

- [`analyse/index.js`](analyse/index.js): Main workflow and UI logic
- [`analyse/pattern_detection.js`](analyse/pattern_detection.js): TB detection and model inference
- [`analyse/fft.js`](analyse/fft.js): Frequency feature extraction
- [`analyse/utils.js`](analyse/utils.js): Block extraction and hashing
- [`analyse/test.js`](analyse/test.js): Validation and metrics

---

For questions or contributions, open an issue or submit a pull request.
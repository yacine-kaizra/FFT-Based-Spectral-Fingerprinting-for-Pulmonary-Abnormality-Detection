
import { detect } from "./pattern_detection"

// Get batch of images for given page
const getbatch = (page = 10, jpeg = false , size = 10) => {
    const basetb = (index) => !jpeg 
        ? `./Tuberculosis/Tuberculosis-${index}.png` 
        : `./Dataset of Tuberculosis Chest X-rays Images/TB Chest X-rays/TB.${index}.jpg`
    
    const basenr = (index) => !jpeg 
        ? `./Normal/Normal-${index}.png` 
        : `./Dataset of Tuberculosis Chest X-rays Images/Normal Chest X-rays/others (${index}).jpg`
    
    const adresses = { tb: [], nr: [] }
    
    for (let index = page * size; index < page * size + size; index++) {
        adresses.tb.push(basetb(index))
        adresses.nr.push(basenr(index))
    }
    
    return adresses
}

// Create TB detection popup with scanning animation
const createTBDetectionPopup = async (imageUrl, tb = true) => {
    const overlay = document.createElement('div');
    overlay.className = 'tb-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'tb-popup';
    
    const header = document.createElement('div');
    header.className = 'tb-header';
    
    const title = document.createElement('h2');
    title.className = 'tb-title';
    title.textContent = 'TB Detection Analysis';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'tb-close';
    closeButton.innerHTML = '&times;';
    
    const body = document.createElement('div');
    body.className = 'tb-body';
    
    const scanningArea = document.createElement('div');
    scanningArea.className = 'tb-scanning-area';
    
    const image = document.createElement('img');
    image.className = 'tb-image';
    image.src = imageUrl;
    
    const scanText = document.createElement('div');
    scanText.className = 'tb-scan-text';
    scanText.textContent = 'Scanning X-ray image...';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'tb-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'tb-progress-bar';
    
    const resultsArea = document.createElement('div');
    resultsArea.className = 'tb-results';
    
    const resultTitle = document.createElement('h3');
    resultTitle.className = 'tb-result-title';
    resultTitle.textContent = 'Analysis Results';
    
    const resultGrid = document.createElement('div');
    resultGrid.className = 'tb-result-grid';
    
    // Add dashed border animation
    const scanningBorder = document.createElement('div');
    scanningBorder.className = 'tb-scanning-border';
    
    // Assemble structure
    progressContainer.appendChild(progressBar);
    scanningArea.append(image, scanText, progressContainer, scanningBorder);
    header.append(title, closeButton);
    body.append(scanningArea, resultsArea);
    popup.append(header, body);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Create result items
    const resultItems = [
        { label: 'TB Detected', id: 'tb-result' },
        { label: 'Confidence Score', id: 'score-result' },
        { label: 'Similar Patterns', id: 'similar-result' },
        { label: 'AI Accuracy', id: 'accuracy-result' },
        { label: 'Processing Time', id: 'time-result' }
    ];
    
    resultItems.forEach(item => {
        const container = document.createElement('div');
        container.className = 'tb-result-item';
        
        const label = document.createElement('div');
        label.className = 'tb-result-label';
        label.textContent = item.label;
        
        const value = document.createElement('div');
        value.className = 'tb-result-value';
        value.id = item.id;
        
        container.append(label, value);
        resultGrid.appendChild(container);
    });
    
    resultsArea.append(resultTitle, resultGrid);
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .tb-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .tb-popup {
            background: white;
            border-radius: 20px;
            width: 95%;
            max-width: 900px;
            overflow: hidden;
            box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }
        
        .tb-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .tb-title {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        .tb-close {
            position: absolute;
            top: 20px;
            right: 25px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .tb-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }
        
        .tb-body {
            padding: 30px;
            overflow-y: auto;
            flex: 1;
        }
        
        .tb-scanning-area {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }
        
        .tb-image {
            width: 100%;
            max-height: 350px;
            object-fit: contain;
            border-radius: 15px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .tb-scan-text {
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .tb-progress-container {
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 25px 0;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tb-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.4s ease;
            border-radius: 5px;
        }
        
        .tb-results {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
            border-radius: 15px;
            padding: 25px;
            display: none;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.5s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .tb-result-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #333;
            text-align: center;
        }
        
        .tb-result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .tb-result-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .tb-result-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        
        .tb-result-label {
            font-size: 15px;
            color: #777;
            margin-bottom: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .tb-result-value {
            font-size: 20px;
            font-weight: 700;
            color: #333;
        }
        
        .tb-scanning-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 3px dashed #667eea;
            border-radius: 15px;
            animation: scanPulse 1.5s infinite;
            pointer-events: none;
        }
        
        @keyframes scanPulse {
            0% { opacity: 0.3; border-color: #667eea; }
            50% { opacity: 1; border-color: #764ba2; }
            100% { opacity: 0.3; border-color: #667eea; }
        }
        
        @media (max-width: 768px) {
            .tb-popup {
                width: 98%;
                border-radius: 15px;
            }
            
            .tb-header {
                padding: 20px;
            }
            
            .tb-title {
                font-size: 24px;
            }
            
            .tb-body {
                padding: 20px;
            }
            
            .tb-result-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Animate entrance
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'scale(1)';
    });
    
    // Close functions
    const closePopup = () => {
        popup.style.transform = 'scale(0.95)';
        popup.style.opacity = '0';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }
        }, 400);
    };
    
    closeButton.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });
    
    // Simulate scanning
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(scanInterval);
            simulateDetection();
        }
    }, 180);
    
    // Detection simulation
    const simulateDetection = async () => {
        scanText.textContent = 'Analyzing patterns...';
        scanText.style.color = '#667eea';
        
        const detectionResult = await detect(imageUrl, 2, 2, false);
        const aiCorrect = tb ? detectionResult.score >= 1200 : detectionResult.score < 1200;
        
        // Update results
        document.getElementById('tb-result').textContent = detectionResult.score >= 1200 ? 'Yes' : 'No';
        document.getElementById('score-result').textContent = detectionResult.score;
        document.getElementById('similar-result').textContent = detectionResult.similar;
        document.getElementById('accuracy-result').textContent = aiCorrect ? 'Correct' : 'Incorrect';
        document.getElementById('time-result').textContent = `${detectionResult.processingTime}s`;
        
        // Color coding
        const tbResult = document.getElementById('tb-result');
        const accuracyResult = document.getElementById('accuracy-result');
        
        tbResult.style.color = detectionResult.score >= 1200 ? '#e74c3c' : '#27ae60';
        accuracyResult.style.color = aiCorrect ? '#27ae60' : '#e74c3c';
        
        // Show results
        scanText.textContent = 'Analysis complete!';
        scanText.style.color = '#27ae60';
        
        resultsArea.style.display = 'block';
        requestAnimationFrame(() => {
            resultsArea.style.opacity = '1';
            resultsArea.style.transform = 'translateY(0)';
        });
    };
};


const createopup = async (imageUrl, tb = true) => {
    const overlay = document.createElement('div');
    overlay.className = 'tb-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'tb-popup';
    

    
    const closeButton = document.createElement('button');
    closeButton.className = 'tb-close';
    closeButton.innerHTML = '&times;';
    
    const body = document.createElement('div');
   
    let cont = document.createElement('div')
    cont.innerHTML = 'hi'
    
    body.appendChild(cont)
    popup.append(body);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
  
   
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .tb-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .tb-popup {
            background: white;
            border-radius: 20px;
            width: 95%;
            max-width: 900px;
            overflow: hidden;
            box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }
        
        .tb-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .tb-title {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        .tb-close {
            position: absolute;
            top: 20px;
            right: 25px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .tb-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }
        
        .tb-body {
            padding: 30px;
            overflow-y: auto;
            flex: 1;
        }
        
        .tb-scanning-area {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
        }
        
        .tb-image {
            width: 100%;
            max-height: 350px;
            object-fit: contain;
            border-radius: 15px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .tb-scan-text {
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .tb-progress-container {
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            margin: 25px 0;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .tb-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.4s ease;
            border-radius: 5px;
        }
        
        .tb-results {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
            border-radius: 15px;
            padding: 25px;
            display: none;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.5s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .tb-result-title {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #333;
            text-align: center;
        }
        
        .tb-result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .tb-result-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            text-align: center;
        }
        
        .tb-result-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        
        .tb-result-label {
            font-size: 15px;
            color: #777;
            margin-bottom: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .tb-result-value {
            font-size: 20px;
            font-weight: 700;
            color: #333;
        }
        
        .tb-scanning-border {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 3px dashed #667eea;
            border-radius: 15px;
            animation: scanPulse 1.5s infinite;
            pointer-events: none;
        }
        
        @keyframes scanPulse {
            0% { opacity: 0.3; border-color: #667eea; }
            50% { opacity: 1; border-color: #764ba2; }
            100% { opacity: 0.3; border-color: #667eea; }
        }
        
        @media (max-width: 768px) {
            .tb-popup {
                width: 98%;
                border-radius: 15px;
            }
            
            .tb-header {
                padding: 20px;
            }
            
            .tb-title {
                font-size: 24px;
            }
            
            .tb-body {
                padding: 20px;
            }
            
            .tb-result-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Animate entrance
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'scale(1)';
    });
    
    // Close functions
    const closePopup = () => {
        popup.style.transform = 'scale(0.95)';
        popup.style.opacity = '0';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }
        }, 400);
    };
    
    closeButton.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });
    

};



// createopup()
// Create image element with hover effects
const createImage = (url) => {
    const div = document.createElement('div');
    div.innerHTML = `
    <div class="group relative aspect-square cursor-pointer overflow-hidden rounded-xl grid-item-animation">
        <div class="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-300 group-hover:scale-105" style='background-image: url("${url}");'></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span class="material-symbols-outlined text-white text-3xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                visibility
            </span>
        </div>
    </div>`;
    return div;
};

// Style image with results (border colors and info overlay)
const styleImageResult = (div, aiDetected, isTB) => {
    const container = div.firstElementChild;
    
    // Add appropriate border color based on detection results
    if (aiDetected && isTB) {
        container.classList.add('border-4', 'border-green-500');
    } else if (aiDetected && !isTB) {
        container.classList.add('border-4','border-blue-500');
    } else {
        container.classList.add('border-4', 'border-red-500');
    } 
    
    // Add result info overlay
    const glassOverlay = document.createElement('div');
    glassOverlay.className = 'absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300';
    glassOverlay.innerHTML = `
        <div class="text-white text-center p-2 bg-black/50 rounded-lg">
            <div class="font-bold">${isTB ? 'TB' : 'Normal'}</div>
            <div class="text-sm">AI: ${aiDetected ? 'Detected' : 'Not Detected'}</div>
        </div>
    `;
    
    container.appendChild(glassOverlay);
    container.classList.add('relative');
    
    return div;
};

// Global variables
let grid = document.getElementById('grid');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let cur = document.getElementById('cur');
let currentImages = []; // Store all currently displayed images

// Test batch of images and style results
const testBatch = async () => {
    if (currentImages.length === 0) {
        console.log('No images to analyze');
        return;
    }

    // Add loading state to button
    const btn = document.getElementById('btn');
    const originalText = btn.textContent;
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    
    // Add loading animation to images
    currentImages.forEach(img => {
        img.div.firstElementChild.classList.add('animate-pulse');
    });
    let stats = {
      tb : { 
        detected : 0,
        missed : 0
      },
      nr  : { 
        detected : 0,
        missed : 0
      }
    }
    // Process each image
    for (const img of currentImages) {
        try {
            const detectionResult = await detect(img.url, 2, 2, false);
            const aiDetected = detectionResult.score >= 1200;
            const correct = img.isTB ? aiDetected : !aiDetected;
            if (img.isTB) {
              if (correct) {
                stats.tb.detected++
              }else{
                stats.tb.missed ++
              }
            }else{
                if (correct) {
                stats.nr.detected++
              }else{
                stats.nr.missed ++
              }
            }
            document.getElementById("acr").innerText = Math.round(( (stats.tb.detected +stats.nr.detected)/ (stats.tb.detected +stats.nr.detected + (stats.nr.missed+stats.tb.missed)))*1000)/10 +'%'
            document.getElementById("tp").innerText = stats.tb.detected
            document.getElementById("fp").innerText = stats.nr.missed
            document.getElementById("tn").innerText = stats.nr.detected
            document.getElementById("fn").innerText = stats.tb.missed
            img.div.firstElementChild.classList.remove('animate-pulse');
            styleImageResult(img.div, correct, img.isTB);
        } catch (error) {
            console.error('Detection error:', error, img.url);
            img.div.firstElementChild.classList.remove('animate-pulse');
        }
        
        // Small delay between processing each image
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Restore button state
    btn.textContent = originalText;
    btn.disabled = false;
};

// Navigation and image display system
const nav = async () => {
    let currentPage = 1;
    let size = 45
    // Display mixed batch of PNG and JPEG images
    const displayMixedBatch = async (page ) => {
        currentImages = []; // Reset current images
        
        // Get both PNG and JPEG batches
        const pngUrls = getbatch(page, false , size);
        const jpegUrls = getbatch(page, true , Math.floor(size/2));
        
        if ((pngUrls.tb.length + pngUrls.nr.length + jpegUrls.tb.length + jpegUrls.nr.length) !== 0) {
            grid.innerHTML = "";
            cur.innerText = page;
            
            // Combine and shuffle all images
            const allImages = [
                ...pngUrls.tb.map(url => ({url, isTB: true})),
                ...pngUrls.nr.map(url => ({url, isTB: false})),
                ...jpegUrls.tb.map(url => ({url, isTB: true})),
                ...jpegUrls.nr.map(url => ({url, isTB: false}))
            ].sort(() => Math.random() - 0.5);
            
            // Load and display valid images
            for (const img of allImages) {
                try {
                    await new Promise((resolve, reject) => {
                        const testImg = new Image();
                        testImg.onload = resolve;
                        testImg.onerror = reject;
                        testImg.src = img.url;
                    });
                    
                    const div = createImage(img.url);
                    
                    // Store the image in currentImages array for batch analysis
                    currentImages.push({
                        div: div,
                        url: img.url,
                        isTB: img.isTB
                    });
                    
                    // Add click event for individual analysis
                    div.addEventListener('click', () => {
                        createTBDetectionPopup(img.url, img.isTB);
                    });
                    
                    grid.appendChild(div);
                } catch (error) {
                    console.log(`Failed to load image: ${img.url}`);
                }
            }
        }
    };

    // Initial display
    await displayMixedBatch(currentPage );

    // Navigation event listeners
    next.addEventListener('click', () => {
        currentPage++;
        displayMixedBatch(currentPage);
    });

    prev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayMixedBatch(currentPage);
        }
    });
};

// Initialize application
document.getElementById('btn').addEventListener('click', testBatch);
nav();
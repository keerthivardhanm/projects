// Global Variables
let currentStep = 1;
let uploadedData = [];
let templateImage = null;
let placeholders = [];
let selectedPlaceholder = null;
let currentRowIndex = 0;
let chatSessions = JSON.parse(localStorage.getItem('bulkgen_chats') || '[]');
let currentChatId = null;
let snapToGrid = false;
let showGrid = false;

// Image and container dimensions for accurate positioning
let imageNaturalWidth = 0;
let imageNaturalHeight = 0;
let imageDisplayWidth = 0;
let imageDisplayHeight = 0;
let containerWidth = 0;
let containerHeight = 0;
let scaleRatio = 1;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BulkGenAI Ultra - Initializing...');
    initializeApp();
    setupEventListeners();
    loadChatHistory();
    updateUI();
});

function initializeApp() {
    // Set initial step
    showStep(1);
    updateProgressBar();
    updateStepNavigation();
    
    // Initialize chat
    if (chatSessions.length === 0) {
        createNewChat();
    } else {
        currentChatId = chatSessions[0].id;
        loadChatMessages(currentChatId);
    }
    
    console.log('✅ Application initialized successfully');
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Sidebar toggle
    const toggleSidebar = document.getElementById('toggleSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    
    if (toggleSidebar) toggleSidebar.addEventListener('click', toggleSidebarFunc);
    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFunc);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // File uploads
    const dataFileInput = document.getElementById('dataFileInput');
    const templateFileInput = document.getElementById('templateFileInput');
    
    if (dataFileInput) dataFileInput.addEventListener('change', handleDataFileUpload);
    if (templateFileInput) templateFileInput.addEventListener('change', handleTemplateFileUpload);
    
    // Drag and drop
    setupDragAndDrop();
    
    // Text processing
    const processTextBtn = document.getElementById('processTextBtn');
    if (processTextBtn) processTextBtn.addEventListener('click', processTextData);
    
    // Progress steps
    document.querySelectorAll('.progress-step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.step);
            if (stepNum <= getMaxAccessibleStep()) {
                showStep(stepNum);
            }
        });
    });
    
    // Step navigation
    const prevStepBtn = document.getElementById('prevStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    if (prevStepBtn) prevStepBtn.addEventListener('click', () => navigateStep(-1));
    if (nextStepBtn) nextStepBtn.addEventListener('click', () => navigateStep(1));
    
    // Canvas controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const toggleGridBtn = document.getElementById('toggleGridBtn');
    const toggleSnapBtn = document.getElementById('toggleSnapBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomCanvas(1.2));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomCanvas(0.8));
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetCanvasZoom);
    if (toggleGridBtn) toggleGridBtn.addEventListener('click', toggleGridFunc);
    if (toggleSnapBtn) toggleSnapBtn.addEventListener('click', toggleSnapFunc);
    
    // Preview navigation
    const prevRowBtn = document.getElementById('prevRowBtn');
    const nextRowBtn = document.getElementById('nextRowBtn');
    
    if (prevRowBtn) prevRowBtn.addEventListener('click', () => navigateRow(-1));
    if (nextRowBtn) nextRowBtn.addEventListener('click', () => navigateRow(1));
    
    // Field properties
    setupFieldPropertyListeners();
    
    // Export
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateImages);
    
    // Chat
    const newChatBtn = document.getElementById('newChatBtn');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    const toggleChat = document.getElementById('toggleChat');
    
    if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);
    if (sendChatBtn) sendChatBtn.addEventListener('click', sendChatMessage);
    if (toggleChat) toggleChat.addEventListener('click', toggleChatAssistant);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    // Window resize handler for responsive canvas
    window.addEventListener('resize', debounce(handleWindowResize, 250));
    
    console.log('✅ Event listeners set up successfully');
}

function setupDragAndDrop() {
    // Data upload area
    const dataUploadArea = document.getElementById('dataUploadArea');
    if (dataUploadArea) {
        dataUploadArea.addEventListener('dragover', handleDragOver);
        dataUploadArea.addEventListener('dragleave', handleDragLeave);
        dataUploadArea.addEventListener('drop', handleDataDrop);
    }
    
    // Template upload area
    const templateUploadArea = document.getElementById('templateUploadArea');
    if (templateUploadArea) {
        templateUploadArea.addEventListener('dragover', handleDragOver);
        templateUploadArea.addEventListener('dragleave', handleDragLeave);
        templateUploadArea.addEventListener('drop', handleTemplateDrop);
    }
    
    // Canvas drop zone for field placement
    const canvasWrapper = document.getElementById('canvasWrapper');
    if (canvasWrapper) {
        canvasWrapper.addEventListener('dragover', handleCanvasDragOver);
        canvasWrapper.addEventListener('drop', handleCanvasDrop);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDataDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processDataFile(files[0]);
    }
}

function handleTemplateDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processTemplateFile(files[0]);
    }
}

function handleCanvasDragOver(e) {
    e.preventDefault();
}

function handleCanvasDrop(e) {
    e.preventDefault();
    const fieldName = e.dataTransfer.getData('text/plain');
    if (!fieldName) return;
    
    // Calculate position relative to image
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = convertDisplayToImageCoordinates(x, y);
    
    if (placeholders.some(p => p.fieldName === fieldName)) {
        showError('Field already added to canvas');
        return;
    }
    
    addFieldToCanvas(fieldName, imageCoords.x, imageCoords.y);
}

// Step Management
function showStep(stepNum) {
    console.log(`📍 Showing step ${stepNum}`);
    
    // Hide all steps
    document.querySelectorAll('.step-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current step
    const stepSection = document.getElementById(`step${stepNum}`);
    if (stepSection) {
        stepSection.classList.add('active');
    }
    
    currentStep = stepNum;
    updateProgressBar();
    updateStepNavigation();
}

function navigateStep(direction) {
    const newStep = currentStep + direction;
    const maxStep = getMaxAccessibleStep();
    
    if (newStep >= 1 && newStep <= maxStep && newStep <= 4) {
        showStep(newStep);
    }
}

function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep || isStepCompleted(stepNum)) {
            step.classList.add('completed');
        }
    });
    
    // Update progress lines
    document.querySelectorAll('.progress-line').forEach((line, index) => {
        const stepNum = index + 1;
        if (stepNum < currentStep || isStepCompleted(stepNum + 1)) {
            line.style.setProperty('--progress-width', '100%');
        } else {
            line.style.setProperty('--progress-width', '0%');
        }
    });
}

function updateStepNavigation() {
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep <= 1;
    }
    
    if (nextBtn) {
        const maxStep = getMaxAccessibleStep();
        const canProceed = currentStep < maxStep && currentStep < 4;
        nextBtn.disabled = !canProceed;
        
        if (canProceed) {
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.classList.add('disabled');
        }
    }
}

function isStepCompleted(stepNum) {
    switch (stepNum) {
        case 1: return uploadedData.length > 0;
        case 2: return templateImage !== null;
        case 3: return placeholders.length > 0;
        case 4: return false; // Export step is never "completed"
        default: return false;
    }
}

function getMaxAccessibleStep() {
    if (placeholders.length > 0) return 4;
    if (templateImage) return 3;
    if (uploadedData.length > 0) return 2;
    return 1;
}

// Tab Management
function switchTab(tabName) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const activePane = document.getElementById(`${tabName}Tab`);
    if (activePane) activePane.classList.add('active');
}

// Data Processing
function handleDataFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        console.log(`📁 Processing file: ${file.name}`);
        processDataFile(file);
    }
}

function processDataFile(file) {
    showLoading('Processing file...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data;
            
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                console.log('📊 Processing Excel file');
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            } else if (file.name.endsWith('.csv')) {
                console.log('📄 Processing CSV file');
                const text = e.target.result;
                data = parseCSV(text);
            } else if (file.name.endsWith('.txt')) {
                console.log('📝 Processing text file');
                const text = e.target.result;
                data = parseDelimitedText(text);
            }
            
            if (data && data.length > 0) {
                processDataArray(data);
                console.log(`✅ File processed successfully: ${data.length} rows`);
                showStep(2); // Auto-advance to next step
            } else {
                showError('No data found in file');
            }
        } catch (error) {
            console.error('❌ Error processing file:', error);
            showError('Error processing file: ' + error.message);
        } finally {
            hideLoading();
        }
    };
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsBinaryString(file);
    } else {
        reader.readAsText(file);
    }
}

function processTextData() {
    const textData = document.getElementById('textDataInput').value.trim();
    if (!textData) {
        showError('Please enter some data');
        return;
    }
    
    console.log('📝 Processing text data');
    showLoading('Processing text data...');
    
    try {
        const data = parseDelimitedText(textData);
        if (data && data.length > 0) {
            processDataArray(data);
            console.log(`✅ Text data processed successfully: ${data.length} rows`);
            showStep(2); // Auto-advance to next step
        } else {
            showError('No valid data found');
        }
    } catch (error) {
        console.error('❌ Error processing text data:', error);
        showError('Error processing text data: ' + error.message);
    } finally {
        hideLoading();
    }
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
}

function parseDelimitedText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';')) delimiter = ';';
    
    console.log(`🔍 Detected delimiter: "${delimiter}"`);
    
    return lines.map(line => line.split(delimiter).map(cell => cell.trim()));
}

function processDataArray(data) {
    if (data.length < 2) {
        showError('Data must have at least a header row and one data row');
        return;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    uploadedData = headers.map((header, index) => ({
        name: header,
        values: rows.map(row => row[index] || '')
    }));
    
    console.log(`📊 Data processed: ${uploadedData.length} columns, ${rows.length} rows`);
    
    displayDataPreview();
    updateStats();
    populateFieldList();
    updateUI();
}

function displayDataPreview() {
    const preview = document.getElementById('dataPreview');
    const table = document.getElementById('previewTable');
    
    if (!preview || !table) return;
    
    // Clear existing content
    table.innerHTML = '';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    uploadedData.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.name;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body with first 5 rows
    const tbody = document.createElement('tbody');
    const maxRows = Math.min(5, uploadedData[0]?.values.length || 0);
    
    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');
        uploadedData.forEach(column => {
            const td = document.createElement('td');
            td.textContent = column.values[i] || '';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    
    // Show preview
    preview.classList.remove('hidden');
}

function updateStats() {
    const columnCount = document.getElementById('columnCount');
    const rowCount = document.getElementById('rowCount');
    const totalImages = document.getElementById('totalImages');
    
    const columns = uploadedData.length;
    const rows = uploadedData[0]?.values.length || 0;
    
    if (columnCount) columnCount.textContent = `${columns} columns`;
    if (rowCount) rowCount.textContent = `${rows} rows`;
    if (totalImages) totalImages.textContent = rows;
}

// Template Processing
function handleTemplateFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        console.log(`🖼️ Processing template: ${file.name}`);
        processTemplateFile(file);
    }
}

function processTemplateFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        return;
    }
    
    showLoading('Processing image...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            templateImage = {
                src: e.target.result,
                width: img.width,
                height: img.height,
                element: img
            };
            
            // Store natural dimensions
            imageNaturalWidth = img.width;
            imageNaturalHeight = img.height;
            
            console.log(`✅ Template loaded: ${img.width}x${img.height}`);
            
            displayTemplatePreview();
            setupCanvas();
            updateUI();
            hideLoading();
            showStep(3); // Auto-advance to next step
        };
        img.onerror = function() {
            hideLoading();
            showError('Failed to load image');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayTemplatePreview() {
    const preview = document.getElementById('templatePreview');
    const img = document.getElementById('templateImage');
    const dimensions = document.getElementById('imageDimensions');
    
    if (!preview || !img || !dimensions) return;
    
    img.src = templateImage.src;
    dimensions.textContent = `${templateImage.width} × ${templateImage.height}px`;
    
    preview.classList.remove('hidden');
}

// Canvas Setup and Management
function setupCanvas() {
    if (!templateImage) return;
    
    console.log('🎨 Setting up responsive canvas');
    
    const canvasWrapper = document.getElementById('canvasWrapper');
    const templateImageCanvas = document.getElementById('templateImageCanvas');
    const placeholderContainer = document.getElementById('placeholderContainer');
    
    if (!canvasWrapper || !templateImageCanvas || !placeholderContainer) return;
    
    // Set up the template image
    templateImageCanvas.src = templateImage.src;
    templateImageCanvas.style.display = 'block';
    
    // Calculate responsive dimensions
    calculateCanvasDimensions();
    
    // Set up resize observer for responsive behavior
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(debounce(() => {
            calculateCanvasDimensions();
            updateAllPlaceholderPositions();
        }, 100));
        
        resizeObserver.observe(canvasWrapper);
    }
    
    updateCanvasInfo();
    
    console.log(`✅ Canvas setup complete: ${imageDisplayWidth}x${imageDisplayHeight} (scale: ${scaleRatio.toFixed(2)})`);
}

function calculateCanvasDimensions() {
    const canvasWrapper = document.getElementById('canvasWrapper');
    const templateImageCanvas = document.getElementById('templateImageCanvas');
    
    if (!canvasWrapper || !templateImageCanvas || !templateImage) return;
    
    // Get container dimensions
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    containerWidth = wrapperRect.width - 40; // Account for padding
    containerHeight = Math.min(wrapperRect.height - 40, 600); // Max height
    
    // Calculate scale to fit image in container while maintaining aspect ratio
    const scaleX = containerWidth / imageNaturalWidth;
    const scaleY = containerHeight / imageNaturalHeight;
    scaleRatio = Math.min(scaleX, scaleY, 1); // Don't scale up beyond natural size
    
    // Calculate display dimensions
    imageDisplayWidth = imageNaturalWidth * scaleRatio;
    imageDisplayHeight = imageNaturalHeight * scaleRatio;
    
    // Update image display
    templateImageCanvas.style.width = imageDisplayWidth + 'px';
    templateImageCanvas.style.height = imageDisplayHeight + 'px';
    
    // Update placeholder container to match image exactly
    const placeholderContainer = document.getElementById('placeholderContainer');
    if (placeholderContainer) {
        // Position container to overlay the image perfectly
        const imageRect = templateImageCanvas.getBoundingClientRect();
        const wrapperRect = canvasWrapper.getBoundingClientRect();
        
        placeholderContainer.style.left = (imageRect.left - wrapperRect.left) + 'px';
        placeholderContainer.style.top = (imageRect.top - wrapperRect.top) + 'px';
        placeholderContainer.style.width = imageDisplayWidth + 'px';
        placeholderContainer.style.height = imageDisplayHeight + 'px';
    }
    
    console.log(`📐 Canvas dimensions: ${imageDisplayWidth}x${imageDisplayHeight}, scale: ${scaleRatio.toFixed(3)}`);
}

function convertImageToDisplayCoordinates(imageX, imageY) {
    return {
        x: imageX * scaleRatio,
        y: imageY * scaleRatio
    };
}

function convertDisplayToImageCoordinates(displayX, displayY) {
    return {
        x: displayX / scaleRatio,
        y: displayY / scaleRatio
    };
}

function handleWindowResize() {
    if (templateImage) {
        calculateCanvasDimensions();
        updateAllPlaceholderPositions();
    }
}

// Field Management
function populateFieldList() {
    const fieldList = document.getElementById('fieldList');
    const fieldCount = document.getElementById('fieldCount');
    
    if (!fieldList) return;
    
    fieldList.innerHTML = '';
    
    uploadedData.forEach((column, index) => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        fieldItem.draggable = true;
        fieldItem.dataset.fieldName = column.name;
        
        const isUsed = placeholders.some(p => p.fieldName === column.name);
        if (isUsed) {
            fieldItem.classList.add('used');
        }
        
        fieldItem.innerHTML = `
            <div class="field-name">${column.name}</div>
            <div class="field-sample">Sample: "${column.values[0] || 'N/A'}"</div>
        `;
        
        fieldItem.addEventListener('dragstart', handleFieldDragStart);
        fieldItem.addEventListener('click', () => addFieldToCanvas(column.name));
        
        fieldList.appendChild(fieldItem);
    });
    
    if (fieldCount) {
        fieldCount.textContent = `${uploadedData.length} fields`;
    }
}

function handleFieldDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.fieldName);
    console.log(`🎯 Dragging field: ${e.target.dataset.fieldName}`);
}

function addFieldToCanvas(fieldName, x = null, y = null) {
    if (placeholders.some(p => p.fieldName === fieldName)) {
        showError('Field already added to canvas');
        return;
    }
    
    // Default position if not specified
    if (x === null || y === null) {
        x = 50 + (placeholders.length * 25);
        y = 50 + (placeholders.length * 25);
    }
    
    const placeholder = {
        id: generateId(),
        fieldName: fieldName,
        x: x, // Image coordinates
        y: y, // Image coordinates
        width: 200, // Image coordinates
        height: 30, // Image coordinates
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        align: 'left'
    };
    
    placeholders.push(placeholder);
    createPlaceholderElement(placeholder);
    populateFieldList(); // Refresh to show used state
    updateStats();
    updateFieldCount();
    updateUI();
    
    console.log(`✅ Added field to canvas: ${fieldName} at (${x}, ${y})`);
}

function createPlaceholderElement(placeholder) {
    const placeholderElement = document.createElement('div');
    placeholderElement.className = 'placeholder';
    placeholderElement.dataset.id = placeholder.id;
    
    updatePlaceholderElement(placeholder, placeholderElement);
    
    // Add event listeners
    placeholderElement.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPlaceholder(placeholder.id);
    });
    placeholderElement.addEventListener('mousedown', startDragging);
    
    const placeholderContainer = document.getElementById('placeholderContainer');
    if (placeholderContainer) {
        placeholderContainer.appendChild(placeholderElement);
    }
}

function updatePlaceholderElement(placeholder, element = null) {
    if (!element) {
        element = document.querySelector(`[data-id="${placeholder.id}"]`);
    }
    if (!element) return;
    
    // Convert image coordinates to display coordinates
    const displayCoords = convertImageToDisplayCoordinates(placeholder.x, placeholder.y);
    const displayWidth = placeholder.width * scaleRatio;
    const displayHeight = placeholder.height * scaleRatio;
    const displayFontSize = placeholder.fontSize * scaleRatio;
    
    element.style.left = displayCoords.x + 'px';
    element.style.top = displayCoords.y + 'px';
    element.style.width = displayWidth + 'px';
    element.style.height = displayHeight + 'px';
    element.style.fontSize = Math.max(8, displayFontSize) + 'px'; // Minimum readable size
    element.style.fontFamily = placeholder.fontFamily;
    element.style.color = placeholder.color;
    element.style.textAlign = placeholder.align;
    
    // Get sample data
    const fieldData = uploadedData.find(col => col.name === placeholder.fieldName);
    const sampleValue = fieldData ? fieldData.values[currentRowIndex] || `[${placeholder.fieldName}]` : `[${placeholder.fieldName}]`;
    element.textContent = sampleValue;
}

function updateAllPlaceholderPositions() {
    placeholders.forEach(placeholder => {
        updatePlaceholderElement(placeholder);
    });
}

function selectPlaceholder(id) {
    selectedPlaceholder = id;
    
    console.log(`🎯 Selected placeholder: ${id}`);
    
    // Update visual selection
    document.querySelectorAll('.placeholder').forEach(el => {
        el.classList.remove('selected');
    });
    const selectedElement = document.querySelector(`[data-id="${id}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
    
    // Show properties panel
    showFieldProperties(id);
}

function showFieldProperties(id) {
    const placeholder = placeholders.find(p => p.id === id);
    if (!placeholder) return;
    
    const propertiesPanel = document.getElementById('fieldProperties');
    const selectedFieldName = document.getElementById('selectedFieldName');
    
    if (!propertiesPanel) return;
    
    propertiesPanel.classList.remove('hidden');
    
    if (selectedFieldName) {
        selectedFieldName.textContent = placeholder.fieldName;
    }
    
    // Update property controls
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorInput = document.getElementById('textColorInput');
    const positionX = document.getElementById('positionX');
    const positionY = document.getElementById('positionY');
    const placeholderWidth = document.getElementById('placeholderWidth');
    const placeholderHeight = document.getElementById('placeholderHeight');
    
    if (fontSizeSlider) fontSizeSlider.value = placeholder.fontSize;
    if (fontSizeValue) fontSizeValue.textContent = placeholder.fontSize + 'px';
    if (fontFamilySelect) fontFamilySelect.value = placeholder.fontFamily;
    if (textColorPicker) textColorPicker.value = placeholder.color;
    if (textColorInput) textColorInput.value = placeholder.color;
    if (positionX) positionX.value = Math.round(placeholder.x);
    if (positionY) positionY.value = Math.round(placeholder.y);
    if (placeholderWidth) placeholderWidth.value = Math.round(placeholder.width);
    if (placeholderHeight) placeholderHeight.value = Math.round(placeholder.height);
    
    // Update align buttons
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeAlignBtn = document.querySelector(`[data-align="${placeholder.align}"]`);
    if (activeAlignBtn) {
        activeAlignBtn.classList.add('active');
    }
}

function setupFieldPropertyListeners() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorInput = document.getElementById('textColorInput');
    const positionX = document.getElementById('positionX');
    const positionY = document.getElementById('positionY');
    const placeholderWidth = document.getElementById('placeholderWidth');
    const placeholderHeight = document.getElementById('placeholderHeight');
    const deleteFieldBtn = document.getElementById('deleteFieldBtn');
    const duplicateFieldBtn = document.getElementById('duplicateFieldBtn');
    
    if (fontSizeSlider) fontSizeSlider.addEventListener('input', updateSelectedPlaceholder);
    if (fontFamilySelect) fontFamilySelect.addEventListener('change', updateSelectedPlaceholder);
    if (textColorPicker) textColorPicker.addEventListener('change', updateSelectedPlaceholder);
    if (textColorInput) textColorInput.addEventListener('change', updateSelectedPlaceholder);
    if (positionX) positionX.addEventListener('input', updateSelectedPlaceholder);
    if (positionY) positionY.addEventListener('input', updateSelectedPlaceholder);
    if (placeholderWidth) placeholderWidth.addEventListener('input', updateSelectedPlaceholder);
    if (placeholderHeight) placeholderHeight.addEventListener('input', updateSelectedPlaceholder);
    
    if (deleteFieldBtn) deleteFieldBtn.addEventListener('click', deleteSelectedPlaceholder);
    if (duplicateFieldBtn) duplicateFieldBtn.addEventListener('click', duplicateSelectedPlaceholder);
    
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateSelectedPlaceholder();
        });
    });
}

function updateSelectedPlaceholder() {
    if (!selectedPlaceholder) return;
    
    const placeholder = placeholders.find(p => p.id === selectedPlaceholder);
    if (!placeholder) return;
    
    // Update placeholder properties
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const textColorPicker = document.getElementById('textColorPicker');
    const textColorInput = document.getElementById('textColorInput');
    const positionX = document.getElementById('positionX');
    const positionY = document.getElementById('positionY');
    const placeholderWidth = document.getElementById('placeholderWidth');
    const placeholderHeight = document.getElementById('placeholderHeight');
    const activeAlignBtn = document.querySelector('.align-btn.active');
    
    if (fontSizeSlider) {
        placeholder.fontSize = parseInt(fontSizeSlider.value);
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeValue) fontSizeValue.textContent = placeholder.fontSize + 'px';
    }
    
    if (fontFamilySelect) placeholder.fontFamily = fontFamilySelect.value;
    
    if (textColorPicker) {
        placeholder.color = textColorPicker.value;
        if (textColorInput) textColorInput.value = textColorPicker.value;
    }
    
    if (textColorInput && textColorInput.value !== placeholder.color) {
        placeholder.color = textColorInput.value;
        if (textColorPicker) textColorPicker.value = textColorInput.value;
    }
    
    if (positionX) placeholder.x = parseInt(positionX.value) || placeholder.x;
    if (positionY) placeholder.y = parseInt(positionY.value) || placeholder.y;
    if (placeholderWidth) placeholder.width = parseInt(placeholderWidth.value) || placeholder.width;
    if (placeholderHeight) placeholder.height = parseInt(placeholderHeight.value) || placeholder.height;
    if (activeAlignBtn) placeholder.align = activeAlignBtn.dataset.align;
    
    // Update placeholder element
    updatePlaceholderElement(placeholder);
}

function deleteSelectedPlaceholder() {
    if (!selectedPlaceholder) return;
    
    const index = placeholders.findIndex(p => p.id === selectedPlaceholder);
    if (index > -1) {
        placeholders.splice(index, 1);
        
        const element = document.querySelector(`[data-id="${selectedPlaceholder}"]`);
        if (element) {
            element.remove();
        }
        
        selectedPlaceholder = null;
        const propertiesPanel = document.getElementById('fieldProperties');
        if (propertiesPanel) {
            propertiesPanel.classList.add('hidden');
        }
        
        populateFieldList();
        updateFieldCount();
        updateUI();
        
        console.log('🗑️ Deleted placeholder');
    }
}

function duplicateSelectedPlaceholder() {
    if (!selectedPlaceholder) return;
    
    const placeholder = placeholders.find(p => p.id === selectedPlaceholder);
    if (!placeholder) return;
    
    const newPlaceholder = {
        ...placeholder,
        id: generateId(),
        x: placeholder.x + 20,
        y: placeholder.y + 20
    };
    
    placeholders.push(newPlaceholder);
    createPlaceholderElement(newPlaceholder);
    updateFieldCount();
    
    console.log('📋 Duplicated placeholder');
}

function startDragging(e) {
    e.preventDefault();
    const placeholderId = e.target.dataset.id;
    const placeholder = placeholders.find(p => p.id === placeholderId);
    if (!placeholder) return;
    
    selectedPlaceholder = placeholderId;
    
    const rect = e.target.getBoundingClientRect();
    const containerRect = document.getElementById('placeholderContainer').getBoundingClientRect();
    
    const dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    e.target.classList.add('dragging');
    selectPlaceholder(placeholderId);
    
    function handleMouseMove(e) {
        const containerRect = document.getElementById('placeholderContainer').getBoundingClientRect();
        
        // Calculate new position in display coordinates
        const newDisplayX = e.clientX - containerRect.left - dragOffset.x;
        const newDisplayY = e.clientY - containerRect.top - dragOffset.y;
        
        // Convert to image coordinates
        const imageCoords = convertDisplayToImageCoordinates(newDisplayX, newDisplayY);
        
        // Constrain to image boundaries
        let finalX = Math.max(0, Math.min(imageNaturalWidth - placeholder.width, imageCoords.x));
        let finalY = Math.max(0, Math.min(imageNaturalHeight - placeholder.height, imageCoords.y));
        
        // Apply snap to grid if enabled
        if (snapToGrid) {
            const gridSize = 20;
            finalX = Math.round(finalX / gridSize) * gridSize;
            finalY = Math.round(finalY / gridSize) * gridSize;
        }
        
        placeholder.x = finalX;
        placeholder.y = finalY;
        
        updatePlaceholderElement(placeholder);
        
        // Update position inputs if this placeholder is selected
        if (selectedPlaceholder === placeholderId) {
            const positionX = document.getElementById('positionX');
            const positionY = document.getElementById('positionY');
            if (positionX) positionX.value = Math.round(placeholder.x);
            if (positionY) positionY.value = Math.round(placeholder.y);
        }
    }
    
    function handleMouseUp() {
        e.target.classList.remove('dragging');
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Canvas Controls
function zoomCanvas(factor) {
    if (!templateImage) return;
    
    scaleRatio *= factor;
    scaleRatio = Math.max(0.1, Math.min(3, scaleRatio));
    
    calculateCanvasDimensions();
    updateZoomDisplay();
    updateAllPlaceholderPositions();
    
    console.log(`🔍 Canvas zoom: ${Math.round(scaleRatio * 100)}%`);
}

function resetCanvasZoom() {
    if (!templateImage) return;
    
    calculateCanvasDimensions();
    updateZoomDisplay();
    updateAllPlaceholderPositions();
    
    console.log('🔄 Canvas zoom reset');
}

function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
        zoomLevel.textContent = Math.round(scaleRatio * 100) + '%';
    }
}

function toggleGridFunc() {
    showGrid = !showGrid;
    const gridOverlay = document.getElementById('gridOverlay');
    const toggleGridBtn = document.getElementById('toggleGridBtn');
    
    if (gridOverlay) {
        if (showGrid) {
            gridOverlay.classList.remove('hidden');
        } else {
            gridOverlay.classList.add('hidden');
        }
    }
    
    if (toggleGridBtn) {
        if (showGrid) {
            toggleGridBtn.classList.add('active');
        } else {
            toggleGridBtn.classList.remove('active');
        }
    }
    
    console.log(`📐 Grid ${showGrid ? 'enabled' : 'disabled'}`);
}

function toggleSnapFunc() {
    snapToGrid = !snapToGrid;
    const toggleSnapBtn = document.getElementById('toggleSnapBtn');
    
    
    if (toggleSnapBtn) {
        if (snapToGrid) {
            toggleSnapBtn.classList.add('active');
        } else {
            toggleSnapBtn.classList.remove('active');
        }
    }
    
    console.log(`🧲 Snap to grid ${snapToGrid ? 'enabled' : 'disabled'}`);
}

function updateCanvasInfo() {
    const canvasInfo = document.getElementById('canvasInfo');
    if (canvasInfo && templateImage) {
        canvasInfo.textContent = `Canvas: ${templateImage.width} × ${templateImage.height}px`;
    }
}

function updateFieldCount() {
    const placeholderCount = document.getElementById('placeholderCount');
    const mappedFields = document.getElementById('mappedFields');
    
    if (placeholderCount) {
        placeholderCount.textContent = `Placeholders: ${placeholders.length}`;
    }
    if (mappedFields) {
        mappedFields.textContent = placeholders.length;
    }
}

// Preview Navigation
function navigateRow(direction) {
    const maxRows = uploadedData[0]?.values.length || 0;
    if (maxRows === 0) return;
    
    currentRowIndex += direction;
    currentRowIndex = Math.max(0, Math.min(maxRows - 1, currentRowIndex));
    
    updateRowIndicator();
    updatePreviewData();
    updateNavigationButtons();
    
    console.log(`👁️ Preview row: ${currentRowIndex + 1}/${maxRows}`);
}

function updateRowIndicator() {
    const maxRows = uploadedData[0]?.values.length || 0;
    const rowIndicator = document.getElementById('rowIndicator');
    if (rowIndicator) {
        rowIndicator.textContent = `Row ${currentRowIndex + 1} of ${maxRows}`;
    }
}

function updatePreviewData() {
    // Update all placeholder elements with current row data
    placeholders.forEach(placeholder => {
        updatePlaceholderElement(placeholder);
    });
}

function updateNavigationButtons() {
    const maxRows = uploadedData[0]?.values.length || 0;
    const prevRowBtn = document.getElementById('prevRowBtn');
    const nextRowBtn = document.getElementById('nextRowBtn');
    
    if (prevRowBtn) prevRowBtn.disabled = currentRowIndex === 0;
    if (nextRowBtn) nextRowBtn.disabled = currentRowIndex >= maxRows - 1;
}

// Export Functionality
function generateImages() {
    if (placeholders.length === 0) {
        showError('Please add at least one field to the canvas');
        return;
    }
    
    if (!templateImage) {
        showError('Please upload a template image');
        return;
    }
    
    if (uploadedData.length === 0) {
        showError('Please upload data');
        return;
    }
    
    const format = document.getElementById('exportFormat').value;
    const totalRows = uploadedData[0]?.values.length || 0;
    
    if (totalRows === 0) {
        showError('No data rows to process');
        return;
    }
    
    console.log(`🚀 Starting export: ${format}, ${totalRows} images`);
    
    showExportProgress();
    
    // Generate images based on format
    setTimeout(() => {
        if (format.startsWith('pdf')) {
            generatePDF(format);
        } else if (format.startsWith('zip')) {
            generateZIP(format);
        }
    }, 100);
}

function generatePDF(format) {
    console.log(`📄 Generating PDF: ${format}`);
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const totalRows = uploadedData[0]?.values.length || 0;
    
    let imagesPerPage = 1;
    if (format === 'pdf-double') imagesPerPage = 2;
    else if (format === 'pdf-quad') imagesPerPage = 4;
    
    let currentPage = 0;
    let processedRows = 0;
    
    function processNextBatch() {
        const batchSize = Math.min(5, totalRows - processedRows);
        const promises = [];
        
        for (let i = 0; i < batchSize; i++) {
            const rowIndex = processedRows + i;
            if (rowIndex >= totalRows) break;
            
            promises.push(generateImageForRow(rowIndex));
        }
        
        Promise.all(promises).then(images => {
            images.forEach((imageData, index) => {
                const rowIndex = processedRows + index;
                const positionIndex = rowIndex % imagesPerPage;
                
                if (positionIndex === 0 && rowIndex > 0) {
                    pdf.addPage();
                    currentPage++;
                }
                
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                let x = 10, y = 10, width = pageWidth - 20, height = pageHeight - 20;
                
                if (imagesPerPage === 2) {
                    y = positionIndex === 0 ? 10 : pageHeight / 2 + 5;
                    height = pageHeight / 2 - 15;
                } else if (imagesPerPage === 4) {
                    x = positionIndex % 2 === 0 ? 10 : pageWidth / 2 + 5;
                    y = positionIndex < 2 ? 10 : pageHeight / 2 + 5;
                    width = pageWidth / 2 - 15;
                    height = pageHeight / 2 - 15;
                }
                
                if (imageData) {
                    pdf.addImage(imageData, 'PNG', x, y, width, height);
                }
            });
            
            processedRows += batchSize;
            updateExportProgress((processedRows / totalRows) * 100);
            
            if (processedRows < totalRows) {
                setTimeout(processNextBatch, 50);
            } else {
                // Complete PDF generation
                const filename = `bulk-images-${new Date().toISOString().split('T')[0]}.pdf`;
                pdf.save(filename);
                hideExportProgress();
                showSuccess(`PDF generated successfully! ${totalRows} images exported.`);
                console.log(`✅ PDF export complete: ${filename}`);
            }
        }).catch(error => {
            hideExportProgress();
            showError('Error generating PDF: ' + error.message);
            console.error('❌ PDF export error:', error);
        });
    }
    
    processNextBatch();
}

function generateZIP(format) {
    console.log(`📦 Generating ZIP: ${format}`);
    
    const zip = new JSZip();
    const totalRows = uploadedData[0]?.values.length || 0;
    const imageFormat = format === 'zip-png' ? 'png' : 'jpeg';
    
    let processedRows = 0;
    
    function processNextBatch() {
        const batchSize = Math.min(10, totalRows - processedRows);
        const promises = [];
        
        for (let i = 0; i < batchSize; i++) {
            const rowIndex = processedRows + i;
            if (rowIndex >= totalRows) break;
            
            promises.push(generateImageForRow(rowIndex));
        }
        
        Promise.all(promises).then(images => {
            images.forEach((imageData, index) => {
                const rowIndex = processedRows + index;
                if (imageData) {
                    const filename = `image-${String(rowIndex + 1).padStart(4, '0')}.${imageFormat === 'png' ? 'png' : 'jpg'}`;
                    const base64Data = imageData.split(',')[1];
                    zip.file(filename, base64Data, { base64: true });
                }
            });
            
            processedRows += batchSize;
            updateExportProgress((processedRows / totalRows) * 100);
            
            if (processedRows < totalRows) {
                setTimeout(processNextBatch, 50);
            } else {
                // Complete ZIP generation
                zip.generateAsync({ type: 'blob' }).then(content => {
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `bulk-images-${new Date().toISOString().split('T')[0]}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    hideExportProgress();
                    showSuccess(`ZIP file generated successfully! ${totalRows} images exported.`);
                    console.log(`✅ ZIP export complete`);
                });
            }
        }).catch(error => {
            hideExportProgress();
            showError('Error generating ZIP: ' + error.message);
            console.error('❌ ZIP export error:', error);
        });
    }
    
    processNextBatch();
}

function generateImageForRow(rowIndex) {
    return new Promise((resolve) => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Use natural image dimensions for export
        tempCanvas.width = imageNaturalWidth;
        tempCanvas.height = imageNaturalHeight;
        
        // Draw template image at natural size
        tempCtx.drawImage(templateImage.element, 0, 0, imageNaturalWidth, imageNaturalHeight);
        
        // Draw text placeholders using image coordinates (not display coordinates)
        placeholders.forEach(placeholder => {
            const fieldData = uploadedData.find(col => col.name === placeholder.fieldName);
            const value = fieldData ? fieldData.values[rowIndex] || '' : '';
            
            tempCtx.font = `${placeholder.fontSize}px ${placeholder.fontFamily}`;
            tempCtx.fillStyle = placeholder.color;
            tempCtx.textAlign = placeholder.align;
            
            let x = placeholder.x;
            if (placeholder.align === 'center') x += placeholder.width / 2;
            else if (placeholder.align === 'right') x += placeholder.width;
            
            // Simple text wrapping
            const words = value.split(' ');
            const lines = [];
            let currentLine = words[0] || '';
            
            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const metrics = tempCtx.measureText(testLine);
                if (metrics.width > placeholder.width) {
                    lines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            lines.push(currentLine);
            
            // Draw lines
            lines.forEach((line, lineIndex) => {
                const y = placeholder.y + placeholder.fontSize + (lineIndex * (placeholder.fontSize + 2));
                tempCtx.fillText(line, x, y);
            });
        });
        
        resolve(tempCanvas.toDataURL('image/png'));
    });
}

function showExportProgress() {
    const exportProgress = document.getElementById('exportProgress');
    const generateBtn = document.getElementById('generateBtn');
    
    if (exportProgress) exportProgress.classList.remove('hidden');
    if (generateBtn) generateBtn.disabled = true;
}

function hideExportProgress() {
    const exportProgress = document.getElementById('exportProgress');
    const generateBtn = document.getElementById('generateBtn');
    
    if (exportProgress) exportProgress.classList.add('hidden');
    if (generateBtn) generateBtn.disabled = false;
    updateExportProgress(0);
}

function updateExportProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) progressFill.style.width = percentage + '%';
    if (progressText) progressText.textContent = 'Generating images...';
    if (progressPercent) progressPercent.textContent = Math.round(percentage) + '%';
}

// Chat Functionality
function createNewChat() {
    const chatId = generateId();
    const newChat = {
        id: chatId,
        title: `Chat ${new Date().toLocaleDateString()}`,
        messages: [{
            id: generateId(),
            role: 'assistant',
            content: "Hello! I'm your AI assistant. I can help you with layout optimization, field positioning, and design recommendations. What would you like to know?",
            timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    chatSessions.unshift(newChat);
    saveChatSessions();
    
    currentChatId = chatId;
    loadChatMessages(chatId);
    updateChatList();
    
    console.log('💬 Created new chat session');
}

function loadChatMessages(chatId) {
    const chat = chatSessions.find(c => c.id === chatId);
    if (!chat) return;
    
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    chat.messages.forEach(message => {
        addMessageToChat(message);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    const userMessage = {
        id: generateId(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    };
    
    addMessageToCurrentChat(userMessage);
    addMessageToChat(userMessage);
    input.value = '';
    
    console.log(`💬 User message: ${message}`);
    
    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        const assistantMessage = {
            id: generateId(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };
        
        addMessageToCurrentChat(assistantMessage);
        addMessageToChat(assistantMessage);
        
        console.log(`🤖 AI response generated`);
    }, 1000);
}

function addMessageToCurrentChat(message) {
    const chat = chatSessions.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push(message);
        chat.updatedAt = new Date().toISOString();
        saveChatSessions();
    }
}

function addMessageToChat(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}-message`;
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">${message.content}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('layout') || message.includes('position')) {
        return `Based on your current setup with ${placeholders.length} placeholders and ${uploadedData.length} data columns, here are my recommendations:

🎯 **Layout Optimization:**
• Consider using a grid-based alignment for better visual consistency
• Maintain at least 20px spacing between text elements
• Align similar fields (like names, dates) vertically when possible

📐 **Positioning Tips:**
• Place important information (like names) in the upper portion
• Use the golden ratio for positioning key elements
• Ensure text doesn't overlap with busy background areas

Would you like me to analyze your specific placeholder positions?`;
    } else if (message.includes('align')) {
        return `Here's how to achieve professional field alignment:

✨ **Alignment Strategies:**
• **Left Align:** Best for body text and long content
• **Center Align:** Great for titles and headers
• **Right Align:** Perfect for numbers and dates

🔧 **Auto-alignment Tips:**
• Group related fields and align them consistently
• Use snap-to-grid for precise positioning
• Maintain consistent margins from image edges

I can help you implement these alignments. Which fields would you like to focus on?`;
    } else if (message.includes('color') || message.includes('font')) {
        return `Here are professional design recommendations:

🎨 **Color Guidelines:**
• High contrast ratios (4.5:1 minimum) for readability
• Dark text on light backgrounds or vice versa
• Consider your brand colors for consistency

🔤 **Font Selection:**
• **Sans-serif** (Arial, Helvetica) for modern, clean look
• **Serif** (Times, Georgia) for traditional, formal feel
• Keep font sizes between 12-24px for optimal readability

📱 **Responsive Considerations:**
• Test readability at different sizes
• Ensure text remains visible when scaled

What type of design aesthetic are you aiming for?`;
    } else {
        return `I'm here to help with your bulk image generation project! Here's what I can assist with:

🔧 **Technical Support:**
• Layout optimization and field positioning
• Export format recommendations
• Data mapping guidance

🎨 **Design Assistance:**
• Color scheme suggestions
• Typography recommendations
• Visual hierarchy tips

📊 **Project Analysis:**
• Currently you have ${placeholders.length} placeholders mapped
• ${uploadedData.length} data columns available
• Template image: ${templateImage ? 'Loaded ✅' : 'Not uploaded ❌'}

What specific aspect would you like help with?`;
    }
}

function loadChatHistory() {
    updateChatList();
    if (chatSessions.length > 0) {
        currentChatId = chatSessions[0].id;
        loadChatMessages(currentChatId);
    }
}

function updateChatList() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    chatList.innerHTML = '';
    
    chatSessions.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }
        
        const lastMessage = chat.messages[chat.messages.length - 1];
        const preview = lastMessage ? lastMessage.content.substring(0, 50) + '...' : 'No messages';
        
        chatItem.innerHTML = `
            <div class="chat-title">${chat.title}</div>
            <div class="chat-preview">${preview}</div>
        `;
        
        chatItem.addEventListener('click', () => {
            currentChatId = chat.id;
            loadChatMessages(chat.id);
            updateChatList();
        });
        
        chatList.appendChild(chatItem);
    });
}

function saveChatSessions() {
    localStorage.setItem('bulkgen_chats', JSON.stringify(chatSessions));
}

function toggleChatAssistant() {
    const chatAssistant = document.getElementById('chatAssistant');
    if (chatAssistant) {
        chatAssistant.classList.toggle('collapsed');
    }
}

// Sidebar Management
function toggleSidebarFunc() {
    const sidebar = document.getElementById('chatSidebar');
    const appContainer = document.querySelector('.app-container');
    
    if (sidebar) sidebar.classList.toggle('open');
    if (appContainer) appContainer.classList.toggle('sidebar-open');
}

function closeSidebarFunc() {
    const sidebar = document.getElementById('chatSidebar');
    const appContainer = document.querySelector('.app-container');
    
    if (sidebar) sidebar.classList.remove('open');
    if (appContainer) appContainer.classList.remove('sidebar-open');
}

// UI Update Functions
function updateUI() {
    updateProgressBar();
    updateStepNavigation();
    updateStats();
    updateFieldCount();
    updateCanvasInfo();
    updateRowIndicator();
    updateNavigationButtons();
    
    // Enable/disable generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        const canGenerate = templateImage && placeholders.length > 0 && uploadedData.length > 0;
        generateBtn.disabled = !canGenerate;
    }
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(message = 'Processing...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    if (loadingText) loadingText.textContent = message;
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
}

function showError(message) {
    console.error('❌ Error:', message);
    alert('Error: ' + message);
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    alert('Success: ' + message);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
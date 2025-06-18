# BulkGenAI Ultra - Standalone Image Generator

A powerful, browser-based tool for generating personalized bulk images using templates and data files. No login required - everything runs locally in your browser!

## 🚀 Features

### 📊 Data Input
- **Multiple Formats**: Upload Excel (.xlsx), CSV, or text files
- **Direct Text Input**: Paste data directly into the application
- **Smart Parsing**: Automatic delimiter detection (comma, tab, semicolon)
- **Real-time Preview**: See your data before processing

### 🖼️ Template Management
- **Image Upload**: Support for PNG, JPG, GIF formats
- **Drag & Drop**: Easy file uploading with visual feedback
- **Auto-scaling**: Templates automatically fit the canvas
- **Preview**: Real-time template preview with dimensions

### 🎯 Field Mapping
- **Visual Editor**: Drag and drop fields onto your template
- **Precise Controls**: Fine-tune position, size, and styling
- **Live Preview**: See how your data will look in real-time
- **Advanced Styling**: Font family, size, color, and alignment options

### 🎨 Canvas Editor
- **Zoom Controls**: Zoom in/out and reset view
- **Grid System**: Optional grid overlay for precise alignment
- **Interactive Placeholders**: Click and drag to reposition
- **Multi-row Preview**: Navigate through your data rows

### 📤 Export Options
- **PDF Export**: 1, 2, or 4 images per A4 page
- **ZIP Export**: Individual PNG or JPG files
- **Batch Processing**: Handle thousands of records efficiently
- **Progress Tracking**: Real-time generation progress

### 🤖 AI Assistant
- **Layout Optimization**: Get smart recommendations for field positioning
- **Design Tips**: Professional advice on colors, fonts, and alignment
- **Chat History**: Locally stored conversation history
- **Context Aware**: Analyzes your current project setup

## 🛠️ How to Use

### Step 1: Upload Data
1. Choose between file upload or direct text input
2. Supported formats: Excel (.xlsx), CSV, or tab-delimited text
3. Preview your data to ensure correct parsing

### Step 2: Upload Template
1. Upload an image file (PNG, JPG, or GIF)
2. The template will be displayed with dimensions
3. Ensure your template has space for text placement

### Step 3: Map Fields
1. Drag data fields from the list onto your template
2. Position and style each field using the properties panel
3. Use the preview navigation to test with different data rows
4. Fine-tune positioning with precise controls

### Step 4: Generate & Export
1. Choose your export format (PDF or ZIP)
2. Click "Generate Images" to start the process
3. Monitor progress and download when complete

## 🎯 Tips for Best Results

### Template Design
- Use high-resolution images (at least 1080p)
- Leave clear spaces for text placement
- Consider contrast between background and text
- PNG format works great for templates with transparency

### Data Preparation
- Ensure your first row contains column headers
- Keep data consistent across rows
- Remove empty rows and columns
- Test with a small dataset first

### Field Positioning
- Use the grid system for precise alignment
- Group related fields together
- Maintain consistent spacing
- Test readability at different zoom levels

### Export Optimization
- Choose PDF for print-ready documents
- Use ZIP for individual image files
- Consider file size vs. quality trade-offs
- Test with a few samples before bulk generation

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript enabled required
- Local storage for chat history

### File Size Limits
- Template images: Up to 10MB recommended
- Data files: No strict limit (browser memory dependent)
- Export files: Depends on template size and row count

### Performance
- Optimized for thousands of records
- Batch processing prevents browser freezing
- Progress tracking for long operations
- Memory efficient canvas rendering

## 📁 Project Structure

```
bulk-image-generator/
├── index.html          # Main application file
├── style.css           # All styling and animations
├── script.js           # Core application logic
├── data/
│   ├── sample.csv      # Sample CSV data
│   └── sample.txt      # Sample text data
└── README.md           # This file
```

## 🚀 Getting Started

1. Download all files to a local folder
2. Open `index.html` in your web browser
3. Upload your data and template image
4. Start mapping fields and generating images!

## 💡 Use Cases

- **Business Cards**: Generate personalized business cards for team members
- **Certificates**: Create custom certificates with recipient names
- **Name Tags**: Bulk generate event name tags
- **Invitations**: Personalized event invitations
- **ID Cards**: Employee or student ID cards
- **Labels**: Product or shipping labels
- **Social Media**: Bulk social media graphics

## 🔒 Privacy & Security

- **No Server Required**: Everything runs in your browser
- **Local Processing**: Your data never leaves your device
- **No Registration**: No accounts or personal information required
- **Offline Capable**: Works without internet connection (after initial load)

## 🆘 Troubleshooting

### Common Issues

**Data not parsing correctly:**
- Check that your first row contains headers
- Ensure consistent delimiter usage
- Remove special characters from headers

**Template not displaying:**
- Verify image file format (PNG, JPG, GIF)
- Check file size (under 10MB recommended)
- Ensure image is not corrupted

**Export taking too long:**
- Reduce template image size
- Process smaller batches
- Close other browser tabs to free memory

**Fields not positioning correctly:**
- Use the zoom controls for precision
- Check that placeholders are within image bounds
- Verify font sizes are appropriate for template size

## 📞 Support

This is a standalone application with no external dependencies. All functionality is contained within the provided files. For best results, use the latest version of Chrome, Firefox, or Safari.

---

**BulkGenAI Ultra** - Transform your data into beautiful, personalized images with ease! 🎨✨
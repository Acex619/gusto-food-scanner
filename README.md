# Gusto Food Scanner – Evidence-Based Food Transparency

Gusto Food Scanner is a modern, science-driven mobile application that empowers consumers to make informed food choices through comprehensive product analysis. Scan barcodes to instantly reveal nutrition, ingredient safety, environmental impact, and sustainability insights—all backed by authoritative scientific sources.

![Gusto Logo](public/gusto-logo.svg)

## 🚀 Live Demo

**Try it now:** [https://gusto-food-scanner.vercel.app](https://gusto-food-scanner.vercel.app)

*Note: Use your mobile device for the best barcode scanning experience!*

## ✨ Features

- 🍎 **Smart Barcode Scanning**: Advanced image processing for reliable product recognition
- 🔬 **Scientific Evidence**: Every ingredient analysis backed by FDA, EFSA, and peer-reviewed research
- 🌱 **Environmental Impact**: CO2 footprint, water usage, deforestation risk, and biodiversity assessments
- 🧬 **GMO Detection**: Identify genetically modified ingredients with confidence ratings
- 📚 **Ingredient Definitions**: Clear explanations of what each ingredient is and does
- 🏷️ **Safety Classifications**: Risk levels from 'Generally Safe' to 'High Risk' with scientific justification
- 📊 **Comprehensive Scoring**: Environmental, nutritional, and safety scores with visual indicators
- 🌍 **Sustainability Metrics**: Land use, packaging impact, and transportation assessments
- ℹ️ **Info Tooltips**: Tap any ingredient for instant definitions and supporting research

## 🔬 Scientific & Environmental Data Sources

Gusto integrates with multiple authoritative databases to provide reliable, evidence-based information:

- **[Open Food Facts](https://world.openfoodfacts.org/)**: Global open database of food products
- **[FDA GRAS Database](https://www.fda.gov/food/food-additives-petitions/food-additive-status-list)**: Generally Recognized as Safe ingredients
- **[European Food Safety Authority (EFSA)](https://www.efsa.europa.eu/)**: EU reference for food safety data
- **[USDA FoodData Central](https://fdc.nal.usda.gov/)**: US Department of Agriculture food composition database
- **[PubMed](https://pubmed.ncbi.nlm.nih.gov/)**: Biomedical literature for scientific evidence on ingredients
- **[Agribalyse](https://agribalyse.ademe.fr/app)**: French life-cycle assessment database for agricultural products
- **[WHO/FAO Guidelines](https://www.who.int/publications)**: International food safety standards

## 🛠 Tech Stack

- **Frontend**: React + TypeScript with Vite
- **Styling**: TailwindCSS with shadcn/ui components  
- **Mobile**: Capacitor for native camera and device features
- **Scanning**: ZXing library with enhanced image processing
- **Data**: React Query for efficient data management and caching
- **Build**: Modern ES modules with optimized chunking

## Installation

### Prerequisites

- Node.js 18+ and npm installed
- Git for version control

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm installed
- Git for version control

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/Acex619/eco-ai-food-lens.git

# Navigate to project directory
cd eco-ai-food-lens

# Install dependencies
npm install

# Start development server
npm run dev
```

### 📱 Mobile Development

For mobile app development with Capacitor:

```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Add platforms
npx cap add android
npx cap add ios

# Build web assets
npm run build

# Sync assets to native projects
npx cap sync

# Open native IDE
npx cap open android
# or
npx cap open ios
```

## 🌐 Online Testing

You can test Gusto Food Scanner online without installing anything:

### Deployment Options

1. **Deploy on Vercel**:
   ```bash
   npm install -g vercel
   vercel --name gusto-food-scanner
   ```
   This will create a URL like `gusto-food-scanner.vercel.app`

2. **Deploy on Netlify**:
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```
   When satisfied with the preview, deploy to production:
   ```bash
   netlify deploy --prod
   ```

### Quick Deployment

A deployment helper script is included to make the process easier:

```bash
# Run the deployment helper
node deploy.js
```

This interactive script will:
1. Build your project
2. Help you choose a deployment platform (Vercel, Netlify, or GitHub Pages)
3. Guide you through the deployment process
4. Provide the URL where your app is accessible

### 📋 Usage Instructions for Online Version

1. **Open the app** link on your mobile device (recommended) or desktop
2. **Grant camera permissions** when prompted
3. **Scan a product**: Point your camera at a food product barcode
4. **Tap ingredient info icons** (ℹ️) to see definitions and scientific sources
5. **Review comprehensive analysis** with environmental impact, nutrition, and safety data

For the best experience, use a recent version of Chrome, Safari, or Firefox on a mobile device.

## 🆕 New Features in Gusto

### Enhanced Ingredient Information
- **Definitions**: Tap the ℹ️ icon next to any ingredient for a clear, scientific definition
- **Scientific Sources**: View 2-3 clickable research papers supporting each ingredient's classification
- **Evidence-Based**: Every risk assessment backed by FDA, EFSA, or peer-reviewed studies

### Improved User Experience
- **Modern Design**: Clean, eco-friendly color palette with smooth animations
- **Logo Integration**: Consistent Gusto apple mascot branding throughout the app
- **Scientific Credibility**: All information sources clearly cited and accessible

## Contributing

We welcome contributions to Gusto Food Scanner! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Use TypeScript for type safety
- Follow ESLint rules for code quality
- Write tests for new features
- Update documentation as needed

## Roadmap

- [ ] Add product image preview from scan result
- [ ] Implement user flagging for incorrect data
- [ ] Add product caching for faster repeated scans
- [ ] Enhance country origin detection
- [ ] Implement offline mode for basic functionality
- [ ] Add user dietary preference profiles

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Open Food Facts](https://world.openfoodfacts.org/) for their extensive product database
- [ZXing](https://github.com/zxing/zxing) for barcode/QR code scanning capabilities
- [shadcn/ui](https://ui.shadcn.com/) for accessible UI components

---

<p align="center">
  <img src="public/gusto-logo.svg" alt="Gusto Logo" width="100">
  <br>
  <strong>Gusto Food Scanner – Make informed food choices for a healthier planet</strong>
</p>

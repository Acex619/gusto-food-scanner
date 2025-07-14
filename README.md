# GreenTrace – The Real-Time Food Transparency Tool

GreenTrace is a modern, evidence-based application that empowers consumers to make informed food choices by providing comprehensive analysis of food products through barcode and QR code scanning. Get instant insights about environmental impact, nutritional value, GMO presence, and potential safety concerns, all backed by scientific evidence.

![GreenTrace Banner](public/placeholder.svg)

## Features

- 🔍 **Multi-Format Scanning**: Scan both traditional barcodes and QR codes for maximum product coverage
- 🌎 **Multi-Market Support**: Product recognition for both European and American markets
- 🧬 **GMO Detection**: Identify genetically modified ingredients with confidence ratings
- 🌱 **Environmental Impact**: CO2 footprint, water usage, and packaging analysis based on standardized datasets
- 🔬 **Scientific Backing**: References to peer-reviewed studies for ingredients with health concerns
- 📊 **Comprehensive Scoring**: Environmental, nutritional, and safety scores with visual indicators
- 🛡️ **Trust Score**: Data reliability metrics that show confidence in the analysis results
- 🏭 **Ingredient Analysis**: Detailed breakdown of each ingredient with risk levels and concerns

## Scientific & Environmental Data Sources

GreenTrace integrates with multiple authoritative databases to provide reliable information:

- **[Open Food Facts](https://world.openfoodfacts.org/)**: Global open database of food products
- **[Agribalyse](https://agribalyse.ademe.fr/app)**: French life-cycle assessment database for agricultural products
- **[Ecoinvent](https://ecoinvent.org/)**: Comprehensive life cycle inventory database
- **[European Food Safety Authority (EFSA)](https://www.efsa.europa.eu/)**: EU reference for food safety data
- **[USDA FoodData Central](https://fdc.nal.usda.gov/)**: US Department of Agriculture food composition database
- **[PubMed](https://pubmed.ncbi.nlm.nih.gov/)**: Biomedical literature for scientific evidence on ingredients

## Tech Stack

- React + TypeScript
- Vite
- TailwindCSS
- Capacitor for native features
- shadcn/ui for components
- ZXing for barcode & QR code scanning
- React Query for data management

## Installation

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

### Mobile Development

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

## Contributing

We welcome contributions to GreenTrace! Here's how you can help:

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
  <img src="public/placeholder.svg" alt="GreenTrace Logo" width="100">
  <br>
  <strong>GreenTrace – Make informed food choices for a healthier planet</strong>
</p>

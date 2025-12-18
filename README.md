# National Risk Index Explorer

An interactive web application for exploring the National Risk Index data using ArcGIS JavaScript API 4.34 and Calcite Design System.

## 🌐 Live Demo

Visit the live application: [https://paullgibbs.github.io/risk-index-explorer/](https://paullgibbs.github.io/risk-index-explorer/)

## 📊 About

The National Risk Index Explorer helps visualize communities most at risk for 18 natural hazards across the United States and territories. This application provides an interactive interface to explore:

- **18 Natural Hazards**: Avalanche, Coastal Flooding, Cold Wave, Drought, Earthquake, Hail, Heat Wave, Hurricane, Ice Storm, Inland Flooding, Landslide, Lightning, Strong Wind, Tornado, Tsunami, Volcanic Activity, Wildfire, and Winter Weather
- **Risk Analysis**: View risk by rating, score, or value
- **Social Vulnerability**: Census-based community resilience estimates
- **Community Resilience**: FEMA modified Baseline Resilience Indicators

## 🚀 Features

### ArcGIS API Features
- Feature Layer visualization
- Smart Mapping with color renderers
- Query and statistical analysis
- Search functionality
- Custom popup templates
- Basemap gallery
- Dynamic legend
- Layer management
- Measurement tools
- Sketch/drawing tools
- Graphics layer

### Calcite Components
- Modern, accessible UI components
- Responsive design
- Navigation and panels
- Action bar
- Forms and controls
- Modal dialogs
- Notifications

### Application Capabilities
- Toggle between 18 different natural hazards
- Three visualization types: Rating, Score, Value
- Filter counties by risk rating
- Real-time summary statistics
- Overlay Social Vulnerability and Community Resilience layers
- Interactive charts for risk distribution
- Detailed county-level popups
- Mobile-friendly responsive layout

## 🛠️ Technologies

- **ArcGIS Maps SDK for JavaScript 4.34**
- **Calcite Design System 2.13.2**
- **HTML5, CSS3, JavaScript (ES6+)**

## 📁 Project Structure

```
risk-index-explorer/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── styles.css         # Custom styles
└── README.md          # This file
```

## 🎯 Data Source

**National Risk Index Counties Feature Service**
- URL: https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer
- Version: December 2025 (1.20.0)
- Provider: FEMA

## 💻 Local Development

1. Clone the repository:
```bash
git clone https://github.com/PaulLGibbs/risk-index-explorer.git
```

2. Navigate to the project directory:
```bash
cd risk-index-explorer
```

3. Open `index.html` in a web browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

4. Open your browser to `http://localhost:8000`

## 📝 Usage

1. **Select a Hazard**: Choose from 18 different natural hazards using the dropdown menu
2. **Choose Visualization Type**: Toggle between Rating, Score, or Value views
3. **Apply Filters**: Filter counties by risk rating levels
4. **View Statistics**: See real-time statistics for the selected hazard
5. **Add Layers**: Enable Social Vulnerability or Community Resilience overlays
6. **Explore Tools**: Use the action bar to access charts, basemaps, legend, measurement, and sketch tools
7. **Search**: Find specific counties using the search widget
8. **Click Counties**: View detailed information in the popup

## 🌟 Highlights

- **No Build Process**: Pure HTML/CSS/JavaScript - works directly in the browser
- **CDN-Based**: All dependencies loaded from CDN for fast, reliable access
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Accessible**: Built with Calcite's accessible components
- **Modern**: Uses latest ArcGIS API features and design patterns

## 📄 License

This project is open source and available for educational and demonstration purposes.

## 👤 Author

**Paul L. Gibbs**
- GitHub: [@PaulLGibbs](https://github.com/PaulLGibbs)

## 🙏 Acknowledgments

- FEMA for providing the National Risk Index data
- Esri for the ArcGIS Maps SDK for JavaScript and Calcite Design System
- Various data sources including NOAA, USGS, U.S. Census Bureau, and others

## 📞 Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/PaulLGibbs/risk-index-explorer/issues).

---

**Data Version**: December 2025 (1.20.0)  
**Last Updated**: December 17, 2025

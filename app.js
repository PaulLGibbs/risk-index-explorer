require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/BasemapGallery",
    "esri/widgets/LayerList",
    "esri/widgets/Expand",
    "esri/widgets/Measurement",
    "esri/widgets/Sketch",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Search",
    "esri/widgets/Home",
    "esri/widgets/Fullscreen",
    "esri/widgets/ScaleBar",
    "esri/renderers/ClassBreaksRenderer",
    "esri/symbols/SimpleFillSymbol",
    "esri/smartMapping/renderers/color",
    "esri/smartMapping/statistics/summaryStatistics",
    "esri/rest/support/Query",
    "esri/core/reactiveUtils"
], function(
    Map, MapView, FeatureLayer, Legend, BasemapGallery, LayerList, Expand,
    Measurement, Sketch, GraphicsLayer, Search, Home, Fullscreen, ScaleBar,
    ClassBreaksRenderer, SimpleFillSymbol, colorRendererCreator,
    summaryStatistics, Query, reactiveUtils
) {

    // Feature Service URL
    const serviceUrl = "https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer/0";

    // Current configuration
    let currentHazard = "RISK_SCORE";
    let currentVizType = "rating";

    // Graphics layer for sketching
    const graphicsLayer = new GraphicsLayer({
        title: "Sketch Layer"
    });

    // Create the feature layer
    const riskLayer = new FeatureLayer({
        url: serviceUrl,
        title: "National Risk Index",
        outFields: ["*"],
        popupTemplate: createPopupTemplate()
    });

    // Create the map
    const map = new Map({
        basemap: "gray-vector",
        layers: [graphicsLayer, riskLayer]
    });

    // Create the map view
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-98, 39],
        zoom: 4,
        popup: {
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false
            }
        }
    });

    // UI Elements
    const loader = document.getElementById("mainLoader");
    const hazardSelect = document.getElementById("hazardSelect");
    const vizTypeControl = document.getElementById("vizTypeControl");
    const ratingFilter = document.getElementById("ratingFilter");
    const applyFilterBtn = document.getElementById("applyFilterBtn");
    const clearFilterBtn = document.getElementById("clearFilterBtn");
    const statsBlock = document.getElementById("statsBlock");
    const statsContent = document.getElementById("statsContent");
    const infoBtn = document.getElementById("infoBtn");
    const infoModal = document.getElementById("infoModal");
    const socialVulnCheck = document.getElementById("socialVulnCheck");
    const communityResCheck = document.getElementById("communityResCheck");

    // Widget panel elements
    const widgetPanel = document.getElementById("widgetPanel");
    const widgetPanelContent = document.getElementById("widgetPanelContent");
    const closeWidgetBtn = document.getElementById("closeWidgetBtn");
    const chartPanel = document.getElementById("chartPanel");
    const chartDiv = document.getElementById("chartDiv");
    const closeChartBtn = document.getElementById("closeChartBtn");

    // Action bar elements
    const chartAction = document.getElementById("chartAction");
    const basemapAction = document.getElementById("basemapAction");
    const layerListAction = document.getElementById("layerListAction");
    const legendAction = document.getElementById("legendAction");
    const measureAction = document.getElementById("measureAction");
    const sketchAction = document.getElementById("sketchAction");

    // Initialize widgets
    const search = new Search({
        view: view,
        includeDefaultSources: false,
        sources: [{
            layer: riskLayer,
            searchFields: ["COUNTY", "STATE"],
            displayField: "COUNTY",
            exactMatch: false,
            outFields: ["*"],
            name: "Counties",
            placeholder: "Search for a county"
        }]
    });

    const home = new Home({
        view: view
    });

    const fullscreen = new Fullscreen({
        view: view
    });

    const scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
    });

    const legend = new Legend({
        view: view
    });

    const basemapGallery = new BasemapGallery({
        view: view
    });

    const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
            const item = event.item;
            if (item.layer.type !== "group") {
                item.panel = {
                    content: "legend",
                    open: true
                };
            }
        }
    });

    const measurement = new Measurement({
        view: view
    });

    const sketch = new Sketch({
        layer: graphicsLayer,
        view: view,
        creationMode: "update"
    });

    // Add widgets to the view
    view.ui.add(search, "top-right");
    view.ui.add(home, "top-left");
    view.ui.add(fullscreen, "top-left");
    view.ui.add(scaleBar, "bottom-left");

    // Function to create popup template
    function createPopupTemplate() {
        return {
            title: "{COUNTY}, {STATE}",
            content: createPopupContent,
            outFields: ["*"]
        };
    }

    // Function to create popup content
    function createPopupContent(feature) {
        const attributes = feature.graphic.attributes;
        const hazardName = getHazardName(currentHazard);
        const fieldPrefix = currentHazard.replace("_RISKS", "");
        
        let content = `<div class="custom-popup-content">`;
        content += `<div class="popup-header">${attributes.COUNTY}, ${attributes.STATE}</div>`;
        
        // Overall Risk Information
        content += `<div class="popup-section">`;
        content += `<div class="popup-section-title">Overall Risk Index</div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Risk Score:</span><span class="popup-field-value">${formatValue(attributes.RISK_SCORE)}</span></div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Risk Rating:</span><span class="popup-field-value ${getRatingClass(attributes.RISK_RATNG)}">${attributes.RISK_RATNG || 'N/A'}</span></div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Population:</span><span class="popup-field-value">${formatNumber(attributes.POPULATION)}</span></div>`;
        content += `</div>`;

        // Current Hazard Information
        if (currentHazard !== "RISK_SCORE") {
            content += `<div class="popup-section">`;
            content += `<div class="popup-section-title">${hazardName}</div>`;
            
            const riskScore = attributes[`${fieldPrefix}_RISKS`];
            const riskRating = attributes[`${fieldPrefix}_RISKR`];
            const expectedLoss = attributes[`${fieldPrefix}_EALA`];
            const eventCount = attributes[`${fieldPrefix}_EVNTS`];
            
            content += `<div class="popup-field"><span class="popup-field-label">Risk Score:</span><span class="popup-field-value">${formatValue(riskScore)}</span></div>`;
            content += `<div class="popup-field"><span class="popup-field-label">Risk Rating:</span><span class="popup-field-value ${getRatingClass(riskRating)}">${riskRating || 'N/A'}</span></div>`;
            content += `<div class="popup-field"><span class="popup-field-label">Expected Annual Loss:</span><span class="popup-field-value">$${formatNumber(expectedLoss)}</span></div>`;
            content += `<div class="popup-field"><span class="popup-field-label">Historic Events:</span><span class="popup-field-value">${formatNumber(eventCount)}</span></div>`;
            content += `</div>`;
        }

        // Social Vulnerability
        content += `<div class="popup-section">`;
        content += `<div class="popup-section-title">Social Vulnerability</div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Score:</span><span class="popup-field-value">${formatValue(attributes.SOVI_SCORE)}</span></div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Rating:</span><span class="popup-field-value ${getRatingClass(attributes.SOVI_RATNG)}">${attributes.SOVI_RATNG || 'N/A'}</span></div>`;
        content += `</div>`;

        // Community Resilience
        content += `<div class="popup-section">`;
        content += `<div class="popup-section-title">Community Resilience</div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Score:</span><span class="popup-field-value">${formatValue(attributes.RESL_SCORE)}</span></div>`;
        content += `<div class="popup-field"><span class="popup-field-label">Rating:</span><span class="popup-field-value ${getRatingClass(attributes.RESL_RATNG)}">${attributes.RESL_RATNG || 'N/A'}</span></div>`;
        content += `</div>`;

        content += `</div>`;
        return content;
    }

    // Helper function to get rating CSS class
    function getRatingClass(rating) {
        if (!rating) return "";
        const lowerRating = rating.toLowerCase();
        if (lowerRating.includes("very high")) return "risk-rating-very-high";
        if (lowerRating.includes("high")) return "risk-rating-high";
        if (lowerRating.includes("moderate")) return "risk-rating-moderate";
        if (lowerRating.includes("low") && !lowerRating.includes("very")) return "risk-rating-low";
        if (lowerRating.includes("very low")) return "risk-rating-very-low";
        return "";
    }

    // Helper function to format values
    function formatValue(value) {
        if (value === null || value === undefined) return "N/A";
        return parseFloat(value).toFixed(2);
    }

    // Helper function to format numbers
    function formatNumber(value) {
        if (value === null || value === undefined) return "N/A";
        return new Intl.NumberFormat('en-US').format(value);
    }

    // Helper function to get hazard name
    function getHazardName(hazardCode) {
        const hazardMap = {
            "RISK_SCORE": "Overall Risk Index",
            "AVLN_RISKS": "Avalanche",
            "CFLD_RISKS": "Coastal Flooding",
            "CWAV_RISKS": "Cold Wave",
            "DRGT_RISKS": "Drought",
            "ERQK_RISKS": "Earthquake",
            "HAIL_RISKS": "Hail",
            "HWAV_RISKS": "Heat Wave",
            "HRCN_RISKS": "Hurricane",
            "ISTM_RISKS": "Ice Storm",
            "RFLD_RISKS": "Inland Flooding",
            "LNDS_RISKS": "Landslide",
            "LTNG_RISKS": "Lightning",
            "SWND_RISKS": "Strong Wind",
            "TRND_RISKS": "Tornado",
            "TSUN_RISKS": "Tsunami",
            "VLCN_RISKS": "Volcanic Activity",
            "WFIR_RISKS": "Wildfire",
            "WNTW_RISKS": "Winter Weather"
        };
        return hazardMap[hazardCode] || hazardCode;
    }

    // Function to get the field name based on selection
    function getFieldName() {
        const prefix = currentHazard === "RISK_SCORE" ? "RISK" : currentHazard.replace("_RISKS", "");
        
        if (currentVizType === "rating") {
            return currentHazard === "RISK_SCORE" ? "RISK_RATNG" : `${prefix}_RISKR`;
        } else if (currentVizType === "score") {
            return currentHazard === "RISK_SCORE" ? "RISK_SCORE" : currentHazard;
        } else {
            return currentHazard === "RISK_SCORE" ? "RISK_VALUE" : `${prefix}_EALR`;
        }
    }

    // Function to update renderer
    async function updateRenderer() {
        loader.hidden = false;
        
        try {
            const fieldName = getFieldName();
            
            if (currentVizType === "rating") {
                // Use unique value renderer for ratings
                const renderer = {
                    type: "unique-value",
                    field: fieldName,
                    defaultSymbol: {
                        type: "simple-fill",
                        color: [200, 200, 200, 0.5],
                        outline: { color: [255, 255, 255, 0.5], width: 0.5 }
                    },
                    uniqueValueInfos: [
                        {
                            value: "Very High",
                            symbol: { type: "simple-fill", color: [215, 25, 28, 0.7], outline: { color: [255, 255, 255, 0.5], width: 0.5 } },
                            label: "Very High"
                        },
                        {
                            value: "Relatively High",
                            symbol: { type: "simple-fill", color: [253, 174, 97, 0.7], outline: { color: [255, 255, 255, 0.5], width: 0.5 } },
                            label: "Relatively High"
                        },
                        {
                            value: "Relatively Moderate",
                            symbol: { type: "simple-fill", color: [255, 255, 191, 0.7], outline: { color: [255, 255, 255, 0.5], width: 0.5 } },
                            label: "Relatively Moderate"
                        },
                        {
                            value: "Relatively Low",
                            symbol: { type: "simple-fill", color: [166, 217, 106, 0.7], outline: { color: [255, 255, 255, 0.5], width: 0.5 } },
                            label: "Relatively Low"
                        },
                        {
                            value: "Very Low",
                            symbol: { type: "simple-fill", color: [26, 150, 65, 0.7], outline: { color: [255, 255, 255, 0.5], width: 0.5 } },
                            label: "Very Low"
                        }
                    ]
                };
                riskLayer.renderer = renderer;
            } else {
                // Use smart mapping for score and value
                const colorParams = {
                    layer: riskLayer,
                    view: view,
                    field: fieldName,
                    theme: "high-to-low",
                    basemap: map.basemap
                };

                const rendererResponse = await colorRendererCreator.createContinuousRenderer(colorParams);
                riskLayer.renderer = rendererResponse.renderer;
            }

            // Update statistics
            await updateStatistics(fieldName);
            
        } catch (error) {
            console.error("Error updating renderer:", error);
            showNotification("Error updating visualization", "danger");
        } finally {
            loader.hidden = true;
        }
    }

    // Function to update statistics
    async function updateStatistics(fieldName) {
        try {
            const query = riskLayer.createQuery();
            query.outStatistics = [
                { statisticType: "count", onStatisticField: fieldName, outStatisticFieldName: "count" },
                { statisticType: "sum", onStatisticField: "POPULATION", outStatisticFieldName: "totalPop" },
                { statisticType: "avg", onStatisticField: fieldName, outStatisticFieldName: "avgValue" },
                { statisticType: "max", onStatisticField: fieldName, outStatisticFieldName: "maxValue" },
                { statisticType: "min", onStatisticField: fieldName, outStatisticFieldName: "minValue" }
            ];

            const result = await riskLayer.queryFeatures(query);
            
            if (result.features.length > 0) {
                const stats = result.features[0].attributes;
                
                let statsHtml = `
                    <div class="stat-item">
                        <span class="stat-label">Total Counties:</span>
                        <span class="stat-value">${formatNumber(stats.count)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Population:</span>
                        <span class="stat-value">${formatNumber(stats.totalPop)}</span>
                    </div>
                `;
                
                if (currentVizType !== "rating") {
                    statsHtml += `
                        <div class="stat-item">
                            <span class="stat-label">Average:</span>
                            <span class="stat-value">${formatValue(stats.avgValue)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Maximum:</span>
                            <span class="stat-value">${formatValue(stats.maxValue)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Minimum:</span>
                            <span class="stat-value">${formatValue(stats.minValue)}</span>
                        </div>
                    `;
                }
                
                statsContent.innerHTML = statsHtml;
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    }

    // Function to show notifications
    function showNotification(message, kind = "info") {
        const notice = document.createElement("calcite-notice");
        notice.setAttribute("open", "");
        notice.setAttribute("kind", kind);
        notice.setAttribute("auto-dismiss", "");
        notice.setAttribute("auto-dismiss-duration", "medium");
        notice.innerHTML = `<div slot="message">${message}</div>`;
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.remove();
        }, 3000);
    }

    // Event Listeners
    hazardSelect.addEventListener("calciteSelectChange", () => {
        currentHazard = hazardSelect.value;
        updateRenderer();
    });

    vizTypeControl.addEventListener("calciteSegmentedControlChange", () => {
        currentVizType = vizTypeControl.value;
        updateRenderer();
    });

    applyFilterBtn.addEventListener("click", () => {
        const rating = ratingFilter.value;
        if (rating === "all") {
            riskLayer.definitionExpression = "";
        } else {
            const fieldName = getFieldName();
            riskLayer.definitionExpression = `${fieldName} = '${rating}'`;
        }
        showNotification("Filter applied successfully", "success");
    });

    clearFilterBtn.addEventListener("click", () => {
        riskLayer.definitionExpression = "";
        ratingFilter.value = "all";
        showNotification("Filter cleared", "info");
    });

    infoBtn.addEventListener("click", () => {
        infoModal.open = true;
    });

    // Social Vulnerability Layer
    socialVulnCheck.addEventListener("calciteCheckboxChange", async (e) => {
        if (e.target.checked) {
            const sovLayer = new FeatureLayer({
                url: serviceUrl,
                title: "Social Vulnerability",
                opacity: 0.6,
                renderer: await createSocialVulnRenderer()
            });
            map.add(sovLayer);
        } else {
            const layer = map.layers.find(l => l.title === "Social Vulnerability");
            if (layer) map.remove(layer);
        }
    });

    // Community Resilience Layer
    communityResCheck.addEventListener("calciteCheckboxChange", async (e) => {
        if (e.target.checked) {
            const resLayer = new FeatureLayer({
                url: serviceUrl,
                title: "Community Resilience",
                opacity: 0.6,
                renderer: await createCommunityResRenderer()
            });
            map.add(resLayer);
        } else {
            const layer = map.layers.find(l => l.title === "Community Resilience");
            if (layer) map.remove(layer);
        }
    });

    async function createSocialVulnRenderer() {
        return {
            type: "unique-value",
            field: "SOVI_RATNG",
            uniqueValueInfos: [
                { value: "Very High", symbol: { type: "simple-fill", color: [215, 25, 28, 0.5] }, label: "Very High" },
                { value: "Relatively High", symbol: { type: "simple-fill", color: [253, 174, 97, 0.5] }, label: "Relatively High" },
                { value: "Relatively Moderate", symbol: { type: "simple-fill", color: [255, 255, 191, 0.5] }, label: "Relatively Moderate" },
                { value: "Relatively Low", symbol: { type: "simple-fill", color: [166, 217, 106, 0.5] }, label: "Relatively Low" },
                { value: "Very Low", symbol: { type: "simple-fill", color: [26, 150, 65, 0.5] }, label: "Very Low" }
            ]
        };
    }

    async function createCommunityResRenderer() {
        return {
            type: "unique-value",
            field: "RESL_RATNG",
            uniqueValueInfos: [
                { value: "Very High", symbol: { type: "simple-fill", color: [26, 150, 65, 0.5] }, label: "Very High" },
                { value: "Relatively High", symbol: { type: "simple-fill", color: [166, 217, 106, 0.5] }, label: "Relatively High" },
                { value: "Relatively Moderate", symbol: { type: "simple-fill", color: [255, 255, 191, 0.5] }, label: "Relatively Moderate" },
                { value: "Relatively Low", symbol: { type: "simple-fill", color: [253, 174, 97, 0.5] }, label: "Relatively Low" },
                { value: "Very Low", symbol: { type: "simple-fill", color: [215, 25, 28, 0.5] }, label: "Very Low" }
            ]
        };
    }

    // Action Bar Handlers
    chartAction.addEventListener("click", () => {
        chartPanel.hidden = !chartPanel.hidden;
        if (!chartPanel.hidden) {
            generateChart();
        }
    });

    basemapAction.addEventListener("click", () => {
        showWidget("Basemap Gallery", basemapGallery);
    });

    layerListAction.addEventListener("click", () => {
        showWidget("Layer List", layerList);
    });

    legendAction.addEventListener("click", () => {
        showWidget("Legend", legend);
    });

    measureAction.addEventListener("click", () => {
        showWidget("Measurement Tools", measurement);
    });

    sketchAction.addEventListener("click", () => {
        showWidget("Sketch Tools", sketch);
    });

    closeWidgetBtn.addEventListener("click", () => {
        widgetPanel.hidden = true;
        widgetPanelContent.innerHTML = '<calcite-action slot="header-actions-end" id="closeWidgetBtn" icon="x" text="Close"></calcite-action>';
    });

    closeChartBtn.addEventListener("click", () => {
        chartPanel.hidden = true;
    });

    function showWidget(title, widget) {
        widgetPanel.hidden = false;
        widgetPanelContent.heading = title;
        
        // Clear previous content except close button
        const existingContent = widgetPanelContent.querySelector('.widget-container');
        if (existingContent) {
            existingContent.remove();
        }
        
        const container = document.createElement('div');
        container.className = 'widget-container';
        container.appendChild(widget.container);
        widgetPanelContent.appendChild(container);
    }

    // Simple chart generation using canvas
    async function generateChart() {
        try {
            const query = riskLayer.createQuery();
            query.outStatistics = [
                { statisticType: "count", onStatisticField: "OBJECTID", outStatisticFieldName: "count" }
            ];
            query.groupByFieldsForStatistics = ["RISK_RATNG"];
            
            const result = await riskLayer.queryFeatures(query);
            
            chartDiv.innerHTML = `
                <h3>Risk Distribution</h3>
                <div id="chartCanvas" style="display: flex; gap: 1rem; align-items: flex-end; height: 300px; padding: 2rem;">
                </div>
            `;
            
            const canvas = document.getElementById("chartCanvas");
            const maxCount = Math.max(...result.features.map(f => f.attributes.count));
            
            result.features.forEach(feature => {
                const rating = feature.attributes.RISK_RATNG || "Unknown";
                const count = feature.attributes.count;
                const height = (count / maxCount) * 250;
                
                const bar = document.createElement("div");
                bar.style.cssText = `
                    flex: 1;
                    height: ${height}px;
                    background: linear-gradient(to top, var(--calcite-color-brand), var(--calcite-color-brand-hover));
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: center;
                    padding: 0.5rem;
                    color: white;
                    font-weight: bold;
                `;
                
                bar.innerHTML = `
                    <div style="position: absolute; top: -30px; font-size: 0.9rem; color: var(--calcite-color-text-1);">${count}</div>
                    <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.8rem;">${rating}</div>
                `;
                
                canvas.appendChild(bar);
            });
            
        } catch (error) {
            console.error("Error generating chart:", error);
            chartDiv.innerHTML = '<calcite-notice open kind="danger"><div slot="message">Error generating chart</div></calcite-notice>';
        }
    }

    // Initialize the app
    view.when(() => {
        updateRenderer();
        showNotification("National Risk Index Explorer loaded successfully", "success");
    });

});

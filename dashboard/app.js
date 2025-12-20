// Initialize AWS SDK
// Make sure to include AWS SDK in your HTML if you want S3 fetching

class TraffickingRiskApp {
    constructor() {
        this.dashboardData = null;
        this.currentRegion = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Dashboard buttons
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Note: region selection is a dropdown (populated after data loads)
    }

    // ===== LOGIN HANDLING =====
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('loginError');
        
        // Simple client-side validation (in production, use backend authentication)
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
            errorMsg.classList.remove('show');
            this.loginSuccess();
        } else {
            errorMsg.textContent = 'Invalid username or password';
            errorMsg.classList.add('show');
        }
    }

    loginSuccess() {
        // Hide login, show dashboard
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'flex';
        
        // Load data from S3 (if configured), otherwise fallback
        this.loadDataFromS3();
    }

    handleLogout() {
        // Clear form
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.remove('show');
        
        // Hide dashboard, show login
        document.getElementById('dashboardContainer').style.display = 'none';
        document.getElementById('loginContainer').style.display = 'flex';
    }

    // ===== S3 DATA LOADING =====
    async loadDataFromS3() {
        try {
            if (!AWS_CONFIG || !AWS_CONFIG.bucketName) throw new Error('S3 not configured');

            // Configure AWS SDK
            AWS.config.update({
                region: AWS_CONFIG.region,
                credentials: new AWS.Credentials({
                    accessKeyId: AWS_CONFIG.accessKeyId,
                    secretAccessKey: AWS_CONFIG.secretAccessKey
                })
            });

            const s3 = new AWS.S3();
            
            const params = {
                Bucket: AWS_CONFIG.bucketName,
                Key: AWS_CONFIG.dataFilePath
            };

            const data = await s3.getObject(params).promise();
            this.dashboardData = JSON.parse(data.Body.toString('utf-8'));
            // Populate region dropdown so users can select from available results
            this.populateRegionOptions();
            // Do not auto-populate features here — features update after a user search
            
        } catch (error) {
            console.warn('S3 load failed or not configured — attempting to load local results data.', error);
            await this.loadLocalResults();  // Try local results file, fallback to local sample
        }
    }

    async loadLocalResults() {
        // Try to fetch the results JSON from the local filesystem (relative path configured in `config.js`)
        if (!AWS_CONFIG || !AWS_CONFIG.localResultsPath) {
            this.loadLocalData();
            return;
        }

        try {
            const resp = await fetch(AWS_CONFIG.localResultsPath);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const results = await resp.json();

            // Aggregate feature importances across all nations
            const featureSums = {};
            const regions = {};

            results.forEach((entry) => {
                const { nation, coordinates, top_5_features } = entry;
                let totalImportance = 0;
                const featureList = [];

                // Build an array of {feature, importance} for the nation
                const topFeaturesArray = Object.values(top_5_features).map((f) => {
                    totalImportance += f.importance;
                    featureList.push(`${f.feature} (${(f.importance * 100).toFixed(1)}%)`);
                    featureSums[f.feature] = (featureSums[f.feature] || 0) + f.importance;
                    return { feature: f.feature, importance: f.importance };
                });

                let riskLevel = 'Low';
                if (totalImportance >= 0.3) riskLevel = 'High';
                else if (totalImportance >= 0.15) riskLevel = 'Medium';

                regions[nation] = {
                    coordinates,
                    riskLevel,
                    description: `Top features: ${featureList.join(', ')}`,
                    top_5_features: topFeaturesArray
                };
            });

            // Build features array from top features across nations
            const features = Object.entries(featureSums)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([feature]) => feature);

            this.dashboardData = {
                features,
                regions
            };

            // Populate the region dropdown so users can select available nations
            this.populateRegionOptions();
        } catch (err) {
            console.warn('Failed to load local results file — falling back to sample data.', err);
            this.loadLocalData();
        }
    }

    loadLocalData() {
        // Fallback data in case S3 loading fails
        this.dashboardData = {
            features: [
                'Homelessness or housing instability',
                'Unemployment or underemployment',
                'Youth aged 12-17',
                'Prior history of abuse or neglect',
                'Gang involvement'
            ],
            regions: {
                'Los Angeles, CA': {
                    coordinates: { lat: 34.0522, lng: -118.2437 },
                    riskLevel: 'High',
                    description: 'Los Angeles area with identified trafficking concerns'
                }
            }
        };

        // Populate select even for fallback so it is usable
        this.populateRegionOptions();
    }

    findRegion(region) {
        if (!this.dashboardData || !this.dashboardData.regions) return null;
        const query = region.toLowerCase();

        // Exact match first
        for (const key of Object.keys(this.dashboardData.regions)) {
            if (key.toLowerCase() === query) return { key, data: this.dashboardData.regions[key] };
        }

        // Fuzzy match: substring matches
        for (const key of Object.keys(this.dashboardData.regions)) {
            if (key.toLowerCase().includes(query) || query.includes(key.toLowerCase())) return { key, data: this.dashboardData.regions[key] };
        }

        return null;
    }

    populateFeatures(features) {
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';

        if (!features || !features.length) return;

        features.forEach((item, index) => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            let text = '';
            if (typeof item === 'string') {
                text = item;
            } else if (item && item.feature) {
                const importanceText = item.importance ? ` (${(item.importance * 100).toFixed(1)}%)` : '';
                text = `${item.feature}${importanceText}`;
            } else {
                text = String(item);
            }

            featureItem.innerHTML = `
                <span class="feature-number">${index + 1}</span>
                <span class="feature-text">${text}</span>
            `;
            featuresList.appendChild(featureItem);
        });

        // Ensure the features panel is visible (it is always visible in layout)
    }

    populateRegionOptions() {
        const selectEl = document.getElementById('regionSelect');
        if (!selectEl) return;

        // Clear existing options, keep the default placeholder
        selectEl.innerHTML = '<option value="">Select a region</option>';

        if (!this.dashboardData || !this.dashboardData.regions) {
            selectEl.disabled = true;
            document.getElementById('searchBtn').disabled = true;
            return;
        }

        const regionKeys = Object.keys(this.dashboardData.regions);
        regionKeys.forEach((key) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            selectEl.appendChild(opt);
        });

        selectEl.disabled = false;
        document.getElementById('searchBtn').disabled = false;
    }

    // ===== SEARCH HANDLING =====
    handleSearch() {
        const selectEl = document.getElementById('regionSelect');
        const searchRegion = selectEl.value;

        if (!searchRegion) {
            alert('Please select a region');
            return;
        }

        this.currentRegion = searchRegion;
        this.displaySearchResults(searchRegion);
    }

    displaySearchResults(region) {
        const regionInfoEl = document.getElementById('regionInfo');
        const featuresListEl = document.getElementById('featuresList');
        const selectEl = document.getElementById('regionSelect');

        let regionKey = region;
        let regionData = null;

        if (this.dashboardData && this.dashboardData.regions) {
            if (this.dashboardData.regions[region]) {
                regionData = this.dashboardData.regions[region];
            } else {
                const found = this.findRegion(region);
                if (found) {
                    regionKey = found.key;
                    regionData = found.data;
                }
            }
        }

        if (regionData) {
            regionInfoEl.style.display = 'block';
            regionInfoEl.innerHTML = `
                <p><strong>Region:</strong> ${regionKey}</p>
                <p><strong>Risk Level:</strong> <span style="color: ${regionData.riskLevel === 'High' ? 'red' : (regionData.riskLevel === 'Medium' ? 'orange' : 'green')}">${regionData.riskLevel}</span></p>
                <p><strong>Coordinates:</strong> Lat: ${regionData.coordinates.lat}, Lng: ${regionData.coordinates.lng}</p>
                <p><strong>Description:</strong> ${regionData.description}</p>
            `;

            // Ensure the dropdown shows the selected region
            if (selectEl && selectEl.value !== regionKey) selectEl.value = regionKey;

            // Populate features with region-specific features if available
            if (regionData.top_5_features && Array.isArray(regionData.top_5_features)) {
                this.populateFeatures(regionData.top_5_features);
            } else if (this.dashboardData && this.dashboardData.features) {
                // Fallback to global top features
                this.populateFeatures(this.dashboardData.features);
            } else {
                featuresListEl.innerHTML = '';
            }
        } else {
            regionInfoEl.style.display = 'block';
            regionInfoEl.innerHTML = `<p>No specific data found for "${region}". Try a country code like "US" or "PH".</p>`;
            featuresListEl.innerHTML = '';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TraffickingRiskApp();
});

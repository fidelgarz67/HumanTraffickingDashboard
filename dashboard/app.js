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
        
        // Region input - allow Enter key
        document.getElementById('regionInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
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
            
            // Populate features from loaded data
            this.populateFeatures();
            
        } catch (error) {
            console.warn('S3 load failed or not configured — using local fallback data.', error);
            this.loadLocalData();  // Fallback to local data
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
        
        this.populateFeatures();
    }

    populateFeatures() {
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';

        if (this.dashboardData && this.dashboardData.features) {
            this.dashboardData.features.forEach((feature, index) => {
                const featureItem = document.createElement('div');
                featureItem.className = 'feature-item';
                featureItem.innerHTML = `
                    <span class="feature-number">${index + 1}</span>
                    <span class="feature-text">${feature}</span>
                `;
                featuresList.appendChild(featureItem);
            });
        }
    }

    // ===== SEARCH HANDLING =====
    handleSearch() {
        const regionInput = document.getElementById('regionInput');
        const searchRegion = regionInput.value.trim();

        if (!searchRegion) {
            alert('Please enter a region');
            return;
        }

        this.currentRegion = searchRegion;
        this.displaySearchResults(searchRegion);
    }

    displaySearchResults(region) {
        const dataDisplay = document.getElementById('dataDisplay');
        const resultsContent = document.getElementById('resultsContent');

        let html = `<p><strong>Region:</strong> ${region}</p>`;

        if (this.dashboardData && this.dashboardData.regions && this.dashboardData.regions[region]) {
            const regionData = this.dashboardData.regions[region];
            html += `
                <p><strong>Risk Level:</strong> <span style="color: ${regionData.riskLevel === 'High' ? 'red' : 'orange'}">${regionData.riskLevel}</span></p>
                <p><strong>Description:</strong> ${regionData.description}</p>
                <p><strong>Coordinates:</strong> Lat: ${regionData.coordinates.lat}, Lng: ${regionData.coordinates.lng}</p>
            `;
        } else {
            html += '<p>No specific data found for this region. Please try another location.</p>';
        }

        resultsContent.innerHTML = html;
        dataDisplay.style.display = 'block';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TraffickingRiskApp();
});

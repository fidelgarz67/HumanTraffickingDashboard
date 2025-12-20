// AWS Configuration (DO NOT commit real credentials)
// Replace these placeholder values with your own when testing locally.
const AWS_CONFIG = {
    region: 'us-east-1',             // change to your bucket region
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    bucketName: 'your-bucket-name',
    dataFilePath: 'trafficking-risk-data.json',
    // Local results path (relative to dashboard/index.html)
    localResultsPath: 'results/country_shap_summary.json'
};

// Simple demo credentials for local testing only
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'password123'
};

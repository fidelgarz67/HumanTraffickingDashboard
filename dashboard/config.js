// AWS Configuration (DO NOT commit real credentials)
// Replace these placeholder values with your own when testing locally.
// This file is loaded in the browser, so guard access to `process.env` to
// avoid "can't find variable: process" runtime errors when no Node runtime
// is present.
const AWS_CONFIG = {
    region: (typeof process !== 'undefined' && process.env && process.env.region) ? process.env.region : 'us-east-1',
    accessKeyId: (typeof process !== 'undefined' && process.env && process.env.accessKeyId) ? process.env.accessKeyId : '',
    secretAccessKey: (typeof process !== 'undefined' && process.env && process.env.secretAccessKey) ? process.env.secretAccessKey : '',
    bucketName: 'your-bucket-name',
    dataFilePath: 'trafficking-risk-data.json',
    // Local results path (relative to dashboard/index.html)
    localResultsPath: 'results/country_shap_summary.json'
};


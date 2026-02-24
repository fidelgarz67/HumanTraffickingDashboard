// Minimal Express server that exposes a POST /auth endpoint to validate
// credentials against DynamoDB. This keeps AWS credentials on the server
// (safer than calling DynamoDB from the browser).

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

// Ensure required environment variables are available; fail safely with clear errors.
const CREDENTIALS_TABLE = process.env.CREDENTIALS_TABLE_NAME;
if (!CREDENTIALS_TABLE) {
  console.warn('Warning: CREDENTIALS_TABLE_NAME is not set. /auth will return an error until this is configured.');
}

app.post('/auth', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    if (!CREDENTIALS_TABLE) {
      console.error('CREDENTIALS_TABLE_NAME missing for auth request');
      return res.status(500).json({ error: 'server misconfiguration: CREDENTIALS_TABLE_NAME not set' });
    }

    const params = {
      TableName: CREDENTIALS_TABLE,
      Key: {
        username: { S: username }
      }
    };

    const result = await ddbClient.send(new GetItemCommand(params));
    if (!result.Item) return res.json({ authenticated: false });

    // NOTE: In production compare hashed passwords. This example does plain
    // comparison only for local testing if a `password` attribute exists.
    const stored = result.Item.password && result.Item.password.S ? result.Item.password.S : null;
    const authenticated = stored ? (stored === password) : false;

    return res.json({ authenticated });
  } catch (err) {
    console.error('DynamoDB error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});

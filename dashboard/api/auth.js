import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

// Vercel-compatible serverless API route for authentication.
// Reads AWS credentials and table name from environment variables:
// - AWS_REGION
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// - CREDENTIALS_TABLE_NAME

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const ddb = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
  });

  try {
    const params = {
      TableName: process.env.CREDENTIALS_TABLE_NAME,
      Key: { username: { S: username } }
    };

    const result = await ddb.send(new GetItemCommand(params));
    if (!result.Item) return res.json({ authenticated: false });

    const stored = result.Item.password && result.Item.password.S ? result.Item.password.S : null;
    const authenticated = stored ? (stored === password) : false;

    return res.json({ authenticated });
  } catch (err) {
    console.error('DynamoDB error', err);
    return res.status(500).json({ error: 'internal' });
  }
}

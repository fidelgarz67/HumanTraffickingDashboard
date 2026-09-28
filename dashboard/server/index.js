// Authentication has been removed from the app. This Express server remains as a
// harmless stub so any old clients or service workers do not fail when requesting /auth.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/auth', async (req, res) => {
  return res.json({ authenticated: true, authRemoved: true });
});

app.listen(PORT, () => {
  console.log(`Dashboard server listening on http://localhost:${PORT}`);
});

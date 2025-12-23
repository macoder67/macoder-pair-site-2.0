require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createSession, validateSession, isBotActive, activeSessions } = require('./utils/session');
const { Client } = require('whatsapp-web.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

// WhatsApp client setup
const client = new Client({ puppeteer: { headless: true } });
client.on('ready', () => console.log('WhatsApp client ready!'));
client.initialize();

// Create session
app.post('/create-session', async (req, res) => {
    const { number, mode } = req.body;
    const sessionID = createSession(number, mode);

    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, `✅ Your session ID: ${sessionID}\nUse it within 5 minutes.`);
    } catch (err) {
        console.error(err);
    }

    res.json({ sessionID, expiresIn: 300 });
});

// Validate session
app.post('/validate-session', (req, res) => {
    const { sessionID } = req.body;
    const valid = validateSession(sessionID);
    res.json({ valid, status: activeSessions[sessionID]?.status || 'expired' });
});

// Bot command endpoint
app.post('/bot-command', (req, res) => {
    const { sessionID, command } = req.body;
    if (!sessionID || !isBotActive(sessionID)) {
        return res.status(403).json({ error: 'Session inactive or invalid. Please link your session first.' });
    }
    // Example commands
    if (command === 'ping') return res.json({ result: 'Pong!' });
    res.json({ result: `Command '${command}' executed.` });
});

// Clean expired sessions
setInterval(() => {
    Object.keys(activeSessions).forEach(id => {
        if (Date.now() > activeSessions[id].expiresAt) {
            activeSessions[id].status = 'expired';
            activeSessions[id].botActive = false;
        }
    });
}, 30000);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

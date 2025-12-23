const crypto = require('crypto');

const activeSessions = {};

function generateSessionID() {
    const randomLetters = crypto.randomBytes(4).toString('hex');
    return `${process.env.SESSION_PREFIX}${randomLetters}`;
}

function createSession(number, mode, duration = 300) {
    const sessionID = generateSessionID();
    const expiresAt = Date.now() + duration * 1000;

    activeSessions[sessionID] = {
        number,
        mode,
        status: 'pending',
        expiresAt,
        botActive: false
    };

    return sessionID;
}

function validateSession(sessionID) {
    const session = activeSessions[sessionID];
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
        session.status = 'expired';
        return false;
    }
    session.status = 'linked';
    session.botActive = true;
    return true;
}

function isBotActive(sessionID) {
    const session = activeSessions[sessionID];
    return session?.botActive || false;
}

module.exports = { generateSessionID, createSession, validateSession, activeSessions, isBotActive };

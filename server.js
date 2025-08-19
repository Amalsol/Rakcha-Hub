const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Storage
const users = {};     // e.g., { 'amal': { nodes: [...] } }
const sessions = {};  // e.g., { 'session_id_123': { username: 'amal' } }

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = sessions[sessionId];
    next();
};

// --- API ROUTES ---

// Login
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    const sanitizedUser = username.trim().toLowerCase();
    if (!users[sanitizedUser]) {
        users[sanitizedUser] = { nodes: [] };
    }
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    sessions[sessionId] = { username: sanitizedUser };
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.status(200).json({ message: 'Login successful' });
});

// Logout
app.post('/api/logout', (req, res) => {
    const sessionId = req.cookies.sessionId;
    delete sessions[sessionId];
    res.clearCookie('sessionId');
    res.status(200).json({ message: 'Logout successful' });
});

// Check user session
app.get('/api/user', authMiddleware, (req, res) => {
    res.status(200).json({ username: req.user.username });
});

// Get Nodes
app.get('/api/nodes', authMiddleware, (req, res) => {
    res.status(200).json(users[req.user.username].nodes);
});

// Create Node
app.post('/api/nodes', authMiddleware, (req, res) => {
    const newNode = req.body;
    users[req.user.username].nodes.push(newNode);
    res.status(201).json(newNode);
});

// Update Node
app.put('/api/nodes/:id', authMiddleware, (req, res) => {
    const nodeId = parseInt(req.params.id);
    const updates = req.body;
    const userNodes = users[req.user.username].nodes;
    const nodeIndex = userNodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return res.status(404).json({ error: 'Node not found' });
    userNodes[nodeIndex] = { ...userNodes[nodeIndex], ...updates };
    res.status(200).json(userNodes[nodeIndex]);
});

// Delete Node
app.delete('/api/nodes/:id', authMiddleware, (req, res) => {
    const nodeId = parseInt(req.params.id);
    const userNodes = users[req.user.username].nodes;
    const nodeIndex = userNodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return res.status(404).json({ error: 'Node not found' });
    userNodes.splice(nodeIndex, 1);
    res.status(200).json({ message: 'Node deleted' });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
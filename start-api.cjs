const path = require('path');

process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));
process.on('uncaughtException', (err) => console.error('UNCAUGHT EXCEPTION:', err));

const app = require(path.join(__dirname, 'api'));
const port = process.env.PORT || 5174;

const server = app.listen(port, () => console.log(`StudyBuddy running on http://localhost:${port}`));
server.on('error', (e) => console.error('Server error:', e));

// Keep event loop alive
setInterval(() => {}, 1000);
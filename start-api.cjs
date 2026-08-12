const app = require('./api');
const port = process.env.PORT || 5174;

app.listen(port, () => console.log(`StudyBuddy running on http://localhost:${port}`));

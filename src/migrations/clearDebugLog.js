const fs = require('node:fs');
const path = require('node:path');

fs.writeFileSync(path.resolve('./user-data/logs/debug-write.txt'), '');
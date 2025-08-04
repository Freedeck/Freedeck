const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml'); // You'll need: npm install js-yaml
const app = require('express')();

let openApiDocumentation;

// Function to load documentation from YAML or JSON
function loadDocumentation() {
  try {
    // Try loading from YAML first
    if (fs.existsSync('./index.yaml')) {
      const yamlContent = fs.readFileSync('./index.yaml', 'utf8');
      openApiDocumentation = yaml.load(yamlContent);
      console.log('Loaded documentation from index.yaml');
    } else if (fs.existsSync('./openapi.json')) {
      // Fallback to JSON
      delete require.cache[path.resolve('./openapi.json')];
      openApiDocumentation = require('./openapi.json');
      console.log('Loaded documentation from openapi.json');
    } else {
      throw new Error('No documentation file found (index.yaml or openapi.json)');
    }
  } catch (error) {
    console.error('Error loading documentation:', error);
    // Fallback to empty spec
    openApiDocumentation = {
      openapi: '3.0.4',
      info: { title: 'API Documentation', version: '1.0.0' },
      paths: {}
    };
  }
}

// Initial load
loadDocumentation();

// Watch for changes in documentation files
const filesToWatch = ['./index.yaml', './openapi.json'];

filesToWatch.forEach(file => {
  if (fs.existsSync(file)) {
    fs.watchFile(file, (curr, prev) => {
      console.log(`Documentation file changed: ${file}`);
      loadDocumentation();
      console.log('Documentation reloaded successfully');
    });
  }
});

// Middleware to serve fresh documentation on each request
app.use('/', swaggerUi.serve, (req, res, next) => {
  // Setup swagger UI with current documentation
  const setup = swaggerUi.setup(openApiDocumentation, {
    swaggerOptions: {
      // Add any swagger UI options here
    }
  });
  
  setup(req, res, next);
});

app.listen(5753, () => {
  console.log('Documentation server running on http://localhost:5753/docs');
  console.log('Watching for changes in documentation files...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping documentation server...');
  filesToWatch.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unwatchFile(file);
    }
  });
  process.exit(0);
});
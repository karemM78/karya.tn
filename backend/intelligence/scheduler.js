const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');

console.log('Automation Scheduler started...');

// Helper to run the Python engine
const runIntelligenceEngine = () => {
  console.log(`[${new Date().toISOString()}] Triggering AI Intelligence Engine...`);
  
  const pythonProcess = spawn('python', [path.join(__dirname, 'engine.py')]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Engine: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Engine Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Intelligence Engine process exited with code ${code}`);
  });
};

// Run every hour: '0 * * * *'
// For demonstration, let's run it once immediately and then every hour
runIntelligenceEngine();

cron.schedule('0 * * * *', () => {
  runIntelligenceEngine();
});

module.exports = { runIntelligenceEngine };

console.log('Node.js test script running');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Try to require Firebase
console.log('\nAttempting to require Firebase...');
try {
    const firebase = require('firebase');
    console.log('Firebase version:', firebase.SDK_VERSION || 'Unknown version');
} catch (error) {
    console.error('Error requiring Firebase:', error.message);
}

// Try to execute a simple command
console.log('\nExecuting a simple command...');
const { execSync } = require('child_process');
try {
    const result = execSync('echo Hello, World!').toString();
    console.log('Command output:', result.trim());
} catch (error) {
    console.error('Error executing command:', error.message);
}

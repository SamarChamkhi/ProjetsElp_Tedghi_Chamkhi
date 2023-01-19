const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.prompt();

rl.on('line', (input) => {
  if (input == '\x10') {
    console.log('CTRL-P pressed, exiting shell...');
    //rl.off();
    process.exit();
  } else {
    console.log(`You entered: ${input}`);
  }
});

console.log('Welcome to the Node.js shell. Press CTRL-P to exit.');
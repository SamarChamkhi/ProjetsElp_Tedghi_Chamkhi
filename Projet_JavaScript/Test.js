const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');

// Récupération de la variable d'environnement PATH
const envPath = process.env.PATH;

// Création de l'interface de lecture de ligne
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Boucle de lecture de ligne
rl.on('line', (input) => {
  // Récupération du chemin d'accès absolu ou relatif
  const filePath = input.trim();
  
  // Ajout de la variable d'environnement PATH
  process.env.PATH = `${filePath}:${envPath}`;
  
  // Exécution du programme
  exec(filePath, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
});
*/
/*const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.prompt();

rl.on('line', (input) => {
  if (input ==='\x10') {
    console.log('CTRL-P pressed, exiting shell...');
    //rl.off();
    process.exit();
  } else {
    console.log(`You entered: ${input}`);
  }
});

console.log('Welcome to the Node.js shell. Press CTRL-P to exit.');*/

/*code complet : 

const readline = require('readline');
const { exec, execSync } = require('child_process');
const path = require('path');

// Récupération de la variable d'environnement PATH
const envPath = process.env.PATH;

// Création de l'interface de lecture de ligne
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Tableau pour stocker les processus à détacher
const detachedProcesses = [];

console.log("Welcome to my shell. Type 'help' for a list of commands.");

// Boucle de lecture de ligne
rl.on('line', (input) => {
  // Récupération de la commande et de l'ID de processus
  const [command, ...args] = input.trim().split(' ');

  switch (command) {
    case 'help':
      console.log("List of commands:");
      console.log("lp - list running processes");
      console.log("kill <processId> - kill a process by its process ID");
      console.log("pause <processId> - pause a process by its process ID");
      console.log("continue <processId> - continue a process by its process ID");
      console.log("keep <processId> - detach a process by its process ID");
      console.log("exit - exit the shell");
      break;
    case 'lp':
      // Lister les processus en cours
      try {
        const stdout = execSync('ps -eo pid,comm').toString();
        console.log(stdout);
      } catch (err) {
        console.error(`Error: ${err}`);
      }
      break;
    case 'kill':
    case 'pause':
    case 'continue':
      // Vérifier que l'ID de processus est un nombre
      if (isNaN(args[0])) {
        console.log(`Error: ${args[0]} is not a valid process ID.`);
        return;
      }
      const processId = args[0];
      // Exécution de la commande
      exec(`${command} ${processId}`, (err) => {
        if (err) {
          console.error(`Error: ${err}`);
          return;
        }
        console.log(`Process ${processId} has been ${command}ed.`);
      });
      break;
    case 'keep':
      // Vérifier que l'ID de processus est un nombre
      if (isNaN(args[0])) {
        console.log(`Error: ${args[0]} is not a valid process ID.`);
        return;
      }
      // Exécution de la commande détacher en utilisant l'option 'disown' pour détacher le processus
      exec(`disown ${args[0]}`, (err) => {
        if (err) {
          console.error
*/
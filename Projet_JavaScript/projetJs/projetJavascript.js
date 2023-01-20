//import inquirer from "inquirer"
const { exec, spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
//const inquirer = require("inquirer");
// Récupération de la variable d'environnement PATH
const envPath = process.env.PATH;

// Tableau pour stocker les informations sur les processus en cours
let processes = [];

// Fonction pour lister les processus en cours
function listProcesses() {
    exec('ps a', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        let lines = stdout.split('\n');
        console.log('Command \tProcess ID');
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line !== '') {
                let parts = line.split(/\s+/);
                let pid = parts[0];
                let command = parts.slice(3).join(' ');
                console.log(`${i}\t\t${pid}\t${command}`);
                processes[i] = { pid, command };
            }
        }
    });
}
//On a mis 'sudo' mais pas sûres de l'utilité on n'a pas pu tester car on n'est pas sudo sur les machines INSA
// Fonction pour tuer, mettre en pause ou reprendre un processus
function manageProcess(action, pid) {
    switch (action) {
        case '-k':
            exec(`kill -KILL ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} killed.`);
            });
            break;
        case '-p':
            exec(`kill -STOP ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} paused.`);
            });
            break;
        case '-c':
            exec(`kill -CONT ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} resumed.`);
            });
            break;
    }
}

//ne fonctionne pas encore
function changeDirectory(dir) {
    //dir = 'testCd';
    return new Promise((resolve, reject) => {
        exec(`cd ${dir}`, (error, stdout, stderr) => {
        if (error) {
            reject(error);
        }
        resolve(stdout);
        });
    });
}
//écoute du clavier pour fermer sur CTRL P
var clavier = process.stdin;
    
clavier.setRawMode(true);
clavier.resume;
clavier.setEncoding('utf8');

clavier.on('data', key =>{
  if(key==='\u0010'){
    console.log('CTRL-P pressé, fermeture du shell...');
    process.exit();
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.prompt();
console.log('Bienvenue sur le shell Node.js. Pressez CTRL-P pour quitter.');

rl.on('line', (line) => {
    let testPoint = (/!$/) ; //pour tester la présence d'un "!" en postfixe 
    let parts = line.trim().split(' ');
    let command = parts[0];
    let args = parts.slice(1);
    // Récupération du chemin d'accès absolu ou relatif
    const filePath = line.trim();

    if(testPoint.test(command)){
      console.log(command + "lancé en arrière plan")
      console.log(command.slice(0,-1))
      const backgroundProcess = spawn('node', [command.slice(0,-1)], { detached: true, stdio: 'ignore' });
      //backgroundProcess.unref();
      //runBackgroundProcess(command);
    }else{
      switch (command) {
          case 'lp':
              listProcesses();
              break;
          case 'bing':
              let action = args[0];
              let pid = args[1];
              manageProcess(action,pid) //process.kill(pid);
              break;
          case 'path' : //pas demandé, affiche l'endroit ou le fichier est.
              const path = require('path');
              console.log(module.paths[0]);
              break;
          case 'keep':
              //let processId = args[0];
              break;
          case 'cd':
              let chemin = toString(args[0]);
              changeDirectory(chemin)
                  .then(console.log)
                  .catch(console.error);
                        
      }
    }
})


// Boucle infinie pour lire les commandes entrées par l'utilisateur

/*//fct pour cd option 0:
const { exec } = require('child_process');

function changeDirectory(dir) {
  return new Promise((resolve, reject) => {
    exec(`cd ${dir}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });console.log('CTRL-P pressé, fermeture du shell...');
}

changeDirectory('/path/to/directory')
  .then(console.log)
  .catch(console.error);
//fct pour cd*/

/*autre code trouvé : si ça marche pas option 1:
function changeDirectory(dir){
    exec('ps -e', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        let child_process = require('child_process');
        child_process.spawn(
            // With this variable we know we use the same shell as the one that started this process
            process.env.SHELL,
            {
            // Change the cwd
            cwd: `${process.cwd()} chemin ${product_id}`,
        
            // This makes this process "take over" the terminal
            stdio: 'inherit',
        
            // If you want, you can also add more environment variables here, but you can also remove this line
            //env: { ...process.env, extra_environment: chemin },
            },
        );
    }*/

    /*option 3 : Ce code utilise les modules readline pour créer une interface de lecture 
    de ligne, child_process pour exécuter un programme en utilisant exec() et path pour traiter
    les chemins d'accès. Il récupère la variable d'environnement PATH de l'utilisateur au démarrage, 
    puis utilise la méthode on pour écouter les entrées de l'utilisateur, récupérer le chemin d'accès absolu ou 
    relatif et exécuter le programme. Il utilise la variable d'environnement PATH pour s'assurer que le programme 
    est bien exécuté quelque soit l'emplacement.

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



/*fct pour tache de fond : option 1
//Dans cet exemple, la fonction runBackgroundProcess() 
//prend une commande en argument et l'exécute en 
//utilisant exec(). 
//La fonction retourne les résultats de la commande 
//(stdout) dans la console.
const { exec } = require('child_process');

function runBackgroundProcess(command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        console.log(`Output: ${stdout}`);
    });
}*/
/*option n 2 : 
Dans cet exemple, la fonction runBackgroundProcess() 
//prend en argument une commande et des arguments, 
//et l'exécute en utilisant spawn(). La fonction écoute 
//les événements stdout, stderr et close pour obtenir 
//les résultats de la commande et les afficher dans 
//la console.

const { spawn } = require('child_process');

function runBackgroundProcess(command, args) {
    const child = spawn(command, args);
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}*/
// Boucle de lecture de ligne
/*rl.on('line', (input) => {
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
/*
const { spawn } = require('child_process');
const backgroundProcess = spawn('node', ['background.js'], { detached: true, stdio: 'ignore' });
backgroundProcess.unref();*/

/*Voici un exemple de code qui crée un shell en Node.js qui peut détacher des processus en 
cours d'exécution en utilisant la commande keep <processId> :

const readline = require('readline');
const { exec } = require('child_process');

// Création de l'interface de lecture de ligne
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Tableau pour stocker les processus à détacher
const detachedProcesses = [];

// Boucle de lecture de ligne
rl.on('line', (input) => {
  // Récupération de la commande et de l'ID de processus
  const [command, processId] = input.trim().split(' ');

  if (command === 'keep') {
    // Vérifier que l'ID de processus est un nombre
    if (isNaN(processId)) {
      console.log(`Error: ${processId} is not a valid process ID.`);
      return;
    }

    // Exécution de la commande détacher en utilisant l'option 'disown' pour détacher le processus
    exec(`disown ${processId}`, (err) => {
      if (err) {
        console.error(`Error: ${err}`);
        return;
      }

      // Ajout de l'ID de processus au tableau des processus détachés
      detachedProcesses.push(processId);
      console.log(`Process ${processId} has been detached.`);
    });
  } else {
    console.log(`Unknown command: ${command}`);
  }
});
Ce code utilise les modules readline pour créer une interface de lecture de ligne, child_process pour 
exécuter une commande en utilisant exec(). Il utilise la méthode on pour écouter les entrées de l'utilisateur, 
vérifie si la commande est "keep" et extrait l'ID de processus. Il vérifie si l'ID de processus est un nombre valide, 
ensuite exécute la commande disown pour détacher le processus. Il ajoute également l'ID de processus détaché dans un 
tableau pour une référence future.*/

/*          //Sortir quand on presse CTRL-P (pour l'instant ca ne marche pas c'est peut être à cause de VS)
          case '\u0010':
              console.log('CTRL-P pressé, fermeture du shell...');
              process.exit();
              break*/


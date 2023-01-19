const { exec, spawn } = require('child_process');
const readline = require('readline');

// Tableau pour stocker les informations sur les processus en cours
let processes = [];

// Fonction pour lister les processus en cours
function listProcesses() {
    exec('ps -e', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        let lines = stdout.split('\n');
        console.log('Process ID\tCommand');
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
        case 'kill':
            exec(`sudo kill ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} killed.`);
            });
            break;
        case 'pause':
            exec(`sudo kill -STOP ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} paused.`);
            });
            break;
        case 'continue':
            exec(`sudo kill -CONT ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} resumed.`);
            });
            break;
    }
}

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


// Boucle infinie pour lire les commandes entrées par l'utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.prompt();

//Sortir quand on presse CTRL-P
rl.on('line', (input) => {
    if (input === '\x10') {
      console.log('CTRL-P pressé, fermeture du shell...');
      process.exit();
    } else {
      console.log(` vous avez entré : ${input}`);
    }
  });
  
  console.log('Bienvenue sur le shell Node.js. Pressez CTRL-P pour quitter.');


rl.on('line', (line) => {
    let parts = line.trim().split(' ');
    let command = parts[0];
    let args = parts.slice(1);

    switch (command) {
        case 'lp':
            listProcesses();
            break;
        case 'bing':
            let action = args[0];
            let pid = args[1];
            if (action === '-k'){
                console.log('k')
                manageProcess('kill',pid) //process.kill(pid);
            }else if(action === '-p'){
                console.log('p')
               manageProcess('pause',pid) //process.suspend(pid);
            }else if(action === '-c'){
                console.log('c')
                manageProcess('continue',pid) //process.resume(pid); 
            }
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
})

/*//fct pour cd
const { exec } = require('child_process');

function changeDirectory(dir) {
  return new Promise((resolve, reject) => {
    exec(`cd ${dir}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
}

changeDirectory('/path/to/directory')
  .then(console.log)
  .catch(console.error);
//fct pour cd*/

/*autre code trouvé : si ça marche pas :
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



/* Quitter en appuyant sur ctrl + p

Ce code utilise la fonction readline.createInterface pour créer une interface de 
//ligne de commande qui lit les entrées de l'utilisateur à partir de process.stdin 
//et affiche les sorties à process.stdout. En utilisant l'événement line de cette interface, 
//nous pouvons vérifier si l'entrée de l'utilisateur est égale à \x10 (qui correspond à la combinaison 
//de touches Ctrl-P) et si c'est le cas, nous sortons du shell en appelant process.exit(). Sinon, on affiche
// l'entrée de l'utilisateur
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input === '\x10') {
    console.log('CTRL-P pressed, exiting shell...');
    process.exit();
  } else {
    console.log(`You entered: ${input}`);
  }
});

console.log('Welcome to the Node.js shell. Press CTRL-P to exit.');*/


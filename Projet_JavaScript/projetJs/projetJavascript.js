const { exec, spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
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
                console.log(`Process ${pid} mis en pause.`);
            });
            break;
        case '-c':
            exec(`kill -CONT ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} a repris.`);
            });
            break;
    }
}

function execProg(prog){
  let path = prog;
  // Check si l'entrée n'est pas un path ou un nom, cherche dans PATH
  if (!prog.match(/^[\/~]|[a-zA-Z]:\\/)) {
    path = process.env.PATH.split(':').map(folder => `${folder}/${prog}`).find(p => {
      try {
        return require('fs').lstatSync(p).isFile();
      } catch (e) {
        return false;
      }
    });
    if (!path) {
      console.log(`Programme ${prog} non trouvé`);
      return;
    }
  }
  exec(path, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

let detachedProcesses = [];
//Détacher certains processus du CLIi
function detache(processId) {
  exec(`nohup kill -s SIGHUP ${processId}`, (err) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }
    // Ajoute le process ID au tableau des process détachés
    detachedProcesses.push(processId);
    console.log(`Process ${processId} a été détaché.`);
  });
}
function runBackgroundProcess(command){
  exec(`${command} &`, (err) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }else{
      console.log(command+ " lancé en arrière plan")
    }
    // Ajoute la commande au tableau des process détachés
    detachedProcesses.push(command);
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
      runBackgroundProcess(command.slice(0,-1));
    }else{
      switch (command) {
          case 'exec':
              let prog = args[0]
              execProg(prog);
              break
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
            let processId=args[0]
            // Vérifier que l'ID de processus est un nombre
            if (isNaN(processId)) {
              console.log(`Error: ${processId} n'est pas un process ID valide.`);
              return;
            }else{
              detache(processId);
            }
      }
    }
})




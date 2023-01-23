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
function execProg(prog){
  let path = prog;
  // Check if the input is not a path or name, search in PATH
  if (!prog.match(/^[\/~]|[a-zA-Z]:\\/)) {
    path = process.env.PATH.split(':').map(folder => `${folder}/${prog}`).find(p => {
      try {
        return require('fs').lstatSync(p).isFile();
      } catch (e) {
        return false;
      }
    });
    if (!path) {
      console.log(`Program ${prog} not found`);
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
  exec(`disown ${processId}`, {stdio:'inherit'}, (err) => {
    if (err) {
      console.error(`Error: ${err}`);
      return;
    }
    // Add the process ID to the array of detached processes
    detachedProcesses.push(processId);
    console.log(`Process ${processId} has been detached.`);
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
      console.log(command.slice(0,-1) + " lancé en arrière plan")
      console.log(command.slice(0,-1))
      const backgroundProcess = spawn('node', [command.slice(0,-1)], { detached: true, stdio: 'ignore' });
      backgroundProcess.unref();
      //runBackgroundProcess(command);
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
              console.log(`Error: ${processId} is not a valid process ID.`);
              return;
            }else{
              detache(processId);
            }
      }
    }
})




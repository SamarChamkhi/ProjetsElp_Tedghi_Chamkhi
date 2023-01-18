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

// Fonction pour tuer, mettre en pause ou reprendre un processus
function manageProcess(action, pid) {
    switch (action) {
        case 'kill':
            exec(`kill ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} killed.`);
            });
            break;
        case 'pause':
            exec(`kill -STOP ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`Process ${pid} paused.`);
            });
            break;
        case 'continue':
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

// Boucle infinie pour lire les commandes entrées par l'utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Welcome to the Node.js shell.');
rl.prompt();
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
                process.kill(pid);
            }else if(action === '-p'){
                process.suspend();
            }else if(action === '-c'){
                process.resume();
            }
            break;
        case 'path' :
            const path = require('path');
            console.log(path.sep);                          
            console.log(path.dirname('projetJavascript.js'));
            //console.log(process.env) 
            console.log(module.paths)
        
    }
})
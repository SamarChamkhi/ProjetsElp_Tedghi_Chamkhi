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
function cdFunc(chemin){
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
            cdFunc(args[0]);
            
    }
})
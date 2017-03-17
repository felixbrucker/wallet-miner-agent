const psTree = require('ps-tree');
const spawn = require('cross-spawn');
const path = require('path');
const toPromise = require('../util/to_promise');

let currentRunning = null;
let shouldExit = false;

function startMiner(miner, wallet, gotTerminated) {
    gotTerminated = gotTerminated || false;
    const minerString = miner.cmdline
        .replace('#URL#', wallet.url)
        .replace('#USER#', wallet.user)
        .replace('#PASS#', wallet.pass);
    const isWin = /^win/.test(process.platform);
    if (isWin) {
        currentRunning = spawn(path.basename(miner.path), minerString.split(' '), {
            cwd: path.dirname(miner.path),
        });
    } else {
        currentRunning = spawn(miner.path, minerString.split(' '));
    }
    if (!gotTerminated) {
        console.log(`${path.basename(miner.path)} ${minerString}`);
    }
    currentRunning.stdout.on('data', (data) => {
        console.log(data.toString().trim());
    });
    currentRunning.stderr.on('data', (data) => {
        console.log(data.toString().trim());
    });
    currentRunning.on('exit', () => {
        if (!shouldExit) {
            console.log('miner got terminated, restarting..');
            startMiner(miner, wallet);
        }
    });
    currentRunning.on('error', () => {
        // silently discard enoent for killing proc
    });
}

function stopMiner() {
    if (currentRunning !== null) {
        shouldExit = true;

        return toPromise(kill, currentRunning.pid)
        .then(() => {
            currentRunning = null;
            setTimeout(() => {
                shouldExit = false;
            }, 2 * 1000);
        });
    }

    return Promise.resolve({});
}


function kill(pid, callback) {
    const signal = 'SIGKILL';
    callback = callback || function () {};
    psTree(pid, (err, children) => {
        [pid].concat(
            children.map(p => p.PID)
        ).forEach((tpid) => {
            try {
                process.kill(tpid, signal);
            } catch (ex) {
                //
            }
        });
        callback();
    });
}

module.exports = {
    startMiner,
    stopMiner,
};

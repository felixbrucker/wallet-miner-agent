const config = require('../config');
const runningConfig = require('../modules/running_config');
const miner = require('./miner');
const io = require('socket.io-client');

function init() {
    const socket = io.connect(config.connectionUrl);

    socket.on('connect', () => {
        console.log('connected to wallet-monitor');
    });
    socket.on('disconnect', () => {
        console.log('disconnected from wallet-monitor');
    });
    socket.on('bestWallet', (wallet) => {
        if (runningConfig.minerRunning) {
            // switch
            console.log(`received new best Wallet: ${wallet.name}, switching..`);
            miner.stopMiner()
            .then(() => {
                miner.startMiner(config.getBestMinerForAlgo(wallet.algo), wallet);
            });
        } else {
            // startup
            console.log(`received best Wallet: ${wallet.name}, starting..`);
            runningConfig.setMinerRunning(true);
            miner.startMiner(config.getBestMinerForAlgo(wallet.algo), wallet);
        }
    });
}

module.exports = {
    init,
};

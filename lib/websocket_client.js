const config = require('./config');
const runningConfig = require('../modules/running_config');
const miner = require('./miner');
const io = require('socket.io-client');

function init() {
    config.init()
    .then(() => {
        const socket = io.connect(config.store.connectionUrl);

        socket.on('connect', () => {
            console.log('connected to wallet-monitor');
            socket.emit('subscribe', config.getHashrateArray());
        });
        socket.on('disconnect', () => {
            console.log('disconnected from wallet-monitor');
        });
        socket.on('bestWallet', (wallet) => {
            if (wallet !== null) {
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
            } else if (runningConfig.minerRunning) {
                miner.stopMiner()
                    .then(() => {
                        console.log('stopped miner, no best Wallet');
                    });
            }
        });
    })
    .catch((err) => {
        console.log(err.message);
    });
}

module.exports = {
    init,
};

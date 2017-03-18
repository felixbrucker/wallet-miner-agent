const fs = require('fs');
const toPromise = require('../util/to_promise');

const configPath = 'conf.json';

const config = {
    store: null,
    getBestMinerForAlgo: (algo) => {
        let bestHashrate = 0;
        let bestMiner = null;
        config.store.miner.forEach((miner) => {
            if (miner.enabled && miner.algo === algo && miner.hashrate > bestHashrate) {
                bestHashrate = miner.hashrate;
                bestMiner = miner;
            }
        });

        return bestMiner;
    },
    getHashrateArray: () => {
        const hashrateArray = [];
        config.store.miner.forEach((miner) => {
            if (miner.enabled) {
                hashrateArray.push({ algo: miner.algo, hashrate: miner.hashrate });
            }
        });

        return hashrateArray;
    },
    saveConfig: () => {
        fs.writeFile(configPath, JSON.stringify(config.store, null, 2), (err) => {
            if (err) {
                throw (err);
            }
        });
    },
    init: () =>
        toPromise(fs.stat, configPath)
            .then(() => toPromise(fs.readFile, configPath))
            .then((data) => {
                config.store = JSON.parse(data);
            })
            .catch((err) => {
                if (err.code === 'ENOENT') {
                    // default conf
                    config.store = {
                        connectionUrl: 'http://localhost:9000',
                        miner: [],
                    };
                    config.saveConfig();
                } else {
                    console.log('no valid JSON');
                }
            }),
};

module.exports = config;

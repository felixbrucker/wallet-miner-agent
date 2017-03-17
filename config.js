const config = {
    connectionUrl: 'http://localhost:9000',
    miner: [
        {
            path: 'bin/cpuminer',
            cmdline: '-a zoin -t 3 -o #URL# -u #USER# -p #PASS#',
            algo: 'zoin',
            hashrate: 400,
            enabled: true,
        },
        {
            path: 'bin/cpuminer',
            cmdline: '-a x11 -t 3 -o #URL# -u #USER# -p #PASS#',
            algo: 'x11',
            hashrate: 140000,
            enabled: true,
        },
    ],
    getBestMinerForAlgo: (algo) => {
        let bestHashrate = 0;
        let bestMiner = null;
        config.miner.forEach((miner) => {
            if (miner.enabled && miner.algo === algo && miner.hashrate > bestHashrate) {
                bestHashrate = miner.hashrate;
                bestMiner = miner;
            }
        });

        return bestMiner;
    },
    getHashrateArray: () => {
        const hashrateArray = [];
        config.miner.forEach((miner) => {
            if (miner.enabled) {
                hashrateArray.push({ algo: miner.algo, hashrate: miner.hashrate });
            }
        });

        return hashrateArray;
    },
};

module.exports = config;

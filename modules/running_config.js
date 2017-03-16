const config = {
    minerRunning: false,
    setMinerRunning: (isRunning) => {
        config.minerRunning = isRunning;
    },
};

module.exports = config;

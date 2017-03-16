module.exports = ((func, data) =>
        new Promise((resolve, reject) => {
            func(data, (err, result) => {
                if (err) {
                    reject(err);

                    return;
                }
                resolve(result);
            });
        })
);

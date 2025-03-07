#!/usr/bin/env node
let timeoutFired = false;

try {
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            timeoutFired = true;
            reject(new Error('Timeout'));
        }, 60000);
    
        getUrl(timeout, resolve, reject);
    });
    console.log('done');
    process.exit(0);
}
catch (err) {
    console.error(err);
    process.exit(1);
}
async function getUrl(timeoutId, resolve, reject) {
    const url = process.argv[2];
    console.log(`Checking ${url}`);
    try {
        await fetch(url);
        resolve();
    }
    catch (err) {
        if (timeoutFired) {
            reject(err);
            return;
        }
        setTimeout(() => getUrl(timeoutId, resolve, reject), 1000);
    }
}
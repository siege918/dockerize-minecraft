module.exports = {
    runCommand: runCommand
}

function runCommand(message, config) {
    return new Promise((resolve) => {
        runCommandPromise(message, config, resolve);
    });
}

function runCommandPromise(message, config, callback) {
    if (!config.minecraftProcess) {
        throw "Minecraft Process not specified.";
    }

    const command = message.content.substr(1).trim();

    config.minecraftProcess.stdin.write(command + '\n');
    callback(command);
}
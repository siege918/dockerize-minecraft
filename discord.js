const siegebot = require("siegebot-client");

let bot;

module.exports = {
    init: (token, minecraftProcess, outputChannelId, adminRoleRegex) => {
        var botConfig = {
            name: "Minecraft Management Bot",
            token,
            prefix: ">",
            commands: {
                "minecraft": "./siegebot-minecraft.js"
            },
            triggers: {
                "": {
                    command: "minecraft",
                    subcommand: "runCommand",
                    roleWhitelistRegex: adminRoleRegex,
                    config: {
                        minecraftProcess
                    }
                }
            }
        };

        siegebot.activateWithConfig(botConfig);

        bot = siegebot.getDiscordJSClient();

        let logCache = "";

        function appendLogs(logData) {
            logCache += logData.toString();
        }

        minecraftProcess.stdout.on('data', appendLogs);
        minecraftProcess.stderr.on('data', appendLogs);

        bot.on('ready', () => {
            var outputChannel = bot.channels.get(outputChannelId);
            outputChannel.send("Bot initialized.");

            //Every 5 seconds, output logs if possible
            setInterval(() => {
               var newLogs = logCache.substring(0, 2000);
               logCache = logCache.substr(2000);

               if (newLogs) {
                   outputChannel.send(newLogs);
               }
            }, 5000);
        });
    }
}
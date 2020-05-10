var spawn = require('child_process').spawn;
const fs = require('fs');
var backup = require('./backup');
var discord = require('./discord');


var accessKeyID = process.env['MINECRAFT_S3_accessKeyID'];
var secretAccessKey = process.env['MINECRAFT_S3_secretAccessKey'];

var bucketName = process.env['MINECRAFT_S3_bucketName'];
var region = process.env['MINECRAFT_S3_region'] || 'us-west-2';

var discordToken = process.env['MINECRAFT_DISCORD_token'];
var outputChannelId = process.env['MINECRAFT_DISCORD_outputChannelId'];
var adminRoleRegex = process.env['MINECRAFT_DISCORD_adminRoleRegex'];

var Xmx = process.env['MINECRAFT_Xmx'] || '1G';
var Xms = process.env['MINECRAFT_Xms'] || '512M';
var serverPath = process.env['MINECRAFT_serverPath'] || '.';

backup.init( { accessKeyID, secretAccessKey, region } );

// If a world already exists, don't restore a backup
if (fs.existsSync(`${serverPath}/world`)) {
    runServer();
} else {
    backup.restore(bucketName, () => {
        runServer();
    });
}

const runServer = () => {
    var minecraftServerProcess = spawn('java', [
        `-Xmx${Xmx}`,
        `-Xms${Xms}`,
        '-jar',
        '/server/spigot.jar'
    ], {
        cwd: serverPath
    });


    minecraftServerProcess.stdout.on(
        'data',
        (data) => { process.stdout.write(data.toString()); }
    );

    minecraftServerProcess.stderr.on(
        'data',
        (data) => { process.stderr.write(data.toString()); }
    );

    if (discordToken) {
        discord.init(discordToken, minecraftServerProcess, outputChannelId, adminRoleRegex);
    }

    //Run backups every 24 hours
    setInterval(backup.backup, 1000 * 60 * 60 * 24, bucketName, minecraftServerProcess);
}
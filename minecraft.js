var spawn = require('child_process').spawn;
var backup = require('./backup');
var discord = require('./discord');


var accessKeyID = process.env['MINECRAFT_S3_accessKeyID'];
var secretAccessKey = process.env['MINECRAFT_S3_secretAccessKey'];

var bucketName = process.env['MINECRAFT_S3_bucketName'];
var region = process.env['MINECRAFT_S3_region'] || 'us-west-2';

var discordToken = process.env['MINECRAFT_DISCORD_token'];
var outputChannelId = process.env['MINECRAFT_DISCORD_outputChannelId'];
var adminRoleRegex = process.env['MINECRAFT_DISCORD_adminRoleRegex'];

backup.init( { accessKeyID, secretAccessKey, region } );

backup.restore(bucketName, () => {
    var minecraftServerProcess = spawn('java', [
        '-Xmx1G',
        '-Xms512M',
        '-jar',
        'spigot.jar'
    ]);


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

<<<<<<< HEAD
    //Run backups every 15 minutes
    setInterval(backup.backup, 1000 * 60 * 15, bucketName, minecraftServerProcess);
=======
    //Run backups hourly
    setInterval(backup.backup, 1000 * 60 * 60, bucketName, minecraftServerProcess);
>>>>>>> b858b1e12334bc9b9bc88b7654e1e8ce8c67c895
});
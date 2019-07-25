var spawn = require('child_process').spawn;
var backup = require('./backup');
var discord = require('./discord');


var accessKeyID = process.env['MINECRAFT_S3_accessKeyID'];
var secretAccessKey = process.env['MINECRAFT_S3_secretAccessKey'];

var bucketName = process.env['MINECRAFT_S3_bucketName'];
var region = process.env['MINECRAFT_S3_region'] || 'us-west-2';

var discordToken = process.env['MINECRAFT_DISCORD_token'];

if (discordToken) {
    discord.init(discordToken);
}

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

    //Run backups hourly
    setInterval(backup.backup, 1000 * 60 * 60, bucketName, minecraftServerProcess);

    //For testing, backup after one minute
    setTimeout(backup.backup, 1000 * 60, bucketName, minecraftServerProcess);
});
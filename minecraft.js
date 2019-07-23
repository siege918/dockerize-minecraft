var spawn = require('child_process').spawn;
var backup = require('./backup');



var accessKeyID = process.env['MINECRAFT_S3_accessKeyID'];
var secretAccessKey = process.env['MINECRAFT_S3_secretAccessKey'];

var bucketName = process.env['MINECRAFT_S3_bucketName'];

backup.init( { accessKeyID, secretAccessKey } );

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
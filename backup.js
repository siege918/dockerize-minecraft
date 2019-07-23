var fs = require('fs');
var archiver = require('archiver');
var AWS = require('aws-sdk');
var stream = require('stream');
var unzip = require('unzip-stream');

var ignoredFiles = [
    "backup.js",
    "dockerfile",
    "minecraft.js",
    "node_modules",
    "node_modules/**",
    "package.json",
    "package-lock.json",
    "spigot.jar"
];

var S3;

function log(message) {
    console.log(`\x1b[33m[BackupScript] [${new Date().toISOString()}] ${message}\x1b[0m`);
}

function markFileAsLatest(bucketName, fileName) {
    S3.upload({
        Bucket: bucketName,
        Key: `latest-minecraft-backup`,
        Body: fileName
    }, function (err, data) {
        if (err) {
            log('[AWS] Error marking file as latest:');
            console.warn(err);
        }
        else {
            log(`[AWS] File ${fileName} marked as latest update`);
        }
    });
}

module.exports = {
    init: function ( { accessKeyID, secretAccessKey, region } ) {
        S3 = new AWS.S3({ region, credentials: new AWS.Credentials(accessKeyID, secretAccessKey) });
    },
    backup: function (bucketName, minecraftServerProcess) {
        log("Backup process started")
        try {
            log("Disabling save and saving all pending changes")
            minecraftServerProcess.stdin.write('save-off\nsave-all\n');
            setTimeout(() => {
                let archive = archiver('zip', {
                    zlib: { level: 9 }
                });

                archive.on('error', function (err) {
                    log('[Archiver] Error when archiving:');
                    console.error(err);
                });

                archive.on('warning', function (warning) {
                    log('[Archiver] Warning when archiving:');
                    console.warn(warning);
                });

                var passthrough = stream.PassThrough();
                archive.pipe(passthrough);

                log(`Archiving files...`);
                archive.glob('**', {
                    ignore: ignoredFiles
                });

                var backupName = `minecraft_backup_${new Date().toISOString()}.zip`;

                S3.upload({
                    Bucket: bucketName,
                    Key: backupName,
                    Body: passthrough
                }, function (err, data) {
                    if (err) {
                        log('[AWS] Error uploading world:');
                        console.warn(err);
                    }
                    else {
                        log(`File uploaded: ${JSON.stringify(data)}`);
                        log(`Marking file '${backupName}' as latest`);
                        markFileAsLatest(bucketName, backupName);
                    }
                    log('Enabling saving');
                    minecraftServerProcess.stdin.write('save-on\n');
                });

                archive.finalize();
            }, 30000);
        }
        catch (e) {
            console.error(e);
            log('Enabling saving');
            minecraftServerProcess.stdin.write('save-on\n');
        }
    },
    restore: function (bucketName, callback) {
        log('Identifying latest backup...');
        S3.getObject({ Bucket: bucketName, Key: 'latest-minecraft-backup' }, function (err, data) {
            if (err) {
                log("[AWS] Error checking latest backup name:");
                console.error(err);
                log("Initializing server from scratch!");
                callback();
            }
            else {
                var latestBackup = data.Body.toString().trim();
                log(`Found name of latest backup: ${latestBackup}`);
                log('Downloading and extracting backup');

                var restoreStream = S3
                    .getObject({ Bucket: bucketName, Key: latestBackup })
                    .createReadStream();

                restoreStream.on('finish', () => {
                    log('Unzip complete.');
                    callback();
                });

                restoreStream.pipe(unzip.Extract({ path: '.' }));
            }
        });
    }
}
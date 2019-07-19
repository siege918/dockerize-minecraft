var fs = require('fs');
var watch = require('node-watch');

var fileIndex = 0;

watch('/server/plugins/AutoWorldBackup/', { filter: /\.zip$/}, function(evt, name) {
    fileIndex++;
    fs.copyFile(name, `/server/backup_${fileIndex}.zip`, (err) => {
        if (err) console.error(err);
        else console.log(`Backup File '${name}' has been copied to 'backup_${fileIndex}.zip'`);
    });
});
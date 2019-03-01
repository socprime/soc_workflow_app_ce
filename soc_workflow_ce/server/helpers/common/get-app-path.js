let appFolderName = 'soc_workflow_ce';

module.exports = function (server) {
    let appPath = '';

    try {
        appPath = server.getUiAppById(appFolderName);
        appPath = appPath._kbnServer.rootDir;
        appPath += '/plugins/' + appFolderName + '/';
    } catch (e) {
        appPath = '';
    }

    //appPath = '/usr/share/kibana/plugins/soc_workflow_ce/';

    return appPath;
};
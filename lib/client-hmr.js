const { createLoggerOnce } = require('./utils');

module.exports = function applyClientHMR(cb) {
  if (module.hot) {
    function log(msg, type = 'log') {
      console[type](`[%cFileWatchHMR%c] ${msg}`, 'color:#bc93b6', '');
    }

    const logOnce = createLoggerOnce(log);

    const { changedFile } = require('./trigger.js');

    if (!changedFile || changedFile) {
      // We must use the required variable
      log('Client HMR has started');
    }

    async function notify({ changedFiles }) {
      log(`Got an update with ${changedFiles.length} files.`);

      for (const file of changedFiles) {
        cb(file);
      }
    }

    module.hot.accept('./trigger.js', () => {
      const { changedFiles } = require('./trigger.js');

      log(`Got an update with ${changedFiles.length} files.`);

      for (const file of changedFiles) {
        cb(file);
      }
    });
  }
};

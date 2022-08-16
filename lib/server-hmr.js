const { createLoggerOnce } = require('./utils');

module.exports = function applyServerHMR(cb) {
  const pluginName = `\x1b[35m\x1b[1m${'FileWatchHMR'}\x1b[0m\x1b[39m`;
  function log(message, type = 'log') {
    console[type](`[ ${pluginName} ] ${message}`);
  }

  const logOnce = createLoggerOnce(log);

  function notify({ changedFiles }) {
    log(`Got an update with ${changedFiles.length} files.`);

    for (const file of changedFiles) {
      cb(file);
    }
  }

  if (module.hot) {
    const { changedFile } = require('./trigger.js');

    if (!changedFile || changedFile) {
      // We must use the required variable
      logOnce(`Server HMR has started`);
    }

    module.hot.accept('./trigger.js', () => {
      const changedFiles = require('./trigger.js');
      notify(changedFiles);
    });
  } else {
    logOnce(`Server HMR has started - callback mode`);

    const FileWatchHMRPlugin = require('./plugin');
    FileWatchHMRPlugin.addListener(notify);
  }
};

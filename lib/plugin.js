const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');

const pluginName = 'FileWatchHMRPlugin';

const DEFAULT_OPTIONS = {
  files: '',
  folders: '',
};

class FileWatchHMRPlugin {
  constructor(options) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.lastUpdate = { changedFiles: [] };
  }

  apply(compiler) {
    const isWebpack5 = compiler.webpack
      ? +compiler.webpack.version.split('.').reverse().pop() === 5
      : false;

    const filesToWatch = [];
    const foldersToWatch = [];

    compiler.hooks.beforeCompile.tapAsync(pluginName, (_params, callback) => {
      filesToWatch.length = 0;
      foldersToWatch.length = 0;

      for (const filePattern of this.options.files) {
        const filePaths = glob.sync(filePattern, { dot: true, onlyFiles: true });
        if (filePaths.length === 0) {
          throw new Error(`Invalid file pattern: ${filePattern}`);
        }
        filesToWatch.push(...filePaths);
      }

      for (const folderPattern of this.options.folders) {
        const folderPaths = glob.sync(folderPattern, { dot: true, onlyDirectories: true });
        if (folderPaths.length === 0) {
          throw new Error(`Invalid folder pattern: ${folderPattern}`);
        }
        foldersToWatch.push(...folderPaths);
      }

      return callback();
    });

    compiler.hooks.watchRun.tap(pluginName, (compiler) => {
      const watcher = (compiler.watchFileSystem.wfs || compiler.watchFileSystem).watcher;
      const changedTimes = isWebpack5 ? watcher.getTimes() : watcher.mtimes;

      const { startTime = 0 } = watcher || {};

      const changedFiles = Object.keys(changedTimes).filter((file) => {
        return (
          (filesToWatch.some((path) => file === path) ||
            foldersToWatch.some((path) => file.startsWith(path))) &&
          changedTimes[file] > startTime &&
          fs.statSync(file).isFile()
        );
      });

      if (changedFiles.length === 0) {
        return;
      }

      this.lastUpdate = { changedFiles };

      FileWatchHMRPlugin.callbacks.forEach((cb) => cb({ changedFiles }));
    });

    compiler.hooks.normalModuleFactory.tap(pluginName, (nmf) => {
      nmf.hooks.createModule.tap(pluginName, (module) => {
        const triggerPath = path.resolve(__dirname, 'trigger.js');
        if (module.resource !== triggerPath) {
          return;
        }

        module.loaders.push({
          loader: path.resolve(__dirname, 'loader.js'), // Path to loader
          options: {
            filesToWatch,
            foldersToWatch,
            getChangedFiles: () => ({ ...this.lastUpdate }),
          },
        });
      });
    });
  }
}

FileWatchHMRPlugin.callbacks = [];

FileWatchHMRPlugin.addListener = function (cb) {
  FileWatchHMRPlugin.callbacks.length = 0;
  FileWatchHMRPlugin.callbacks.push(cb);
};

module.exports = FileWatchHMRPlugin;

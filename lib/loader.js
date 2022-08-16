module.exports = function (content) {
  this.query.filesToWatch.forEach((file) => this.addDependency(file));
  this.query.foldersToWatch.forEach((folder) => this.addContextDependency(folder));
  return (
    content.replace(`'__PLACEHOLDER__'`, JSON.stringify(this.query.getChangedFiles())) +
    '//' +
    new Date().getTime()
  );
};

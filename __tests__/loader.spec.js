const loader = require('../lib/loader');

describe('loader', () => {
  let context;
  const options = ['app/locales/common.json'];
  const query = {
    getChangedFiles: jest.fn().mockImplementation(() => options),
    filesToWatch: ['app/locales/common.json'],
    foldersToWatch: ['app/locales'],
  };
  const content = `module.exports = '__PLACEHOLDER__';`;

  beforeEach(() => {
    context = {
      addDependency: jest.fn(),
      addContextDependency: jest.fn(),
      query,
    };
  });

  it('should add files to watch as context dependency', () => {
    loader.apply(context, [content]);
    expect(context.addDependency).toHaveBeenCalledWith(query.filesToWatch[0]);
  });

  it('should add folders to watch as context dependency', () => {
    loader.apply(context, [content]);
    expect(context.addContextDependency).toHaveBeenCalledWith(query.foldersToWatch[0]);
  });

  it('should add all files to watch as dependency', () => {
    query.filesToWatch = ['app/locales/en/common.json', 'app/locales/en/extra.json'];
    loader.apply(context, [content]);

    expect(context.addDependency).toHaveBeenCalledTimes(query.filesToWatch.length);
    expect(context.addDependency).toHaveBeenCalledWith(query.filesToWatch[0]);
    expect(context.addDependency).toHaveBeenCalledWith(query.filesToWatch[1]);
  });

  it('should add all folders to watch as context dependency', () => {
    query.foldersToWatch = ['app/locales1', 'app/locales2'];
    loader.apply(context, [content]);

    expect(context.addContextDependency).toHaveBeenCalledTimes(query.foldersToWatch.length);
    expect(context.addContextDependency).toHaveBeenCalledWith(query.foldersToWatch[0]);
    expect(context.addContextDependency).toHaveBeenCalledWith(query.foldersToWatch[1]);
  });

  it('should inject an object', () => {
    expect(loader.apply(context, [content])).toContain(JSON.stringify(options));
  });

  it('should invalidate content hash', async () => {
    const firstCall = loader.apply(context, [content]);
    await new Promise((resolve) => setTimeout(() => resolve(), 10));
    const secondCall = loader.apply(context, [content]);
    expect(firstCall).not.toEqual(secondCall);
  });
});

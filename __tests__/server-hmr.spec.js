const changedData = {};

jest.mock('../lib/trigger.js', () => {
  return changedData;
});

const cbMock = jest.fn();

const applyServerHMR = require('../lib/server-hmr');
const plugin = require('../lib/plugin');

function whenNativeHMRTriggeredWith(changedFiles) {
  changedData.changedFiles = changedFiles;

  const acceptCallback = mockModule.hot.accept.mock.calls[0][1];
  return acceptCallback();
}

describe('server-hmr', () => {
  beforeEach(() => {
    cbMock.mockReset();
    jest.spyOn(plugin, 'addListener');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('with native HMR', () => {
    beforeEach(() => {
      global.mockModule = {
        hot: {
          accept: jest.fn(),
        },
      };

      applyServerHMR(cbMock);
    });

    it('should accept hmr', () => {
      expect(global.mockModule.hot.accept).toHaveBeenCalledWith(
        './trigger.js',
        expect.any(Function)
      );
    });

    it('should notify that server HMR started HMR mode once', async () => {
      jest.spyOn(global.console, 'log');

      applyServerHMR(cbMock); // second call

      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('Server HMR has started')
      );
      expect(global.console.log).not.toHaveBeenCalledWith(expect.stringContaining('callback mode'));
    });

    it('should trigger the callback with one changed file', () => {
      const changedFiles = ['app/locales/de/common.json'];
      whenNativeHMRTriggeredWith(changedFiles);
      expect(cbMock).toHaveBeenCalledTimes(1);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
    });

    it('should trigger the callback with multiple changed files', () => {
      const changedFiles = ['app/locales/de/common.json', 'app/locales/de/other.json'];
      whenNativeHMRTriggeredWith(changedFiles);
      expect(cbMock).toHaveBeenCalledTimes(2);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[1]);
    });

    it('should notify on successful callback', async () => {
      jest.spyOn(global.console, 'log');
      whenNativeHMRTriggeredWith(['app/locales/en/common.json']);
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('Got an update with')
      );
    });
  });

  describe('without native HMR', () => {
    beforeEach(() => {
      global.mockModule = {};
      applyServerHMR(cbMock);
    });

    it('should register a listener on webpack plugin', () => {
      expect(plugin.addListener).toHaveBeenCalled();
    });

    it('should notify that server HMR started as callback mode once', async () => {
      jest.spyOn(global.console, 'log');

      applyServerHMR(cbMock); // second call

      expect(global.console.log).toHaveBeenCalledTimes(1);
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('Server HMR has started - callback mode')
      );
    });

    it('should trigger the callback with one changed file', () => {
      const changedFiles = ['app/locales/de/common.json'];
      plugin.callbacks[0]({ changedFiles });
      expect(cbMock).toHaveBeenCalledTimes(1);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
    });

    it('should trigger the callback with multiple changed files', () => {
      const changedFiles = ['app/locales/de/common.json', 'app/locales/de/other.json'];
      plugin.callbacks[0]({ changedFiles });
      expect(cbMock).toHaveBeenCalledTimes(2);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
      expect(cbMock).toHaveBeenCalledWith(changedFiles[1]);
    });

    it('should notify on successful callback', async () => {
      jest.spyOn(global.console, 'log');
      plugin.callbacks[0]({ changedFiles: ['app/locales/en/common.json'] });
      expect(global.console.log).toHaveBeenCalledWith(
        expect.stringContaining('Got an update with')
      );
    });
  });
});

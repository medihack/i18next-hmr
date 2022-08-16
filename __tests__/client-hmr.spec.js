let changedData = {};
jest.mock('../lib/trigger.js', () => {
  return changedData;
});

global.mockModule = {
  hot: {
    accept: jest.fn(),
  },
};

const cbMock = jest.fn();

const applyClientHMR = require('../lib/client-hmr');

function whenHotTriggeredWith(changedFiles) {
  changedData.changedFiles = changedFiles;

  const acceptCallback = mockModule.hot.accept.mock.calls[0][1];
  return acceptCallback();
}

describe('client-hmr', () => {
  beforeEach(() => {
    cbMock.mockReset();
    mockModule.hot.accept.mockReset();
  });

  it('should trigger the callback with one changed file', () => {
    applyClientHMR(cbMock);
    const changedFiles = ['app/locales/de/common.json'];
    whenHotTriggeredWith(changedFiles);
    expect(cbMock).toHaveBeenCalledTimes(1);
    expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
  });

  it('should trigger the callback with multiple changed files', () => {
    applyClientHMR(cbMock);
    const changedFiles = ['app/locales/de/common.json', 'app/locales/de/other.json'];
    whenHotTriggeredWith(changedFiles);
    expect(cbMock).toHaveBeenCalledTimes(2);
    expect(cbMock).toHaveBeenCalledWith(changedFiles[0]);
    expect(cbMock).toHaveBeenCalledWith(changedFiles[1]);
  });
});

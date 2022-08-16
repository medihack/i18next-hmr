function createLoggerOnce(logger) {
  const msgCount = new Map();
  return (msg, type = 'log') => {
    const count = msgCount.has(msg) ? msgCount.get(msg) : 0;
    if (count > 0) {
      return;
    }

    logger(msg, type);
    msgCount.set(msg, count + 1);
  };
}

module.exports = {
  createLoggerOnce: createLoggerOnce,
};

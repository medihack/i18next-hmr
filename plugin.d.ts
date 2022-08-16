export class FileWatchHMRPlugin {
  static addListener(cb: (file: string) => void): void;

  constructor(options: { files: string[]; folders: [] });
}

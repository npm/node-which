declare function which(command: string, cb: (err: Error, path: string) => void): void;
declare function which(command: string, options: which.WhichOptions, cb: (err: Error, path: string) => void): void;

declare namespace which {
  function sync(command: string, options?: WhichSyncOptions): string;

  interface WhichOptions {
    path?: string,
    pathExt?: string;
    all?: boolean;
  }

  interface WhichSyncOptions extends WhichOptions {
    nothrow?: boolean;
  }
}

export = which;

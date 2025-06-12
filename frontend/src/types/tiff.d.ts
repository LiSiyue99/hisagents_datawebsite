declare module 'tiff.js' {
  interface TiffOptions {
    buffer: ArrayBuffer;
  }

  class Tiff {
    constructor(options: TiffOptions);
    toCanvas(): HTMLCanvasElement;
  }

  export default Tiff;
} 
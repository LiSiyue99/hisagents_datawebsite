declare module 'utif' {
  interface IFD {
    width: number;
    height: number;
  }

  const UTIF: {
    decode: (buffer: ArrayBuffer) => IFD[];
    decodeImage: (buffer: ArrayBuffer, ifd: IFD) => void;
    toRGBA8: (ifd: IFD) => Uint8Array;
  };

  export default UTIF;
} 
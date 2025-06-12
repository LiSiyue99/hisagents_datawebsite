declare module 'decode-tiff' {
  export interface TiffImage {
    width: number;
    height: number;
    data: Uint8Array;
    ifdEntries?: Record<string, any[]>;
  }

  export function decode(
    buffer: ArrayBuffer | Buffer,
    options?: { singlePage?: boolean }
  ): TiffImage | TiffImage[];
} 
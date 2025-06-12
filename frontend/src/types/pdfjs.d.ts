declare module 'pdfjs-dist/webpack' {
  import pdfjs from 'pdfjs-dist';
  export = pdfjs;
}

declare module 'pdfjs-dist/build/pdf.worker.min.mjs' {
  const content: any;
  export default content;
} 
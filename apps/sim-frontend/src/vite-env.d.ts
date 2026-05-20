/// <reference types="vite/client" />

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/editor/editor.main' {
  export * from 'monaco-editor';
}

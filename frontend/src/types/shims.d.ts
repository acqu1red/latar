// Temporary shims so the editor/tsserver resolves React + CSS during linting
// This does not affect runtime; real types come from node_modules when available.

declare module 'react' {
  export type FC<P = {}> = (props: P) => any;
  export function useState<T = any>(initial?: T): any;
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T = any>(factory: () => T, deps: any[]): T;
  export function useRef<T = any>(initial?: T): any;
  export type CSSProperties = any;
  export type PointerEvent = any;
  export type ChangeEvent<T = Element> = any;
  export const StrictMode: any;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}



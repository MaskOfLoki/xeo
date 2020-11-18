declare const BUILD_NUM: string;
declare const BRANCH: string;
declare const GC_PRODUCTION: boolean;
declare const ENVIRONMENT: string;

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

// Vite `?raw` imports resolve to the file content as a string.
declare module "*.md?raw" {
  const content: string;
  export default content;
}

export const promises = {
  mkdir: async () => {},
  appendFile: async () => {},
  readFile: async () => "",
  unlink: async () => {},
};

export const existsSync = () => false;
export const readFileSync = () => "";
export const writeFileSync = () => {};
export const dirname = () => "";

export default {
  promises,
  existsSync,
  readFileSync,
  writeFileSync,
  dirname,
};

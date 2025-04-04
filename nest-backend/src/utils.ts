export const toSnakeCase = (s: string): string => {
  return s
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

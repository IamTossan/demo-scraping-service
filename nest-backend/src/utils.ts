export const toSnakeCase = (s: string): string => {
  return s
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export const throttle = async (
  fns: ((() => Promise<any>) | (() => any))[],
  delay: number,
): Promise<void> => {
  for (const fn of fns) {
    await fn();
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

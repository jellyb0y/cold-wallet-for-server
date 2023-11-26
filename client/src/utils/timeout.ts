export type ExtendedPromise = Promise<void> & {
  clearTimeout: () => void;
};

const timeout = (delay: number): ExtendedPromise => {
  let timer: NodeJS.Timeout;
  const promise = new Promise((resolve) => {
    timer = setTimeout(resolve, delay);
  }) as ExtendedPromise;

  promise.clearTimeout = () => clearTimeout(timer);

  return promise;
};

export default timeout;

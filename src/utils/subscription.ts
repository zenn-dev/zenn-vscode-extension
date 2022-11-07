type Callback<E> = (event: E) => void;

export class Subscription<E> {
  private __callbacks = new Set<Callback<E>>();

  dispatch(event: E) {
    this.__callbacks.forEach((callback) => callback(event));
  }

  addEventListener(callback: Callback<E>) {
    this.__callbacks.add(callback);

    return () => {
      this.__callbacks.delete(callback);
    };
  }
}

export type Listener<T> = (value: T) => void

export interface Stream<T> {
  subscribe(listener: Listener<T>): void
}

export class StreamChannel<T> implements Stream<T> {
  protected listeners: Listener<T>[] = []

  subscribe(listener: Listener<T>): Listener<T> {
    this.listeners.push(listener)
    return listener
  }

  unsubscribe(listener: Listener<T>) {
    this.listeners = this.listeners.filter(l => l != listener)
  }

  next(value: T) {
    for (const listener of this.listeners) {
      listener(value)
    }
  }
}

export class StreamSource<T> extends StreamChannel<T> {
  private _value: T 

  constructor(initialValue: T) {
    super()
    this._value = initialValue
  }

  subscribe(listener: Listener<T>): Listener<T> {
    listener(this._value)
    return super.subscribe(listener)
  }

  next(value: T) {
    this._value = value
    super.next(value)
  }

  get value(): T {
    return this._value
  }
}

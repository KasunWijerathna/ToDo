/**
 * Performance monitoring decorator for methods
 * Logs execution time in development mode
 */
export function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();

    if (typeof result === 'object' && result !== null && 'then' in result) {
      // Handle async functions
      return result.then((data: any) => {
        const asyncEnd = performance.now();
        console.log(`[Performance] ${target.constructor.name}.${propertyKey} took ${(asyncEnd - start).toFixed(2)}ms`);
        return data;
      });
    }

    console.log(`[Performance] ${target.constructor.name}.${propertyKey} took ${(end - start).toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

/**
 * Memoization decorator for getters
 * Caches the result of expensive computations
 */
export function Memoize(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalGetter = descriptor.get;
  if (!originalGetter) {
    throw new Error('Memoize can only be applied to getters');
  }

  const memoizeKey = Symbol(`__memoized_${propertyKey}`);

  descriptor.get = function () {
    if (!(memoizeKey in this)) {
      Object.defineProperty(this, memoizeKey, {
        value: originalGetter.call(this),
        configurable: true,
        writable: true
      });
    }
    return (this as any)[memoizeKey];
  };

  return descriptor;
}

/**
 * Debounce decorator for methods
 * Delays execution until after wait milliseconds have elapsed since the last call
 */
export function Debounce(wait: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    descriptor.value = function (...args: any[]) {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        originalMethod.apply(this, args);
        timeout = null;
      }, wait);
    };

    return descriptor;
  };
}

/**
 * Throttle decorator for methods
 * Ensures function is called at most once per specified time period
 */
export function Throttle(wait: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    let lastTime = 0;

    descriptor.value = function (...args: any[]) {
      const now = Date.now();

      if (now - lastTime >= wait) {
        lastTime = now;
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

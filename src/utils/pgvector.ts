export function toPgVector(arr: number[]): string {
    // Validate input is an array of finite numbers
    if (!Array.isArray(arr)) {
      throw new Error('toPgVector: expected an array of numbers');
    }
    if (arr.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
      throw new Error('toPgVector: all elements must be finite numbers');
    }
  
    // Join values directly—fast and concise
    return `[${arr.join(',')}]`;
  }
  
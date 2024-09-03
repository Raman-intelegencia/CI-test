export class ExponentialDelay {
    private static readonly BACKOFF_EXPONENT_MAX: number = 8; // 2 ^ 8 = 256 seconds max delay
  
    private backoffExponent = 0;
  
    public next(): number {
      this.updateExponent();
  
      // Calculate exponential delay with random jitter
      const random = Math.random();
      const exponentialDelay = random * Math.pow(2, this.backoffExponent) * 1000;
  
      // Add bonus initial delay for the first attempt
      const bonusInitialDelay = this.backoffExponent === 0 ? Math.random() * 30000 : 0;
  
      return exponentialDelay + bonusInitialDelay;
    }
  
    private updateExponent(): void {
      this.backoffExponent = Math.min(this.backoffExponent + 1, ExponentialDelay.BACKOFF_EXPONENT_MAX);
    }
  
    public reset(): void {
      this.backoffExponent = 0;
    }
  }
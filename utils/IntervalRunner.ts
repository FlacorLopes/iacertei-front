class IntervalRunner {
  private intervalId: number | undefined;
  private intervalDelay: number = 1000; // default delay is 1 second

  constructor(private fn: () => void) {}

  // set the delay between each execution of the function
  public delay(delayMs: number): this {
    this.intervalDelay = delayMs;
    return this;
  }

  // start the interval and store its ID
  public start(): this {
    this.intervalId = window.setInterval(this.fn, this.intervalDelay);
    return this;
  }

  // stop the interval and clear its ID
  public stop(): this {
    if (this.intervalId !== undefined) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    return this;
  }
}

// // Example usage:
// const intervalRunner = new IntervalRunner(() => console.log("Hello, world!"));
// intervalRunner.delay(500).start().delay(2000).stop();

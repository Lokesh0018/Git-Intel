type CacheRecord<T> = {
  expiresAt: number;
  value: T;
};

export class MemoryCache {
  private records = new Map<string, CacheRecord<unknown>>();

  constructor(private ttlSeconds: number) {}

  get<T>(key: string): T | undefined {
    const record = this.records.get(key);
    if (!record) return undefined;
    if (Date.now() > record.expiresAt) {
      this.records.delete(key);
      return undefined;
    }
    return record.value as T;
  }

  set<T>(key: string, value: T) {
    this.records.set(key, {
      value,
      expiresAt: Date.now() + this.ttlSeconds * 1000
    });
  }
}

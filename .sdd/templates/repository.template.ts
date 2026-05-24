import { Db } from 'mongodb';

export interface IRepository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
}

export class MongoRepository<T extends { id: string }> implements IRepository<T> {
  constructor(
    protected db: Db,
    protected collectionName: string
  ) {}

  async save(entity: T): Promise<void> {
    const collection = this.db.collection(this.collectionName);
    await collection.updateOne(
      { id: entity.id },
      { $set: entity },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<T | null> {
    const collection = this.db.collection(this.collectionName);
    const result = await collection.findOne({ id });
    return result as T | null;
  }
}

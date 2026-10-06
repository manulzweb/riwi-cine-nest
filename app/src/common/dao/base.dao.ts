import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export abstract class BaseDao<T extends ObjectLiteral> {
  constructor(protected readonly repo: Repository<T>) {}

  protected getRepo(manager?: EntityManager): Repository<T> {
    return manager ? manager.getRepository<T>(this.repo.target) : this.repo;
  }

  async create(data: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    const repository = this.getRepo(manager);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  createInstance(data: DeepPartial<T>, manager?: EntityManager): T {
    return this.getRepo(manager).create(data);
  }

  async save(entity: T, manager?: EntityManager): Promise<T> {
    return this.getRepo(manager).save(entity);
  }

  async saveMany(entities: T[], manager?: EntityManager): Promise<T[]> {
    return this.getRepo(manager).save(entities);
  }

  async findById(id: any, manager?: EntityManager): Promise<T | null> {
    return this.getRepo(manager).findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<T>,
    manager?: EntityManager,
  ): Promise<T | null> {
    return this.getRepo(manager).findOne(options);
  }

  async findAll(
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<T[]> {
    return this.getRepo(manager).find(options);
  }

  async findAndCount(
    options?: FindManyOptions<T>,
    manager?: EntityManager,
  ): Promise<[T[], number]> {
    return this.getRepo(manager).findAndCount(options);
  }

  async update(
    id: any,
    data: QueryDeepPartialEntity<T>,
    manager?: EntityManager,
  ): Promise<boolean> {
    const res = await this.getRepo(manager).update(id, data);
    return (res.affected ?? 0) > 0;
  }

  async delete(id: any, manager?: EntityManager): Promise<boolean> {
    const res = await this.getRepo(manager).delete(id);
    return (res.affected ?? 0) > 0;
  }

  async softDelete(id: any, manager?: EntityManager): Promise<boolean> {
    const res = await this.getRepo(manager).softDelete(id);
    return (res.affected ?? 0) > 0;
  }
}

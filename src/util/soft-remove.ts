import { Repository } from 'typeorm';
/**
 * Soft remove an entity by setting `is_deleted: true`
 */
export const softRemove = async <T extends { is_deleted?: boolean }>(
  repo: Repository<T>,
  entity: T,
): Promise<T> => {
  entity.is_deleted = true;
  return await repo.save(entity);
};

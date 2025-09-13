import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  relations?: string[];
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const paginate = async <T extends ObjectLiteral>(
  repo: Repository<T>,
  options: PaginationParams = {},
  customizeQuery?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
): Promise<PaginationResult<T>> => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    filters = {},
    relations = [],
  } = options;
  const skip = (page - 1) * limit;

  let qb = repo.createQueryBuilder('entity').skip(skip).take(limit);

  // ✅ Default to false unless explicitly provided in filters
  const isDeleted = filters?.is_deleted ?? false;

  qb = qb.where('entity.is_deleted = :isDeleted', { isDeleted });

  // Dynamically join relations
  for (const relation of relations) {
    qb = qb.leftJoinAndSelect(`entity.${relation}`, relation);
  }

  // Add filters dynamically
  for (const key in filters) {
    if (key === 'is_deleted') continue; // already handled above
    if (filters[key]) {
      qb = qb.andWhere(`entity.${key} ILIKE :${key}`, {
        [key]: `%${filters[key]}%`,
      });
    }
  }

  // for (const key in filters) {
  //   if (filters[key]) {
  //     qb = qb.andWhere(`entity.${key} = :${key}`, { [key]: filters[key] });
  //   }
  // }

  qb = qb.orderBy(
    `entity.${sortBy}`,
    sortOrder.toUpperCase() as 'ASC' | 'DESC',
  );

  if (customizeQuery) qb = customizeQuery(qb);

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
};

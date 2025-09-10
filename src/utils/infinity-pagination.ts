import { InfinityPaginationResponseDto } from './dto';
import { IPaginationOptions } from './types';

export const infinityPagination = <T>(data: T[], options: IPaginationOptions): InfinityPaginationResponseDto<T> => {
  return {
    data,
    hasNextPage: data.length === options.limit,
  };
};



export interface PaginatedResult<T> {
    items: T[];
    total: number;
    currentPage: number;
    totalPages: number;
  }

  export interface PersonalizedError {
    code: string,
    detail: string
  }
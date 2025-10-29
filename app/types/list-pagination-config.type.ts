export interface ListPaginationConfig<TFilters = unknown> {
  page: number; 
  perPage: number; 
  filters: TFilters; 
}
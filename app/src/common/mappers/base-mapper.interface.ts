export interface BaseMapper<TEntity, TCreateDto, TResponseDto> {
  toEntity(dto: TCreateDto): TEntity;
  toResponseDto(entity: TEntity): TResponseDto;
  toResponseDtoList?(entities: TEntity[]): TResponseDto[];
}

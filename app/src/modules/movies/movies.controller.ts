// src/modules/movies/movies.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { MoviesService } from './movies.service.js';
import { CreateMovieDto } from './dto/create-movie.dto.js';
import { UpdateMovieDto } from './dto/update-movie.dto.js';
import { MovieQueryDto } from './dto/movie-query.dto.js';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get('premieres')
  getPremieres(@Query('limit') limit?: string) {
    return this.moviesService.findPremieres(limit ? parseInt(limit, 10) : 10);
  }

  @Public()
  @Get()
  getMovies(@Query() query: MovieQueryDto) {
    return this.moviesService.findAll(query);
  }

  @Public()
  @Get(':id')
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findById(id);
  }

  @Roles('admin')
  @Post()
  createMovie(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Roles('admin')
  @Put(':id')
  updateMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, dto);
  }

  @Roles('admin')
  @Patch(':id/status')
  updateMovieStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.moviesService.updateStatus(id, isActive);
  }

  @Roles('admin')
  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.delete(id);
  }
}

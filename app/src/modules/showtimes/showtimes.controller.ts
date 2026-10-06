// src/modules/showtimes/showtimes.controller.ts

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
import { ShowtimesService } from './showtimes.service.js';
import { CreateShowtimeDto } from './dto/create-showtime.dto.js';
import { UpdateShowtimeDto } from './dto/update-showtime.dto.js';
import { ShowtimeQueryDto } from './dto/showtime-query.dto.js';
import { BillboardQueryDto } from './dto/billboard-query.dto.js';

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Public()
  @Get('billboard')
  getBillboard(@Query() query: BillboardQueryDto) {
    return this.showtimesService.getBillboard(query);
  }

  @Public()
  @Get()
  getShowtimes(@Query() query: ShowtimeQueryDto) {
    return this.showtimesService.findAll(query);
  }

  @Public()
  @Get(':id')
  getShowtime(@Param('id', ParseIntPipe) id: number) {
    return this.showtimesService.findById(id);
  }

  @Roles('admin')
  @Post()
  createShowtime(@Body() dto: CreateShowtimeDto) {
    return this.showtimesService.create(dto);
  }

  @Roles('admin')
  @Put(':id')
  updateShowtime(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShowtimeDto,
  ) {
    return this.showtimesService.update(id, dto);
  }

  @Roles('admin')
  @Patch(':id/status')
  updateShowtimeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.showtimesService.updateStatus(id, isActive);
  }

  @Roles('admin')
  @Delete(':id')
  deleteShowtime(@Param('id', ParseIntPipe) id: number) {
    return this.showtimesService.delete(id);
  }
}

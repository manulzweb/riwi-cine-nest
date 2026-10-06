// src/modules/cinemas/cinemas.controller.ts

import {
  Body,
  Controller,
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
import { CinemasService } from './cinemas.service.js';
import { CreateCinemaDto } from './dto/create-cinema.dto.js';
import { UpdateCinemaDto } from './dto/update-cinema.dto.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { GenerateSeatsDto } from './dto/generate-seats.dto.js';
import { CreateSeatTypeDto } from './dto/create-seat-type.dto.js';

@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) {}

  @Public()
  @Get('seat-types')
  getSeatTypes() {
    return this.cinemasService.getSeatTypes();
  }

  @Public()
  @Get()
  getCinemas(@Query('cityId') cityId?: string) {
    return this.cinemasService.findAll(
      cityId ? parseInt(cityId, 10) : undefined,
    );
  }

  @Public()
  @Get('rooms/:roomId/seats')
  getRoomSeatsDirect(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.cinemasService.getRoomSeats(roomId);
  }

  @Public()
  @Get(':id')
  getCinema(@Param('id', ParseIntPipe) id: number) {
    return this.cinemasService.findById(id);
  }

  @Public()
  @Get(':id/rooms')
  getRooms(@Param('id', ParseIntPipe) id: number) {
    return this.cinemasService.findRoomsByCinema(id);
  }

  @Public()
  @Get(':cinemaId/rooms/:roomId/seats')
  getRoomSeats(
    @Param('cinemaId', ParseIntPipe) _cinemaId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    return this.cinemasService.getRoomSeats(roomId);
  }

  @Roles('admin')
  @Post()
  createCinema(@Body() dto: CreateCinemaDto) {
    return this.cinemasService.createCinema(dto);
  }

  @Roles('admin')
  @Put(':id')
  updateCinema(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCinemaDto,
  ) {
    return this.cinemasService.updateCinema(id, dto);
  }

  @Roles('admin')
  @Patch(':id/status')
  updateCinemaStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.cinemasService.updateCinemaStatus(id, isActive);
  }

  @Roles('admin')
  @Post(':cinemaId/rooms')
  createRoom(
    @Param('cinemaId', ParseIntPipe) cinemaId: number,
    @Body() dto: CreateRoomDto,
  ) {
    return this.cinemasService.createRoom(cinemaId, dto);
  }

  @Roles('admin')
  @Post(':cinemaId/rooms/:roomId/seats/generate')
  generateSeats(
    @Param('cinemaId', ParseIntPipe) _cinemaId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() dto: GenerateSeatsDto,
  ) {
    return this.cinemasService.generateSeats(roomId, dto);
  }

  @Roles('admin')
  @Post('rooms/:roomId/seats/generate')
  generateSeatsDirect(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() dto: GenerateSeatsDto,
  ) {
    return this.cinemasService.generateSeats(roomId, dto);
  }

  @Roles('admin')
  @Post('seat-types')
  createSeatType(@Body() dto: CreateSeatTypeDto) {
    return this.cinemasService.createSeatType(dto);
  }
}

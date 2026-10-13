// src/modules/reservations/reservations.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una reserva bloqueando temporalmente las butacas (TTL 10m)',
  })
  async createReservation(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.create(userId, dto);
  }

  @Public()
  @Get('function/:functionId/seats')
  @ApiOperation({
    summary:
      'Obtener mapa y disponibilidad de butacas en tiempo real para una función',
  })
  async getFunctionSeats(
    @Param('functionId', ParseIntPipe) functionId: number,
    @CurrentUser('id') userId?: number,
  ) {
    return this.reservationsService.getSeatAvailability(functionId, userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener el historial de reservas del usuario actual' })
  async getMyReservations(
    @CurrentUser('id') userId: number,
  ): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findMyReservations(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una reserva específica' })
  async getReservation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole?: string,
  ): Promise<ReservationResponseDto> {
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    return this.reservationsService.findById(id, userId, isAdmin);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar definitivamente una reserva activa y asegurar los asientos',
  })
  async confirmReservation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.confirm(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar una reserva y liberar las butacas asociadas',
  })
  async cancelReservation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.reservationsService.cancel(id, userId);
  }
}

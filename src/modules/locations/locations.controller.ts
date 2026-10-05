// src/modules/locations/locations.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Public()
  @Get('countries')
  getCountries() {
    return this.locationsService.findCountries();
  }

  @Public()
  @Get('departments')
  getDepartments(@Query('countryId') countryId?: string) {
    return this.locationsService.findDepartments(
      countryId ? parseInt(countryId, 10) : undefined,
    );
  }

  @Public()
  @Get('cities')
  getCities(@Query('departmentId') departmentId?: string) {
    return this.locationsService.findCities(
      departmentId ? parseInt(departmentId, 10) : undefined,
    );
  }

  @Public()
  @Get('cities/:id')
  getCity(@Param('id', ParseIntPipe) id: number) {
    return this.locationsService.findCityById(id);
  }

  @Roles('admin')
  @Post('countries')
  createCountry(@Body() dto: CreateCountryDto) {
    return this.locationsService.createCountry(dto);
  }

  @Roles('admin')
  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.locationsService.createDepartment(dto);
  }

  @Roles('admin')
  @Post('cities')
  createCity(@Body() dto: CreateCityDto) {
    return this.locationsService.createCity(dto);
  }

  @Roles('admin')
  @Patch('cities/:id/status')
  updateCityStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.locationsService.updateCityStatus(id, isActive);
  }
}

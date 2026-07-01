import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, Request, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { SearchPlacesDto, SavePlaceDto } from './places.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('Places')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(private places: PlacesService) {}

  // ── Search ─────────────────────────────────────────────────────────────────
  @Get('search')
  @ApiOperation({ summary: 'Search nearby places' })
  search(@Request() req: AuthReq, @Query() dto: SearchPlacesDto) {
    return this.places.searchNearby(req.user.id, dto);
  }

  @Get('details/:placeId')
  @ApiOperation({ summary: 'Get detailed info for a place' })
  details(@Param('placeId') placeId: string) {
    return this.places.getPlaceDetails(placeId);
  }

  // ── Saved places ───────────────────────────────────────────────────────────
  @Get('saved')
  @ApiOperation({ summary: 'Get my saved places' })
  @ApiQuery({ name: 'category', required: false })
  getSaved(@Request() req: AuthReq, @Query('category') category?: string) {
    return this.places.getSavedPlaces(req.user.id, category);
  }

  @Post('saved')
  @ApiOperation({ summary: 'Save a place' })
  savePlace(@Request() req: AuthReq, @Body() dto: SavePlaceDto) {
    return this.places.savePlace(req.user.id, dto);
  }

  @Delete('saved/:placeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a saved place' })
  unsavePlace(@Request() req: AuthReq, @Param('placeId') placeId: string) {
    return this.places.unsavePlace(req.user.id, placeId);
  }

  @Patch('saved/:placeId/visited')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a saved place as visited' })
  markVisited(@Request() req: AuthReq, @Param('placeId') placeId: string) {
    return this.places.markVisited(req.user.id, placeId);
  }

  // ── AI Recommendations ─────────────────────────────────────────────────────
  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered place recommendations' })
  getRecommendations(
    @Request() req: AuthReq,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.places.getRecommendations(req.user.id, +lat || 5.6037, +lng || -0.1870);
  }

  @Patch('recommendations/:id/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  dismiss(@Request() req: AuthReq, @Param('id') id: string) {
    return this.places.dismissRecommendation(req.user.id, id);
  }
}

import type { PageResponse } from '../common/interface';

import type { StationFacility } from './types';

// Metro Map
export interface MetroMapStation {
    stationCode: string;
    stationId: number;
    nameZhTw: string;
    nameEn: string;
    sequence: number;
}

export interface MetroMapLine {
    letter: string;
    color: string;
    nameZhTw: string;
    nameEn: string;
    stations: MetroMapStation[];
}

export interface GetMetroMapResponse {
    lines: MetroMapLine[];
}

// Station By Code

export interface GetStationByCodeRequest {
    stationCode: string;
    stationFacilities?: StationFacility[];
}

// All Station

export interface StationDetails {
    id: number;
    nameZhTw: string;
    nameEn: string;
    atm: string | null;
    nursingRoom: string | null;
    diaperTable: string | null;
    chargingStation: string | null;
    ticketMachine: string | null;
    drinkingWater: string | null;
    restroom: string | null;
    elevator: string | null;
    escalator: string | null;
    updatedAt: string;
}

export type GetAllStationResponse = StationDetails[];

// All Station Option

export interface StationOption {
    stationCode: string;
    nameZhTw: string;
}

export type GetAllStationOptionResponse = StationOption[];

// All Station Fare 

export interface StationFare {
    id: number;
    fromStationId: number;
    toStationId: number;
    fareType: number;
    price: number;
    updatedAt: string;
}

export type GetAllStationFareResponse = StationFare[];

// All Line 

export interface LineInfo {
    id: number;
    letter: string;
    nameZhTw: string;
    nameEn: string;
    color: string;
    updatedAt: string;
}

export type GetAllLineResponse = LineInfo[];

// All Line Transfer 

export interface LineTransfer {
    id: number;
    fromLineStationId: number;
    toLineStationId: number;
    transferTime: number;
    updatedAt: string;
}

export type GetAllLineTransferResponse = LineTransfer[];

// All Line Station

export interface LineStation {
    id: number;
    lineId: number;
    stationId: number;
    stationSequence: number;
    stationCode: string;
    cumulativeDistance: number;
    cumulativeTime: number;
    updatedAt: string;
}

export type GetAllLineStationResponse = LineStation[];

// Station By Id

export interface GetStationByIdRequest {
    id: string;
}

export interface Station {
    id: string;
    nameZhTw: string;
    nameEn: string;
    atm: string;
    nursingRoom: string;
    diaperTable: string;
    chargingStation: string;
    ticketMachine: string;
    drinkingWater: string;
    restroom: string;
    elevator: string;
    escalator: string;
    updatedAt: string;
}

// All Station Paginated

export interface GetAllStationPaginatedRequest {
    keyword?: string;
    page: number;
    size: number;
}

export interface StationSummary {
    id: string;
    nameZhTw: string;
    nameEn: string;
    updatedAt: string;
}

export type GetAllStationPaginatedResponse = PageResponse<StationSummary>;

// All Station Id Option

export interface StationIdOption {
    id: string;
    nameZhTw: string;
}

export type GetAllStationIdOptionResponse = StationIdOption[];

// Origin Destination Detail

export interface GetOriginDestinationDetailRequest {
    fromStationCode: string;
    toStationCode: string;
    fareType: number;
    routingStrategy: number;
}

export interface RouteStation {
    stationCode: string;
    nameZhTw: string;
    nameEn: string;
}

export interface RouteSegment {
    lineCode: string;
    lineNameZhTw: string;
    lineColor: string;
    stations: RouteStation[];
    segmentTimeSeconds: number;
}

export interface GetOriginDestinationDetailResponse {
    fromStationCode: string;
    toStationCode: string;
    fareType: number;
    routingStrategy: number;
    route: RouteSegment[];
    transferCount: number;
    totalTravelTimeSeconds: number;
    transferTimeSeconds: number;
    farePrice: number;
}

// Update Station

export interface UpdateStationRequest {
    id: number;
    nameZhTw?: string;
    nameEn?: string;
    atm?: string;
    nursingRoom?: string;
    diaperTable?: string;
    chargingStation?: string;
    ticketMachine?: string;
    locker?: string;
    drinkingWater?: string;
    restroom?: string;
    elevator?: string;
    escalator?: string;
}

export interface UpdateStationResponse {
    message: string;
}

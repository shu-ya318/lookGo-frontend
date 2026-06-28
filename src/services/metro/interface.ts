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

// All Station 

export interface StationInfo {
    id: number;
    nameZhTw: string;
    nameEn: string;
    atm: string | null;
    nursingRoom: string | null;
    diaperTable: string | null;
    chargingStation: string | null;
    ticketMachine: string | null;
    locker: string | null;
    drinkingWater: string | null;
    restroom: string | null;
    elevator: string | null;
    escalator: string | null;
    updatedAt: string;
}

export type GetAllStationResponse = StationInfo[];

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

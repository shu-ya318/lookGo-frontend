export interface StationInfo {
    id: number;
    nameZhTw: string;
    nameEn: string;
    status: number;
    atm: string;
    nursingRoom: string;
    diaperTable: string;
    chargingStation: string;
    ticketMachine: string;
    locker: string;
    drinkingWater: string;
    restroom: string;
}

export interface GetStationsRequest {
    page: number;
    pageSize: number;
}

export interface GetStationsResponse {
    content: StationInfo[];
    totalElements: number;
}

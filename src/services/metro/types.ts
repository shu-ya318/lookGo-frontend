import type { StationDetails } from './interface';

export const FareType = {
    FULL: 1,
    STUDENT: 4,
    CHILD: 5,
    LOVE: 7,
} as const;
export type FareType = typeof FareType[keyof typeof FareType];

export const RoutingStrategy = {
    MIN_TRANSFER: 1,
    MIN_TIME: 2,
} as const;
export type RoutingStrategy = typeof RoutingStrategy[keyof typeof RoutingStrategy];

export const FARE_TYPE_LABELS: Record<number, string> = {
    [FareType.FULL]: '全票',
    [FareType.STUDENT]: '學生票',
    [FareType.CHILD]: '兒童票',
    [FareType.LOVE]: '愛心票',
};

export const ROUTING_STRATEGY_LABELS: Record<number, string> = {
    [RoutingStrategy.MIN_TRANSFER]: '最少轉乘次數',
    [RoutingStrategy.MIN_TIME]: '最短車程時間',
};

export const StationFacility = {
    TOILET: 'TOILET',
    ELEVATOR: 'ELEVATOR',
    ACCESSIBLE_FACILITIES: 'ACCESSIBLE_FACILITIES',
    NURSING_ROOM: 'NURSING_ROOM',
    ATM: 'ATM',
    LOCKER: 'LOCKER',
    CHARGING_STATION: 'CHARGING_STATION',
} as const;
export type StationFacility = typeof StationFacility[keyof typeof StationFacility];

export const facilityLabelMap = {
    '廁所': StationFacility.TOILET,
    '電梯': StationFacility.ELEVATOR,
    '無障礙設施': StationFacility.ACCESSIBLE_FACILITIES,
    '哺乳室': StationFacility.NURSING_ROOM,
    'ATM': StationFacility.ATM,
    '置物櫃': StationFacility.LOCKER,
    '充電站': StationFacility.CHARGING_STATION,
} as const;

export type FacilityLabel = keyof typeof facilityLabelMap;

export const facilityFilterOptions = Object.keys(facilityLabelMap) as FacilityLabel[];

export const labelToFacility = (label: string): StationFacility | undefined =>
    facilityLabelMap[label as FacilityLabel];

export type FacilityDetailKey = Extract<
    keyof StationDetails,
    | 'atm'
    | 'nursingRoom'
    | 'diaperTable'
    | 'chargingStation'
    | 'ticketMachine'
    | 'drinkingWater'
    | 'restroom'
    | 'elevator'
    | 'escalator'
>;

export const FACILITY_DETAIL_LABELS: { key: FacilityDetailKey; label: string }[] = [
    { key: 'elevator', label: '電梯' },
    { key: 'escalator', label: '電扶梯' },
    { key: 'atm', label: 'ATM' },
    { key: 'restroom', label: '廁所' },
    { key: 'drinkingWater', label: '飲水機' },
    { key: 'chargingStation', label: '充電站' },
    { key: 'ticketMachine', label: '售票機' },
    { key: 'nursingRoom', label: '哺乳室' },
    { key: 'diaperTable', label: '尿布台' },
];


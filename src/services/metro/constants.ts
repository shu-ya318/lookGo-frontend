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

const facilityLabelMap: Record<string, StationFacility> = {
    '廁所': StationFacility.TOILET,
    '電梯': StationFacility.ELEVATOR,
    '無障礙設施': StationFacility.ACCESSIBLE_FACILITIES,
    '哺乳室': StationFacility.NURSING_ROOM,
    'ATM': StationFacility.ATM,
    '置物櫃': StationFacility.LOCKER,
    '充電站': StationFacility.CHARGING_STATION,
};

export const labelToFacility = (label: string): StationFacility | undefined =>
    facilityLabelMap[label];

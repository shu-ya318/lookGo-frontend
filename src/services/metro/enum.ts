export enum StationFacility {
    TOILET = 'TOILET',
    ELEVATOR = 'ELEVATOR',
    ACCESSIBLE_FACILITIES = 'ACCESSIBLE_FACILITIES',
    NURSING_ROOM = 'NURSING_ROOM',
    ATM = 'ATM',
    LOCKER = 'LOCKER',
    CHARGING_STATION = 'CHARGING_STATION',
}

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

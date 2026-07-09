import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import {
  getOriginDestinationDetails,
  getStationByCode,
} from '@/services/metro';

import type { FareType, RoutingStrategy } from '@/services/metro/types';
import type { StationOption } from '@/services/metro/interface';

export interface TripResult {
  fromStationId: number;
  toStationId: number;
  fromStationNameZhTw: string;
  toStationNameZhTw: string;
  fareType: number;
  routingStrategy: number;
  farePrice: number;
  transferCount: number;
  totalTravelTimeSeconds: number;
}

interface UseTripRouteQueryResult {
  tripResult: TripResult | null;
  isSearching: boolean;
}

// StationOption 僅提供 stationCode，新增/更新旅程需要的 stationId 另行查詢
const resolveStationId = async (
  station: StationOption
): Promise<number | null> => {
  try {
    const response = await getStationByCode({
      stationCode: station.stationCode,
    });
    return response.id;
  } catch (error) {
    enqueueSnackbar((error as string) || '取得車站資訊失敗', {
      variant: 'error',
    });
    return null;
  }
};

// 起訖車站、票價種類與車程時間皆選定後，自動查詢路線
export const useTripRouteQuery = (
  startStation: StationOption | null,
  endStation: StationOption | null,
  fare: FareType | null,
  routingStrategy: RoutingStrategy | null
): UseTripRouteQueryResult => {
  const [tripResult, setTripResult] = useState<TripResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (
      !startStation ||
      !endStation ||
      fare === null ||
      routingStrategy === null
    ) {
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSearching(true);
    Promise.all([
      getOriginDestinationDetails({
        fromStationCode: startStation.stationCode,
        toStationCode: endStation.stationCode,
        fareType: fare,
        routingStrategy,
      }),
      resolveStationId(startStation),
      resolveStationId(endStation),
    ])
      .then(([detail, startStationId, endStationId]) => {
        if (!isMounted || startStationId === null || endStationId === null) {
          return;
        }

        setTripResult({
          fromStationId: startStationId,
          toStationId: endStationId,
          fromStationNameZhTw: startStation.nameZhTw,
          toStationNameZhTw: endStation.nameZhTw,
          fareType: detail.fareType,
          routingStrategy: detail.routingStrategy,
          farePrice: detail.farePrice,
          transferCount: detail.transferCount,
          totalTravelTimeSeconds: detail.totalTravelTimeSeconds,
        });
      })
      .catch((error) => {
        if (isMounted) {
          enqueueSnackbar((error as string) || '路線查詢失敗', {
            variant: 'error',
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsSearching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startStation, endStation, fare, routingStrategy]);

  return { tripResult, isSearching };
};

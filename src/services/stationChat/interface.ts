import type { PageResponse } from '../common/interface';

export type ChatType = 'TEXT' | 'TRIP_PLAN';
export type ChatEventType = 'NEW' | 'DELETE';

export interface MessageResponse {
    message: string;
}

// Station Chat Message
export interface StationChatMessage {
    id: number;
    username: string;
    chatType: ChatType;
    content: string | null;
    tripPlanId: number | null;
    fromStationName: string | null;
    toStationName: string | null;
    fareType: number | null;
    farePrice: number | null;
    transferCount: number | null;
    travelTimeSeconds: number | null;
    notes: string | null;
    createdAt: string;
}

export interface GetMessageByStationIdRequest {
    stationId: number;
    page?: number;
    size?: number;
}

export type GetMessageByStationIdResponse = PageResponse<StationChatMessage>;

export interface GetExcelByStationIdRequest {
    stationId: number;
}

// Station Chat Announcement
export interface StationChatAnnouncement {
    id: number;
    stationId: number;
    content: string;
    createdByUsername: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAnnouncementByStationIdRequest {
    stationId: number;
    page?: number;
    size?: number;
}

export type GetAnnouncementByStationIdResponse =
    PageResponse<StationChatAnnouncement>;

export interface CreateAnnouncementRequest {
    stationId: number;
    content: string;
}

export interface UpdateAnnouncementRequest {
    announcementId: number;
    content: string;
}

export interface DeleteAnnouncementRequest {
    announcementId: number;
}

// STOMP  message
export interface SendMessagePayload {
    chatType: ChatType;
    content?: string | null;
    tripPlanId?: number | null;
}

export interface StationChatEvent {
    eventType: ChatEventType;
    message?: StationChatMessage;
    deletedMessageId?: number;
}

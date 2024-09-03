export interface ScheduleStatus {
    user_id: string,
    status: string,
    duration: string,
    start_date: string,
    end_date: string,
    coverage: string,
    away_message_mode: string,
    away_message: string,
}

export interface ScheduleStatusResponse {
    status: string
}

export interface showScheduleStatusResponse {
    status: string,
    user: User[]
}

export interface User {
    user_id: string,
    object_id: string,
    end_date: string,
    start_date: string,
    updated: boolean,
    status: string,
    coverage_user_id: string,
    coverage_user_name: string,
    away_message: string,
    away_message_mode: string
}
// Shared Firestore document types used across the public site and admin.
import type { Timestamp } from "firebase/firestore";

export type SubmissionStatus =
    | "pending"
    | "queued"
    | "playing"
    | "played"
    | "featured"
    | "promoted"
    | "rejected";

// BonnetSubmit — a track dropped into the live queue. Supports either an
// external link or an uploaded audio file (Firebase Storage).
export interface Submission {
    id: string;
    songName: string;
    artistName: string;
    link?: string;
    /** Firebase Storage download URL for an uploaded audio file. */
    fileUrl?: string;
    fileName?: string;
    /** Duration in seconds, if known from the uploaded file. */
    durationSec?: number;
    /** Optional note to the artist. */
    note?: string;
    /** Membership tier claimed at submit time (affects queue priority). */
    tier?: "squad" | "supporter" | "vip";
    /** Discord handle so members can be verified for priority. */
    discordName?: string;
    /** Higher = closer to the front of the queue. */
    priority?: number;
    roundId: number;
    submittedAt: Timestamp | null;
    status: SubmissionStatus;
}

export type CollabStatus = "new" | "reviewing" | "accepted" | "declined" | "archived";

// Collaboration / booking inquiry.
export interface Collab {
    id: string;
    name: string;
    email: string;
    /** matches COLLAB_TYPES id */
    type: string;
    message: string;
    /** Portfolio / track / EPK link. */
    link?: string;
    /** Optional uploaded file (Firebase Storage). */
    fileUrl?: string;
    fileName?: string;
    budget?: string;
    discordName?: string;
    createdAt: Timestamp | null;
    status: CollabStatus;
    /** Internal admin note. */
    adminNote?: string;
}

export type EventType = "stream" | "release" | "event" | "collab" | "drop";
export type EventRecurrence = "none" | "daily" | "weekly" | "biweekly" | "monthly";

// Calendar event (homepage Schedule + admin ScheduleManager).
export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    time: string; // HH:mm
    endTime?: string; // HH:mm
    type: EventType;
    description?: string;
    url?: string;
    location?: string;
    recurrence?: EventRecurrence;
    /** ISO date the recurrence stops (inclusive). Empty = no end. */
    recurrenceUntil?: string;
    createdAt?: Timestamp | null;
}

export const EVENT_TYPE_META: Record<EventType, { label: string; color: string; dot: string }> = {
    stream: { label: "Stream", color: "from-purple-500 to-fuchsia-500", dot: "bg-purple-500" },
    release: { label: "Release", color: "from-emerald-500 to-teal-500", dot: "bg-emerald-500" },
    event: { label: "Event", color: "from-sky-500 to-blue-500", dot: "bg-sky-500" },
    collab: { label: "Collab", color: "from-amber-500 to-orange-500", dot: "bg-amber-500" },
    drop: { label: "Drop", color: "from-pink-500 to-rose-500", dot: "bg-pink-500" },
};

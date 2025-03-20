/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message } from "discord-types/general";

import { tokenFactory } from "./auth";
import Logger from "./logger";
import { settings } from "./settings";

export interface Tracker {
    slug: string,
    timesVisited: number,
    message?: {
        id: string,
        channelId: string,
    };
}

export const createTracker = async (): Promise<Tracker> => {
    const token = await tokenFactory();

    try {
        const response = await fetch(new URL("/trackers", settings.store.apiBaseUrl), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        const tracker: Tracker = await response.json();
        return tracker;
    }
    catch (e: any) {
        Logger.error("Failed to create tracker", e);
        throw e;
    }
};

export const attachMessageToTracker = async (slug: string, message: Message): Promise<void> => {
    const token = await tokenFactory();

    try {
        await fetch(new URL(`/trackers/${slug}`, settings.store.apiBaseUrl), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message: {
                    id: message.id,
                    channelId: message.channel_id
                }
            })
        });
    }
    catch (e: any) {
        Logger.error("Failed to attach message to tracker", e);
        throw e;
    }
};

export const getReadReceiptsFromChannel = async (channelId: string, limit: number, before?: string, after?: string): Promise<Tracker[]> => {
    const token = await tokenFactory();

    try {
        const url = new URL(`/trackers/channels/${channelId}`, settings.store.apiBaseUrl);
        url.searchParams.set("limit", limit.toString());
        if (before) url.searchParams.set("before", before);
        if (after) url.searchParams.set("after", after);

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const trackers: Tracker[] = await response.json();
        return trackers;
    }
    catch (e: any) {
        Logger.error("Failed to fetch read receipts", e);
        throw e;
    }
};

export const refreshLogin = async (refreshToken: string): Promise<any> => {
    try {
        const res = await fetch(new URL("/refresh", settings.store.apiBaseUrl), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                refreshToken
            })
        });

        return await res.json();
    }
    catch (e: any) {
        Logger.error("Failed to refresh token", e);
        throw e;
    }
};

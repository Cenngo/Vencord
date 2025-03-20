/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageObject } from "@api/MessageEvents";
import { FluxDispatcher, MessageStore, UserStore } from "@webpack/common";
import { Message } from "discord-types/general";

import { attachMessageToTracker, createTracker, getReadReceiptsFromChannel, Tracker } from "./api";
import { tokenFactory } from "./auth";
import Logger from "./logger";
import { settings } from "./settings";

const SignalR = require("./signalr.js");

const escapeRegExp = (text: string) => {
    return text?.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

let trackerRegex: RegExp | undefined = undefined;

const getTrackerRegex = () => {
    if (!trackerRegex) {
        trackerRegex = new RegExp(`${escapeRegExp(settings.store.apiBaseUrl)}/(?<slug>\\w{7})`);
    }

    return trackerRegex;
};

let hub: typeof SignalR.HubConnection | undefined = undefined;

export const handleReadReceipt = async (tracker: Tracker) => {
    if (!tracker.message) return;

    const { channelId, id: messageId } = tracker.message;

    await FluxDispatcher.dispatch({
        // @ts-ignore
        type: "MESSAGE_READ",
        id: messageId,
        channelId: channelId,
        readTimes: tracker.timesVisited
    });

    const cachedMessage = MessageStore.getMessage(channelId, messageId);

    if (!cachedMessage) return;

    await FluxDispatcher.dispatch({
        type: "MESSAGE_UPDATE",
        message: cachedMessage
    });
};

export const handleMessageFetch = async (data: { channelId: string, isBefore: boolean, isAfter: boolean, messages: Message[]; }) => {
    const { channelId, isBefore, isAfter, messages } = data;
    const limit = messages.length;
    const before = isBefore ? messages[0].id : undefined;
    const after = isAfter ? messages[limit - 1].id : undefined;
    const trackers = await getReadReceiptsFromChannel(channelId, limit, before, after);
    trackers.forEach(t => handleReadReceipt(t));
};

export const handleRead = (cache: any, data: { id: string, readTimes: number; }) => {
    try {
        if (cache == null || !cache.has(data.id)) return cache;

        const msg = cache.get(data.id);
        if (!msg) return;

        cache = cache.update(data.id, m => m
            .set("read", data.readTimes));

    } catch (e) {
        Logger.error("Error during handleRead", e);
    }
    return cache;
};

const parseTracker = (content: string) => {
    const match = getTrackerRegex().exec(content);

    if (!match) return;

    return match.groups?.slug;
};

export const handleMessageCreate = async (data: { optimistic: boolean, message: Message; }) => {
    const { optimistic, message } = data;
    if (optimistic) return;

    const currentUser = UserStore.getCurrentUser();
    if (message.state === "SENDING") return;
    if (!message.content) return;
    if (message.author.id !== currentUser.id) return;

    const trackerSlug = parseTracker(message.content);

    if (!trackerSlug) return;

    attachMessageToTracker(trackerSlug, message);
};

export const handlePreSend = async (_channelId: string, msg: MessageObject) => {
    const { isEnabled } = settings.store;
    if (!isEnabled) return;

    const tracker = await createTracker();
    if (parseTracker(msg.content)) return;

    const url = new URL(tracker.slug, settings.store.apiBaseUrl);

    msg.content += ` [⁥](${url})`;
};

export const startWs = async () => {
    if (!settings.store.authenticated) return;

    hub = new SignalR.HubConnectionBuilder()
        .withUrl(`${settings.store.apiBaseUrl}/trackers/ws`, {
            accessTokenFactory: tokenFactory
        })
        .withAutomaticReconnect()
        .build();

    hub.on("ReadReceipt", handleReadReceipt);

    await hub.start();
};

export const stopWs = async () => {
    if (!hub || hub.state === SignalR.HubConnectionState.Disconnected || hub.state === SignalR.HubConnectionState.Disconnecting) return;

    hub.off("ReadReceipt");

    await hub.stop();
    hub = undefined;
};

export const sendReadReceipt = async (messageId: string, channelId: string) => {
    hub?.send("MESSAGE_READ", {
        messageId,
        channelId
    });
};

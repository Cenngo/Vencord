/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, removeChatBarButton } from "@api/ChatButtons";
import { addMessageDecoration, removeMessageDecoration } from "@api/MessageDecorations";
import { addMessagePreSendListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { disableStyle, enableStyle } from "@api/Styles";
import definePlugin from "@utils/types";

import { ReadIcon, SlipTrackerToggle } from "./components";
import { patches } from "./patches";
import { settings } from "./settings";
import style from "./style.css?managed";
import { handleMessageCreate, handleMessageFetch, handlePreSend, handleRead, startWs, stopWs } from "./utils";

export default definePlugin({
    name: "Slip",
    description: "Read receipts for your messages",
    authors: [
        {
            name: "Cenggo",
            id: 203205870916468737n
        }
    ],
    handleRead,
    dependencies: ["ChatInputButtonAPI", "MessageEventsAPI", "MessageDecorationsAPI"],
    settings,
    patches,
    start() {
        enableStyle(style);
        addChatBarButton("SlipTrackerToggle", SlipTrackerToggle);
        addMessageDecoration("SlipReadReceipt", ReadIcon);
        addMessagePreSendListener(handlePreSend);
        startWs();
    },
    stop() {
        disableStyle(style);
        removeChatBarButton("SlipTrackerToggle");
        removeMessageDecoration("SlipReadReceipt");
        removeMessagePreSendListener(handlePreSend);
        stopWs();
    },
    flux: {
        async MESSAGE_CREATE(data) {
            await handleMessageCreate(data);
        },
        async LOAD_MESSAGES_SUCCESS(data) {
            await handleMessageFetch(data);
        }
    }
});

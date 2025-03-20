/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarProps } from "@api/ChatButtons";
import { showNotification } from "@api/Notifications";

import { DM_OFFSET, GUILD_OFFSET } from "./constants";
import { settings } from "./settings";


const BellIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0l.002.1a2.25 2.25 0 1 1-4.5 0Z" clipRule="evenodd" />
        </svg>
    );
};

const BellSlashIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
            <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.57 16.476c-.223.082-.448.161-.674.238L7.319 4.137A6.75 6.75 0 0 1 18.75 9v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206Z" />
            <path fillRule="evenodd" d="M5.25 9c0-.184.007-.366.022-.546l10.384 10.384a3.751 3.751 0 0 1-7.396-1.119 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
        </svg>
    );
};

const EyeIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="18" width="18">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
        </svg>
    );
};

export const ReadIcon = (props: Record<string, any>) => {
    const { message } = props;

    const readCount = props.channel.guild_id
        ? message.read - GUILD_OFFSET
        : message.read - DM_OFFSET;

    if (readCount <= 0) return null;

    return (
        <div className="slip-read">
            <EyeIcon />
            {props.channel.guild_id && readCount > 1 && readCount}
        </div>
    );
};

const ChatBarIcon = ({ isActive }: { isActive: boolean; }) => isActive ? <BellIcon /> : <BellSlashIcon />;

export const SlipTrackerToggle = ({ isMainChat }: ChatBarProps & { isMainChat: boolean; }) => {
    if (!isMainChat) return null;

    const { isEnabled, authenticated } = settings.use(["isEnabled", "authenticated"]);

    const toggle = () => {
        if (!authenticated) {
            showNotification({
                title: "Slip",
                body: "You need to sign in to Slip API to use this feature."
            });
            return;
        }

        settings.store.isEnabled = !isEnabled;
    };

    const tooltipText = isEnabled ? "Disable Read Receipt for the Next Message" : "Enable Read Receipt for the Next Message";

    return (
        <ChatBarButton tooltip={tooltipText} onClick={toggle}>
            <ChatBarIcon isActive={isEnabled && authenticated} />
        </ChatBarButton>
    );
};

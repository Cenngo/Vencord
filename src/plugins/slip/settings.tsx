/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Margins } from "@utils/margins";
import { OptionType } from "@utils/types";
import { Button } from "@webpack/common";

import { authorize, purgeAuthorization } from "./auth";
import { BASE_URL } from "./constants";

const SettingsAuthSection = () => {
    const { authenticated } = settings.use(["authenticated"]);

    return (
        <div>
            {authenticated && <span style={{ color: "var(--text-positive)" }}>You are signed in!</span>}
            {!authenticated && <Button className={Margins.top8} size={Button.Sizes.MEDIUM} color={Button.Colors.BRAND_NEW} onClick={authorize}>Sign In</Button>}
            {authenticated && <Button className={Margins.top8} size={Button.Sizes.MEDIUM} color={Button.Colors.RED} onClick={purgeAuthorization}>Sign Out</Button>}
        </div>
    );
};

export const settings = definePluginSettings({
    apiBaseUrl: {
        type: OptionType.STRING,
        description: "API Base URL",
        hidden: false,
        restartNeeded: true,
        default: BASE_URL
    },
    authenticated: {
        type: OptionType.BOOLEAN,
        description: "Whether the user is authenticated",
        hidden: true,
        restartNeeded: false,
        default: false
    },
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Enable message tracking",
        hidden: false,
        restartNeeded: false,
        default: false,
    },
    sendReadReceipts: {
        type: OptionType.BOOLEAN,
        description: "Send signed read receipts to the Slip API. Allows sender to see when you've read their message",
        hidden: false,
        restartNeeded: false,
        default: false
    },
    authSection: {
        type: OptionType.COMPONENT,
        description: "The API authentication section of the plugin",
        hidden: false,
        component: SettingsAuthSection
    }
}, {
    apiBaseUrl: {
        isValid: (value: string) => {
            if (!value) return "API Base URL is required";

            // if (!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(value)) return "Invalid URL";

            return true;
        }
    },
});

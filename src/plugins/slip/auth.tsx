/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { showNotification } from "@api/Notifications";
import { openModal } from "@utils/modal";
import { OAuth2AuthorizeModal, UserStore } from "@webpack/common";

import { refreshLogin } from "./api";
import { settings } from "./settings";
import { startWs, stopWs } from "./utils";

const refresh = async (token: string) => {
    const { accessToken, refreshToken, expiresIn } = await refreshLogin(token);
    setAuthorization(accessToken, refreshToken, expiresIn);
    return accessToken;
};

export const tokenFactory = async () => {
    const credentials = await DataStore.get<Record<string, string>>("Slip_credentials");
    if (!credentials || !settings.store.authenticated) throw new Error("Not signed in to Slip API");

    const userCredentials = credentials[`${new URL(settings.store.apiBaseUrl).origin}:${UserStore.getCurrentUser()?.id}`];
    if (!userCredentials) throw new Error("Not signed in to Slip API");

    const { accessToken, refreshToken, expiresAt } = JSON.parse(userCredentials);
    if (Date.now() < expiresAt) {
        return accessToken;
    }

    try {
        const newToken = await refresh(refreshToken);
        return newToken;
    } catch (e: any) {
        showNotification({
            title: "Slip Authentication",
            body: `Failed to refresh token: ${e.toString()}`
        });
    }
};

const setAuthorization = async (accessToken: string, refreshToken: string, expiresIn: number) => {
    const expiresAt = Date.now() + expiresIn * 1000;

    await DataStore.update<Record<string, string>>("Slip_credentials", credentials => {
        credentials ??= {};
        credentials[`${new URL(settings.store.apiBaseUrl).origin}:${UserStore.getCurrentUser()?.id}`] = JSON.stringify({
            accessToken,
            refreshToken,
            expiresAt
        });
        return credentials;
    });

    settings.store.authenticated = true;
};

export const purgeAuthorization = async () => {
    await DataStore.update<Record<string, string>>("Slip_credentials", credentials => {
        credentials ??= {};
        credentials[`${new URL(settings.store.apiBaseUrl).origin}:${UserStore.getCurrentUser()?.id}`] = "";
        return credentials;
    });
    settings.store.authenticated = false;
    stopWs();
};

export const authorize = async () => {
    if (settings.store.authenticated) {
        showNotification({
            title: "Slip Authentication",
            body: "Already authenticated."
        });
        return;
    }

    var res = await fetch(new URL("/oauth", settings.store.apiBaseUrl));

    var { clientId, redirectUri, state } = await res.json();

    const callback = async ({ location }: any) => {
        try {
            const res = await fetch(location + `&state=${state}`);
            const { accessToken, refreshToken, expiresIn } = await res.json();
            if (!accessToken) {
                showNotification({
                    title: "Slip Authentication",
                    body: "Setup failed (no access token returned?)"
                });
                return;
            }
            setAuthorization(accessToken, refreshToken, expiresIn);

            showNotification({
                title: "Slip Authentication",
                body: "Authentication Successful."
            });
            startWs();
        } catch (e: any) {
            showNotification({
                title: "Cloud Integration",
                body: `Setup failed (${e.toString()}).`
            });
            settings.store.authenticated = false;
        }
    };

    openModal((props: any) => <OAuth2AuthorizeModal
        {...props}
        scopes={["identify"]}
        responseType="code"
        redirectUri={redirectUri}
        permissions={0n}
        clientId={clientId}
        cancelCompletesFlow={false}
        callback={callback}
    />);
};

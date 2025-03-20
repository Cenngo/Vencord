/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Patch } from "@utils/types";

export const patches: Patch[] = [
    {
        // Module 377253
        find: '"Inserting message tapped on from a push notification"',
        replacement: [
            {
                match: /(?=function \i\(\i\){.*\i=\i\.update\(.*\),(\i)\.(\i)\.commit)/,
                replace: "function handleRead(ev){let cache=$1.$2.getOrCreate(ev.channelId);cache=$self.handleRead(cache, ev);$1.$2.commit(cache);}"
            },
            {
                match: /{(?=BACKGROUND_SYNC_CHANNEL_MESSAGES:\i,)/,
                replace: "{MESSAGE_READ: handleRead,"
            },
        ],
        plugin: "Slip",
    },
    {
        find: "}userHasReactedWithEmoji(",
        replacement: [
            {
                match: /(?=this\.content=null!==\(n=(\i)\.content\))/,
                replace: "this.read=$1.read||false,"
            }
        ],
        plugin: "Slip"
    },
];


// import { Patch } from "@utils/types";

// export const patches: Patch[] = [
//     {
//         // Module 377253
//         find: "Inserting message tapped on from a push notification",
//         replacement: [
//             {
//                 match: /(?=,MESSAGE_UPDATE:function\((\i)\){.*(\i)\.default\.getOrCreate)/,
//                 replace: ",MESSAGE_READ:function($1){var cache = $2.default.getOrCreate($1.channelId); cache = $self.handleRead(cache, $1); $2.default.commit(cache);}"
//             },
//         ],
//         plugin: "Slip",
//     },
//     {
//         find: "}addReaction(",
//         replacement: [
//             {
//                 match: /(?=this\.content=(\i)\.content\|\|"")/,
//                 replace: "this.read=$1.read||false,"
//             }
//         ],
//         plugin: "Slip"
//     },
// ];

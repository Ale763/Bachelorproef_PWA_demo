<template>
<div class="settings">
    <v-card v-if="flag">
        <v-card-text>
            <div v-if="!notificationSubscribed">
                <v-btn color="" @click="showNotificationPrompt = true">
                    <v-icon>notifications</v-icon>Subscribe to notifications
                </v-btn>
            </div>
            <div v-if="pwa.showInstallButton">
                <v-btn color="" @click="installPWA()">
                    <v-icon>get_app</v-icon>Install PWA
                </v-btn>
            </div>
            <v-container fluid>
                <v-layout column wrap>
                    <v-flex xs12>
                        <h2>Set cache strategy</h2>
                    </v-flex>
                    <v-flex xs12>
                        <v-radio-group v-model="strategy" :mandatory="false" @change="setStrategy">
                            <v-radio label="None" value="none"></v-radio>
                            <v-radio label="History" value="history"></v-radio>
                            <v-radio label="Predictive" value="predictive"></v-radio>
                        </v-radio-group>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-container fluid>
                <v-layout row wrap>
                    <v-flex xs12>
                        <h2>Set user group</h2>
                    </v-flex>
                    <v-flex xs12>
                        <v-radio-group v-model="usergroup" :mandatory="false" @change="setUserCookie">
                            <v-radio label="Anonymous" value="none"></v-radio>
                            <v-radio label="UserGroup 1" value="1"></v-radio>
                            <v-radio label="UserGroup 2" value="2"></v-radio>
                        </v-radio-group>
                    </v-flex>
                </v-layout>
            </v-container>
            <v-container fluid v-if="notificationSubscribed">
                <v-layout row wrap>
                    <v-flex xs10>
                        <h2>Configure notifications</h2>
                    </v-flex>

                    <v-flex xs12>
                        <v-radio-group v-model="notificationConfig" :mandatory="false" @change="setNotificationConfigCookie">
                            <v-radio label="Default" value="default"></v-radio>
                            <v-radio label="Only orders" value="only_orders"></v-radio>
                            <v-radio label="None" value="none"></v-radio>
                        </v-radio-group>
                        <v-item-group multiple style="text-align:center;">
                            <h3>Send notifications</h3>
                            <v-item>
                                <v-btn color="info" @click="sendPost('/api/send_order_notification/')">Order</v-btn>
                            </v-item>
                            <v-item>
                                <v-btn color="info" @click="sendPost('/api/send_promo_notification/')">Promo</v-btn>
                            </v-item>
                            <v-item>
                                <v-btn color="info" @click="sendPost('/api/send_promo_notification2/')">Promo 2</v-btn>
                            </v-item>
                        </v-item-group>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-snackbar v-model="showNotificationPrompt" :timeout="0" :vertical="true">
                Do you want to subscribe to push notifications to stay up to date?
                <v-item-group multiple style="text-align:center;">
                    <v-item>
                        <v-btn style="padding: 5px 10px;margin-top: 0;margin-right: 40px;" color="info" @click="_firebaseRequestPermission()">Yes</v-btn>
                    </v-item>
                    <v-item>
                        <v-btn style="padding: 5px 10px;margin-top: 0;margin-left: 40px;" color="info" @click="showNotificationPrompt = false">No</v-btn>
                    </v-item>
                </v-item-group>
            </v-snackbar>
        </v-card-text>
    </v-card>
</div>
</template>

<script>
import localForage from "localforage";
import * as firebase from "firebase/app";
import "firebase/messaging";
export default
{
    name: 'Settings',
    data()
    {
        return {
            strategy: "none",
            usergroup: "none",
            notificationConfig: "default",
            flag: false,
            sw: null,
            registration: null,
            firebase:
            {
                config:
                {
                    apiKey: "AIzaSyAyGInviSJMCyZV_XHLIRa8fKAt-wsaAJA",
                    authDomain: "pwademo-763.firebaseapp.com",
                    databaseURL: "https://pwademo-763.firebaseio.com",
                    projectId: "pwademo-763",
                    storageBucket: "pwademo-763.appspot.com",
                    messagingSenderId: "857384407396"
                },
                messaging: null,
                token: null
            },
            showNotificationPrompt: Notification.permission !== 'granted',
            notificationSubscribed: false,
            pwa:
            {
                installed: false,
                showInstallButton: false,
                promptEvent: null

            }
        }
    },
    async created()
    {
        this.pageTitle = this.$route.name;
        localForage
            .setDriver([
                localForage.INDEXEDDB,
                localForage.WEBSQL,
                localForage.LOCALSTORAGE
            ])
            .then(function ()
            {
                localForage.config(
                {
                    name: "Alessio",
                    version: 1.0,
                    size: 4980736, // Size of database, in bytes. WebSQL-only for now.
                    storeName: "lf2", // Should be alphanumeric, with underscores.
                    description: "some description"
                });
            });

        this.lf = localForage.createInstance(
        {
            name: "lf"
        });

        window.addEventListener("change", (event) =>
        {
            console.log("productCachePolicy: ", event);
        });

        window.addEventListener('load', async () =>
        {
            this.registration = await navigator.serviceWorker.register("/sw.js")
                .then(reg =>
                {
                    this.flag = true;
                    this.sw = reg.active;
                    return reg;
                })
                .catch((error) => console.error(`registration failed: `, error));
        });
        this.initStrategy();
        this.initUsergroupCookie();
        this.initNotificationConfigCookie();
        this.firebaseNotificationsHandler();

        let THIS = this;
        window.addEventListener("beforeinstallprompt", function (e)
        {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            THIS.pwa.promptEvent = e;

            THIS.pwa.showInstallButton = true;
        });

        window.addEventListener('appinstalled', (evt) =>
        {
            this.pwa.installed = true;
            console.log('👍', 'appinstalled', event);
            this.showNotificationPrompt = true;
        });
    },
    methods:
    {
        installPWA()
        {
            this.pwa.promptEvent.prompt();
        },
        async sendPost(url)
        {
            const rawResponse = await fetch(url,
            {
                method: 'POST',
                credentials: 'omit',
            });
        },
        async sendToken(token)
        {
            const rawResponse = await fetch('/api/save_token/',
            {
                method: 'POST',
                credentials: 'omit',
                headers:
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                {
                    "token": token
                })
            });
        },
        async sendMode(mode)
        {
            const rawResponse = await fetch('/api/set_mode/',
            {
                method: 'POST',
                credentials: 'omit',
                headers:
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                {
                    "mode": mode
                })
            });
            // const content = await rawResponse.json();
        },
        async setStrategy()
        {
            this.registration.active.postMessage(
            {
                action: 'updateProductCachePolicy',
                policy: this.strategy
            });
        },
        async setUserCookie()
        {
            if (this.usergroup === '1' || this.usergroup === '2')
            {
                this._setCookie("User", this.usergroup);
            }
            else
            {
                this._setCookie("User", this.usergroup);
                // this._deteleCookie("User");
                // fetch('/api/products/', {credentials: 'include'});
            }
        },
        async setNotificationConfigCookie()
        {
            if (this.notificationConfig === 'only_orders' || this.notificationConfig === 'none')
            {
                this._setCookie("notificationConfig", this.notificationConfig);
            }
            else
            {
                this.notificationConfig = "default"
                this._setCookie("notificationConfig", this.notificationConfig);
            }
            this.sendMode(this.notificationConfig)
        },
        async initStrategy()
        {
            let response = await fetch("/sw/productCachePolicy").catch(err =>
            {
                return null;
            });
            let productCachePolicy = "none";
            if (response != null)
                productCachePolicy = await response.json().then(data =>
                {
                    return data.policy;
                }).catch(err =>
                {
                    return "none";
                });
            this.strategy = productCachePolicy;

        },
        initUsergroupCookie()
        {
            let usergroupCookie = this._getCookieValue('User');
            if (usergroupCookie)
                this.usergroup = usergroupCookie;
            else
                this.usergroup = "none"
        },
        initNotificationConfigCookie()
        {
            let notificationConfigCookie = this._getCookieValue('notificationConfig');
            if (notificationConfigCookie = null) notificationConfigCookie = 'default';


            this.notificationConfig = notificationConfigCookie;

            this.setNotificationConfigCookie()

            let subscribed = this._getCookieValue("notificationSubscribed");
            if (subscribed == null) subscribed = false;
            this.notificationSubscribed = (Notification.permission === 'granted');
            if (window.matchMedia('(display-mode: standalone)').matches)
            {
                this.pwa.installed = true;
            }
            this.showNotificationPrompt = Notification.permission !== 'granted' && this.pwa.installed;
        },
        async _getStrategy()
        {
            if (this.registration.active)
            {
                let response = await fetch("/sw/productCachePolicy").catch(err =>
                {
                    return null;
                });
                let productCachePolicy = "none";
                if (response != null)
                    productCachePolicy = await response.json().then(data =>
                    {
                        return data.policy;
                    }).catch(err =>
                    {
                        return "none";
                    });
                return productCachePolicy;
            }
            return "none";
        },
        _setCookie(key, value)
        {
            let parsedCookies = this._parseDocumentCookies();
            parsedCookies = this._setValueOnParsedCookies(parsedCookies, key, value);
            let stringifiedCookies = this._stringifyParsedCookies(parsedCookies);
            let cookie = `${key}=${value}`
            document.cookie = cookie;

            if (key !== "User")
                return
            if (this.registration.active)
            {
                this.registration.active.postMessage(
                {
                    action: 'setUserCookie',
                    cookies: cookie
                });
            }
        },
        _getCookieValue(key)
        {
            let parsedCookies = this._parseDocumentCookies();
            for (let cookie of parsedCookies)
            {
                if (cookie[0] === key)
                    return cookie[1];
            }
            return null
        },
        _deteleCookie(key)
        {
            document.cookie = `${key}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
        },
        _parseDocumentCookies()
        {
            let docCookies = document.cookie;
            if (docCookies === "")
                return []
            docCookies = docCookies.split('; ');
            let parsedCookies = [];
            for (let docCookie of docCookies)
            {
                let parsedCookie = docCookie.split('=');
                parsedCookies.push(parsedCookie);
            }
            return parsedCookies;
        },
        _setValueOnParsedCookies(parsedCookies, key, value)
        {
            let valueSet = false;
            for (let i = 0; i < parsedCookies.length; ++i)
            {
                if (parsedCookies[i][0] === key)
                {
                    parsedCookies[i][1] = value
                    valueSet = true;
                }
            }
            if (!valueSet)
                parsedCookies.push([key, value]);
            return parsedCookies;
        },
        _stringifyParsedCookies(parsedCookies)
        {
            let stringifiedCookies = "";
            for (let cookie of parsedCookies)
            {
                stringifiedCookies += `${cookie[0]}=${cookie[1]};`;
            }
            return stringifiedCookies;
        },
        _firebaseInit()
        {
            firebase.initializeApp(this.firebase.config);
            this.firebase.messaging = firebase.messaging();
            this.firebase.messaging.usePublicVapidKey(
                "BHEX_KV05JO3refzgJbNXaXObnSiCb2kjx1rOsLWhMon4dea2ddfiYD0iLBHm6DsQkVp8sCLr2Ypuuz6haDnOzo"
            );
            this._firebaseGetToken();
        },
        _firebaseGetToken()
        {
            const THIS = this;
            return THIS.firebase.messaging
                .getToken()
                .then(function (currentToken)
                {
                    if (currentToken)
                    {
                        THIS.firebase.token = currentToken;
                        THIS.notificationSubscribed = true;
                        THIS.sendToken(currentToken)
                        THIS.showNotificationPrompt = false
                        THIS._setCookie("notificationSubscribed", "true")
                    }
                    else
                    {
                        console.log(
                            "No Instance ID token available. Request permission to generate one."
                        );
                    }
                })
                .catch(function (err)
                {
                    console.log("An error occurred while retrieving token. ", err);
                });
        },
        _firebaseRequestPermission()
        {
            const THIS = this;
            this.firebase.messaging
                .requestPermission()
                .then(() =>
                {
                    // console.log('Notification permission granted.');
                    this._firebaseGetToken().then(response =>
                    {
                        let notificationConfigCookie = THIS._getCookieValue('notificationConfig');
                        if (notificationConfigCookie)
                            THIS.notificationConfig = notificationConfigCookie;
                        else
                            THIS.notificationConfig = "default"
                        // let payload = {
                        //     	   "to": THIS.firebase.token,
                        //         "collapse_key": "type_a",
                        //         "notification":
                        //         {
                        //             "title": "payload.title",
                        //             "body": "payload.body",
                        //             "icon": "payload.icon",
                        //             "click_action": "payload.action"
                        //         },
                        //         "data":
                        //         {
                        //             "shown": false
                        //         }
                        // };
                        // FirebaseService.sendNotificationToSelf(payload)

                    });
                })
                .catch(err =>
                {
                    console.log("Unable to get permission to notify.", err);
                });
        },
        firebaseNotificationsHandler()
        {
            const THIS = this;
            this._firebaseInit();
            // this._firebaseRequestPermission();

            // -----------------------------------------------------------------------------------------------------
            // Event listeners

            THIS.firebase.messaging.onTokenRefresh(() =>
            {
                this._firebaseGetToken();
                console.log("TOKEN REFRESHED: ", THIS.firebase.token);
            });

            THIS.firebase.messaging.onMessage(payload =>
            {
                console.log("Message received. ", payload);
                if (Notification.permission === "granted")
                {
                    const notification = new Notification(payload.notification.title,
                    {
                        icon: payload.notification.icon,
                        body: payload.notification.body
                    });
                    notification.onclick = function ()
                    {
                        console.log("NOTIFCATION CLICK");
                        window.open(payload.notification.click_action, "_blank");
                    };
                    return notification;
                }
            });
        },
    }
}
</script>

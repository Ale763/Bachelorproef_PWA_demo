<template>
<v-app>
    <v-toolbar app>
        <v-toolbar-side-icon v-on:click="callChild()"></v-toolbar-side-icon>
        <v-toolbar-title class="black--text">{{pageTitle}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon v-if="offline">cloud_off</v-icon>
        <v-btn v-if="showPWAInstall" icon @click="_firebaseRequestPermission()">
            <v-icon>get_app</v-icon>
        </v-btn>
    </v-toolbar>
    <v-content>
        <Navbar ref="Navbar" />
        
        <v-alert :value="true" type="error" v-if="offline" icon="cloud_off" dismissible>You are offline. Functionality may be limited.</v-alert>
        <router-view />
    </v-content>
</v-app>
</template>

<script>
import Product from "./components/Product";
import Post from "./components/Post";
import Navbar from "./components/Navbar";

import
{
    MagentoAPIService
}
from "./services/MagentoAPIService";
import
{
    FirebaseService
}
from "./services/FirebaseService";
import * as firebase from "firebase/app";
import "firebase/messaging";
import * as localForage from "localforage";
import axios from "axios";
import "./env.js";
import
{
    ServiceWorkerLib
}
from "./modules/ServiceWorkerLib.ts";

export default
{
    name: "App",
    components:
    {
        Product,
        Post,
        Navbar: Navbar
    },
    data()
    {
        return {
            pageTitle: "Home",
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
            swLib: null,
            registration: null,
            serviceWorker: null,
            service_worker:
            {
                refreshing: false,
                reloadRequested: false
            },
            lf: null,
            currentWorker: null,
            newWorker: null,
            drawer: "",
            offline: !navigator.onLine,
            pwaPrompt: null,
            showPWAInstall: false,
            installed: false,
            showNotifications: true
        };
    },
    computed:
    {
        posts: function ()
        {
            let posts = this.$store.getters["posts/allPosts"];
            // console.log("All Posts: ", posts);
            return posts;
        },
        products: function ()
        {
            let products = this.$store.getters["products/allProducts"];
            // console.log("All Posts: ", posts);
            return products;
        },
        firebase_token()
        {}
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
        this.lf.setItem("test", "kqsdjmqkdfj");

        this.sw();
        // this.firebaseNotificationsHandler();
        window.addEventListener("online", () =>
        {
            this._isOffline(false);
        });
        window.addEventListener("offline", () =>
        {
            this._isOffline(true);
        });
    },
    watch:
    {
        async $route(to, from)
        {
            const THIS = this;
            let pageURL = this.$route.path;
            let pageTitle = this.$route.name;
            fetch(pageURL)
                .then(resp => console.log("Background fetched: ", pageURL))
                .catch(err => console.error(err));
            if (pageTitle) this.pageTitle = pageTitle;
            else
            {
                pageTitle = window.location.pathname;
                if (pageTitle.startsWith("/")) pageTitle = pageTitle.slice(1);
                let title = pageTitle.split("/");
                if (title[0] === "category") title[0] = "Category:";
                this.pageTitle = title[0] + " " + title[1];
            }
        }
    },
    methods:
    {
        _isOffline(value)
        {
            this.offline = value;
        },
        _testMethod()
        {
            this.send_msg_to_sw_with_response(
            {
                action: "SW"
            }).then(m => console.log(m));
        },
        callChild()
        {
            // this.bus.$emit('toggleNavbar');
            this.$refs.Navbar._toggleNavbar();
        },
        _firebaseInit()
        {
            firebase.initializeApp(this.firebase.config);
            this.firebase.messaging = firebase.messaging();
            this.firebase.messaging.usePublicVapidKey(
                "BHEX_KV05JO3refzgJbNXaXObnSiCb2kjx1rOsLWhMon4dea2ddfiYD0iLBHm6DsQkVp8sCLr2Ypuuz6haDnOzo"
            );
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
                        THIS.lf
                            .setItem("token", currentToken)
                            .then(value =>
                            {
                                // console.log("LocalForage: ", value)
                            })
                            .catch(error =>
                            {
                                console.error("LocalForage: ", error);
                            });
                        // console.log("TOKEN: ", currentToken);
                        currentToken;
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
                    // setTokenSentToServer(false);
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
            this._firebaseRequestPermission();

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
        send_msg_to_sw_with_response(msg)
        {
            return new Promise(function (resolve, reject)
            {
                var messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = function (event)
                {
                    if (event.data.error)
                    {
                        reject(event.data.error);
                    }
                    else
                    {
                        resolve(event.data);
                    }
                };

                navigator.serviceWorker.controller.postMessage(msg, [
                    messageChannel.port2
                ]);
            });
        },
        pp(sw, msg)
        {
            return new Promise(function (resolve, reject)
            {
                var messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = function (event)
                {
                    if (event.data.error)
                    {
                        reject(event.data.error);
                    }
                    else
                    {
                        resolve(event.data);
                    }
                };

                sw.postMessage(msg, [messageChannel.port2]);
            });
        },
        send_message_to_sw(msg)
        {
            if ("serviceWorker" in navigator)
            {
                // const currentWorker = this.swLib.getCurrentWorker();
                let cookie = `Type=${msg}`;
                this._setCookie("Type", msg);
                this.sw.postMessage(
                {
                    dev_comm: true,
                    cookie: cookie
                });
            }
        },
        request_from_sw()
        {
            let request = new Request("/update.js");
            const requestOptions = {
                method: "GET"
            };
            return fetch(request, requestOptions)
                .then(response =>
                {
                    return {
                        request: request,
                        response: response
                    };
                })
                .catch(error =>
                {
                    console.error(error);
                    console.error(JSON.stringify(error));
                    return {
                        request: request,
                        response: response
                    };
                });
        },
        send_new_sw()
        {
            if (this.newWorker)
                this.newWorker.postMessage(
                {
                    action: "skipWaiting"
                });
        },
        sw()
        {
            window.addEventListener("load", async () =>
            {
                this.registration = await navigator.serviceWorker
                    .register("/sw.js")
                    .catch(error => console.error(`registration failed: `, error));
                this.serviceWorker = this.registration.active;
                // let reg = await this.swLib.register()
                // this.sw = await this.swLib.getCurrentWorker();
                // console.log("REGISTRATION: ", this.swLib);
                window.addEventListener("newSW", () =>
                {
                    console.log("newSW arrived");
                });
            });
            /* navigator.serviceWorker.register("/sw.js").then(registration =>
                          {
                              this.serviceWorker = registration.active;
                          }); */
        },
        _navigateTo(url, buh)
        {
            this.lf.setItem("buh", buh).catch(error =>
            {
                console.error(error);
            });
            window.location = url;
        },
        _setCookie(key, value)
        {
            let parsedCookies = this._parseDocumentCookies();
            parsedCookies = this._setValueOnParsedCookies(parsedCookies, key, value);
            let stringifiedCookies = this._stringifyParsedCookies(parsedCookies);
            document.cookie = `${key}=${value}`;

            if (this.registration.active)
            {
                this.registration.active.postMessage(
                {
                    action: "setCookies",
                    cookies: parsedCookies
                });
            }
        },
        _deteleCookie(key)
        {
            document.cookie = `${key}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
        },
        _parseDocumentCookies()
        {
            let docCookies = document.cookie;
            if (docCookies === "") return [];
            docCookies = document.cookie.split(";");
            let parsedCookies = [];
            for (let docCookie of docCookies)
            {
                let parsedCookie = docCookie.split("=");
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
                    parsedCookies[i][1] = value;
                    valueSet = true;
                }
            }
            if (!valueSet) parsedCookies.push([key, value]);
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
        myfetch(p)
        {
            let request = new Request("https://pwa.local:8080/api/products/");

            // request.headers.append("X-X", p);
            fetch(request,
            {
                credentials: "include"
            }).catch(err => console.error(err));
            // fetch(request);
        }
    }
};
</script>

<style lang="scss">
// Overwrite v-alert icon color
.v-alert .v-alert__icon.v-icon,
.v-alert__dismissible .v-icon {
    color: white !important;
}
</style>

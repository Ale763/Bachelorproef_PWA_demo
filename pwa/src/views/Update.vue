<template>
<div style="margin: 0 auto; padding: 1rem;">
    <h2 style="text-align: right">
        <div v-if="update" style="color: dodgerblue;">
            <v-icon style="color: dodgerblue;padding-right: 1rem;">update</v-icon>
            Update available
        </div>
        <div v-if="!update" style>
            <v-icon style="padding-right: 1rem;">update</v-icon>No update available
        </div>
    </h2>
    <div style="display:block;text-align: center">
        <img
        src="/img/horse.png"
        style="display:block; height: 250px; max-width: 100%; margin: 0 auto"
      >
        <div id="imgElement" style="display:block; height: 250px; max-width: 100%;"></div>
    </div>
    <div style="width: 100%;text-align: center;">
        <v-btn round dark color="teal" v-on:click="toggleSW()">Update SW</v-btn>
        <v-btn round dark color="teal" v-on:click="unregister_sw()">Unregister SW</v-btn>
    </div>
    <v-snackbar v-model="multiClientUpdate" :timeout="0" :vertical=true>
        A new update is available.
        All pages will be reloaded after the update is complete.
        Please update.
        <v-btn dark flat @click="update_sw">
            Update
        </v-btn>
        <v-btn dark flat @click="multiClientUpdate = false">
            Close
        </v-btn>
    </v-snackbar>
</div>
</template>

<script>
import
{
    FirebaseService
}
from "../services/FirebaseService";
import * as localForage from "localforage";

export default
{
    name: "Update",
    data()
    {
        return {
            service_worker: null,
            newWorker: null,
            pageTitle: "Update",
            swName: "sw.js",
            lf: null,
            firebaseToken: null,
            update: false,
            multiclient: false,
            multiClientUpdate: false,
            refreshing: false
        };
    },
    computed:
    {},
    async created()
    {
        console.log("Creating Update, ", window.location.pathname);
        this.lf = await localForage.createInstance(
        {
            name: "lf"
        });

        let key = await this.lf.getItem("VersionSW");
        if (key == null) this.lf.setItem("VersionSW", 0);
        this.install_sw();
        setTimeout(() =>
        {
            let img = document.createElement("img");
            img.src = "/img/horse.png";
            img.style = "max-width: 100%; height: 250px;";
            if (document.getElementById("imgElement"))
            {
                document.getElementById("imgElement").appendChild(img);
            }
        }, 4500);
    },
    methods:
    {
        async install_sw()
        {
            const pathName = window.location.pathname;
            // console.log(pathName);
            if (pathName === "/") return;
            let key = await this.lf.getItem("VersionSW");
            if (key == null) key = 0;
            if (pathName === "/update-without-skip-and-claim")
            {
                this.pageTitle = "Default update";
                if (key === 0) this.swName = "/sw-without-skip-and-claim.js";
                else this.swName = "/sw-without-skip-and-claim-2.js";
            }
            else if (pathName === "/update-with-skip-no-claim")
            {
                this.pageTitle = "Forced update";
                if (key === 0) this.swName = "/sw-with-skip-no-claim.js";
                else this.swName = "/sw-with-skip-no-claim-2.js";
            }
            else if (pathName === "/update-with-skip-and-claim")
            {
                this.pageTitle = "Forced update & immediate control";
                if (key === 0) this.swName = "/sw-with-skip-and-claim.js";
                else this.swName = "/sw-with-skip-and-claim-2.js";
            }
            else if (pathName === "/single-client-update")
            {
                this.pageTitle = "Single Client Update";
                if (key === 0) this.swName = "/sw-single-client-update.js";
                else this.swName = "/sw-single-client-update-2.js";
            }
            else if (pathName === "/multi-client-update")
            {
                this.pageTitle = "Multi Client Update";
                this.multiclient = true;
                if (key === 0) this.swName = "/sw-multi-client-update.js";
                else this.swName = "/sw-multi-client-update-2.js";
            }
            navigator.serviceWorker.register(this.swName,
            {
                scope: pathName
            }).then(registration =>
                {
                    this.registration = registration;
                    this._updateListener();

                    if (this.multiclient)
                    {

                        let THIS = this;
                        navigator.serviceWorker.addEventListener('controllerchange',
                            function ()
                            {
                                if (THIS.refreshing) return;
                                THIS.refreshing = true;
                                window.location.reload();
                            }
                        );
                    }
                },
                err =>
                {
                    console.log("SW UPDATE_DEMO FAILED: ", err);
                }
            );
        },
        _updateListener()
        {
            // Service worker has installed in the background during a previous page load
            if (this.registration.waiting && this.registration.active)
            {
                this._setUpdateStatus(true);
                this.newWorker = this.registration.waiting;
            }
            else
            {
                // Monitor service worker for new version
                this.registration.addEventListener("updatefound", () =>
                {
                    this.newWorker = this.registration.installing;

                    // Monitor controllerchange for when a new version takes over
                    this.registration.addEventListener('controllerchange', () =>
                    {
                        // Remove update available when new service worker activates
                        this._setUpdateStatus(false);
                    });

                    // Monitor new service worker for statechanges
                    this.newWorker.addEventListener("statechange", () =>
                    {
                        // Has service worker state changed?
                        switch (this.newWorker.state)
                        {
                            case "installed":
                                // There is a new service worker available, show the notification
                                console.log("SW DETECTING UPDATE 2");
                                this._setUpdateStatus(true);
                                break;
                            case "activated":
                                // There is a new service worker available, show the notification
                                if (navigator.serviceWorker.controller)
                                {
                                    console.log("SW ACTIVATED");
                                    this._setUpdateStatus(false);
                                }
                                if (this.lf.getItem("updating"))
                                {
                                    // window.location.reload();
                                }
                                break;
                        }
                    });
                });
            }
        },
        unregister_sw()
        {
            this.registration.unregister().then(() =>
            {
                console.log("Unregister");
            });
        },
        async toggleSW()
        {
            this.lf.setItem("UAV", true);
            let key = await this.lf.getItem("VersionSW");
            if (key === 1 || key == null)
            {
                this.lf.setItem("VersionSW", 0);
            }
            else
            {
                this.lf.setItem("VersionSW", 1);
            }
            this.registration.update();
        },
        request_from_sw()
        {
            const pathName = window.location.pathname;
            this.registration.update();
            let request = new Request(`/${this.swName}`);
            const requestOptions = {
                method: "GET"
            };
            return fetch(request, requestOptions)
                .then(response =>
                {
                    navigator.serviceWorker
                        .register(this.swName,
                        {
                            scope: pathName
                        })
                        .then(
                            registration =>
                            {
                                this.registration = registration;
                            },
                            err =>
                            {
                                console.log("SW UPDATE_DEMO FAILED: ", err);
                            }
                        )
                        .then(() =>
                        {
                            this.service_worker = navigator.serviceWorker;
                            return navigator.serviceWorker.ready;
                        });
                    return response;
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
            this.$emit("updateRequest");
        },

        update_sw()
        {
            this.newWorker.postMessage(
            {
                action: 'skipWaiting'
            });
        },
        getSWClients()
        {
            if (navigator.serviceWorker.controller)
            {
                var messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = function (event)
                {
                    console.log("Response from the SW : ", event.data.message);
                };
                console.log("Sending message to the service worker");
                navigator.serviceWorker.controller.postMessage(
                    {
                        command: "twoWayCommunication",
                        message: "Hi, SW"
                    },
                    [messageChannel.port2]
                );
            }
            else
            {
                console.log("No active ServiceWorker");
            }
        },
        _navigateTo(url)
        {
            window.location = url;
        },
        _setUpdateStatus(status)
        {
            if (this.registration.active)
            {
                this.update = status;
                if (this.multiclient)
                    this.multiClientUpdate = status;
            }
        }
    }
};
</script>

<style scoped>
</style>

<template>
<div class="home">
    <!-- <h1>HOME</h1> -->
<!--     <img alt="Vue logo" src="../assets/nf.svg">
    <img alt="Vue logo" src="../assets/no.svg">
    <img alt="Vue logo" src="../assets/cf.svg">
    <img alt="Vue logo" src="../assets/co.svg">
    <img alt="Vue logo" src="../assets/swr.svg"> -->
</div>
</template>

<script>
import localForage from "localforage";
export default
{
    name: 'Home',
    data()
    {
        return {
            strategy: "none",
            usergroup: "none",
            flag: false,
            sw: null,
            registration: null
        }
    },
    computed:
    {

    },
    async created()
    {
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

    },
    methods:
    {
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
            if (this.usergroup === '1' ||  this.usergroup === '2')
            {
                this._setCookie("User", this.usergroup);
            }
            else
            {
                this._deteleCookie("User");
            }

            this.registration.active.postMessage(
            {
                action: 'setCookies',
                policy: this.usergroup
            });
        },
        async getStrategy()
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
            document.cookie = `${key}=${value}`;

            if (this.registration.active)
            {
                this.registration.active.postMessage(
                {
                    action: 'setCookies',
                    cookies: parsedCookies
                });
            }
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
            docCookies = document.cookie.split(';');
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
    }
}
</script>

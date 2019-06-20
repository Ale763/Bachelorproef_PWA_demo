/* export class CookieLib
{
    constructor() {}

    public _setCookie(key, value)
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


} */
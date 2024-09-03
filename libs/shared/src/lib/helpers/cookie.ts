const cookieMap = {
  email: "e",
  iid: "i",
  sso: "s",
};

/*
parseCookies [not exported]
getCookieNamespace
isServerCookie
setCookieString
createCookie
eraseCookie
readCookie
readCookieAndClear
saveToCookie
eraseCookiesForRestart
Note: Do we keep these here or create a different helper file?
isUserAuthed
isMultiAuthed
parseAuthCookie
*/

function parseCookies(cookieStr: string, name: string): string | null {
  let value = null;
  const cookie = cookieStr
    .split(";")
    .find((localValue: string) =>
      new RegExp(`^ *${name}=`, "m").test(localValue)
    );
  if (cookie) {
    // Match for value, either with or without double quotes
    const match = cookie.match(/[^=]*=(")?(.*)\1/);
    if (match) {
      [, , value] = match;
    }
  }

  return value;
}

export function getCookieNamespace() {
    return document.cookie ? document.cookie : '';
}

export function isServerCookie(key:string) {
    return (key === 'a');
}


export function setCookieString(key:string) {
    let cookieString = '';

    if (isServerCookie(key)) {
        cookieString = key;
    } else {
        cookieString = `${key}${getCookieNamespace()}`;
    }

    return cookieString;
}

export function createCookie(cookieName:string, value:string, days:number, domain = 'amsconnectapp.com') {
    const cookieKey = setCookieString(cookieName);
    const data = JSON.stringify(value);
    const domainPart = `; Domain=${domain}`;

    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toGMTString()}`;
    }

    let secure = '';
    if (domain) {
        secure = '; secure';
    }

    document.cookie = `${cookieKey}=${data}${expires}${domainPart}${secure}; path=/;`;
}

export function eraseCookie(name = 's') {
    createCookie(name, '', -1);
}

export function readCookie(key) {
    let cookieKey = '';

    // STEP 1: if in the known map, parse 's' for value
    if (cookieMap[key]) {
        cookieKey = `s${getCookieNamespace()}`;
        const parsedCookies = parseCookies(document.cookie, cookieKey);
        // 's' might not exist
        if (parsedCookies) {
            return JSON.parse(parsedCookies)[cookieMap[key]];
        }
        return undefined;
    }

    cookieKey = setCookieString(key);

    // STEP 2: otherwise parse for key
    return parseCookies(document.cookie, cookieKey) || undefined;
}

export function readCookieAndClear(key) {
    const value = readCookie(key);
    if (value) {
        eraseCookie(key);
    }
    return value;
}

export function saveToCookie(cookieValues) {
    const m = cookieMap;
    const shortKeysObject = {};

    (Object.keys(cookieValues)).forEach((key) => {
        shortKeysObject[m[key]] = cookieValues[key];
    });

    createCookie('s', shortKeysObject);
}

export function eraseCookiesForRestart() {
    eraseCookie('s');
    eraseCookie('redirectTo');
}

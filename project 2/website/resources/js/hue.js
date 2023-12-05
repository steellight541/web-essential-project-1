"use strict";
/*
    Philips Hue core functions
    DO NOT CHANGE THIS CODE
*/
/*
    Philips Hue local information
    ipAdres = ip adres of the Hue bridge
    user    = your generated user id
*/
const ipAdres = "10.10.10.10";
const user = "AYu2d2WypYXgb83WaEh9NkWldFN8KAJoStCUjP8e";
/*
    Get light information of all lights
*/
async function getLampsInfo() {
    try {
        let response = await window.fetch(`http://${ipAdres}/api/${user}/lights/`, {
            method: "GET",
        });
        let json = await response.json();
        return await json;
    }
    catch (_a) {
        return undefined;
    }
}
async function GetLightState(id) {
    const light = await getLightInfo(id);
    return light.state.on;
}
async function GetLightBri(id) {
    const light = await getLightInfo(id);
    return light.state.bri;
}
/*
    Get light information of a specific light
    id = number of the light
*/
async function getLightInfo(id) {
    let response = await fetch("http://" + ipAdres + "/api/" + user + "/lights/" + id, { method: "GET" });
    let json = await response.json();
    return await json;
}
/*
    Turn a specific light on or off
    id = number of the light
    state = true or false
*/
async function setLightState(id, state) {
    //console.log('f(',id,',',state,')');
    const response = await fetch(`http://${ipAdres}/api/${user}/lights/${id}/state`, {
        method: "PUT",
        body: JSON.stringify({ on: state }),
    });
    const json = await response.json();
    return json;
}
/*
    Convert RGB to SBH
    Input = Red (0-255) , Green (0-255) , Blue (0-255)
    Output = Sat (0-254) , Bri (0-254) , Hue (0-65535)
*/
function rgbToHSB(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let l = Math.max(r, g, b);
    let s = l - Math.min(r, g, b);
    let h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    let hue = 60 * h < 0 ? 60 * h + 360 : 60 * h;
    let sat = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
    let bri = (100 * (2 * l - s)) / 2;
    return {
        hue: parseFloat(((65535 * hue) / 360).toFixed(0)),
        bri: parseFloat(((254 * bri) / 100).toFixed(0)),
        sat: parseFloat(((254 * sat) / 100).toFixed(0)),
    };
}
/*
    Set color of specific light
    Input = id , Sat (0-254) , Bri (0-254) , Hue (0-65535)
*/
async function setLightColor(id, hue, bri, sat) {
    let response = await fetch(`http://${ipAdres}/api/${user}/lights/${id}/state`, {
        method: "PUT",
        body: JSON.stringify({ sat: sat, bri: bri, hue: hue }),
    });
    let json = await response.json();
    return json;
}
/*
    Set brightness of specific light
    Input = id , Bri (0-254)
*/
async function setLightBri(id, bri) {
    let response = await fetch(`http://${ipAdres}/api/${user}/lights/${id}/state`, {
        method: "PUT",
        body: JSON.stringify({ bri }),
    });
    let json = await response.json();
    return await json;
}

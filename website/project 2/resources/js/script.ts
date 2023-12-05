document.addEventListener("DOMContentLoaded", async () => {
	toggle("shelly");
	RefreshShellyInfo();
	placeShellyOnDom();
	placeHueOnDom();

	setInterval(async () => {
		RefreshShellyInfo();
		RefreshLightsState();
		refreshLightBri();
	}, 10000);
});
var count: number = 0;

interface Ilights {
	id: string;
	name: string;
	state: boolean;
	bri: number;
	hue: number;
	sat: number;
}

interface Iplugs {
	ip: string;
	id: string;
	device: string;
	name: string;
	state: boolean;
	power: number;
}

const lampen: Ilights[] = [];
const plugs: Iplugs[] = [];

function refreshLightBri() {
	lampen.forEach(async (lamp: Ilights) => {
		const bri = await GetLightBri(Number(lamp.id));
		lamp.bri = bri;
		const hueCardBrightness = document.getElementById("hueCardBrightness" + lamp.id)! as HTMLInputElement;
		hueCardBrightness.value = bri.toString();
	});
}

function RefreshLightsState() {
	lampen.forEach(async (lamp: Ilights) => {
		const state = await GetLightState(Number(lamp.id));
		lamp.state = state;
		const hueCardState = document.getElementById("hueCardState" + lamp.id)!;
		hueCardState.style.color = lamp.state ? "var(--icon-active-color)" : "var(--icon-inactive-color)";
		hueCardState.style.animation = lamp.state ? "magik 5s infinite" : "none";
	});
}

async function placeShellyOnDom(): Promise<void> {
	// check if there are any shelly plugs on DOM
	while (document.getElementById("shellyContainer")!.firstChild) {
		document.getElementById("shellyContainer")!.removeChild(document.getElementById("shellyContainer")!.firstChild!);
	}

	const shellyPlugInfo = await getShellyPlugInfo();
	const devices = shellyPlugInfo["devices_status"];
	const shellyPlugValue = Object.keys(devices);

	shellyPlugValue.forEach((key) => {
		const shellyPlug = devices[key];
		if (shellyPlug._dev_info.code == "SHPLG-S") {
			const shellyPlugIp: string = shellyPlug.wifi_sta.ip;
			const shellyPlugId = shellyPlug._dev_info.id;
			const shellyPlugName = key;
			const shellyPlugState = shellyPlug["relays"][0]["ison"];
			const shellyPlugPower = shellyPlug["meters"][0]["power"];
			const shellyPlugDevice = Object.keys(shellyPlug["relays"])[0];
			const shellyPlugInfo: Iplugs = {
				ip: shellyPlugIp,
				id: shellyPlugId,
				device: shellyPlugDevice,
				name: shellyPlugName,
				state: shellyPlugState,
				power: shellyPlugPower,
			};

			plugs.push(shellyPlugInfo);
		}
	});

	plugs.forEach((plug) => {
		createShellyCard(plug);
	});
}

async function placeHueOnDom(): Promise<void> {
	// check if there are any hue lamps on DOM
	while (document.getElementById("hueContainer")!.firstChild) {
		document.getElementById("hueContainer")!.removeChild(document.getElementById("hueContainer")!.firstChild!);
	}

	const lampsInfo = await getLampsInfo();
	const lampsValue = Object.keys(lampsInfo);

	lampsValue.forEach((lamp) => {
		const lampId = lamp;
		const lampName = lampsInfo[lamp]["name"];
		const lampState = lampsInfo[lamp]["state"]["on"];
		const lampBri = lampsInfo[lamp]["state"]["bri"];
		const lampHue = lampsInfo[lamp]["state"]["hue"];
		const lampSat = lampsInfo[lamp]["state"]["sat"];
		const lampInfo: Ilights = {
			id: lampId,
			name: lampName,
			state: lampState,
			bri: lampBri,
			hue: lampHue,
			sat: lampSat,
		};

		lampen.push(lampInfo);
	});

	lampen.forEach(async (lamp) => {
		createHueCard(lamp);
	});
}

async function RefreshShellyInfo(): Promise<void> {
	if (plugs) {
		plugs.forEach(async (plug: Iplugs) => {
			const power = await GetPlugPower(plug.id);
			plug.power = power;
			document.getElementById("shellypower" + plug.id)!.textContent = power + "W";
		});
	}
}

function createShellyCard(plug: Iplugs) {
	const shellyCard = document.createElement("div");
	shellyCard.classList.add("card");

	
	const cardIcon = document.createElement("div");
	cardIcon.classList.add("card-icon");

	const shellyCardState = document.createElement("i");
	shellyCardState.setAttribute("class", "fa-solid fa-plug fa-2xl");
	shellyCardState.style.color = plug.state ? "var(--icon-active-color)" : "var(--icon-inactive-color)";

	const shellyCardPower = document.createElement("p");
	shellyCardPower.classList.add("shelly-card-power");
	shellyCardPower.setAttribute("id", "shellypower" + plug.id);
	shellyCardPower.textContent = plug.power + "W";

	shellyCardState.addEventListener("click", () => {
		setPlugState(plug.device, plug.ip, plug.state ? "off" : "on");
		plug.state = !plug.state;
		shellyCardState.style.color = plug.state ? "var(--icon-active-color)" : "var(--icon-inactive-color)";
	});

	cardIcon.appendChild(shellyCardState);
	shellyCard.appendChild(cardIcon);
	shellyCard.appendChild(shellyCardPower);

	document.getElementById("shellyContainer")!.appendChild(shellyCard);
}

function createHueCard(plug: Ilights) {
	const hueCard = document.createElement("div");
	hueCard.classList.add("card");

	const cardIcon = document.createElement("div");
	cardIcon.classList.add("card-icon");
	const cardBody = document.createElement("div");
	cardBody.classList.add("card-body");

	const hueCardState = document.createElement("i");
	hueCardState.setAttribute("id", "hueCardState" + plug.id);
	hueCardState.setAttribute("class", "fa-solid fa-lightbulb fa-2xl");
	hueCardState.style.color = plug.state ? "var(--icon-active-color)" : "var(--icon-inactive-color)";
	hueCardState.style.animation = plug.state ? "magik 5s infinite" : "none";

	const hueCardName = document.createElement("h2");
	hueCardName.textContent = plug.name;

	const hueCardBrightness = document.createElement("input");
	hueCardBrightness.setAttribute("id", "hueCardBrightness" + plug.id);
	hueCardBrightness.setAttribute("class", "hue-card-brightness");
	hueCardBrightness.setAttribute("type", "range");
	hueCardBrightness.setAttribute("min", "0");
	hueCardBrightness.setAttribute("max", "255");
	hueCardBrightness.setAttribute("value", plug.bri.toString());

	hueCardBrightness.addEventListener("input", async () => {
		plug.bri = parseInt(hueCardBrightness.value);
		setLightBri(Number(plug.id), plug.bri);
	});
	hueCardState.addEventListener("click", () => {
		setLightState(Number(plug.id), plug.state ? false : true);
		plug.state = !plug.state;
		hueCardState.style.color = plug.state ? "var(--icon-active-color)" : "var(--icon-inactive-color)";
		hueCardState.style.animation = plug.state ? "magik 5s infinite" : "none";
	});

	const iconAsWrapper = document.createElement("i");
	iconAsWrapper.setAttribute("class", "fa-solid fa-palette fa-2xl hue-icon");

	const hueCardColor = document.createElement("input");
	hueCardColor.setAttribute("class", "hue-card-color");
	hueCardColor.setAttribute("type", "color");
	hueCardColor.setAttribute("value", "#" + hueToHex(plug.hue).toString());
	hueCardColor.addEventListener("change", () => {
		[plug.hue, plug.sat] = hexToHue(hueCardColor.value);
		setLightColor(Number(plug.id), plug.hue, plug.bri, plug.sat);
		iconAsWrapper.style.color = hueCardColor.value;
	});

	iconAsWrapper.appendChild(hueCardColor);

	cardIcon.appendChild(hueCardState);
	hueCard.appendChild(cardIcon);
	hueCard.appendChild(hueCardName);
	hueCard.appendChild(hueCardBrightness);
	hueCard.appendChild(iconAsWrapper);

	document.getElementById("hueContainer")!.appendChild(hueCard);
}

function toggle(id: string) {
	if (id == "shelly" || id == "hue") {
		if (id == "shelly") {
			document.getElementById("shellyContainer")!.style.display = "flex";
			document.getElementById("hueContainer")!.style.display = "none";
			const icon1 = document.getElementById("ic-shelly")!;
			const icon2 = document.getElementById("ic-hue")!;
			icon1.style.display = "none";
			icon2.style.display = "block";
		}
		if (id == "hue") {
			document.getElementById("hueContainer")!.style.display = "flex";
			document.getElementById("shellyContainer")!.style.display = "none";
			const icon1 = document.getElementById("ic-shelly")!;
			const icon2 = document.getElementById("ic-hue")!;
			icon1.style.display = "block";
			icon2.style.display = "none";
		}
	}
}

function hexToHue(hex: string): number[] {
	const rgb = hexToRgb(hex);
	const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
	return [hsb[0], hsb[1]];
}

function hueToHex(hue: number): string {
	const rgb = hsbToRgb(hue, 255, 125);
	return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

function rgbToHsb(red: number, green: number, blue: number): number[] {
	red /= 255;
	green /= 255;
	blue /= 255;

	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	let hue = 0;
	let saturation = 0;
	const brightness = max;

	const delta = max - min;
	if (delta) {
		saturation = delta / max;

		switch (max) {
			case red:
				hue = (green - blue) / delta + (green < blue ? 6 : 0);
				break;
			case green:
				hue = (blue - red) / delta + 2;
				break;
			case blue:
				hue = (red - green) / delta + 4;
				break;
		}

		hue /= 6;
	}

	return [Math.round(hue * 65535), Math.round(saturation * 255), Math.round(brightness * 255)];
}

function hexToRgb(hex: string): number[] {
	const bigint = parseInt(hex.replace("#", ""), 16);
	return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function hsbToRgb(hue: number, saturation: number, brightness: number): number[] {
	let red = 0;
	let green = 0;
	let blue = 0;

	if (saturation == 0) {
		red = green = blue = brightness;
	} else {
		const hueSegment = Math.floor(hue / 60);
		const hueSegmentOffset = hue / 60 - hueSegment;

		const p = brightness * (1 - saturation);
		const q = brightness * (1 - saturation * hueSegmentOffset);
		const t = brightness * (1 - saturation * (1 - hueSegmentOffset));

		switch (hueSegment) {
			case 0:
				red = brightness;
				green = t;
				blue = p;
				break;
			case 1:
				red = q;
				green = brightness;
				blue = p;
				break;
			case 2:
				red = p;
				green = brightness;
				blue = t;
				break;
			case 3:
				red = p;
				green = q;
				blue = brightness;
				break;
			case 4:
				red = t;
				green = p;
				blue = brightness;
				break;
			case 5:
				red = brightness;
				green = p;
				blue = q;
				break;
		}
	}

	return [Math.round(red), Math.round(green), Math.round(blue)];
}

function rgbToHex(red: number, green: number, blue: number): string {
	return (
		"#" +
		[red, green, blue]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			})
			.join("")
	);
}

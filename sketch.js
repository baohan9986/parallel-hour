let particles = [];
let segments = [];
let pullSpeed = 5;
let friction = 0.96;
let pullPoint;

let animationFrames = [];
let lastMinute = -1;

let targetValue = 0;
let currentValue = 0;
let hasPulled = false; // 记录是否已经拉出过
let isFetching = false; // 记录是否正在请求数据
let pendingMinuteUpdate = false; // 记录是否在拉出期间发生了分钟变化

// 拖拽或长按都拉出红线。松手后自动回弹到初始状态。
let isDragging = false;
let pointerMoved = false;
let dragAnchorX = 0;
let dragAnchorY = 0;
let dragAnchorValue = 0;
let dragSensitivity = 1;
let holdStartedAt = 0;
const holdPullMs = 2000;

// 当前平行宇宙文本
let currentUniverseText = "CONNECTING TO THE MULTIVERSE";

const svgPaths = {
    '0': "M46.85,348.18c28.52-.82,51.39,1.61,80.46-.58,2.16-.39,3.45-1.26,2.22-2.72-1.29-1.42-3.26-2.41-5.02-3.45-14.33-8.16-26.08-19.3-34.47-32.69-34.79-58.27-38.15-183.01,22.93-227.43,11.55-7.79,25.51-14.3,40-14.78,20.76-.36,12.39,27.52,15.77,43.9,1.11,6.46,5.82,11.45,11.19,15.55,6.1,4.84,10.87,9.02,14.53,14.98,2.86,4.55,4.95,10.4,6.26,15.67,8.01,32.39,6.21,66.44.81,99.08-1.9,9.55-4.88,19.71-12.74,26.65-8.06,7.2-21.23,5.66-27.91-2.37-14.93-18.55-14.97-54.12-13.79-76.57,1.27-19.87,2.02-42.01,15.63-58.09,3.63-4.36,8-8.24,11.41-12.75,9.5-12.42,7.15-28.64,6.68-43.09-.21-6-.73-12.52,2.25-18.02,2.33-4.24,6.92-6.24,12.62-6.52,104.26,8.34,105.71,165.5,76.66,233.42-7.89,19-21.35,35.58-41.07,45.14-1.46.91-3.08,1.48-3.77,2.91-.19,1.66,3.68,1.54,5.32,1.71,26.95.36,43.83-.1,69.17.05",
    '1': "M47.78,348.65c30.26-.43,71.49.72,102.34-.25,5.49.03,8.51-4.17,7.76-9.41-1.35-34.43,2.89-149.53-1.45-180.47-3.33.04-6.47,3.58-9.17,5.58-4.43,3.75-9.01,7.66-13.98,11.88-7.98,5.79-19.27,21.51-28.48,9.42-6.93-7.61-15.24-17.97-22-26-3.63-4.54-10.41-10.88-5.98-16.75,25.66-21.66,66.57-55.75,90.06-73.75,13.09-7.42,37.68-2.52,52.55-3.71,4.65.39,12.38-1.37,14.8,3.19,2.59,38.21-1.41,206.8,1.2,273.3-.05,6,5.67,6.99,10.56,6.91,17.28.47,39.18-.24,56.89.05",
    '2': "M47.78,349.17c6.72.02,13.07-.11,19.69-.28,10.54.2,7.78-10.21,8.28-17.56.33-9.44-.26-18.88.19-28.34.4-8.52,7.22-13.28,12.85-18.93,6.92-6.94,13.86-13.87,20.79-20.8,15.98-15.97,31.98-31.93,47.91-47.94,11.91-12.49,25.79-24.17,33.07-40.19,5.23-11.51,7.09-28.45-2.21-38.51-9.74-10.54-26.34-7.13-37.86-1.92-10.78,4.39-23.21,13.47-31.65,19.93-4.92,4.49-8.42-.35-11.52-4.15-7.97-9.66-22.59-27.33-29.95-36.39-1.98-2.31-4.99-6.18-1.56-8.5,31.28-21.09,63.3-40.25,102.25-41.24,34.4-.88,67.48,13.63,83.84,45.28,16.86,32.61,7.55,67.92-12.39,96.74-21.16,30.59-52.28,50.86-76.53,78.55-.12.55.41.91,1.55,1.1,30.58.84,61.2-.57,91.76.2,2.08.05,4.33.64,5.55,2.32,1.08,1.48,1.12,3.45,1.11,5.27-.03,16.17-.74,32.52.22,48.67-.11,7.32,6.92,6.44,12.24,6.5,6.18.23,11.24.15,17.48.19",
    '3': "M47.78,348.03c17.89.02,40.72.05,59.78-.09,1.27-.05,3.92-.22,2.04-1.11-8.47-3.01-23.44-5.25-29.02-11.65-5.41-5.94-1.89-41.55-2.69-50.77,0-3.86-.71-12.56,5.41-8.73,30.43,14.79,77.68,28.65,106.96,5.25,4.28-3.81,7.37-9.1,7.76-14.87,1-10.81-6.88-21.49-16.17-26.11-9.7-4.94-20.61-4.25-31.75-3.83-8.07.08-16.56,1.01-24.03-2.1-4.8-2.45-4.31-8.4-4.34-13.02-.02-9.07-.02-21.99,0-30.97-.23-7.33.51-13.43,9.36-13.33,19.64-.32,42.69,2.29,57.92-12.53,6.41-6.38,9.41-16.84,5.33-25.21-4.28-8.87-14.82-12.49-24.11-13.03-15.27-.97-29.87,4.96-43.76,11.09-3.46,1.47-7.28,3.46-11.07,3.07-4.96-.58-7.8-5.3-10.51-8.99-5.51-7.79-13.11-18.67-18.42-26.24-2.03-3.6-6.84-7.56-5.34-11.9,30.62-26.4,75.74-30.41,114.65-26.23,37.78,3.87,75.95,22.45,74.63,64.4-.23,29.11-19.15,51.96-44.83,65.29-2.91,1.41-6.01,2.52-9.02,3.61-1.62.6-2.81,1.12-2.92,1.61.15.97,2.36,1.26,5.15,2.05,36.91,6.88,68.16,40.92,59.56,79.85-5.44,28.22-28.91,48.46-53.78,60.44-2.73,1.5-5.06,2.6-4.28,3.47,24.71,1.57,60.54.1,82.6.6",
    '4': "M47.78,348.47c37.86-.36,89.53.66,128.45-.36,3.7-21.62.74-155.15,1.12-180.68-10.48,13.26-32.32,51.18-41.04,64.14-.87,1.31-2.4,4.13.24,4.59,15.49.86,34.18-.07,49.45.4,8.04-.48,5.77,8.07,6.14,13.89-.04,10.44.11,25.48-.06,35.62.24,3.3-.68,7.11-4.74,6.54-19.78-.21-86.7.52-118.32-.25-4.85-.96-2.31-8.94-2.97-12.65.02-11.46-.04-24.51,0-35.91-.38-4.64.9-8.91,3.94-12.41,32.44-45.95,99.35-148.88,114.51-166,19.16-1,43.39-.12,61.29-.35,4.06-.01,8.39-.74,8.42,3.27.09,19.95-.05,122.87.1,162.17-.28,3.49,2.15,4.48,5.82,4.37,10.17,1.64,27.78-5.16,25.47,11.15,0,11.13.07,30.89-.04,40.47.1,2.76-.26,6.18-3.19,7.31-8.14,3.19-18.74-1.84-25.98,3.46-1.71,2.19-1.5,5.28-1.64,7.92-.09,11.91-1.64,29.23-.59,39.97.53,4.16,5.81,3.14,8.95,3.31,15.97-.04,24.97.08,39.77.03",
    '5': "M47.78,348.47c17.51-.02,48.33,0,54.69-.06.71-.02,1.24-.05,1.59-.11.43-.08.57-.2.39-.39-5.62-3.27-14.94-6.2-19.37-11.9-3.28-4.07-2.87-9.3-2.88-17.5-.01-10.57,0-22.26,0-32.64.02-5.81-.07-9.34.54-10.51.48-.95,1.44-.63,3.23.21,5.03,2.39,12.36,5.78,18.8,8.06,28.79,10.11,82.52,18.46,92.62-16.84,3.64-14.1-2.77-26.64-12.63-36.53-15.31-11.96-35.97-9.87-53.62-5.36-5.37-1.27-9.54,3.24-14.7,3.02-8.19-.63-17.7-6.75-24.27-9.9-3.8-2.27-5.27-2.75-5.33-6.14,1.68-19.19,7.6-124.33,10.32-145.88,20.98-2.17,134.28.05,156.57-.71,6.02-.67,3.59,5.71,4.12,13.47,0,10.97,0,27.73,0,38.38-.44,4.77,1.46,12.01-2.86,12.69-15.37.53-57.27.06-81.41.21-6.67.05-9.02-.53-9.71,4.95-.57,4.43-.6,9.63-.84,14.39-.14,3.51-.32,6.96-.33,10.3-.04,6.09,1.25,4.91,5.31,4.49,24.28-2.53,49.44.15,70.54,13.5,29.13,18.43,40.71,57.78,38.56,90.81-1.99,30.45-18.7,56.37-45.58,70.7-6.29,3.91-19.84,7.36-23.84,9.14,22.18.34,74.75.07,95.22.17",
    '6': "M47.78,348.41c21.03-.16,71.97.39,92.87-.22-6.62-1.19-15.9-6.37-21.35-10.55-10.04-7.02-18.38-16.14-24.66-26.6-46.58-81.98-24.34-222.25,81.07-242.45,14.91-2.86,30.11-3.57,45.24-3.52,7.91.14,15.81-.61,24.08.92,8.54,1.54,12.25,6.28,11.74,14.89-.09,12.46.37,28.43-.19,40.44-.35,6.72-6.7,6.04-11.65,5.61-11.93-1.04-24.05-2.63-36.03-2.44-43.8-.68-68.89,34.19-70.18,75.47-1.44,26.32-.9,79.27,30.59,89.09,11.49,3.25,22.69-4.41,27.98-14.31,20.33-38.14-22.34-75.25-51.46-36.44-3.82,4.21-6.59,9.48-10.02,13.96-5.28,6.75-5.8-3.36-6.18-6.97-.79-7.74-1.6-15.44-2.39-23.22-1.4-10.28,0-18.72,7.75-26.16,15.67-16.54,37-29.92,59.7-32.35,8.79-.94,17.72-.22,26.55,2.57,81.27,28.22,63.59,151.39-7.55,180.5-1.19,1.05-.17,1.47,1.17,1.64,24.48.32,66.05.08,87.04.15",
    '7': "M47.78,348.46c12.55.11,28.4-.11,41.02-.11,3.7-.03,8.17.19,11.52-1.37,17.51-28.56,82.37-183.65,96.51-211.89,2.57-4.36-3.35-4.78-6.39-4.65-24.8-.01-54.56-.03-80.04-.02-6.8,0-14.99,0-21.99,0-3.73-.28-7.72.8-10.99-1.21-3.04-2.29-2.71-7.19-2.75-10.72-.03-11.31-.03-31.02,0-42.07.03-2.78-.16-6,.91-8.52.86-2.19,2.61-2.92,4.73-2.86,5.07-.17,19.1.05,30.82-.02,27.52-.04,54.16-.04,83.68-.02,33.26.09,62.52-.08,77.16.09,5.32.46,4.92,7.36,4.95,11.41.04,6.82,0,16.8-.01,25.05-.06,6.22.37,11.45-.49,16.68-11.28,34.9-82.25,187.31-94.95,228.34-.09,1.48,2.29,1.57,3.63,1.58,26.25.62,93.74.07,117.77.29",
    '8': "M47.78,348.25c20.71-.16,45.95.11,66.56-.06,2.33.01,5.28-.1,7.26-.23,1.97-.15,3.08-.4,3.21-.83-.33-1.49-4.24-2.7-9.22-5.4-29.95-14.61-48.93-52.94-38.8-86.03,4.88-15.9,16.64-30.3,30.77-39.06,6.24-3.86,13.4-7.71,19.14-7.56,11.06.35,21.49,10.12,30.69,15.82,8.07,5.52,16.02,10.79,23.97,16.32,9.79,6.95,20.22,14.96,22.12,27.14,3.17,24.87-25.73,35.04-44.93,24.36-8.01-4.21-14.04-12.26-14.87-21.19-1.27-11.14,5.91-21.41,14.07-28.55,31.73-26.59,76.67-38.68,99.51-75.31,26.72-43.86.5-85.58-46.09-97.48-41.72-10.62-94.68-6-121.03,31.97-14.37,20.08-12.24,46.42.25,66.91,6.5,10.69,15.76,22.22,28.96,19.17,5.36-1.15,10.54-4.12,15.37-6.86,12.18-7.06,24.42-13.99,36.44-21.24,6.01-3.75,12.29-7.77,16.34-13.67,12.37-19.22-13.44-33.17-27.79-18.76-6.78,6.5-6.38,17.34-.99,24.8,5.26,7.8,13.38,13.5,21.03,18.86,17.41,12.19,34.99,22.44,52.84,33.87,21.48,13.78,39.94,34.74,43.1,60.85,3.67,26.25-7.76,52.98-29.88,68.11-5.7,4.06-12.97,7.64-16.07,9.95-6.62,4.61,6.89,3.75,9.71,3.97,21.3.04,43.2.14,63.47.14",
    '9': "M47.78,348.43c7.98,0,16.15.06,24.21-.04,6.97.06,15.76-1.02,18.28-7.88,3.01-8.79,1.36-18.43,1.79-27.64.28-7.72-.72-15.12,6.06-18.54,5-2.05,11.08-.91,17.82-.74,20.17.63,42.04-2.32,60.18-11.73,14.5-7.28,25.53-20.15,30.67-35.52,6.15-17.97,6.48-37.68,6.08-56.61-.87-17.55-1.7-37.34-13.23-51.54-11.63-14.36-34.26-15.19-44.62.97-8.24,12.73-10.67,36.93.63,48.57,18.13,16.97,45.73,2.85,52.12-18.85,1.56-4.43,2.58-9.11,3.32-13.79,1.05-3.91.91-19.58,5.35-17.52,2.29,1.52,3.56,4.61,5.41,8.93,2.01,5.18,3.51,10.68,4.48,16.27,11.47,54.95-49.03,108.5-101.77,89.17-36.39-12.34-50.93-50.13-49.96-86.32.21-24.77,5.71-50.73,21.27-70.57,19.8-26.36,54.73-32.07,85.86-29.59,52.7,4.1,92.38,41.63,98.83,94.07,2.26,15.77,2.17,31.76,1.66,47.67-.8,20.59-3.39,41.24-9.64,60.93-10.38,32.52-31.54,64.99-64.89,76.01-2.65,1.25-11.55,3.07-11.75,3.84,31.72,1.26,77.05.09,106.95.48"
};

async function fetchUniverseText() {
    if (isFetching) return;
    isFetching = true;

    let rawHour = hour();
    let hour12 = rawHour % 12 || 12;
    let ampm = rawHour >= 12 ? "pm" : "am";
    let m = nf(minute(), 2);
    let timeStr = `${hour12}:${m}${ampm}`;

    // 在获取新文本前，先重置为加载状态，防止用户拉出太快看到旧文本
    currentUniverseText = `${timeStr} CONNECTING TO THE MULTIVERSE`;

    // 随机抽取一个主题领域，强制 AI 每次都在完全不同的领域里生成，避免重复
    const domains = [
        "cyberpunk/hacker", "culinary/kitchen", "deep sea/ocean", "space/sci-fi",
        "mundane office/corporate", "occult/paranormal", "heavy industry/construction",
        "fine arts/music", "espionage/spy", "wilderness/survival",
        "medical/hospital", "retail/customer service", "historical/ancient",
        "aviation/flying", "underground/subway", "nightlife/club",
        "agriculture/farming", "law enforcement/security", "circus/carnival"
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];

    // 加上时间戳和随机数，强迫 OpenAI 每次都把它当成一个全新的请求，避免缓存
    const uniqueId = Date.now() + "-" + Math.floor(Math.random() * 10000);
    const prompt = `The current time is ${timeStr}. Write one English sentence under 10 words about a parallel-universe version of me. Name one specific profession, never a personal pronoun. The action must be something that profession would actually do at ${timeStr}. Include a specific place. Stay inside this domain: "${randomDomain}". No commas. Connect the time, profession, action, and place with prepositions. Example: "At ${timeStr} a night baker kneads dough in a kitchen." NEVER use libraries, librarians, or reading books. Be completely different every time. English only. [ID: ${uniqueId}]`;

    try {
        const res = await window.fetch("/api/universe-text", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        let sentence = (data.text || "").trim();
        let words = sentence.replace(/[.]/g, "").split(/\s+/).filter(w => w.length > 0);
        let linked = /\b(at|in|on|under|inside|above|over|near|beside|into|onto|across|through|around|behind|between|from|with|by|during|to)\b/i.test(sentence);
        let pronoun = /\b(i|me|my|mine|you|your|yours|he|him|his|she|her|hers|we|us|our|ours|they|them|their|theirs|someone|somebody|anyone|anybody)\b/i.test(sentence);
        if (sentence && !/[^\x00-\x7F]/.test(sentence) && !sentence.includes(",") && words.length <= 10 && linked && !pronoun) {
            currentUniverseText = sentence.toUpperCase();
        } else {
            currentUniverseText = `${timeStr} LOST INSIDE THE MULTIVERSE`;
        }
    } catch (e) {
        currentUniverseText = `${timeStr} LOST INSIDE THE MULTIVERSE`;
        console.error(e);
    } finally {
        isFetching = false;
    }
}

function updateDragSensitivity() {
    // 拖过大约 55% 屏高，对应原来串口的满量程 0–500
    dragSensitivity = 500 / Math.max(height * 0.55, 1);
}

function beginDrag() {
    isDragging = true;
    pointerMoved = false;
    dragAnchorX = mouseX;
    dragAnchorY = mouseY;
    // 回弹途中再次按下时，从画面当前进度继续拉，避免跳变
    dragAnchorValue = currentValue;
    targetValue = currentValue;
    holdStartedAt = millis();
    cursor("grabbing");
}

function updateDrag() {
    if (!isDragging) return;
    let deltaX = mouseX - dragAnchorX;
    let deltaY = mouseY - dragAnchorY;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) pointerMoved = true;
    if (!pointerMoved) return;
    targetValue = constrain(dragAnchorValue + deltaY * dragSensitivity, 0, 500);
}

function updateHold() {
    if (!isDragging || pointerMoved) return;
    let held = millis() - holdStartedAt;
    let span = 500 - dragAnchorValue;
    targetValue = constrain(dragAnchorValue + (held / holdPullMs) * span, 0, 500);
}

function endDrag() {
    isDragging = false;
    targetValue = 0;
    cursor("grab");
}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.elt.addEventListener("contextmenu", (event) => event.preventDefault());
    pixelDensity(1);
    pullPoint = createVector(width * 0.5, height + 100);
    lastMinute = minute();
    updateDragSensitivity();
    cursor("grab");
    initYarn();
    fetchUniverseText();
}

function initYarn() {
    particles = [];
    segments = [];
    animationFrames = [];

    let rawHour = hour();
    let hour12 = rawHour % 12;
    if (hour12 === 0) hour12 = 12;

    let h = nf(hour12, 2);
    let m = nf(minute(), 2);

    let dw = width * 0.1;
    let dh = dw * 2;
    let gap = width * 0.005;
    let waveW = width * 0.15;

    let stretchX = 1.8;

    let totalW = (dw * stretchX * 4) + (gap * 2) + waveW;
    let startX = (width - totalW) / 2;

    let baseY = height * 0.32;
    let bottomY = baseY + dh;

    let rawPoints = [];
    let cx = startX;

    rawPoints.push([-50, bottomY]);
    rawPoints.push([cx, bottomY]);

    let timeStr = h[0] + h[1] + ":" + m[0] + m[1];

    for (let i = 0; i < timeStr.length; i++) {
        let char = timeStr[i];

        if (char === ":") {
            let waveStartX = cx;
            let centerY = bottomY;
            let amp = dh * 0.10;
            let cycles = 2.2;
            let steps = 80;

            for (let j = 0; j <= steps; j++) {
                let t = j / steps;
                let x = lerp(waveStartX, waveStartX + waveW, t);
                let envelope = sin(t * PI);
                let y = centerY + sin(t * TWO_PI * cycles) * amp * envelope;
                rawPoints.push([x, y]);
            }

            cx += waveW;
        } else {
            let dString = svgPaths[char];
            if (dString) {
                let pts = parseSVGPath(dString, 150);
                for (let p of pts) {
                    rawPoints.push([cx + p[0] * dw * stretchX, baseY + p[1] * dh]);
                }
            }

            cx += dw * stretchX;

            if (i < timeStr.length - 1 && timeStr[i + 1] !== ":") {
                rawPoints.push([cx, bottomY]);
                rawPoints.push([cx + gap, bottomY]);
                cx += gap;
            }
        }
    }

    rawPoints.push([cx, bottomY]);

    let p0x = cx, p0y = bottomY;
    let p1x = cx, p1y = bottomY + (height - bottomY) * 0.4;
    let p2x = pullPoint.x, p2y = bottomY + (height - bottomY) * 0.6;
    let p3x = pullPoint.x, p3y = height + 25;

    let curveSteps = 30;
    for (let j = 1; j <= curveSteps; j++) {
        let t = j / curveSteps;
        let bx = bezierPoint(p0x, p1x, p2x, p3x, t);
        let by = bezierPoint(p0y, p1y, p2y, p3y, t);
        rawPoints.push([bx, by]);
    }

    let spacing = 12; // 将采样间距从 6 增加到 12，粒子数量减半，计算量降低 75%
    let sampled = resamplePath(rawPoints, spacing);

    for (let pt of sampled) {
        particles.push({
            x: pt.x,
            y: pt.y,
            oldx: pt.x,
            oldy: pt.y
        });
    }

    for (let i = 0; i < particles.length - 1; i++) {
        let pA = particles[i];
        let pB = particles[i + 1];
        segments.push({
            p1: pA,
            p2: pB,
            restLength: p5.Vector.dist(
                createVector(pA.x, pA.y),
                createVector(pB.x, pB.y)
            )
        });
    }

    precalculatePhysics();
}

function parseSVGPath(dString, numSamples) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", dString);
    svg.appendChild(path);
    document.body.appendChild(svg);

    let len = path.getTotalLength();
    let bbox = path.getBBox();
    let points = [];

    if (len === 0 || bbox.width === 0 || bbox.height === 0) {
        document.body.removeChild(svg);
        return [[0, 1], [1, 1]];
    }

    for (let i = 0; i <= numSamples; i++) {
        let pt = path.getPointAtLength((i * len) / numSamples);
        let nx = (pt.x - bbox.x) / bbox.width;
        let ny = (pt.y - bbox.y) / bbox.height;
        points.push([nx, ny]);
    }

    document.body.removeChild(svg);
    return points;
}

function resamplePath(points, spacing) {
    let resampled = [];
    let totalLength = 0;
    let distances = [0];

    for (let i = 1; i < points.length; i++) {
        let d = dist(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1]);
        totalLength += d;
        distances.push(totalLength);
    }

    for (let d = 0; d < totalLength; d += spacing) {
        for (let i = 1; i < distances.length; i++) {
            if (distances[i] >= d) {
                let over = d - distances[i - 1];
                let segmentLength = distances[i] - distances[i - 1];
                let t = segmentLength > 0 ? over / segmentLength : 0;
                let x = lerp(points[i - 1][0], points[i][0], t);
                let y = lerp(points[i - 1][1], points[i][1], t);
                resampled.push(createVector(x, y));
                break;
            }
        }
    }

    resampled.push(
        createVector(points[points.length - 1][0], points[points.length - 1][1])
    );
    return resampled;
}

function precalculatePhysics() {
    animationFrames.push(copyParticles(particles));

    let maxSimSteps = 3000;
    let steps = 0;

    while (particles.length >= 2 && steps < maxSimSteps) {
        physicsStep();
        animationFrames.push(copyParticles(particles));
        steps++;
    }
}

function copyParticles(pts) {
    let arr = new Float32Array(pts.length * 2);
    for (let i = 0; i < pts.length; i++) {
        arr[i * 2] = pts[i].x;
        arr[i * 2 + 1] = pts[i].y;
    }
    return arr;
}

function physicsStep() {
    let lastP = particles[particles.length - 1];
    let dir = p5.Vector.sub(pullPoint, createVector(lastP.x, lastP.y));

    if (dir.mag() > 0) {
        dir.normalize();
        lastP.x += dir.x * pullSpeed;
        lastP.y += dir.y * pullSpeed;
    }

    if (lastP.y > height + 30 || lastP.x > width + 30) {
        particles.pop();
        segments.pop();
    }

    for (let p of particles) {
        if (p !== particles[particles.length - 1]) {
            let vx = (p.x - p.oldx) * friction;
            let vy = (p.y - p.oldy) * friction;
            p.oldx = p.x;
            p.oldy = p.y;
            p.x += vx;
            p.y += vy;
        } else {
            p.oldx = p.x;
            p.oldy = p.y;
        }
    }

    let iterations = 30; // 将物理迭代次数从 80 降低到 30，大幅减少 CPU 计算量
    for (let i = 0; i < iterations; i++) {
        for (let s of segments) {
            let dx = s.p2.x - s.p1.x;
            let dy = s.p2.y - s.p1.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance === 0) continue;

            let diff = (distance - s.restLength) / distance;

            let p1Fixed = s.p1 === particles[particles.length - 1];
            let p2Fixed = s.p2 === particles[particles.length - 1];
            let totalMass = (p1Fixed ? 0 : 1) + (p2Fixed ? 0 : 1);

            if (totalMass === 0) continue;

            let moveX = dx * diff * (1 / totalMass);
            let moveY = dy * diff * (1 / totalMass);

            if (!p1Fixed) {
                s.p1.x += moveX;
                s.p1.y += moveY;
            }
            if (!p2Fixed) {
                s.p2.x -= moveX;
                s.p2.y -= moveY;
            }
        }
    }
}

function draw() {
    background("#f9f9f9");

    if (minute() !== lastMinute) {
        lastMinute = minute();
        // 如果当前文字没有被拉出（在屏幕外，< 470），直接更新
        if (currentValue < 470) {
            initYarn();
            fetchUniverseText();
        } else {
            // 否则，标记为待更新，等收回后再更新，防止文字在屏幕上突然变化
            pendingMinuteUpdate = true;
        }
    }

    if (animationFrames.length === 0) return;

    updateHold();

    // 按住或拖拽时跟手；松手后稍慢地弹回 0
    let ease = isDragging ? 0.08 : 0.06;
    currentValue = lerp(currentValue, targetValue, ease);

    // 当文字被完全拉出时，标记为已拉出
    if (currentValue >= 470) {
        hasPulled = true;
    }
    // 当文字被放回到屏幕外（小于 470）
    else if (currentValue < 470) {
        // 如果之前拉出过，或者在拉出期间分钟发生了变化，则收回后立刻更新
        if (hasPulled || pendingMinuteUpdate) {
            if (pendingMinuteUpdate) {
                initYarn(); // 更新红线上的时间
            }
            hasPulled = false;
            pendingMinuteUpdate = false;
            fetchUniverseText(); // 获取新文本
        }
    }

    let maxIdx = animationFrames.length - 1;
    let frameIdx = Math.floor(map(currentValue, 0, 500, 0, maxIdx, true));
    frameIdx = constrain(frameIdx, 0, maxIdx);

    let currentFrameData = animationFrames[frameIdx];

    let firstPts = animationFrames[0];
    let startX = firstPts[0];
    let startY = firstPts[1];
    let tx = currentFrameData[0];
    let ty = currentFrameData[1];

    let numRibbons = 5; // 增加线条数量来构建虫洞网格

    let pullDist = dist(startX, startY, tx, ty);
    let pullFactor = constrain(pullDist / 400, 0, 1);

    let nextX = tx;
    let nextY = ty;
    if (currentFrameData.length >= 8) {
        nextX = currentFrameData[6];
        nextY = currentFrameData[7];
    } else if (currentFrameData.length >= 4) {
        nextX = currentFrameData[2];
        nextY = currentFrameData[3];
    }

    let tLen = dist(tx, ty, nextX, nextY);
    let dirX = tLen > 0 ? (nextX - tx) / tLen : 1;
    let dirY = tLen > 0 ? (nextY - ty) / tLen : 0;

    // 当文字开始出现时，主红线比细红线晚一点消失 (比如 475~500)
    let mainLineAlpha = map(currentValue, 475, 500, 255, 0, true);

    // 计算文字的移动轨迹 (470 到 490 时，从左侧屏幕外滑入到屏幕正中间)
    let centerLerp = map(currentValue, 470, 490, 0, 1, true);
    let easeLerp = centerLerp < 0.5 ? 2 * centerLerp * centerLerp : 1 - Math.pow(-2 * centerLerp + 2, 2) / 2;

    // 文字从最左侧（主红线最原始的起点）滑向屏幕中间
    let textX = lerp(startX, width / 2, easeLerp);
    let textY = lerp(startY, height / 2, easeLerp);

    // 计算主红线被拉直的进度 (470 到 485)
    let tautLerp = map(currentValue, 470, 485, 0, 1, true);
    let tautEase = tautLerp < 0.5 ? 2 * tautLerp * tautLerp : 1 - Math.pow(-2 * tautLerp + 2, 2) / 2;

    // 计算整根红线（包括主线）掉入洞里的进度 (485 到 500)
    let lineDropLerp = map(currentValue, 485, 500, 0, 1, true);
    let dropEase = lineDropLerp * lineDropLerp; // 二次方加速掉落

    // 定义底部吸入的“洞口”位置
    let holeX = width / 2;
    let holeY = height + 300;

    // 物理红线的顶部端点：先跟着文字，然后掉进洞里
    let stringTopX = lerp(textX, holeX, dropEase);
    let stringTopY = lerp(textY, holeY, dropEase);

    // 获取原始物理坐标
    let rawPhysX = currentFrameData.length >= 2 ? currentFrameData[0] : 0;
    let rawPhysY = currentFrameData.length >= 2 ? currentFrameData[1] : height / 2;
    let rawNextPhysX = currentFrameData.length >= 4 ? currentFrameData[2] : rawPhysX;
    let rawNextPhysY = currentFrameData.length >= 4 ? currentFrameData[3] : rawPhysY + 10;

    // 物理线目标大弧度曲线的控制点：制造一个极度平滑的“U”型悬垂大肚，消除S型扭曲
    let physTargetCx1 = stringTopX;
    let physTargetCy1 = stringTopY + (holeY - stringTopY) * 0.85;
    let physTargetCx2 = holeX;
    let physTargetCy2 = stringTopY + (holeY - stringTopY) * 0.85;

    // 物理线当前的真实起点 (先变直，再掉落)
    let currentPhysX = lerp(rawPhysX, stringTopX, tautEase);
    let currentPhysY = lerp(rawPhysY, stringTopY, tautEase);

    // 物理线当前的第二个点 (用于计算切线，消除折角)
    let t_next = 2 / Math.max(currentFrameData.length, 2);
    let targetNextX = bezierPoint(stringTopX, physTargetCx1, physTargetCx2, holeX, t_next);
    let targetNextY = bezierPoint(stringTopY, physTargetCy1, physTargetCy2, holeY, t_next);
    let currentNextPhysX = lerp(rawNextPhysX, targetNextX, tautEase);
    let currentNextPhysY = lerp(rawNextPhysY, targetNextY, tautEase);

    for (let i = 0; i < numRibbons; i++) {
        let isLongest = i === 0;

        let alpha = 255;
        if (!isLongest) {
            // 让细红线晚一点出现，快拉到文字出来前才散开
            let fadeInStart = 430;
            let fadeInEnd = 440;
            let fadeInAlpha = map(currentValue, fadeInStart, fadeInEnd, 0, 255, true);

            // 当文字开始出现时 (450~470)，细红线慢慢消失到 0
            let fadeOutStart = 450;
            let fadeOutEnd = 470;
            let fadeOutAlpha = map(currentValue, fadeOutStart, fadeOutEnd, 255, 0, true);

            alpha = Math.min(fadeInAlpha, fadeOutAlpha);
        }

        if (alpha <= 0) continue;

        let sX, sY, endX, endY, cx1, cy1, cx2, cy2;

        let targetCx1 = width * 0.85;
        let targetCy1 = height * 0.10;
        let distC2 = 400 * pullFactor;
        let targetCx2 = tx - dirX * distC2;
        let targetCy2 = ty - dirY * distC2;

        let baseCx1 = lerp(startX, targetCx1, pullFactor);
        let baseCy1 = lerp(startY, targetCy1, pullFactor);
        let baseCx2 = lerp(startX, targetCx2, pullFactor);
        let baseCy2 = lerp(startY, targetCy2, pullFactor);

        if (isLongest) {
            // 主延长线：连接文字和物理红线当前的起点
            // 当线掉落时，它的起点跟着 stringTopX/Y 一起掉进洞里，完美模拟线从文字上脱落
            sX = stringTopX;
            sY = stringTopY;
            endX = currentPhysX;
            endY = currentPhysY;

            // 计算物理线在连接处的切线方向，确保主延长线和物理线完美相切
            let dx = currentNextPhysX - currentPhysX;
            let dy = currentNextPhysY - currentPhysY;
            let len = dist(0, 0, dx, dy);
            if (len > 0) { dx /= len; dy /= len; } else { dx = 0; dy = 1; }

            let distRibbon = dist(sX, sY, endX, endY);

            // 目标控制点：制造一个向左侧饱满凸出的大 C 型弧线，让下落过程极其舒展
            let arcCx1 = sX - distRibbon * 0.6; // 向左凸出，形成大弧度
            let arcCy1 = sY + distRibbon * 0.4;

            // cx1 平滑过渡到大弧线控制点
            cx1 = lerp(baseCx1, arcCx1, tautEase);
            cy1 = lerp(baseCy1, arcCy1, tautEase);

            // 核心修复：cx2 绝对锁定在物理线的切线反方向上，保证数学上的绝对相切（C1连续）
            let baseDist = dist(endX, endY, baseCx2, baseCy2);
            // 增加控制柄长度 (0.8)，让切线处的弧度更大、更平滑，彻底消除折角感
            let currentDist = lerp(baseDist, distRibbon * 0.8, tautEase);
            cx2 = endX - dx * currentDist;
            cy2 = endY - dy * currentDist;

            // 当线掉落时，连接线不再通过透明度消失，而是跟着物理线一起往下掉
            // 我们保持它的透明度为 255（不透明）
            alpha = 255;
        } else {
            // 有机波浪/散开的丝线效果 (参考提供的图片)
            let chaoticOffset = sin(i * 13.7);
            let chaoticOffset2 = cos(i * 29.3);
            let chaoticOffset3 = sin(i * 41.1);

            // 让线条在 Y 轴上散开，作为基础分布
            let ySpread = map(i, 1, numRibbons - 1, -height * 0.8, height * 0.8);

            // 起点：在左侧散开，减小错落的幅度，显得更柔和
            sX = startX - width * 0.05 + chaoticOffset * width * 0.1 * pullFactor;
            sY = startY + ySpread + chaoticOffset2 * height * 0.1;

            // 终点：全部汇聚到文字出现的位置（奇点）
            endX = tx;
            endY = ty;

            // 控制点 1（左半段散开部分）：减小波动的幅度，让线条更平滑、优雅地交织
            cx1 = baseCx1 - width * 0.05 + chaoticOffset3 * width * 0.1 * pullFactor;
            cy1 = baseCy1 + ySpread * 0.7 + chaoticOffset * height * 0.15;

            // 控制点 2（右半段聚拢部分）：把控制点稍微往左拉一点，让汇聚的过渡更加平缓自然
            cx2 = baseCx2 - width * 0.15 * pullFactor;
            cy2 = baseCy2 + ySpread * 0.08 * chaoticOffset2;
        }

        noFill();
        strokeWeight(isLongest ? 4 : 3.5); // 强制主延长线和物理线粗细完全一致(4)，消除接缝视觉差
        strokeCap(ROUND);
        strokeJoin(ROUND);
        stroke(`rgba(230, 57, 70, ${alpha / 255})`);

        beginShape();
        vertex(sX, sY);
        bezierVertex(cx1, cy1, cx2, cy2, endX, endY);
        endShape();
    }

    // 当传入数据到达470时，文字块从左边被拉出到中间
    if (currentValue >= 470) {
        let txt = currentUniverseText;

        let textAlpha = map(currentValue, 470, 485, 0, 255, true);

        // 根据屏幕宽度自适应计算字体大小，最小 14，最大 48
        let responsiveTextSize = constrain(width * 0.025, 14, 48);
        textSize(responsiveTextSize);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        fill(`rgba(230, 57, 70, ${textAlpha / 255})`);
        noStroke();

        // 第一行只放时间，后面的词分成 2 或 3 行，总共 3 到 4 行
        let words = txt.replace(/,/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(w => w.length > 0);
        let rest = words.slice();
        let timeLine = "";
        if (rest.length >= 2 && rest[0] === "AT" && /\d/.test(rest[1])) {
            timeLine = rest[1];
            rest = rest.slice(2);
        } else if (rest.length >= 1 && /^\d{1,2}:\d{2}/.test(rest[0])) {
            timeLine = rest[0];
            rest = rest.slice(1);
        }
        let bodyCount = rest.length >= 7 ? 3 : 2;
        if (rest.length < 2) bodyCount = Math.max(rest.length, 1);
        let lines = timeLine ? [timeLine] : [];
        let size = Math.ceil(rest.length / bodyCount);
        for (let n = 0; n < bodyCount; n++) {
            let chunk = rest.slice(n * size, (n + 1) * size).join(" ");
            if (chunk) lines.push(chunk);
        }

        push();
        let spacing = responsiveTextSize * 1.8;

        // 490到495之间，文字向下平滑移动到屏幕绝对正中间，速度更快
        let textDropOffset = map(currentValue, 490, 495, spacing * 2.5, 0, true);

        // 将文字向上偏移，使其正好坐在剩余主红线的顶端，然后在最后阶段滑到正中间
        translate(textX, textY - textDropOffset);

        let startY = -spacing * (lines.length - 1) / 2;
        for (let n = 0; n < lines.length; n++) {
            text(lines[n], 0, startY + spacing * n);
        }
        pop();
    }

    // 绘制物理主红线
    noFill();
    // 物理红线也不再通过透明度消失，保持不透明
    stroke(`rgba(230, 57, 70, 1)`);
    strokeWeight(4);
    strokeJoin(ROUND);
    strokeCap(ROUND);

    beginShape();
    if (currentFrameData.length >= 2) {
        for (let i = 0; i < currentFrameData.length; i += 2) {
            let px = currentFrameData[i];
            let py = currentFrameData[i + 1];

            // 目标是一根从文字自然下垂的大弧度平滑曲线
            let t = i / currentFrameData.length;
            let targetX = bezierPoint(stringTopX, physTargetCx1, physTargetCx2, holeX, t);
            let targetY = bezierPoint(stringTopY, physTargetCy1, physTargetCy2, holeY, t);

            // 逐渐变直且平滑
            px = lerp(px, targetX, tautEase);
            py = lerp(py, targetY, tautEase);

            if (i === 0) curveVertex(px, py); // 起点控制点
            curveVertex(px, py);
            if (i === currentFrameData.length - 2) curveVertex(px, py); // 终点控制点
        }
    }
    endShape();

    drawHint();
}

function drawHint() {
    if (currentValue > 36) return;

    push();
    let hintAlpha = map(currentValue, 0, 36, 150, 0, true);
    noStroke();
    fill(230, 57, 70, hintAlpha);
    textSize(13);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text("HOLD OR DRAG TO PULL", width / 2, height - 36);
    pop();
}

function mousePressed() {
    beginDrag();
}

function mouseDragged() {
    updateDrag();
}

function mouseReleased() {
    endDrag();
}

function touchStarted() {
    beginDrag();
    return false;
}

function touchMoved() {
    updateDrag();
    return false;
}

function touchEnded() {
    endDrag();
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    pullPoint = createVector(width * 0.5, height + 100);
    updateDragSensitivity();
    initYarn();
}

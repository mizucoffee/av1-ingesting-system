const obs = new OBSWebSocket();

obs
  .connect("ws://localhost:4455", "testtest", {
    eventSubscriptions: OBSWebSocket.EventSubscription.InputVolumeMeters,
  })
  .then(firstUpdate)
  .then(update);

const onair = document.querySelector(".onair-box");

onair.addEventListener("click", async () => {
  const streamStats = await obs.call("GetStreamStatus");
  if (streamStats.outputActive) {
    if (confirm("Are you sure you want to stop streaming?")) {
      await obs.call("StopStream");
    }
  } else {
    await obs.call("StartStream");
  }
});

let vu = {
  left: -Infinity,
  leftPeak: -Infinity,
  right: -Infinity,
  rightPeak: -Infinity,
};

obs.on("InputVolumeMeters", (e) => {
  const [left, right] = e.inputs
    .find((device) => device.inputName == "Blackmagic デバイス")
    .inputLevelsMul.map((v) => [Math.log10(v[0]) * 20, Math.log10(v[1]) * 20]);

  vu.left = left[0];
  vu.right = right[0];
  vu.leftPeak = left[1];
  vu.rightPeak = right[1];
});

let lastOutputBytes = 0;
let lastOutputFrames = 0;

let lastSubmittedTime = 0;
let fpsList = [];
let count = 0;

Chart.defaults.borderColor = "#ffffff3b";

const bitrateChart = new Chart(
  document.querySelector("#bitrate-chart canvas"),
  createChart(true)
);
const fpsChart = new Chart(
  document.querySelector("#fps-chart canvas"),
  createChart(false)
);
const renderTimeChart = new Chart(
  document.querySelector("#render-time-chart canvas"),
  createChart(true)
);

document.addEventListener("dblclick", () => {
  document.documentElement.requestFullscreen();
});

async function update() {
  await fetchStats();

  setTimeout(update, 100);
}

async function firstUpdate() {
  const streamSettings = await obs.call("GetStreamServiceSettings");
  console.log(streamSettings);
  setLiveStreamSettings(streamSettings);

  const virtualCamStatus = await obs.call("GetVirtualCamStatus");
  if (!virtualCamStatus.outputActive) {
    await obs.call("StartVirtualCam");
  }
}

async function fetchStats() {
  const stats = await obs.call("GetStats");

  const streamStats = await obs.call("GetStreamStatus");
  console.log(stats);
  console.log(streamStats);

  setStats(stats);
  setLiveStreamStats(streamStats);

  if (streamStats.outputActive) {
    onair.classList.add("active");
  } else {
    onair.classList.remove("active");
  }

  const now = Date.now();

  fpsList.push(stats.activeFps);
  count++;

  if (now - lastSubmittedTime >= 1000) {
    if (fpsChart.data.datasets[0].data.length >= 30) {
      fpsChart.data.datasets[0].data.shift();
    }
    fpsChart.data.datasets[0].data.push(Math.min(...fpsList));
    fpsChart.update();

    if (bitrateChart.data.datasets[0].data.length >= 30) {
      bitrateChart.data.datasets[0].data.shift();
    }

    const duration = (streamStats.outputDuration - lastOutputFrames) / 1000;
    const mbps =
      ((streamStats.outputBytes - lastOutputBytes) * 8) / duration / 1000000;
    bitrateChart.data.datasets[0].data.push(mbps);
    bitrateChart.update();

    if (renderTimeChart.data.datasets[0].data.length >= 30) {
      renderTimeChart.data.datasets[0].data.shift();
    }
    renderTimeChart.data.datasets[0].data.push(stats.averageFrameRenderTime);
    renderTimeChart.update();

    document.querySelector("#fps-chart .value").innerHTML = `${Math.min(
      ...fpsList
    ).toFixed(0)}<span>fps</span>`;
    document.querySelector("#bitrate-chart .value").innerHTML = `${mbps.toFixed(
      2
    )}<span>Mb/s</span>`;
    document.querySelector(
      "#render-time-chart .value"
    ).innerHTML = `${stats.averageFrameRenderTime.toFixed(2)}<span>ms</span>`;

    lastSubmittedTime = now;
    fpsList = [];
    lastOutputBytes = streamStats.outputBytes;
    lastOutputFrames = streamStats.outputDuration;
    count = 0;
  }
}

const video = document.getElementById("video");
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: false,
  })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((e) => {
    console.log(e);
  });

new p5(function (p) {
  const RED = {
    on: p.color(220, 0, 0),
    off: p.color(120, 0, 0),
  };
  const YELLOW = {
    on: p.color(255, 255, 0),
    off: p.color(120, 120, 0),
  };
  const GREEN = {
    on: p.color(0, 220, 0),
    off: p.color(0, 120, 0),
  };
  p.setup = function () {
    p.createCanvas(134, 700);
  };
  p.draw = function () {
    p.background("#262730");
    for (let i = 0; i < 13; i++) {
      p.stroke(255, 130);
      p.strokeWeight(1);
      p.line(10, 10 + i * 5 * (680 / 60) + 1, 87, 10 + i * 5 * (680 / 60) + 1);
      p.noStroke();
      p.fill(255);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(`${-i * 5} dB`, 95, 10 + i * 5 * (680 / 60) + 1);
    }
    p.stroke(0);
    for (let i = 0; i < 60; i++) {
      let color = null;
      if (i <= 9) color = RED;
      else if (i <= 20) color = YELLOW;
      else color = GREEN;

      if (-Math.ceil(vu.leftPeak) == i) {
        p.fill(color.on);
      } else {
        if (-Math.ceil(vu.left) <= i) {
          p.fill(color.on);
        } else {
          p.fill(color.off);
        }
      }
      p.rect(10, 10 + i * (680 / 60) + 1, 30, 680 / 60);
      if (-Math.ceil(vu.rightPeak) == i) {
        p.fill(color.on);
      } else {
        if (-Math.ceil(vu.right) <= i) {
          p.fill(color.on);
        } else {
          p.fill(color.off);
        }
      }
      p.rect(50, 10 + i * (680 / 60) + 1, 30, 680 / 60);
    }
    p.noFill();
    p.strokeWeight(2);
    p.rect(10, 11, 30, 680);
    p.rect(50, 11, 30, 680);
  };
}, "vu-meters");

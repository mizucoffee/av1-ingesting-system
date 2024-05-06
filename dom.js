const timeCode = document.querySelector(".time-code");

const protocol = document.querySelector("#live-stats-protocol > .value");
const service = document.querySelector("#live-stats-service > .value");
const outputBytes = document.querySelector("#live-stats-output-bytes > .value");
const droppedFrames = document.querySelector(
  "#live-stats-dropped-frames > .value"
);

const renderLag = document.querySelector("#system-stats-render-lag > .value");
const encodeLag = document.querySelector("#system-stats-encode-lag > .value");
const cpu = document.querySelector("#system-stats-cpu > .value");
const ram = document.querySelector("#system-stats-ram > .value");

function setLiveStreamSettings(data) {
  service.innerText = data.streamServiceSettings.service;
  protocol.innerText = data.streamServiceSettings.protocol;
}

function setLiveStreamStats(data) {
  timeCode.textContent = data.outputTimecode;
  droppedFrames.textContent = `${data.outputSkippedFrames}/${
    data.outputTotalFrames
  } (${((data.outputSkippedFrames / data.outputTotalFrames) * 100 || 0).toFixed(
    1
  )}%)`;
  outputBytes.textContent = formatBytes(data.outputBytes);
}

function setStats(data) {
  renderLag.textContent = `${data.renderSkippedFrames}/${
    data.renderTotalFrames
  } (${((data.renderSkippedFrames / data.renderTotalFrames) * 100 || 0).toFixed(
    1
  )}%)`;
  encodeLag.textContent = `${data.outputSkippedFrames}/${
    data.outputTotalFrames
  } (${((data.outputSkippedFrames / data.outputTotalFrames) * 100 || 0).toFixed(
    1
  )}%)`;
  cpu.textContent = `${data.cpuUsage.toFixed(1)}%`;
  ram.textContent = `${formatBytes(data.memoryUsage)}`;
}

function formatBytes(bytes, decimals) {
  if (bytes == 0) return "0 Bytes";
  var k = 1024,
    dm = decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

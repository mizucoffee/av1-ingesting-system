const plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart) => {
    if (
      chart.config.options.plugins.customCanvasBackgroundColor &&
      chart.config.options.plugins.customCanvasBackgroundColor.backgroundColor
    ) {
      var ctx = chart.ctx;
      var chartArea = chart.chartArea;

      ctx.save();
      ctx.fillStyle =
        chart.config.options.plugins.customCanvasBackgroundColor.backgroundColor;
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    }
  },
};

function createChart(beginAtZero) {
  return {
    type: "line",
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        y: {
          duration: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        customCanvasBackgroundColor: {
          backgroundColor: "#W0f0f0f",
        },
      },
      scales: {
        y: {
          beginAtZero: beginAtZero,
          ticks: {
            maxTicksLimit: 5,
          },
        },
        x: {
          min: 0,
          ticks: {
            display: false,
            maxTicksLimit: 6,
          },
          grid: {
            display: true,
            drawTicks: false,
          },
        },
      },
    },
    data: {
      labels: Array.from({ length: 30 }, (_, i) => 0),
      datasets: [
        {
          data: Array.from({ length: 30 }, (_, i) => null),
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.137)",
          pointRadius: 0,
        },
      ],
    },
    plugins: [plugin],
  };
}

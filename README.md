# draggable-area-chart
area chart , Can select area with draggable y-axis lines

## Requre
- echarts3
- jquery

## Useage
``` js
var baseData = [];
function GD(x, u, a) { 
  return Math.exp(-(x - u) * (x - u) / 2 / a / a) / (a * Math.sqrt(2 * Math.PI)); 
}
for (var i = 0; i <= 100; i++) { 
  baseData.push([i, Math.ceil(10000*(GD(i, 20, 10) + 2 * GD(i, 70, 10)))]); 
}

var selectedAreaListener = function(x) {
  console.log(x.start);
  console.log(x.end);
  console.log(x.value);
}

DraggableAreaChart(docment.getElementById("#SomeDiv"), baseData, 50, 80, selectedAreaListener);
```

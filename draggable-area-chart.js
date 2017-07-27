function DraggableAreaChart(doc, data, selectedMin, selectedMax, selectedAreaListener) {
    var chart = echarts.init(doc);

    chart.selectedLineStyle = {
        normal: {
            color: 'red',
            width: 3
        }
    };

    chart.convertXToIndex = function (x) {
        if (x <= this.baseData[0][0]) return 0;
        if (x >= this.baseData[this.baseData.length - 1][0]) return this.baseData.length - 1;

        var high = this.baseData.length - 1;
        var low = 0;
        while (high - low > 1) {
            var i = Math.floor((low + high) / 2);
            if (this.baseData[i][0] <= x && x < this.baseData[i + 1][0])
                return 2 * x > this.baseData[i][0] + this.baseData[i + 1][0] ? i + 1 : i;
            if (x < this.baseData[i][0])
                high = i;
            else
                low = i + 1;
        }

        return low;
    };

    chart.baseData = data;

    chart.selectedStartIndex = selectedMin === undefined ? 0 : chart.convertXToIndex(selectedMin);
    chart.selectedStartX = chart.baseData[chart.selectedStartIndex][0];
    chart.selectedEndIndex = selectedMax === undefined ? chart.baseData.length : chart.convertXToIndex(selectedMax);
    chart.selectedEndX = chart.baseData[chart.selectedEndIndex][0];
    chart.selectedData = chart.baseData.slice(chart.selectedStartIndex, chart.selectedEndIndex + 1);


    chart.minX = chart.baseData[0][0];
    chart.maxX = chart.baseData[0][0];
    chart.minY = chart.baseData[0][1];
    chart.maxY = chart.baseData[0][1];
    for (var i = 0; i < chart.baseData.length; i++) {
        var x = chart.baseData[i][0];
        var y = chart.baseData[i][1];

        if (x > chart.maxX) chart.maxX = x;
        if (x < chart.minX) chart.minX = x;
        if (y > chart.maxY) chart.maxY = y;
        if (y < chart.minY) chart.minY = y;
    }

    chart.areas = [chart.baseData.length - 1];
    for (var i = 0; i < chart.baseData.length - 1; i++) {
        chart.areas[i] = chart.baseData[i][1] * (chart.baseData[i + 1][0] - chart.baseData[i][0])
    }

    chart.selectedArea = {
        startIndex: chart.selectedStartIndex,
        start: chart.selectedStartX,
        endIndex: chart.selectedEndIndex,
        end: chart.selectedEndX,
        value: 0
    };
    for (var i = chart.selectedStartIndex; i < chart.selectedEndIndex; i++) {
        chart.selectedArea.value += chart.areas[i];
    }
    if (selectedAreaListener) selectedAreaListener(chart.selectedArea);

    chart.updateArea = function () {
        if (chart.selectedArea.startIndex > chart.selectedStartIndex) {
            for (var i = chart.selectedStartIndex; i < chart.selectedArea.startIndex; i++)
                chart.selectedArea.value += chart.areas[i];
            chart.selectedArea.startIndex = chart.selectedStartIndex;
            chart.selectedArea.start = chart.selectedStartX;
        }
        if (chart.selectedArea.startIndex < chart.selectedStartIndex) {
            for (var i = chart.selectedArea.startIndex; i < chart.selectedStartIndex; i++)
                chart.selectedArea.value -= chart.areas[i];
            chart.selectedArea.startIndex = chart.selectedStartIndex;
            chart.selectedArea.start = chart.selectedStartX;
        }
        if (chart.selectedArea.endIndex > chart.selectedEndIndex) {
            for (var i = chart.selectedEndIndex; i < chart.selectedArea.endIndex; i++)
                chart.selectedArea.value -= chart.areas[i];
            chart.selectedArea.endIndex = chart.selectedEndIndex;
            chart.selectedArea.end = chart.selectedEndX;
        }
        if (chart.selectedArea.endIndex < chart.selectedEndIndex) {
            for (var i = chart.selectedArea.endIndex; i < chart.selectedEndIndex; i++)
                chart.selectedArea.value += chart.areas[i];
            chart.selectedArea.endIndex = chart.selectedEndIndex;
            chart.selectedArea.end = chart.selectedEndX;
        }
    };

    var option = {
            xAxis: [
                {
                    type: 'value',
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: [{type: 'value', splitLine: {show: false}}],
            series: [
                {
                    name: 'base-area',
                    type: 'line',
                    smooth: true,
                    animation: false,
                    data: chart.baseData,
                    symbol: 'none',
                    itemStyle: {
                        normal: {
                            color: 'rgb(255, 70, 131)'
                        }
                    }
                },
                {
                    name: 'select-area',
                    type: 'line',
                    smooth: true,
                    data: chart.selectedData,
                    symbol: 'none',
                    animation: false,
                    itemStyle: {
                        normal: {
                            color: 'rgb(255, 70, 131)'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(255, 158, 68)'
                            }, {
                                offset: 1,
                                color: 'rgb(255, 70, 131)'
                            }])
                        }
                    }
                },
                {
                    type: "lines",
                    name: "selected-line",
                    coordinateSystem: 'cartesian2d',
                    animation: false,
                    data: [
                        {
                            coords: [
                                [chart.selectedStartX, 0],
                                [chart.selectedStartX, chart.maxY]
                            ],
                            lineStyle: chart.selectedLineStyle
                        },
                        {
                            coords: [
                                [chart.selectedEndX, 0],
                                [chart.selectedEndX, chart.maxY]
                            ],
                            lineStyle: chart.selectedLineStyle
                        }
                    ]
                }
            ]
        }
        ;

    chart.setOption(option);

    chart.minXPixel = chart.convertToPixel('grid', [chart.minX, 0])[0];
    chart.maxXPixel = chart.convertToPixel('grid', [chart.maxX, 0])[0];
    chart.draggableAreaWidth = 10;

    chart.maxLine = {
        element: function () {
            return {
                id: 'maxLine',
                type: 'rect',
                z: 9999,
                draggable: true,
                invisible: true,
                $action: 'replace',
                shape: chart.maxLine.shape(),
                ondrag: chart.maxLine.ondrag,
                onmouseup: chart.maxLine.onmouseup
            }
        },
        shape: function () {
            return {
                x: chart.convertToPixel('grid', [chart.selectedEndX, 0])[0] - chart.draggableAreaWidth / 2,
                y: -10000,
                width: chart.draggableAreaWidth,
                height: 20000
            }
        },
        onmouseup: function (e) {
            if (e.offsetX > chart.maxX || e.offsetX < chart.minX) {
                chart.setOption({
                    graphic: {
                        elements: [chart.maxLine.element()]
                    }
                });
            }
        },
        ondrag: function (e) {
            var x = chart.convertFromPixel('grid', [e.offsetX, 0])[0];
            x = chart.convertXToIndex(x);
            chart.selectedEndIndex = x > chart.selectedStartIndex ? Math.min(x, chart.baseData.length) : chart.selectedStartIndex + 1;
            chart.selectedEndX = chart.baseData[chart.selectedEndIndex][0];
            chart.updateArea();
            if (selectedAreaListener) selectedAreaListener(chart.selectedArea);
            chart.setOption({
                series: [
                    {
                        name: 'select-area',
                        data: baseData.slice(chart.selectedStartIndex, chart.selectedEndIndex + 1)
                    },
                    {
                        name: 'selected-line',
                        data: [
                            {
                                coords: [
                                    [chart.selectedStartX, 0],
                                    [chart.selectedStartX, chart.maxY]
                                ],
                                lineStyle: chart.selectedLineStyle
                            },
                            {
                                coords: [
                                    [chart.selectedEndX, 0],
                                    [chart.selectedEndX, chart.maxY]
                                ],
                                lineStyle: chart.selectedLineStyle
                            }
                        ]
                    }
                ]
            }, false, true);
        }
    };

    chart.minLine = {
        element: function () {
            return {
                id: 'minLine',
                type: 'rect',
                z: 9999,
                draggable: true,
                invisible: true,
                $action: 'replace',
                shape: chart.minLine.shape(),
                ondrag: chart.minLine.ondrag,
                onmouseup: chart.minLine.onmouseup
            }
        },
        shape: function () {
            return {
                x: chart.convertToPixel('grid', [chart.selectedStartX, 0])[0] - chart.draggableAreaWidth / 2,
                y: -10000,
                width: chart.draggableAreaWidth,
                height: 20000
            }
        },
        onmouseup: function (e) {
            if (e.offsetX > chart.maxX || e.offsetX < chart.minX) {
                chart.setOption({
                    graphic: {
                        elements: [chart.minLine.element()]
                    }
                });
            }
        },
        ondrag: function (e) {
            var x = chart.convertFromPixel('grid', [e.offsetX, 0])[0];
            x = chart.convertXToIndex(x);
            chart.selectedStartIndex = x < chart.selectedEndIndex ? Math.max(0, x) : chart.selectedEndIndex - 1;
            chart.selectedStartX = chart.baseData[chart.selectedStartIndex][0];
            chart.updateArea();
            if (selectedAreaListener) selectedAreaListener(chart.selectedArea);
            chart.setOption(
                {
                    series: [
                        {
                            name: 'select-area',
                            data: baseData.slice(chart.selectedStartIndex, chart.selectedEndIndex + 1)
                        },
                        {
                            name: 'selected-line',
                            data: [
                                {
                                    coords: [
                                        [chart.selectedStartX, 0],
                                        [chart.selectedStartX, chart.maxY]
                                    ],
                                    lineStyle: chart.selectedLineStyle
                                },
                                {
                                    coords: [
                                        [chart.selectedEndX, 0],
                                        [chart.selectedEndX, chart.maxY]
                                    ],
                                    lineStyle: chart.selectedLineStyle
                                }
                            ]
                        }
                    ]
                }, false, true);
        }
    };

    chart.setOption({
        graphic: {elements: [chart.minLine.element(), chart.maxLine.element()]}
    });

    $(doc).mouseout(function (e) {
        chart.maxLine.onmouseup(e);
        chart.minLine.onmouseup(e);
    });

    return chart;
}

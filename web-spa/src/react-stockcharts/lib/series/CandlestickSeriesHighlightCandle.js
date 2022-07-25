

import { nest } from "d3-collection";

import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import {
	hexToRGBA, isDefined, functor, plotDataLengthBarWidth, head, getStrokeDasharray
} from "../utils";
import { last } from "lodash";

class CandlestickSeriesHighlightCandle extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	drawOnCanvas(ctx, moreProps) {
		drawOnCanvas(ctx, this.props, moreProps);
	}
	renderSVG(moreProps) {
		const { className, wickClassName, candleClassName, highlightStroke } = this.props;
		const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

		const candleData = getCandleData(this.props, xAccessor, xScale, yScale, plotData);

		return <g className={className}>
			<g className={wickClassName} key="wicks">
				{getWicksSVG(candleData)}
			</g>
			<g className={candleClassName} key="candles">
				{getCandlesSVG(this.props, candleData)}
			</g>
		</g>;
	}

	render() {
		const { clip } = this.props;
		return <GenericChartComponent
			clip={clip}
			svgDraw={this.renderSVG}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getAxisCanvas}
			drawOn={["pan"]}
		/>;
	}
}

CandlestickSeriesHighlightCandle.propTypes = {
	className: PropTypes.string,
	wickClassName: PropTypes.string,
	candleClassName: PropTypes.string,
	widthRatio: PropTypes.number,
	width: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.func
	]),
	classNames: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.string
	]),
	fill: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.string
	]),
	stroke: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.string
	]),
	wickStroke: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.string
	]),
	yAccessor: PropTypes.func,
	offsetRight: PropTypes.number,
	clip: PropTypes.bool,
	highlightStroke: PropTypes.string,
	highligthFill: PropTypes.string,
	highlightStrokeOpacity: PropTypes.number,
	highlightFillOpacity: PropTypes.number,
	highlightStrokeDashArray: PropTypes.string
};

CandlestickSeriesHighlightCandle.defaultProps = {
	className: "react-stockcharts-candlestick",
	wickClassName: "react-stockcharts-candlestick-wick",
	candleClassName: "react-stockcharts-candlestick-candle",
	yAccessor: d => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
	classNames: d => d.close > d.open ? "up" : "down",
	width: plotDataLengthBarWidth,
	wickStroke: "#000000",
	// wickStroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
	fill: d => d.close > d.open ? "#6BA583" : "#FF0000",
	// stroke: d => d.close > d.open ? "#6BA583" : "#FF0000",
	offsetRight: 15,
	stroke: "#000000",
	highlightBrightnessInc: 0.5,
	candleStrokeWidth: 0.5,
	// stroke: "none",
	widthRatio: 0.8,
	opacity: 1,
	clip: true,
	highlightCandle: [],
	highlightStroke: "#000000",
	highlightFillOpacity: 0.3,
	highlightStrokeOpacity: 1,
	highlightFill: "#ffffff",
	highlightStrokeDashArray: "ShortDash",
};

function getWicksSVG(candleData) {

	const wicks = candleData
		.map((each, idx) => {
			const d = each.wick;
			return <path key={idx}
				className={each.className}
				stroke={d.stroke}
				d={`M${d.x},${d.y1} L${d.x},${d.y2} M${d.x},${d.y3} L${d.x},${d.y4}`} />;
		});

	return wicks;
}

function getCandlesSVG(props, candleData) {

	/* eslint-disable react/prop-types */
	const { opacity, candleStrokeWidth } = props;
	/* eslint-enable react/prop-types */

	const candles = candleData.map((d, idx) => {
		if (d.width <= 1)
			return (
				<line className={d.className} key={idx}
					x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.height}
					stroke={d.fill} />
			);
		else if (d.height === 0)
			return (
				<line key={idx}
					x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y + d.height}
					stroke={d.fill} />
			);
		return (
			<rect key={idx} className={d.className}
				fillOpacity={opacity}
				x={d.x} y={d.y} width={d.width} height={d.height}
				fill={d.fill} stroke={d.stroke} strokeWidth={candleStrokeWidth} />
		);
	});
	return candles;
}

function drawOnCanvas(ctx, props, moreProps) {
	const { opacity, candleStrokeWidth, highlightPatterns, highlightBrightnessInc } = props;
	const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

	// const wickData = getWickData(props, xAccessor, xScale, yScale, plotData);
	// const highlightPatterns = highlightPatterns.map(x => new Date(x).getTime());
	const { candles: candleData, rects: highlightRects } = getCandleData(props, xAccessor, xScale, yScale, plotData, highlightPatterns);

	const wickNest = nest()
		.key(d => d.wick.stroke)
		.entries(candleData);

	wickNest.forEach(outer => {
		const { key, values } = outer;
		ctx.fillStyle = key;
		values.forEach(each => {
			ctx.fillStyle = each.isHighlighted ? increaseBrightness(key, highlightBrightnessInc) : key;
			ctx.strokeStyle = each.wick.stroke;
			let wickOffset = 0.5;
			let wickWidth = 1;
			if (each.isHighlighted) {
				wickOffset = 1;
				wickWidth = 2;
			}
			/*
			ctx.moveTo(d.x, d.y1);
			ctx.lineTo(d.x, d.y2);

			ctx.beginPath();
			ctx.moveTo(d.x, d.y3);
			ctx.lineTo(d.x, d.y4);
			ctx.stroke(); */
			const d = each.wick;

			ctx.fillRect(d.x - wickOffset, d.y1, wickWidth, d.y2 - d.y1);
			ctx.fillRect(d.x - wickOffset, d.y3, wickWidth, d.y4 - d.y3);
			// if (each.isHighlighted) {
			// 	let range = yScale.range();
			// 	let radius = yScale(0) - yScale(0.09);
			// 	let distance = yScale(0) - yScale(0.5);
			// 	// canvas_arrow(ctx, d.x - 0.5, d.y1 - 35, d.x - 0.5, d.y1 - 12);
			// 	if (d.y1 > (range[0] + range[1]) / 2) {
			// 		canvas_circle(ctx, d.x - 0.5, d.y1 - distance, radius, '#000000');
			// 	} else {
			// 		canvas_circle(ctx, d.x - 0.5, d.y4 + distance, radius, '#000000');

			// 	}
			// 	// ctx.strokeRect(d.x - wickOffset, d.y1, wickWidth, d.y2 - d.y1);
			// 	// ctx.strokeRect(d.x - wickOffset, d.y3, wickWidth, d.y4 - d.y3);
			// }
		});
	});

	// const candleData = getCandleData(props, xAccessor, xScale, yScale, plotData);

	const candleNest = nest()
		.key(d => d.stroke)
		.key(d => d.fill)
		.entries(candleData);


	candleNest.forEach(outer => {
		const { key: strokeKey, values: strokeValues } = outer;
		if (strokeKey !== "none") {
			ctx.strokeStyle = strokeKey;
			ctx.lineWidth = candleStrokeWidth;
		}
		strokeValues.forEach(inner => {
			const { key, values } = inner;
			const fillStyle = head(values).width <= 1
				? key
				: hexToRGBA(key, opacity);
			ctx.fillStyle = fillStyle;

			values.forEach(d => {
				ctx.fillStyle = d.isHighlighted ? increaseBrightness(key, highlightBrightnessInc) : key;;
				// if (d.isHighlighted) debugger
				if (d.width <= 1) {
					// <line className={d.className} key={idx} x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.height}/>
					/*
					ctx.beginPath();
					ctx.moveTo(d.x, d.y);
					ctx.lineTo(d.x, d.y + d.height);
					ctx.stroke();
					*/
					ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
				} else if (d.height === 0) {
					// <line key={idx} x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y + d.height} />
					/*
					ctx.beginPath();
					ctx.moveTo(d.x, d.y);
					ctx.lineTo(d.x + d.width, d.y + d.height);
					ctx.stroke();
					*/
					ctx.fillRect(d.x, d.y - 0.5, d.width, 1);
				} else {
					/*
					ctx.beginPath();
					ctx.rect(d.x, d.y, d.width, d.height);
					ctx.closePath();
					ctx.fill();
					if (strokeKey !== "none") ctx.stroke();
					*/
					ctx.fillRect(d.x, d.y, d.width, d.height);
					if (strokeKey !== "none") ctx.strokeRect(d.x, d.y, d.width, d.height);
				}
			});
		});
	});

	const { highlightStroke, highlightFill, highlightStrokeDashArray } = props;
	const { highlightStrokeOpacity, highlightFillOpacity } = props;
	const padding = { vertical: 8, horizontal: 2 }

	const dashArray = getStrokeDasharray(highlightStrokeDashArray)
		.split(",")
		.map(d => +d);

	ctx.strokeStyle = hexToRGBA(highlightStroke, highlightStrokeOpacity);
	ctx.fillStyle = hexToRGBA(highlightFill, highlightFillOpacity);
	ctx.setLineDash(dashArray);

	highlightRects.forEach(rect => {
		drawHighlightRect(ctx, rect, padding);
	})
}
/*
function getWickData(props, xAccessor, xScale, yScale, plotData) {

	const { classNames: classNameProp, wickStroke: wickStrokeProp, yAccessor } = props;
	const wickStroke = functor(wickStrokeProp);
	const className = functor(classNameProp);
	const wickData = plotData
			.filter(d => isDefined(yAccessor(d).close))
			.map(d => {
				// console.log(yAccessor);
				const ohlc = yAccessor(d);

				const x = Math.round(xScale(xAccessor(d))),
					y1 = yScale(ohlc.high),
					y2 = yScale(Math.max(ohlc.open, ohlc.close)),
					y3 = yScale(Math.min(ohlc.open, ohlc.close)),
					y4 = yScale(ohlc.low);

				return {
					x,
					y1,
					y2,
					y3,
					y4,
					className: className(ohlc),
					direction: (ohlc.close - ohlc.open),
					stroke: wickStroke(ohlc),
				};
			});
	return wickData;
}
*/

function canvas_arrow(ctx, fromx, fromy, tox, toy) {
	const headlen = 10; // length of head in pixels
	const dx = tox - fromx;
	const dy = toy - fromy;
	const angle = Math.atan2(dy, dx);
	const origWidth = ctx.lineWidth;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	ctx.stroke();
	ctx.lineWidth = origWidth;
}

function canvas_circle(ctx, centerX, centerY, radius, stroke) {
	const origWidth = ctx.lineWidth;
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = stroke;
	ctx.strokeStyle = stroke;
	ctx.fill();
	ctx.lineWidth = origWidth;
}

function getCandleData(props, xAccessor, xScale, yScale, plotData, highlightPatterns) {

	const { wickStroke: wickStrokeProp, offsetRight } = props;
	const wickStroke = functor(wickStrokeProp);

	const { classNames, fill: fillProp, stroke: strokeProp, yAccessor } = props;
	const className = functor(classNames);

	const fill = functor(fillProp);
	const stroke = functor(strokeProp);

	const widthFunctor = functor(props.width);
	const width = widthFunctor(props, {
		xScale,
		xAccessor,
		plotData
	});

	/*
	const candleWidth = Math.round(width);
	const offset = Math.round(candleWidth === 1 ? 0 : 0.5 * width);
	*/
	const trueOffset = 0.5 * width;
	const offset = trueOffset > 0.7
		? Math.round(trueOffset)
		: Math.floor(trueOffset);

	// eslint-disable-next-line prefer-const
	let candles = [];
	let rects = [];
	let isCurrentHighlighted = [];

	for (let i = 0; i < plotData.length; i++) {
		const d = plotData[i];
		if (isDefined(yAccessor(d).close)) {
			const x = Math.round(xScale(xAccessor(d)));// - offsetRight;
			// const x = Math.round(xScale(xAccessor(d)) - offset);

			const ohlc = yAccessor(d);
			const y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
			const height = Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close)));
			isCurrentHighlighted = isHighlighted(d, highlightPatterns);

			candles.push({
				// type: "line"
				x: x - offset,
				y: y,
				wick: {
					stroke: wickStroke(ohlc),
					x: x,
					y1: Math.round(yScale(ohlc.high)),
					y2: y,
					y3: y + height, // Math.round(yScale(Math.min(ohlc.open, ohlc.close))),
					y4: Math.round(yScale(ohlc.low)),
				},
				height: height,
				width: offset * 2,
				className: className(ohlc),
				fill: fill(ohlc),
				stroke: stroke(ohlc),
				direction: (ohlc.close - ohlc.open),
				isHighlighted: isCurrentHighlighted ? true : false
			});

			let patterns = getPatterns(d, highlightPatterns);
			if (patterns) {
				let appendRects = patterns.map(patternObj => {
					let pattern = patternObj['candles']
					let currentRect = {};
					currentRect['start'] = pattern[0];
					currentRect['max'] = {
						high: pattern[0].high,
						low: pattern[0].low
					}
					currentRect['end'] = pattern[pattern.length - 1];
					currentRect['end']['index'] = d['idx']['index'] + pattern.length - 1;
					for (let i = 1; i < pattern.length; ++i) {
						if (currentRect['max'].high < pattern[i].high)
							currentRect['max'].high = pattern[i].high;
						if (currentRect['max'].low > pattern[i].low)
							currentRect['max'].low = pattern[i].low;
					}
					return {
						x: x - offset,
						y: Math.round(yScale(currentRect['max'].high)),
						width: xScale(currentRect['end']['index']) - xScale(xAccessor(d)) + 2 * offset,
						height: Math.abs(yScale(currentRect['max'].high) - yScale(currentRect['max'].low))
					}
				});
				rects = rects.concat(appendRects);
			}
		}
	}

	return { candles, rects };
}

function isHighlighted(d, highlightPatterns) {
	let patterns = highlightPatterns.find(x => x['candles'].find(y => y.date == d.date));
	if (!patterns)
		return null;
	return patterns;
}

function getPatterns(d, highlightPatterns) {
	let patterns = highlightPatterns.filter(x => x['candles'][0].date == d.date);
	if (!patterns || patterns.length <= 0)
		return null;
	return patterns;
}

function increaseBrightness(hex, percent) {
	// strip the leading # if it's there
	percent = percent * 100;
	hex = hex.replace(/^\s*#|\s*$/g, "");

	// convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
	if (hex.length == 3) {
		hex = hex.replace(/(.)/g, "$1$1");
	}

	let r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);

	return "#" +
		((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function drawHighlightRect(ctx, rect, padding = { vertical: 0, horizontal: 0 }) {
	if (rect) {
		let { x, y, height, width } = rect;
		x = x - padding.horizontal;
		y = y - padding.vertical;
		width = width + 2 * padding.horizontal;
		height = height + 2 * padding.vertical;

		ctx.beginPath();
		ctx.fillRect(x, y, width, height);
		ctx.strokeRect(x, y, width, height);
	}
}

export default CandlestickSeriesHighlightCandle;

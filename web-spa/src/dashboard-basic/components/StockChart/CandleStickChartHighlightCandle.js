
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart, ZoomButtons } from "../../../react-stockcharts";
import {
	BarSeries,
	BollingerSeries,
	CandlestickSeries,
	CandlestickSeriesWithAnnotation,
	CandlestickSeriesHighlightCandle,
	LineSeries,
	StochasticSeries,
} from "../../../react-stockcharts/lib/series";
import { XAxis, YAxis } from "../../../react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "../../../react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "../../../react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	BollingerBandTooltip,
	StochasticTooltip,
	GroupTooltip,
	HoverTooltip
} from "../../../react-stockcharts/lib/tooltip";
import { ema, stochasticOscillator, bollingerBand } from "../../../react-stockcharts/lib/indicator";
import { fitWidth } from "../../../react-stockcharts/lib/helper";
import { last } from "../../../react-stockcharts/lib/utils";
import { LabelAnnotation, Label, Annotate } from "../../../react-stockcharts/lib/annotation";
import { Brush } from "../../../react-stockcharts/lib/interactive";
import Helper from "../../../common/helper";
import patternMap from "../../../common/patternMap";
import { noop } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCross } from "@fortawesome/free-solid-svg-icons";

const bbAppearance = {
	stroke: {
		top: "#964B00",
		middle: "#FF6600",
		bottom: "#964B00",
	},
	fill: "#4682B4"
};
const stoAppearance = {
	stroke: Object.assign({},
		StochasticSeries.defaultProps.stroke,
		{ top: "#37a600", middle: "#b8ab00", bottom: "#37a600" })
};

const candleAppearance = {
	stroke: d => d.close > d.open ? "#46ad82" : "#ff3737",
	wickStroke: d => d.close > d.open ? "#46ad82" : "#ff3737",
	fill: d => d.close > d.open ? "#46ad82" : "#ff3737"
};

const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

class CandleStickChartHighlightCandle extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			suffix: 1
		}

		this.xExtentsZoom = null;
		this.saveNode = this.saveNode.bind(this);
		this.resetYDomain = this.resetYDomain.bind(this);
		this.handleReset = this.handleReset.bind(this);
		this.annotationProps = {
			fontFamily: "Arial",
			fontSize: 25,
			fill: d => d.fillAnnotation,
			opacity: 0.8,
			text: "\u{1F82F}",
			y: ({ yScale }) => yScale.range()[1] - 25,
			x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
			onClick: (e) => this.zoomOnClickAnnotation(e['datum']),
			tooltip: (d) => d.patternTitle,
			onMouseOver: e => console.log(e),
		};
		this.annotationConfirmProps = {
			fontFamily: "fontawesome",
			fontSize: 18,
			fill: d => d.confirmation ? '#28a745' : '#dc3545',
			stroke: '#00000000',
			opacity: 0.8,
			text: d => d.confirmation ? "" : "",			// fa-check and fa-times fontawesome 4.7
			y: ({ yScale }) => yScale.range()[1] - 5,
			x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
			onClick: (e) => this.zoomOnClickAnnotation(e['datum']),
			tooltip: (d) => d.patternTitle,
			onMouseOver: e => console.log(e),
		};
		this.focusCandle = null;
		this.patternCount = {};
		this.forceReset = false;
		this.renderCount = 0;
	}

	zoomOnClickAnnotation(datum) {
		let newStart = datum['idx']['index'] + 62;
		let newEnd = newStart - 125;
		newEnd = newEnd >= 0 ? newEnd : 0;
		this.xExtentsZoom = [newStart, newEnd];
		this.setState({
			suffix: this.state.suffix + 1
		});
	}

	zoomOnClickTooltip(tooltipKey, highlightPatterns) {
		let pattern = highlightPatterns.findLast(pattern => pattern && pattern['type'] == tooltipKey);
		if (pattern) {
			this.focusCandle = pattern['annotation'];
			this.setState({
				suffix: this.state.suffix + 1
			});
		}
	}

	saveNode(node) {
		this.node = node;
	}
	resetYDomain() {
		this.node.resetYDomain();
	}
	handleReset() {
		this.forceReset = true;
		this.setState({
			suffix: this.state.suffix + 1
		});
	}

	tooltipContent(ys) {
		return ({ currentItem, xAccessor }) => {
			return {
				x: dateFormat(xAccessor(currentItem)),
				y: [
					// {
					// 	label: "open",
					// 	value: currentItem.open && numberFormat(currentItem.open)
					// },
					// {
					// 	label: "high",
					// 	value: currentItem.high && numberFormat(currentItem.high)
					// },
					// {
					// 	label: "low",
					// 	value: currentItem.low && numberFormat(currentItem.low)
					// },
					// {
					// 	label: "close",
					// 	value: currentItem.close && numberFormat(currentItem.close)
					// }
				]
					.concat(
						ys.map(each => ({
							label: each.label,
							value: each.value(currentItem),
							stroke: each.stroke
						}))
					)
					.filter(line => line.value)
			};
		};
	}

	isAnnoted(highlightPatterns, d) {
		let patterns = highlightPatterns.filter(x => x['annotation']?.date == d.date);
		if (!patterns)
			return false;
		let results = patterns.map(pattern => {
			// let datePattern = Helper.getMedium(pattern, 0, pattern.length - 2);
			let result = pattern['annotation'].date == d.date;
			if (result) {
				d.fillAnnotation = patternMap[pattern['type']]?.stroke;
				d.patternTitle = patternMap[pattern['type']]?.titleEn;
				return true;
			}
			return false;
		});
		return results.find(x => x == true);
	}

	isAnnotedConfirmation(highlightPatterns, d) {
		let patterns = highlightPatterns.filter(x => x['annotation']?.date == d.date);
		if (!patterns)
			return false;
		let results = patterns.map(pattern => {
			// let datePattern = Helper.getMedium(pattern, 0, pattern.length - 2);
			let result = pattern['annotation'].date == d.date;
			if (result && typeof(pattern['confirmation']) === 'boolean') {
				d.confirmation = pattern['confirmation']
				d.patternTitle = patternMap[pattern['type']]?.titleEn;
				return true;
			}
			return false;
		});
		return results.find(x => x == true);
	}

	render() {
		const that = this;
		const totalHeight = 700;
		const priceHeight = 600;
		const volHeight = totalHeight - priceHeight;
		const { type, data: initialData, width, ratio, highlightPatterns, code, highlightOptions, focusPattern } = this.props;
		let { mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp } = this.props;
		const margin = { left: 50, right: 70, top: 30, bottom: 30 };

		const gridHeight = totalHeight - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const showGrid = true;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 } : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		// const ema20 = ema()
		// 	.id(0)
		// 	.options({ windowSize: 20 })
		// 	.merge((d, c) => { d.ema20 = c; })
		// 	.accessor(d => d.ema20);

		// const ema50 = ema()
		// 	.id(2)
		// 	.options({ windowSize: 50 })
		// 	.merge((d, c) => { d.ema50 = c; })
		// 	.accessor(d => d.ema50);

		// const bb = bollingerBand()
		// 	.merge((d, c) => {d.bb = c;})
		// 	.accessor(d => d.bb);


		// const calculatedData = ema20(ema50(initialData));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);
		let defaultStart = xAccessor(last(data)) + 1.5;
		let defaultEnd = xAccessor(data[Math.max(0, data.length - 125)]);
		let start = defaultStart;
		let end = defaultEnd;
		if (!this.forceReset) {
			if (focusPattern) {
				let annotation = focusPattern['annotation'];
				let range = (focusPattern['candles'].length - 1) < 125 ? 125 : focusPattern['candles'].length + 20;

				let newStart = xAccessor(data.find(x => x.date == annotation.date)) + range / 2;
				let newEnd = newStart - range;
				if (newStart <= defaultStart) {
					start = newStart;
					end = newEnd >= 0 ? newEnd : 0;
				}
			}
			if (this.xExtentsZoom) {
				if (this.xExtentsZoom[0] <= defaultStart) {
					start = this.xExtentsZoom[0];
					end = this.xExtentsZoom[1];
				} else {
					start = defaultStart;
					end = defaultEnd;
				}
				this.xExtentsZoom = null;
			}
			if (this.focusCandle) {
				let newStart = xAccessor(data.find(x => x.date == this.focusCandle.date)) + 62;
				let newEnd = newStart - 125;
				if (newStart <= defaultStart) {
					start = newStart;
					end = newEnd >= 0 ? newEnd : 0;
				} else {
					start = defaultStart;
					end = defaultEnd;
				}
				this.focusCandle = null;
			}
		}
		this.forceReset = false;
		let xExtents = [start, end];
		console.log(++this.renderCount);
		if (highlightPatterns && highlightPatterns.length > 0) {
			this.patternCount = {};
			highlightPatterns.forEach(pattern => {
				let patternKey = pattern['type'];
				if (patternKey in that.patternCount)
					that.patternCount[patternKey]++;
				else
					that.patternCount[patternKey] = 1;
			})
		}

		return (
			<ChartCanvas
				ref={this.saveNode}
				height={totalHeight}
				width={width}
				ratio={ratio}
				margin={margin}
				mouseMoveEvent={mouseMoveEvent}
				panEvent={panEvent}
				zoomEvent={zoomEvent}
				clamp={clamp}
				zoomAnchor={zoomAnchor}
				type={type}
				seriesName={`${code}_${this.state.suffix}`}
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>
				{/* <Label x={margin.right + 20} y={30}
					fontSize={20} text={code} /> */}
				<Chart id={1} height={priceHeight}
					yExtents={[d => [d.high, d.low]]}
					padding={{ top: 120, bottom: 150 }}
				>
					<YAxis axisAt="right" orient="right" ticks={10}
						stroke="#000000" zoomEnabled={zoomEvent} {...yGrid} />
					<XAxis axisAt="bottom" orient="bottom"
						stroke="#000000" opacity={0.2} zoomEnabled={zoomEvent} {...xGrid} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeriesHighlightCandle
						{...candleAppearance}
						highlightPatterns={highlightPatterns}
						highlightBrightnessInc={0.7}
						offsetRight={15} />

					{/* <LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
					<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} /> */}

					{/* <BollingerSeries yAccessor={d => d.bb}
						{...bbAppearance} /> */}
					{/* <CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
					<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} /> */}

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#46ad82" : "#DB0000"} />

					{/* <Brush
						// ref={this.saveInteractiveNode(3)}
						enabled={true}
						type={"2D"}
						// onBrush={this.handleBrush3}
					/> */}

					<OHLCTooltip origin={[-40, -10]} />
					{/* <MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema20.accessor(),
								type: ema20.type(),
								stroke: ema20.stroke(),
								windowSize: ema20.options().windowSize,
							},
							{
								yAccessor: ema50.accessor(),
								type: ema50.type(),
								stroke: ema50.stroke(),
								windowSize: ema50.options().windowSize,
							},
						]}
					/> */}
					<GroupTooltip
						layout="vertical"
						origin={[-38, 15]}
						verticalSize={20}
						onClick={options => this.zoomOnClickTooltip(options['tooltipKey'], highlightPatterns)}
						options={highlightOptions.filter(options => options).slice(0, 4).map(options => ({
							yAccessor: () => this.patternCount[options] ?? '0',
							yLabel: patternMap[options]?.titleEn,
							valueFill: patternMap[options]?.stroke,
							withShape: true,
							width: 100,
							tooltipKey: options,
						}))}
						displayFormat={n => Math.round(n)?.toString() ?? '0'}
					/>
					<GroupTooltip
						layout="vertical"
						origin={[120, 15]}
						verticalSize={20}
						onClick={options => this.zoomOnClickTooltip(options['tooltipKey'], highlightPatterns)}
						options={highlightOptions.filter(options => options).slice(4, 8).map(options => ({
							yAccessor: () => this.patternCount[options] ?? '0',
							yLabel: patternMap[options]?.titleEn,
							valueFill: patternMap[options]?.stroke,
							withShape: true,
							width: 100,
						}))}
						displayFormat={n => Math.round(n)?.toString() ?? '0'}
					/>
					<GroupTooltip
						layout="vertical"
						origin={[278, 15]}
						verticalSize={20}
						onClick={options => this.zoomOnClickTooltip(options['tooltipKey'], highlightPatterns)}
						options={highlightOptions.filter(options => options).slice(8, 12).map(options => ({
							yAccessor: () => this.patternCount[options] ?? '0',
							yLabel: patternMap[options]?.titleEn,
							valueFill: patternMap[options]?.stroke,
							withShape: true,
							width: 100,
						}))}
						displayFormat={n => Math.round(n)?.toString() ?? '0'}
					/>
					{/* <Annotate
						with={LabelAnnotation}
						when={(d) => d.date.getDate() == 25}
						usingProps={annotationProps}
					/> */}
					<Annotate
						with={LabelAnnotation}
						when={(d) => this.isAnnoted(highlightPatterns, d)}
						usingProps={this.annotationProps}
					/>
					<Annotate
						with={LabelAnnotation}
						when={(d) => this.isAnnotedConfirmation(highlightPatterns, d)}
						usingProps={this.annotationConfirmProps}
					/>
					<ZoomButtons
						onReset={this.handleReset}
					/>
					{/* <HoverTooltip
						yAccessor={ema50.accessor()}
						tooltipContent={this.tooltipContent([
							{
								label: `${ema20.type()}(${ema20.options()
									.windowSize})`,
								value: d => numberFormat(ema20.accessor()(d)),
								stroke: ema20.stroke()
							},
							{
								label: `${ema50.type()}(${ema50.options()
									.windowSize})`,
								value: d => numberFormat(ema50.accessor()(d)),
								stroke: ema50.stroke()
							}
						])}
						fontSize={15}
					/> */}
				</Chart>
				<Chart id={2}
					yExtents={d => d.volume}
					height={volHeight} origin={(w, h) => [0, h - 150]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}
						zoomEnabled={zoomEvent} stroke="#000000" />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries
						yAccessor={d => d.volume}
						fill={d => d.close > d.open ? "#6BA583" : "#DB0000"}
						opacity={0.7} />
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}
CandleStickChartHighlightCandle.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
	mouseMoveEvent: PropTypes.bool,
	panEvent: PropTypes.bool,
	zoomEvent: PropTypes.bool,
	clamp: PropTypes.bool
};

CandleStickChartHighlightCandle.defaultProps = {
	type: "hybrid",
	mouseMoveEvent: true,
	panEvent: true,
	zoomEvent: true,
	clamp: false,
};
CandleStickChartHighlightCandle = fitWidth(CandleStickChartHighlightCandle);

export default CandleStickChartHighlightCandle;


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

const annotationProps = {
	fontFamily: "Arial",
	fontSize: 25,
	fill: "#060F8F",
	opacity: 0.8,
	text: "\u{1F82F}",
	y: ({ yScale }) => yScale.range()[1] - 10,
	onClick: (e) => console.log(e),
	tooltip: (d) => timeFormat("%B")(d.date),
	onMouseOver: e => console.log(e),
};

const dateFormat = timeFormat("%Y-%m-%d");
const numberFormat = format(".2f");

class CandleStickChartHighlightCandle extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			suffix: 1
		}

		this.saveNode = this.saveNode.bind(this);
		this.resetYDomain = this.resetYDomain.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	saveNode(node) {
		this.node = node;
	}
	resetYDomain() {
		this.node.resetYDomain();
	}
	handleReset() {
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

	render() {
		const totalHeight = 700;
		const priceHeight = 600;
		const volHeight = totalHeight - priceHeight;
		const { type, data: initialData, width, ratio, highlightCandle, code } = this.props;
		let { mouseMoveEvent, panEvent, zoomEvent, zoomAnchor, clamp } = this.props;
		const margin = { left: 50, right: 70, top: 20, bottom: 30 };

		const gridHeight = totalHeight - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const showGrid = true;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 } : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		const ema20 = ema()
			.id(0)
			.options({ windowSize: 20 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => { d.ema50 = c; })
			.accessor(d => d.ema50);

		// const bb = bollingerBand()
		// 	.merge((d, c) => {d.bb = c;})
		// 	.accessor(d => d.bb);


		const calculatedData = ema20(ema50(initialData));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 125)]);
		const xExtents = [start, end];

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
					yExtents={[d => [d.high, d.low], ema20.accessor(), ema50.accessor()]}
					padding={{ top: 120, bottom: 150 }}
				>
					<YAxis axisAt="right" orient="right" ticks={10}
						stroke="#000000" zoomEnabled={zoomEvent} {...yGrid}/>
					<XAxis axisAt="bottom" orient="bottom" 
						stroke="#000000" opacity={0.2} zoomEnabled={zoomEvent} {...xGrid} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeriesHighlightCandle
						{...candleAppearance}
						highlightCandle={highlightCandle}
						highlightStroke="#000000"
						highlightBrightnessInc={0.7} />

					<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()} />
					<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()} />

					{/* <BollingerSeries yAccessor={d => d.bb}
						{...bbAppearance} /> */}
					<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
					<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#46ad82" : "#DB0000"} />

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
						verticalSize={25}
						onClick={e => console.log(e)}
						options={[
							{
								yAccessor: ema20.accessor(),
								yLabel: `${ema20.type()}(${ema20.options().windowSize})`,
								valueFill: ema20.stroke(),
								withShape: true,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `${ema50.type()}(${ema50.options().windowSize})`,
								valueFill: ema50.stroke(),
								withShape: true,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `Three White Soliders`,
								valueFill: ema50.stroke(),
								withShape: true,
								width: 100,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `Three White Soliders`,
								valueFill: ema50.stroke(),
								withShape: true,
								width: 100,
							}
						]}
					/>
					<GroupTooltip
						layout="vertical"
						origin={[120, 15]}
						verticalSize={25}
						onClick={e => console.log(e)}
						options={[
							{
								yAccessor: ema20.accessor(),
								yLabel: `${ema20.type()}(${ema20.options().windowSize})`,
								valueFill: ema20.stroke(),
								withShape: true,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `${ema50.type()}(${ema50.options().windowSize})`,
								valueFill: ema50.stroke(),
								withShape: true,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `Three White Soliders`,
								valueFill: ema50.stroke(),
								withShape: true,
								width: 100,
							},
							{
								yAccessor: ema50.accessor(),
								yLabel: `Three White Soliders`,
								valueFill: ema50.stroke(),
								withShape: true,
								width: 100,
							}
						]}
					/>
					{/* <Annotate
						with={LabelAnnotation}
						when={(d) => d.date.getDate() == 25}
						usingProps={annotationProps}
					/> */}
					<Annotate
						with={LabelAnnotation}
						when={(d) => highlightCandle.includes(d.date)}
						usingProps={annotationProps}
					/>
					<ZoomButtons
						onReset={this.handleReset}
					/>
					<HoverTooltip
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
					/>
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

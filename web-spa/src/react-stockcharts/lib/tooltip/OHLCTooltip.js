

import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class OHLCTooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const { displayValuesFor } = this.props;
		const {
			xDisplayFormat,
			accessor,
			volumeFormat,
			ohlcFormat,
			percentFormat,
			displayTexts
		} = this.props;

		const { chartConfig: { width, height } } = moreProps;
		const { displayXAccessor } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);

		let displayDate, open, high, low, close, volume, percent, change, amp;
		displayDate = open = high = low = close = volume = percent = change = amp = displayTexts.na;

		if (isDefined(currentItem) && isDefined(accessor(currentItem))) {
			const item = accessor(currentItem);
			volume = isDefined(item.volume) ? volumeFormat(item.volume) : displayTexts.na;

			displayDate = xDisplayFormat(displayXAccessor(item));
			open = ohlcFormat(item.open);
			high = ohlcFormat(item.high);
			low = ohlcFormat(item.low);
			close = ohlcFormat(item.close);
			percent = percentFormat((item.close - item.open) / item.open);
			change = calcPercentChange(item.open, item.close),
			amp = calcPercentChange(item.low, item.high)
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const itemsToDisplay = {
			displayDate,
			open,
			high,
			low,
			close,
			percent,
			volume,
			change,
			amp,
			x,
			y
		};
		return this.props.children(this.props, moreProps, itemsToDisplay);
	}
	render() {
		return (
			<GenericChartComponent
				clip={false}
				svgDraw={this.renderSVG}
				drawOn={["mousemove"]}
			/>
		);
	}
}

OHLCTooltip.propTypes = {
	className: PropTypes.string,
	accessor: PropTypes.func,
	xDisplayFormat: PropTypes.func,
	children: PropTypes.func,
	volumeFormat: PropTypes.func,
	percentFormat: PropTypes.func,
	ohlcFormat: PropTypes.func,
	origin: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	onClick: PropTypes.func,
	displayValuesFor: PropTypes.func,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	displayTexts: PropTypes.object,
};

const displayTextsDefault = {
	d: "Date: ",
	o: " O: ",
	h: " H: ",
	l: " L: ",
	c: " C: ",
	v: " Vol: ",
	p: " Change: ",
	a: " Amplitude: ",
	na: "n/a"
};

function calcPercentChange(before, after) {
	let fbefore = parseFloat(before);
	let fafter = parseFloat(after);

	if (isNaN(fbefore) || isNaN(fafter)) {
		return '';
	} else {
		return Math.round((fafter - fbefore) * 100 / fbefore * 100) / 100;
	}
}

OHLCTooltip.defaultProps = {
	accessor: d => {
		return {
			date: d.date,
			open: d.open,
			high: d.high,
			low: d.low,
			close: d.close,
			volume: d.volume,
		};
	},
	xDisplayFormat: timeFormat("%Y-%m-%d"),
	volumeFormat: format(".4s"),
	percentFormat: format(".2%"),
	ohlcFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 0],
	children: defaultDisplay,
	displayTexts: displayTextsDefault,
};

function defaultDisplay(props, moreProps, itemsToDisplay) {

	/* eslint-disable */
	const {
		className,
		textFill,
		labelFill,
		onClick,
		fontFamily,
		fontSize,
		displayTexts
	} = props;
	/* eslint-enable */

	const {
		displayDate,
		open,
		high,
		low,
		close,
		volume,
		change,
		amp,
		x,
		y
	} = itemsToDisplay;
	return (
		<g
			className={`react-stockcharts-tooltip-hover ${className}`}
			transform={`translate(${x}, ${y})`}
			onClick={onClick}
		>
			<ToolTipText
				x={0}
				y={0}
				fontFamily={fontFamily}
				fontSize={fontSize}
			>
				<ToolTipTSpanLabel
					fill={labelFill}
					key="label"
					x={0}
					dy="5">{displayTexts.d}</ToolTipTSpanLabel>
				<tspan key="value" fill={textFill}>{displayDate}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_O">{displayTexts.o}</ToolTipTSpanLabel>
				<tspan key="value_O" fill={textFill}>{open}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_H">{displayTexts.h}</ToolTipTSpanLabel>
				<tspan key="value_H" fill={textFill}>{high}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_L">{displayTexts.l}</ToolTipTSpanLabel>
				<tspan key="value_L" fill={textFill}>{low}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_C">{displayTexts.c}</ToolTipTSpanLabel>
				<tspan key="value_C" fill={textFill}>{close}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_Vol">{displayTexts.v}</ToolTipTSpanLabel>
				<tspan key="value_Vol" fill={textFill}>{volume}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_Change">{displayTexts.p}</ToolTipTSpanLabel>
				<tspan key="value_Change" fill={textFill}>{`${change}%`}</tspan>
				<ToolTipTSpanLabel fill={labelFill} key="label_Amp">{displayTexts.a}</ToolTipTSpanLabel>
				<tspan key="value_Amp" fill={textFill}>{`${amp}%`}</tspan>
			</ToolTipText>
		</g>
	);
}

export default OHLCTooltip;

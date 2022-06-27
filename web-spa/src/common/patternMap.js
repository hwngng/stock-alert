import hammerCandle from '../dashboard-basic/candle-patterns/hammer';
import invertedHammerCandle from '../dashboard-basic/candle-patterns/invertedHammer';
import morningStar from '../dashboard-basic/candle-patterns/morningStar';
import eveningStar from '../dashboard-basic/candle-patterns/eveningStar';
import bullishEngulfing from '../dashboard-basic/candle-patterns/bullishEngulfing';
import bearishEngulfing from '../dashboard-basic/candle-patterns/bearishEngulfing';
import threeWhiteSoldiers from '../dashboard-basic/candle-patterns/threeWhiteSoldiers';
import threeBlackCrows from '../dashboard-basic/candle-patterns/threeBlackCrows';

const patternMap = {
	hammerCandle: {
		titleEn: 'Hammer',
		titleVi: '',
		stroke: '#ffc0cb',
		fn: hammerCandle
	},
	invertedHammerCandle: {
		titleEn: 'Inverted Hammer',
		titleVi: '',
		stroke: '#ff69b4',
		fn: invertedHammerCandle
	},
	morningStar: {
		titleEn: 'Morning Star',
		titleVi: '',
		stroke: '#ffdab9',
		fn: morningStar
	},
	eveningStar: {
		titleEn: 'Evening Star',
		titleVi: '',
		stroke: '#7fffd4',
		fn: eveningStar
	},
	bullishEngulfing: {
		titleEn: 'Bullish Engulfing',
		titleVi: '',
		stroke: '#ee82ee',
		fn: bullishEngulfing
	},
	bearishEngulfing: {
		titleEn: 'Bearish Engulfing',
		titleVi: '',
		stroke: '#87ceeb',
		fn: bearishEngulfing
	},
	threeWhiteSoldiers: {
		titleEn: 'Three White Soldiers',
		titleVi: '',
		stroke: '#90ee90',
		fn: threeWhiteSoldiers
	},
	threeBlackCrows: {
		titleEn: 'Three Black Crows',
		titleVi: '',
		stroke: '#dda0dd',
		fn: threeBlackCrows
	}
}

export default patternMap;
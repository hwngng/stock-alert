import hammerCandle from '../dashboard-basic/candle-patterns/hammer';
import invertedHammerCandle from '../dashboard-basic/candle-patterns/invertedHammer';
import morningStar from '../dashboard-basic/candle-patterns/morningStar';
import eveningStar from '../dashboard-basic/candle-patterns/eveningStar';
import { bullishEngulfing, bearishEngulfing } from '../dashboard-basic/candle-patterns/engulfing';
import threeWhiteSoldiers from '../dashboard-basic/candle-patterns/threeWhiteSoldiers';
import threeBlackCrows from '../dashboard-basic/candle-patterns/threeBlackCrows';
import { piercing } from '../dashboard-basic/candle-patterns/piercing';
import { whiteMarubozu, blackMarubozu } from '../dashboard-basic/candle-patterns/marubozu';
import { threeInsideUp, threeInsideDown } from '../dashboard-basic/candle-patterns/threeInside';

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
	},
	piercing: {
		titleEn: 'Piercing',
		titleVi: '',
		stroke: '#ffff54',
		fn: piercing
	},
	whiteMarubozu: {
		titleEn: 'White Marubozu',
		titleVi: '',
		stroke: '#db7093',
		fn: whiteMarubozu
	},
	blackMarubozu: {
		titleEn: 'Black Marubozu',
		titleVi: '',
		stroke: '#1e90ff',
		fn: blackMarubozu
	},
	threeInsideUp: {
		titleEn: 'Three Inside Up',
		titleVi: '',
		stroke: '#ff00ff',
		fn: threeInsideUp
	},
	threeInsideDown: {
		titleEn: 'Three Inside Down',
		titleVi: '',
		stroke: '#ff6347',
		fn: threeInsideDown
	}
}

export default patternMap;
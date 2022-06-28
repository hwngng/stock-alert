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
import { bullishHarami, bearishHarami } from '../dashboard-basic/candle-patterns/harami';
import { tweezerBottom, tweezerTop } from '../dashboard-basic/candle-patterns/tweezer';
import { threeOutsideDown, threeOutsideUp } from '../dashboard-basic/candle-patterns/threeOutside';

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
	},
	bullishHarami: {
		titleEn: 'Bullish Harami',
		titleVi: '',
		stroke: '#ff6347',
		fn: bullishHarami
	},
	bearishHarami: {
		titleEn: 'Bearish Harami',
		titleVi: '',
		stroke: '#ff6347',
		fn: bearishHarami
	},
	tweezerTop: {
		titleEn: 'Tweezer Top',
		titleVi: '',
		stroke: '#adff2f',
		fn: tweezerTop
	},
	tweezerBottom: {
		titleEn: 'Tweezer Bottom',
		titleVi: '',
		stroke: '#adff2f',
		fn: tweezerBottom
	},
	threeOutsideUp: {
		titleEn: 'Three Outside Up',
		titleVi: '',
		stroke: '#adff2f',
		fn: threeOutsideUp
	},
	threeOutsideDown: {
		titleEn: 'Three Outside Down',
		titleVi: '',
		stroke: '#adff2f',
		fn: threeOutsideDown
	}
}

export default patternMap;
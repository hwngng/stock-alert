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
import { onNeck } from '../dashboard-basic/candle-patterns/onNeck';
import { bearishCounterAttack, bullishCounterAttack } from '../dashboard-basic/candle-patterns/counterattack';
import { cupWithHandle } from '../dashboard-basic/candle-patterns/cupWithHandle';
import { darkCloudCover } from '../dashboard-basic/candle-patterns/darkCloudCover';
import { doji, dragonflyDoji, gravestoneDoji, longLeggedDoji } from '../dashboard-basic/candle-patterns/doji';
import { spinningTop } from '../dashboard-basic/candle-patterns/spinningTop';
import { fallingThreeMethods, risingThreeMethods } from '../dashboard-basic/candle-patterns/threeMethods';
import hangingManCandle from '../dashboard-basic/candle-patterns/hangingMan';
import shootingStarCandle from '../dashboard-basic/candle-patterns/shootingStar';

const patternMap = {
	hammerCandle: {
		titleEn: 'Hammer',
		titleVi: '',
		stroke: '#ffc0cb',
		fn: hammerCandle,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	hangingManCandle: {
		titleEn: 'Hanging Man',
		titleVi: '',
		stroke: '#800080',
		fn: hangingManCandle,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	invertedHammerCandle: {
		titleEn: 'Inverted Hammer',
		titleVi: '',
		stroke: '#ff69b4',
		fn: invertedHammerCandle,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	shootingStarCandle: {
		titleEn: 'Shooting Star',
		titleVi: '',
		stroke: '#8fbc8f',
		fn: shootingStarCandle,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	morningStar: {
		titleEn: 'Morning Star',
		titleVi: '',
		stroke: '#ffdab9',
		fn: morningStar,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	eveningStar: {
		titleEn: 'Evening Star',
		titleVi: '',
		stroke: '#7fffd4',
		fn: eveningStar,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	bullishEngulfing: {
		titleEn: 'Bullish Engulfing',
		titleVi: '',
		stroke: '#ee82ee',
		fn: bullishEngulfing,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	bearishEngulfing: {
		titleEn: 'Bearish Engulfing',
		titleVi: '',
		stroke: '#87ceeb',
		fn: bearishEngulfing,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	threeWhiteSoldiers: {
		titleEn: 'Three White Soldiers',
		titleVi: '',
		stroke: '#90ee90',
		fn: threeWhiteSoldiers,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	threeBlackCrows: {
		titleEn: 'Three Black Crows',
		titleVi: '',
		stroke: '#dda0dd',
		fn: threeBlackCrows,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	piercing: {
		titleEn: 'Piercing',
		titleVi: '',
		stroke: '#ffff54',
		fn: piercing,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	whiteMarubozu: {
		titleEn: 'White Marubozu',
		titleVi: '',
		stroke: '#db7093',
		fn: whiteMarubozu,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}		
	},
	blackMarubozu: {
		titleEn: 'Black Marubozu',
		titleVi: '',
		stroke: '#1e90ff',
		fn: blackMarubozu,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	threeInsideUp: {
		titleEn: 'Three Inside Up',
		titleVi: '',
		stroke: '#ff00ff',
		fn: threeInsideUp,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	threeInsideDown: {
		titleEn: 'Three Inside Down',
		titleVi: '',
		stroke: '#ff6347',
		fn: threeInsideDown,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	bullishHarami: {
		titleEn: 'Bullish Harami',
		titleVi: '',
		stroke: '#ff6347',
		fn: bullishHarami,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	bearishHarami: {
		titleEn: 'Bearish Harami',
		titleVi: '',
		stroke: '#ff6347',
		fn: bearishHarami,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	tweezerTop: {
		titleEn: 'Tweezer Top',
		titleVi: '',
		stroke: '#adff2f',
		fn: tweezerTop,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	tweezerBottom: {
		titleEn: 'Tweezer Bottom',
		titleVi: '',
		stroke: '#a020f0',
		fn: tweezerBottom,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	threeOutsideUp: {
		titleEn: 'Three Outside Up',
		titleVi: '',
		stroke: '#0000ff',
		fn: threeOutsideUp,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	threeOutsideDown: {
		titleEn: 'Three Outside Down',
		titleVi: '',
		stroke: '#f4a460',
		fn: threeOutsideDown,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	onNeck: {
		titleEn: 'On Neck',
		titleVi: '',
		stroke: '#00bfff',
		fn: onNeck,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	bullishCounterAttack: {
		titleEn: 'Bullish Counter Attack',
		titleVi: '',
		stroke: '#dc143c',
		fn: bullishCounterAttack,
		preTrend: {
			window: 4,
			trend: -1
		},
		confirm: {
			window: 2,
			trend: 1
		}
	},
	bearishCounterAttack: {
		titleEn: 'Bearish Counter Attack',
		titleVi: '',
		stroke: '#00fa9a',
		fn: bearishCounterAttack,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	cupWithHandle: {
		titleEn: 'Cup With Handle',
		titleVi: '',
		stroke: '#00ff00',
		fn: cupWithHandle,
		confirm: {
			window: 4,
			trend: 1
		}
	},
	darkCloudCover: {
		titleEn: 'Dark Cloud Cover',
		titleVi: '',
		stroke: '#0000cd',
		fn: darkCloudCover,
		preTrend: {
			window: 4,
			trend: 1
		},
		confirm: {
			window: 2,
			trend: -1
		}
	},
	doji: {
		titleEn: 'Doji',
		titleVi: '',
		stroke: '#c71585',
		fn: doji,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	longLeggedDoji: {
		titleEn: 'Long Legged Doji',
		titleVi: '',
		stroke: '#6a5acd',
		fn: longLeggedDoji,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	dragonflyDoji: {
		titleEn: 'Dragonfly Doji',
		titleVi: '',
		stroke: '#ffd700',
		fn: dragonflyDoji,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	gravestoneDoji: {
		titleEn: 'Gravestone Doji',
		titleVi: '',
		stroke: '#ff8c00',
		fn: gravestoneDoji,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	spinningTop: {
		titleEn: 'Spinning Top',
		titleVi: '',
		stroke: '#00ced1',
		fn: spinningTop,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	fallingThreeMethods: {
		titleEn: 'Falling Three Methods',
		titleVi: '',
		stroke: '#ff4500',
		fn: fallingThreeMethods,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	},
	risingThreeMethods: {
		titleEn: 'Rising Three Methods',
		titleVi: '',
		stroke: '#9932cc',
		fn: risingThreeMethods,
		preTrend: {
			window: 4,
		},
		confirm: {
			window: 2,
		}
	}
}

export default patternMap;
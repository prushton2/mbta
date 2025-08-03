package trainCars

import (
	"strconv"
	"strings"

	"prushton.com/mbta/types"
)

var VehicleInfo map[string][]types.VehicleTypeInfo = map[string][]types.VehicleTypeInfo{
	"CR": {
		{StartID: 1025, EndID: 1075, Type: 0, Model: "F40PH-3C"},

		{StartID: 1115, EndID: 1139, Type: 0, Model: "GP40MC"},

		{StartID: 2000, EndID: 2039, Type: 0, Model: "HSP46"},

		{StartID: 200, EndID: 202, Type: 0, Model: "BTC-1C"},
		{StartID: 204, EndID: 214, Type: 0, Model: "BTC-1C"},
		{StartID: 216, EndID: 258, Type: 0, Model: "BTC-1C"},
		{StartID: 350, EndID: 389, Type: 0, Model: "BTC-1A"},

		{StartID: 500, EndID: 532, Type: 0, Model: "BTC-3"},
		{StartID: 533, EndID: 536, Type: 0, Model: "BTC-3"},
		{StartID: 540, EndID: 540, Type: 0, Model: "BTC-3"},

		{StartID: 600, EndID: 653, Type: 0, Model: "BTC-1B"},

		{StartID: 700, EndID: 749, Type: 0, Model: "BTC-4"},
		{StartID: 750, EndID: 766, Type: 0, Model: "BTC-4A"},
		{StartID: 767, EndID: 781, Type: 0, Model: "BTC-4B"},
		{StartID: 800, EndID: 886, Type: 0, Model: "BTC-4D"},
		{StartID: 900, EndID: 932, Type: 0, Model: "BTC-4C"},

		{StartID: 1500, EndID: 1533, Type: 0, Model: "CTC-3"},
		{StartID: 1600, EndID: 1652, Type: 0, Model: "CTC-1B"},
		{StartID: 1700, EndID: 1724, Type: 0, Model: "CTC-4"},
		{StartID: 1800, EndID: 1870, Type: 0, Model: "CTC-5"},
	},
	"Blue": {
		{StartID: 700, EndID: 793, Type: 5, Model: "Siemens"},
	},
	"Green": {
		{StartID: 3600, EndID: 3699, Type: 7, Model: "Kinki-Sharyo"},
		{StartID: 3700, EndID: 3719, Type: 7, Model: "Kinki-Sharyo"},
		{StartID: 3800, EndID: 3894, Type: 8, Model: "Breda"},
		{StartID: 3900, EndID: 3923, Type: 9, Model: "CAF"},
		{StartID: 4001, EndID: 4102, Type: 10, Model: "CAF"},
	},
	"Orange": {
		{StartID: 1400, EndID: 1551, Type: 14, Model: "CRRC"},
	},
	"Red": {
		{StartID: 1500, EndID: 1523, Type: 1, Model: "Pullman-Standard"},
		{StartID: 1600, EndID: 1651, Type: 1, Model: "Pullman-Standard"},
		{StartID: 1700, EndID: 1757, Type: 2, Model: "UTDC"},
		{StartID: 1800, EndID: 1885, Type: 3, Model: "Bombardier"},
		{StartID: 1900, EndID: 2151, Type: 4, Model: "CRRC"},
	},
}

func GetCarAndType(fullLine string, labelstring string) (int32, string) {
	label64, err := strconv.ParseInt(labelstring, 10, 32)
	if err != nil {
		return 0, ""
	}

	label := int32(label64)
	line := strings.Split(fullLine, "-")[0]

	carTypes, exists := VehicleInfo[line]
	if !exists {
		return 0, ""
	}

	for _, carType := range carTypes {
		if label >= carType.StartID && label <= carType.EndID {
			return carType.Type, carType.Model
		}
	}

	return 0, ""
}

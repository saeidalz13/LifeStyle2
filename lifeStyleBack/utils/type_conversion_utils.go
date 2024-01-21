package utils

import (
	"strconv"
)

func ConvertStringToInt64(strArr []string) ([]int64, error) {
	var convertedInts []int64
	for _, str := range strArr {
		eachInt, err := strconv.ParseInt(str, 10, 64)
		if err != nil {
			return nil, err
		}
		convertedInts = append(convertedInts, eachInt)
	}
	return convertedInts, nil
}

// func ConvertToDate(rawStartDate string, rawEndDate string) (time.Time, time.Time, error) {
// 	startDate, err := time.Parse("2006-01-02", rawStartDate)
// 	if err != nil {
// 		return time.Time{}, time.Time{}, err
// 	}
// 	endDate, err := time.Parse("2006-01-02", rawEndDate)
// 	if err != nil {
// 		return time.Time{}, time.Time{}, err
// 	}
// 	return startDate, endDate, nil
// }

// func ConvertStringToFloat(args ...interface{}) ([]float64, error) {
// 	var results []float64
// 	var floatType []int
// 	for _, arg := range args {
// 		if arg == "floatType32" {
// 			floatType = append(floatType, 32)
// 			continue
// 		} else if arg == "floatType64" {
// 			floatType = append(floatType, 64)
// 			continue
// 		} else {
// 			if argStr, ok := arg.(string); ok {
// 				f, err := strconv.ParseFloat(argStr, floatType[0])
// 				if err != nil {
// 					return nil, err
// 				}
// 				results = append(results, f)
// 			} else {
// 				return nil, errors.New("One of the args is not string")
// 			}
// 		}
// 	}
// 	return results, nil
// }

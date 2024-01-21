package config

type ExpenseTypesStruct struct {
	Capital       string
	Eatout        string
	Entertainment string
}

var ExpenseTypes = ExpenseTypesStruct{
	Capital:       "capital",
	Eatout:        "eatout",
	Entertainment: "entertainment",
}

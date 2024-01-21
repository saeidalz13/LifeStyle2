package token

import (
	"errors"
	"time"

	"github.com/google/uuid"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

type Payload struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	IssuedAt  time.Time `json:"issuedAt"`
	ExpiredAt time.Time `json:"expiredAt"`
}

func (py *Payload) Valid() error {
	if time.Now().After(py.ExpiredAt) {
		return errors.New(cn.DefaultTokenErrors.Expired)
	}
	return nil
}

// Creates a new payload with user email and specifications
func NewPayLoad(email string, duration time.Duration) (*Payload, error) {
	tokenId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	payload := &Payload{
		ID:        tokenId,
		Email:     email,
		IssuedAt:  time.Now(),
		ExpiredAt: time.Now().Add(duration),
	}

	return payload, nil
}

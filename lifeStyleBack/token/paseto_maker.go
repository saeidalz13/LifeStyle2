package token

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

var PasetoMakerGlobal Maker

type Maker interface {
	CreateToken(email string, duration time.Duration) (string, error)
	VerifyToken(token string) (*Payload, error)
}

// in the function "NewPasetoMaker", we want PasetoMaker
// to have a Maker interface. So, it has to have its 2 methods
type PasetoMaker struct {
	paseto  *paseto.V2
	symmKey []byte
}

func (p *PasetoMaker) CreateToken(email string, duration time.Duration) (string, error) {
	payload, err := NewPayLoad(email, duration)
	if err != nil {
		return "", err
	}
	// Compared to JWT that returns an encoded payload,
	// Paseto returns an encrypted payload
	return p.paseto.Encrypt(p.symmKey, payload, nil)
}

func (p *PasetoMaker) VerifyToken(token string) (*Payload, error) {
	payload := &Payload{}

	if err := p.paseto.Decrypt(token, p.symmKey, payload, nil); err != nil {
		return nil, errors.New(cn.DefaultTokenErrors.Invalid)
	}
	if err := payload.Valid(); err != nil {
		return nil, err
	}
	return payload, nil
}

func NewPasetoMaker(symmKey string) (Maker, error) {
	if len(symmKey) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("Length of symmetric key must be %d", chacha20poly1305.KeySize)
	}
	maker := &PasetoMaker{
		paseto:  paseto.NewV2(),
		symmKey: []byte(symmKey),
	}
	return maker, nil
}

func init() {
	tempPaseto, err := NewPasetoMaker(cn.EnvVars.PasetoKey)
	if err != nil {
		log.Fatalln("Failed to extract Paseto Key!")
	}

	PasetoMakerGlobal = tempPaseto
}
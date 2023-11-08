import joi from 'joi';

export type Type = {
  userId: number;
  amount: number;
};

export const schema = joi.object({
  userId: joi.number().integer().min(1).required(),
  amount: joi.number().integer().min(0).required()
});
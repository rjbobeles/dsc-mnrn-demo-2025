import Joi from 'joi'

export default Joi.object({
  PORT: Joi.number().port().default(3000),
  NAME: Joi.string().optional().default('main-api'),
  ENVIRONMENT_NAME: Joi.string().valid('development', 'production', 'testing').default('development'),
  PRODUCTION_FEATURES: Joi.boolean().default(false),
})

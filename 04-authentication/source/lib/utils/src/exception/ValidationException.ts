import { ValidationError } from 'class-validator'

export class ValidationException extends Error {
  public validationErrors: ValidationError[]

  constructor(validationErrors: ValidationError[]) {
    super('Unable to process request due to malformed data')
    this.validationErrors = validationErrors
  }

  getValidationErrors(): Array<{ field: string; error: unknown[] }> {
    const results: Array<{ field: string; error: unknown[] }> = []

    const stack = this.validationErrors.map((error) => ({ error, path: '' }))

    while (stack.length > 0) {
      const current = stack.pop()
      if (!current) continue

      const { error, path } = current
      const fieldPath = path ? `${path}.${error.property}` : error.property

      if (error.constraints) {
        results.push({
          field: fieldPath,
          error: Object.values(error.constraints as never).reverse(),
        })
      }

      if (error.children?.length) {
        stack.push(
          ...error.children.map((child) => ({
            error: child,
            path: fieldPath,
          })),
        )
      }
    }

    return results
  }
}

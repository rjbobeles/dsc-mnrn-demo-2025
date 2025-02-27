export class ValidateUserPayload {
  constructor(public readonly payload: { email: string; password: string }) {}
}

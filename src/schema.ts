import { email, maxLength, minLength, object, pipe, regex, string } from 'valibot'

export const UserSchema = object({
  _id: string(),
  name: pipe(string(), minLength(8)),
  email: pipe(string(), email()),
  phone: pipe(string(), regex(/^\+(?:[0-9-()/.]\s?){6,15}\d$/)),
  address: pipe(string(), minLength(10), maxLength(50)),
})

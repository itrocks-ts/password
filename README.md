[![npm version](https://img.shields.io/npm/v/@itrocks/password?logo=npm)](https://www.npmjs.org/package/@itrocks/password)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/password)](https://www.npmjs.org/package/@itrocks/password)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/password?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/password)
[![issues](https://img.shields.io/github/issues/itrocks-ts/password)](https://github.com/itrocks-ts/password/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# password

@Password() decorator for secure formatting of password fields.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/password
```

## Usage

`@itrocks/password` provides a property decorator `@Password()` that marks a
field as containing a password and wires it to appropriate transformers
(`@itrocks/transformer`, `@itrocks/property-view`, etc.). These transformers
are responsible for things such as:

- how the password is displayed (or hidden) in HTML forms,
- how it is serialized to JSON (for APIs, logs, exports),
- how it is handled when the user edits it.

You typically use this package together with other `@itrocks/*` packages. In
simple projects you can still benefit from it as a way to centralize how
password fields are formatted and transformed.

### Minimal example

```ts
import { Password } from '@itrocks/password'

class Account {
  @Password()
  password = ''
}
```

Here, the `password` property is marked as a password field. When the rest of
the framework iterates over decorators, it can automatically apply the
corresponding transformers (for example to mask the value in UI or to avoid
leaking it in JSON payloads).

### Complete example with transformers

In a real application you generally combine this decorator with
`@itrocks/transformer` and `@itrocks/property-view` so that passwords are
handled consistently across HTML and JSON.

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Password, passwordOf } from '@itrocks/password'
import { setPasswordTransformers } from '@itrocks/password/transformers'

class Account {
  @Password()
  password = ''

  // Other fields are not affected by password‑specific transformers
  email = ''
}

// Example: manually attach the recommended transformers on all password fields
function configurePasswordFields<T extends object>(type: ObjectOrType<T>): void {
  const properties: (keyof T)[] = ['password', 'email'] as (keyof T)[]

  for (const property of properties) {
    if (passwordOf(type, property)) {
      setPasswordTransformers(type, property)
    }
  }
}

configurePasswordFields(Account)
```

In most cases you will not need to call `setPasswordTransformers` yourself:
framework packages such as `@itrocks/framework` use `passwordDependsOn` to
register the appropriate dependencies globally. The example above is provided
to illustrate how the pieces fit together if you integrate the package
manually.

## API

### Main module: `@itrocks/password`

#### `function Password<T extends object>(value?: boolean): DecorateCaller<T>`

Property decorator indicating that a field is a password field.

##### Parameters

- `value` *(optional, default: `true`)* – enables or disables the marking of
  the property as a password field. Normally you simply write `@Password()`.
  Passing `false` is useful if you want to explicitly remove or override an
  inherited decorator in advanced scenarios.

##### Return value

- `DecorateCaller<T>` – function from `@itrocks/decorator/property` used by
  TypeScript to apply the decorator. You normally do not call it directly.

##### Example

```ts
class User {
  @Password()
  password = ''
}
```

---

#### `function passwordOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): boolean`

Checks whether the given property is marked with `@Password()`.

##### Parameters

- `target` – the class (`User`) or instance (`new User()`) that owns the
  property.
- `property` – the property name to inspect.

##### Return value

- `boolean` – `true` if the property is currently marked as a password field,
  `false` otherwise.

##### Example

```ts
import type { ObjectOrType } from '@itrocks/class-type'
import { Password, passwordOf } from '@itrocks/password'

class Account {
  @Password()
  password = ''

  login = ''
}

function isPasswordProperty<T extends object>(type: ObjectOrType<T>, property: keyof T): boolean {
  return passwordOf(type, property)
}

isPasswordProperty(Account, 'password') // true
isPasswordProperty(Account, 'login')    // false
```

---

#### `function passwordDependsOn(dependencies: Partial<Dependencies>): void`

Configures how the `@Password()` decorator should behave depending on other
packages. This is mainly used by higher‑level framework modules to inject the
right transformers.

##### Parameters

- `dependencies` – an object that can contain the following optional
  properties:
  - `setTransformers<T extends object>(target: T, property: KeyOf<T>): void` –
    a function that is called whenever a `@Password()` decorator is applied.
    It is expected to register all relevant transformers (HTML, JSON, and
    others) for this property.

##### Typical usage

You normally do not call `passwordDependsOn` directly unless you are building a
framework or a shared library on top of `@itrocks/password`. If you do, it is
typically done at startup:

```ts
import { passwordDependsOn } from '@itrocks/password'
import { setPasswordTransformers } from '@itrocks/password/transformers'

passwordDependsOn({ setTransformers: setPasswordTransformers })
```

Once configured, all `@Password()` decorators in your application can rely on
these transformers.

### Transformers submodule: `@itrocks/password/transformers`

This optional submodule contains helpers and default transformers for password
fields. They are usually wired automatically by higher‑level packages, but you
can also use them directly.

#### `function editPassword<T extends object>(value: string, target: ObjectOrType<T>, property: KeyOf<T>): string`

Transforms a password value when edited, for instance in a form or an admin
UI. The actual behavior depends on your transformer configuration (for example,
it may preserve existing values when the user leaves the field empty).

#### `function inputPassword(value: string): string`

Transforms a raw input value (for example from an HTML form) into the stored
password representation. This is where you can centralize masking or other
input‑side logic.

#### `function setPasswordHtmlTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): void`

Registers HTML‑related transformers for the given password property (for
example rendering an `<input type="password">` field and masking its value).

#### `function setPasswordJsonTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): void`

Registers JSON‑related transformers for the given password property (for
example omitting the value from JSON output or replacing it with a placeholder).

#### `function setPasswordTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>): void`

Convenience helper that calls both `setPasswordHtmlTransformers` and
`setPasswordJsonTransformers` so that all standard transformers are registered
at once.

## Typical use cases

- Mark password fields in your domain models so that they are handled
  securely and consistently across your application.
- Automatically render password input fields in generated forms while
  avoiding accidental display of the underlying value.
- Prevent passwords from being leaked in JSON APIs, logs, or exports by
  applying dedicated transformers.
- Centralize all password‑related formatting logic (input, edition, output)
  in one place, instead of duplicating it by hand in every form or endpoint.

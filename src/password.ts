import { KeyOf, ObjectOrType }   from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/property'

const PASSWORD = Symbol('password')

type Dependencies = {
	setTransformers?: <T extends object>(target: T, property: KeyOf<T>) => void
}

const depends: Dependencies = {
}

export function passwordDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export function Password<T extends object>(value = true)
{
	const parent = decorate<T>(PASSWORD, value)
	return value
		? (target: T, property: KeyOf<T>) => {
			parent(target, property)
			depends.setTransformers?.(target, property)
		}
		: parent
}

export function passwordOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, PASSWORD, false)
}

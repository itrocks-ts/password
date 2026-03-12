import { ObjectOrType }      from '@itrocks/class-type'
import { decorate }          from '@itrocks/decorator/property'
import { DecorateCaller }    from '@itrocks/decorator/property'
import { decoratorOf }       from '@itrocks/decorator/property'
import { parameterProperty } from '@itrocks/decorator/property'

const PASSWORD = Symbol('password')

type Dependencies = {
	setTransformers?: <T extends object>(target: T, property: keyof T) => void
}

const depends: Dependencies = {
}

export function passwordDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}

export function Password<T extends object>(value = true): DecorateCaller<T>
{
	const parent = decorate<T>(PASSWORD, value)
	return value
		? (target, property, index) => {
			const [targetObject, parameterName] = parameterProperty(target, property, index)
			depends.setTransformers?.(targetObject, parameterName)
			parent(target, property)
		}
		: parent
}

export function passwordOf<T extends object>(target: ObjectOrType<T>, property: keyof T)
{
	return decoratorOf(target, property, PASSWORD, false)
}

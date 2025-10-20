import { KeyOf }              from '@itrocks/class-type'
import { ObjectOrType }       from '@itrocks/class-type'
import { decorate }           from '@itrocks/decorator/property'
import { DecorateCaller }     from '@itrocks/decorator/property'
import { decoratorOf }        from '@itrocks/decorator/property'
import { parameterDecorator } from '@itrocks/decorator/property'

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

export function Password<T extends object>(value = true): DecorateCaller<T>
{
	const parent = decorate<T>(PASSWORD, value)
	return value
		? (target, property, index) => {
			[target, property] = parameterDecorator(PASSWORD, target, property, index)
			depends.setTransformers?.(target, property)
			parent(target, property)
		}
		: parent
}

export function passwordOf<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	return decoratorOf(target, property, PASSWORD, false)
}

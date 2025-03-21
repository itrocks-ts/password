import { KeyOf, ObjectOrType }     from '@itrocks/class-type'
import { displayOf }               from '@itrocks/property-view'
import { EDIT, HTML, IGNORE }      from '@itrocks/transformer'
import { INPUT, JSON }             from '@itrocks/transformer'
import { setPropertyTransformer }  from '@itrocks/transformer'
import { setPropertyTransformers } from '@itrocks/transformer'
import { tr }                      from '@itrocks/translate'
import { createHash }              from 'crypto'

const lfTab = '\n\t\t\t\t'

export function editPassword<T extends object>(value: string, target: ObjectOrType<T>, property: KeyOf<T>)
{
	const inputValue = value.length ? ` value="${IGNORE}"` : ''
	const label      = `<label for="${property}">${tr(displayOf(target, property))}</label>`
	const input      = `<input id="${property}" name="${property}" type="password"${inputValue}>`
	return label + lfTab + input
}

export function inputPassword(value: string)
{
	return ['', IGNORE].includes(value)
		? value
		: createHash('sha512').update(value, 'utf8').digest('hex')
}

export function setPasswordHtmlTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	setPropertyTransformers(target, property, [
		{ format: HTML, direction: EDIT,  transformer: editPassword<T> },
		{ format: HTML, direction: INPUT, transformer: inputPassword },
		{ format: HTML,                   transformer: (value: string) => value.length ? '***********' : '' }
	])
}

export function setPasswordJsonTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	setPropertyTransformer(target, property, JSON, '', (value: string) => value.length ? '*PASSWORD*' : '*EMPTY*')
}

export function setPasswordTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	setPasswordHtmlTransformers(target, property)
	setPasswordJsonTransformers(target, property)
}

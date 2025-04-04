import { KeyOf, ObjectOrType }     from '@itrocks/class-type'
import { displayOf }               from '@itrocks/property-view'
import { toCssId, toField }        from '@itrocks/rename'
import { EDIT, HTML, IGNORE }      from '@itrocks/transformer'
import { INPUT, JSON }             from '@itrocks/transformer'
import { setPropertyTransformer }  from '@itrocks/transformer'
import { setPropertyTransformers } from '@itrocks/transformer'
import { tr }                      from '@itrocks/translate'
import { createHash }              from 'node:crypto'

const lfTab = '\n\t\t\t\t'

export function editPassword<T extends object>(value: string, target: ObjectOrType<T>, property: KeyOf<T>)
{
	const fieldId    = toCssId(property)
	const fieldName  = toField(property)
	const inputValue = value.length ? ` value="${IGNORE}"` : ''
	const label      = `<label for="${fieldId}">${tr(displayOf(target, property))}</label>`
	const input      = `<input id="${fieldId}" name="${fieldName}" type="password"${inputValue}>`
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
	setPropertyTransformer(target, property, JSON, '', (value: string) => (value === '') ? '*EMPTY*' : '*PASSWORD*')
}

export function setPasswordTransformers<T extends object>(target: ObjectOrType<T>, property: KeyOf<T>)
{
	setPasswordHtmlTransformers(target, property)
	setPasswordJsonTransformers(target, property)
}

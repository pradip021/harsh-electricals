import Joi from 'joi';
import {
    COLUMN_ID_PATTERN,
    COLUMN_TYPES,
    MAX_CELL_TEXT_LENGTH,
    MAX_COLUMN_NAME_LENGTH,
    MAX_COLUMNS,
    SYSTEM_COLUMN_KEYS,
    VALUE_MODES,
} from '../utils/quotationTable';
import { checkSignatureImage, MAX_SIGNATURE_LENGTH, SIGNATURE_MODES } from '../utils/signature';

// String first so text such as "007" is not converted to a number.
const cellValue = Joi.alternatives()
    .try(Joi.string().allow('').max(MAX_CELL_TEXT_LENGTH), Joi.number())
    .allow(null);

const optionalText = (max: number) => Joi.string().allow('', null).max(max);

const columnSchema = Joi.object({
    id: Joi.string().pattern(COLUMN_ID_PATTERN).required(),
    name: Joi.string().trim().min(1).max(MAX_COLUMN_NAME_LENGTH).required().messages({
        'string.empty': 'Column name is required',
        'string.max': `Column name must be at most ${MAX_COLUMN_NAME_LENGTH} characters`,
    }),
    type: Joi.string().valid(...COLUMN_TYPES).required(),
    position: Joi.number().integer().min(0).required(),
    width: Joi.number().integer().min(40).max(600).allow(null),
    valueMode: Joi.string().valid(...VALUE_MODES).required(),
    autoIncrement: Joi.object({
        start: Joi.number().required(),
        step: Joi.number().invalid(0).required().messages({ 'any.invalid': 'Auto increment step cannot be 0' }),
        resetOnColumnId: Joi.string().pattern(COLUMN_ID_PATTERN).allow(null, ''),
    }).allow(null),
    defaultValue: cellValue,
    editable: Joi.boolean(),
    systemKey: Joi.string().valid(...SYSTEM_COLUMN_KEYS).allow(null),
});

const itemSchema = Joi.object({
    pointName: Joi.string().trim().min(1).max(1000).required().messages({
        'string.empty': 'Every row needs a point name or heading',
        'any.required': 'Every row needs a point name or heading',
    }),
    description: optionalText(5000),
    qty: Joi.alternatives().try(Joi.string().allow('').max(100), Joi.number()).allow(null),
    unit: optionalText(50),
    unitId: Joi.string().hex().length(24).allow(null, ''),
    rate: Joi.number().min(0),
    amount: Joi.number(),
    isSection: Joi.boolean(),
    values: Joi.object().pattern(COLUMN_ID_PATTERN, cellValue),
});

export const createQuotationSchema = Joi.object({
    clientName: Joi.string().trim().min(1).max(200).required().messages({
        'string.empty': 'Please add client name',
        'any.required': 'Please add client name',
    }),
    clientAddress: optionalText(2000),
    date: Joi.date(),
    ref: optionalText(200),
    subject: optionalText(500),
    message: optionalText(5000),
    notes: optionalText(20000),
    signature: Joi.string().allow('', null).max(MAX_SIGNATURE_LENGTH).custom((value, helpers) => {
        const error = checkSignatureImage(value);
        return error ? helpers.message({ custom: error }) : value;
    }).messages({ 'string.max': 'Signature image is too large' }),
    signatureMode: Joi.string().valid(...SIGNATURE_MODES).messages({
        'any.only': 'Signature type must be DIGITAL or PHYSICAL',
    }),
    gstEnabled: Joi.boolean(),
    gstRate: Joi.number().min(0).max(100),
    status: Joi.string().valid('draft', 'sent', 'paid'),
    columns: Joi.array().items(columnSchema).max(MAX_COLUMNS),
    items: Joi.array().items(itemSchema).min(1).required().messages({
        'array.min': 'Please add at least one item',
    }),
});

export const updateQuotationSchema = createQuotationSchema.fork(['clientName', 'items'], (schema) => schema.optional());

// Only strip unknown object keys (ids, timestamps, client-only fields); invalid array entries must still fail.
export const quotationValidationOptions: Joi.ValidationOptions = { stripUnknown: { objects: true } };

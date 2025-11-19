import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types';

/**
 * Validation Middleware
 * Koristi Joi za validaciju request body/params/query
 */

/**
 * Generic validation middleware
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Vrati sve greške
      stripUnknown: true, // Ukloni nepoznata polja
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      throw new ValidationError(errorMessage);
    }

    req.body = value;
    next();
  };
};

/**
 * Auth Validation Schemas
 */

// Register schema
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Ungültige E-Mail-Adresse',
    'any.required': 'E-Mail ist erforderlich',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Passwort muss mindestens 8 Zeichen lang sein',
    'any.required': 'Passwort ist erforderlich',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwörter stimmen nicht überein',
    'any.required': 'Passwort-Bestätigung ist erforderlich',
  }),
  institutionName: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Firmenname muss mindestens 2 Zeichen lang sein',
    'string.max': 'Firmenname darf maximal 255 Zeichen lang sein',
    'any.required': 'Firmenname ist erforderlich',
  }),
  addressStreet: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Straße muss mindestens 3 Zeichen lang sein',
    'any.required': 'Straße ist erforderlich',
  }),
  addressPlz: Joi.string().pattern(/^\d{5}$/).required().messages({
    'string.pattern.base': 'PLZ muss 5 Ziffern enthalten',
    'any.required': 'PLZ ist erforderlich',
  }),
  addressCity: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Stadt muss mindestens 2 Zeichen lang sein',
    'any.required': 'Stadt ist erforderlich',
  }),
  phone: Joi.string().min(7).max(20).required().messages({
    'string.min': 'Telefonnummer muss mindestens 7 Zeichen lang sein',
    'any.required': 'Telefonnummer ist erforderlich',
  }),
});

// Verify email schema
export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Ungültige E-Mail-Adresse',
    'any.required': 'E-Mail ist erforderlich',
  }),
  code: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Code muss 6 Ziffern enthalten',
    'any.required': 'Verifizierungscode ist erforderlich',
  }),
});

// Login schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Ungültige E-Mail-Adresse',
    'any.required': 'E-Mail ist erforderlich',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Passwort ist erforderlich',
  }),
});

// Worker login schema
export const workerLoginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Benutzername muss mindestens 3 Zeichen lang sein',
    'any.required': 'Benutzername ist erforderlich',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Passwort ist erforderlich',
  }),
});

// Forgot password schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Ungültige E-Mail-Adresse',
    'any.required': 'E-Mail ist erforderlich',
  }),
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset-Token ist erforderlich',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'Passwort muss mindestens 8 Zeichen lang sein',
    'any.required': 'Neues Passwort ist erforderlich',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwörter stimmen nicht überein',
    'any.required': 'Passwort-Bestätigung ist erforderlich',
  }),
});

/**
 * Patient Validation Schemas
 */

// Create patient schema
export const createPatientSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Vorname muss mindestens 2 Zeichen lang sein',
    'string.max': 'Vorname darf maximal 100 Zeichen lang sein',
    'any.required': 'Vorname ist erforderlich',
  }),
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nachname muss mindestens 2 Zeichen lang sein',
    'string.max': 'Nachname darf maximal 100 Zeichen lang sein',
    'any.required': 'Nachname ist erforderlich',
  }),
  date_of_birth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Geburtsdatum muss im Format YYYY-MM-DD sein',
      'any.required': 'Geburtsdatum ist erforderlich',
    }),
  address: Joi.string().min(5).max(255).required().messages({
    'string.min': 'Adresse muss mindestens 5 Zeichen lang sein',
    'string.max': 'Adresse darf maximal 255 Zeichen lang sein',
    'any.required': 'Adresse ist erforderlich',
  }),
  unique_code: Joi.string().min(3).max(50).optional().messages({
    'string.min': 'Patientennummer muss mindestens 3 Zeichen lang sein',
    'string.max': 'Patientennummer darf maximal 50 Zeichen lang sein',
  }),
});

// Update patient schema (all fields optional)
export const updatePatientSchema = Joi.object({
  first_name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Vorname muss mindestens 2 Zeichen lang sein',
    'string.max': 'Vorname darf maximal 100 Zeichen lang sein',
  }),
  last_name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Nachname muss mindestens 2 Zeichen lang sein',
    'string.max': 'Nachname darf maximal 100 Zeichen lang sein',
  }),
  date_of_birth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Geburtsdatum muss im Format YYYY-MM-DD sein',
    }),
  address: Joi.string().min(5).max(255).optional().messages({
    'string.min': 'Adresse muss mindestens 5 Zeichen lang sein',
    'string.max': 'Adresse darf maximal 255 Zeichen lang sein',
  }),
}).min(1).messages({
  'object.min': 'Mindestens ein Feld muss aktualisiert werden',
});

/**
 * Product Validation Schemas
 */

// Create product schema
export const createProductSchema = Joi.object({
  name_de: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Produktname muss mindestens 3 Zeichen lang sein',
    'string.max': 'Produktname darf maximal 255 Zeichen lang sein',
    'any.required': 'Produktname ist erforderlich',
  }),
  description_de: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Beschreibung darf maximal 1000 Zeichen lang sein',
  }),
  type: Joi.string().valid('gloves', 'disinfectant_liquid', 'disinfectant_wipes').required().messages({
    'any.only': 'Produkttyp muss gloves, disinfectant_liquid oder disinfectant_wipes sein',
    'any.required': 'Produkttyp ist erforderlich',
  }),
  size: Joi.string().valid('S', 'M', 'L', 'XL').optional().allow(null).messages({
    'any.only': 'Größe muss S, M, L oder XL sein',
  }),
  quantity_per_box: Joi.number().integer().min(1).required().messages({
    'number.min': 'Menge pro Box muss mindestens 1 sein',
    'number.integer': 'Menge pro Box muss eine ganze Zahl sein',
    'any.required': 'Menge pro Box ist erforderlich',
  }),
  unit: Joi.string().min(1).max(20).required().messages({
    'string.min': 'Einheit muss mindestens 1 Zeichen lang sein',
    'string.max': 'Einheit darf maximal 20 Zeichen lang sein',
    'any.required': 'Einheit ist erforderlich',
  }),
  price_per_unit: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Preis pro Einheit muss mindestens 0 sein',
    'any.required': 'Preis pro Einheit ist erforderlich',
  }),
  min_order_quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Mindestbestellmenge muss mindestens 1 sein',
    'number.integer': 'Mindestbestellmenge muss eine ganze Zahl sein',
    'any.required': 'Mindestbestellmenge ist erforderlich',
  }),
  image_url: Joi.string().optional().allow('', null).messages({
    'string.base': 'Bild-URL muss ein Text sein',
  }),
});

// Update product schema (all fields optional)
export const updateProductSchema = Joi.object({
  name_de: Joi.string().min(3).max(255).optional().messages({
    'string.min': 'Produktname muss mindestens 3 Zeichen lang sein',
    'string.max': 'Produktname darf maximal 255 Zeichen lang sein',
  }),
  description_de: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Beschreibung darf maximal 1000 Zeichen lang sein',
  }),
  type: Joi.string().valid('gloves', 'disinfectant_liquid', 'disinfectant_wipes').optional().messages({
    'any.only': 'Produkttyp muss gloves, disinfectant_liquid oder disinfectant_wipes sein',
  }),
  size: Joi.string().valid('S', 'M', 'L', 'XL').optional().allow(null).messages({
    'any.only': 'Größe muss S, M, L oder XL sein',
  }),
  quantity_per_box: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Menge pro Box muss mindestens 1 sein',
    'number.integer': 'Menge pro Box muss eine ganze Zahl sein',
  }),
  unit: Joi.string().min(1).max(20).optional().messages({
    'string.min': 'Einheit muss mindestens 1 Zeichen lang sein',
    'string.max': 'Einheit darf maximal 20 Zeichen lang sein',
  }),
  price_per_unit: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Preis pro Einheit muss mindestens 0 sein',
  }),
  min_order_quantity: Joi.number().integer().min(1).optional().messages({
    'number.min': 'Mindestbestellmenge muss mindestens 1 sein',
    'number.integer': 'Mindestbestellmenge muss eine ganze Zahl sein',
  }),
  image_url: Joi.string().optional().allow('', null).messages({
    'string.base': 'Bild-URL muss ein Text sein',
  }),
}).min(1).messages({
  'object.min': 'Mindestens ein Feld muss aktualisiert werden',
});

/**
 * Order Validation Schemas
 */

// Order item schema
const orderItemSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Ungültige Produkt-ID',
    'any.required': 'Produkt-ID ist erforderlich',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Menge muss mindestens 1 sein',
    'number.integer': 'Menge muss eine ganze Zahl sein',
    'any.required': 'Menge ist erforderlich',
  }),
});

// Create order schema
export const createOrderSchema = Joi.object({
  patient_id: Joi.string().uuid().optional().messages({
    'string.uuid': 'Ungültige Patienten-ID',
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'array.min': 'Mindestens ein Produkt ist erforderlich',
    'any.required': 'Produkte sind erforderlich',
  }),
  scheduled_date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'Lieferdatum muss im ISO-Format sein',
  }),
  is_recurring: Joi.boolean().optional().messages({
    'boolean.base': 'is_recurring muss ein Boolean sein',
  }),
  notes: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Notizen dürfen maximal 1000 Zeichen lang sein',
  }),
});

// Update order status schema
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Ungültiger Status',
      'any.required': 'Status ist erforderlich',
    }),
});

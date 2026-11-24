import { Joi } from "../../utils/joi.js";

// Mismo rango que el CHECK chk_restaurant_settings_table_count (0041)
export const TABLE_COUNT_MIN = 1;
export const TABLE_COUNT_MAX = 200;

export const updateSettingsSchema = Joi.object({
  tableCount: Joi.number()
    .integer()
    .min(TABLE_COUNT_MIN)
    .max(TABLE_COUNT_MAX)
    .required()
    .label("La cantidad de mesas"),
});

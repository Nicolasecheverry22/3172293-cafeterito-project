export default function Checkbox({
    id,                    //Identificador unico (necesario para accesibilidad)
    name,                  //Nombre del campo (util para formulario)
    label,                 //Texto visible asociado
    checked = false,
    onChange,              //Fución que maneja el cambio de estado
    disabled = false,
    className = "",
}) {

    return (
        <label
            htmlFor={id}
            className={`
                flex items-center gap-3
                min-h-touch
                text-sm
                cursor-pointer
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${className}

            `}
        >

        {/* Input del checkbox */}
        <input
            id={id}
            name={name}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="size-[18px] accent-text-primary cursor-pointer"
        />

        {/* Texto del checkbox */}
        <span>{label}</span>
        </label>
    );
}
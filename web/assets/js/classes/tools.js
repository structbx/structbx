export function CleanForm(formSelector)
{
    const forms = $(formSelector);
    forms.each((i, form) => {
        form.reset();
        const $form = $(form);
        $form.removeClass('was-validated');
        $form.find('.is-invalid').removeClass('is-invalid');
    });
}

export function randomGenerator(l)
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomName = '';
    for (let i = 0; i < l; i++) {
        const randI = Math.floor(Math.random() * chars.length);
        randomName += chars[randI];
    }
    return randomName;
}

export function headerRowContrastColor(hexColor)
{
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calcular luminancia (fórmula WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si el fondo es oscuro (luminancia < 0.5), usar texto blanco
    // Si el fondo es claro (luminancia >= 0.5), usar texto negro
    return luminance < 0.5 ? '#fff' : '#333';
}

export function headerRowColor(link_color, value)
{
    return  `
        <span class='small' style='background-color:${link_color};color:${headerRowContrastColor(link_color)};padding:2px 8px;border-radius:4px;'>
            ${value}
        </span>
    `;
}
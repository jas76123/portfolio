export const BASE_PATH = "/portfolio";

// Фото на первом экране показывается в квадрате 208px на телефоне и 288px
// от md-брейкпоинта. Строка общая для <img> и для preload в layout — иначе
// браузер предзагрузит один вариант, а покажет другой.
export const PHOTO_SIZES = "(min-width: 768px) 288px, 208px";

const i18n = {
    tr: {
        score: "SKOR",
        settings: "AYARLAR",
        speed: "SİSTEM HIZI",
        gameOver: "SİSTEM ÇÖKTÜ",
        close: "KAPAT",
        highScore: "EN YÜKSEK",
        langName: "Türkçe"
    },
    en: {
        score: "SCORE",
        settings: "SETTINGS",
        speed: "SYSTEM SPEED",
        gameOver: "SYSTEM OVERLOAD",
        close: "CLOSE",
        highScore: "HIGH SCORE",
        langName: "English"
    },
    de: {
        score: "PUNKTZAHL",
        settings: "EINSTELLUNGEN",
        speed: "GESCHWINDIGKEIT",
        gameOver: "SYSTEMABSTURZ",
        close: "SCHLIESSEN",
        highScore: "REKORD",
        langName: "Deutsch"
    },
    ru: {
        score: "СЧЕТ",
        settings: "НАСТРОЙКИ",
        speed: "СКОРОСТЬ",
        gameOver: "СИСТЕМА СБОЯ",
        close: "ЗАКРЫТЬ",
        highScore: "РЕКОРД",
        langName: "Русский"
    },
    jp: {
        score: "スコア",
        settings: "設定",
        speed: "スピード",
        gameOver: "システムダウン",
        close: "閉じる",
        highScore: "ハイスコア",
        langName: "日本語"
    },
    es: {
        score: "PUNTUACIÓN",
        settings: "AJUSTES",
        speed: "VELOCIDAD",
        gameOver: "SISTEMA CAÍDO",
        close: "CERRAR",
        highScore: "RÉCORD",
        langName: "Español"
    },
    fr: {
        score: "SCORE",
        settings: "RÉGLAGES",
        speed: "VITESSE",
        gameOver: "SYSTÈME CRASHÉ",
        close: "FERMER",
        highScore: "MEILLEUR SCORE",
        langName: "Français"
    },
    it: {
        score: "PUNTEGGIO",
        settings: "IMPOSTAZIONI",
        speed: "VELOCITÀ",
        gameOver: "SISTEMA CRASHATO",
        close: "CHIUDI",
        highScore: "RECORD",
        langName: "Italiano"
    },
    zh: {
        score: "分数",
        settings: "设置",
        speed: "速度",
        gameOver: "系统崩溃",
        close: "关闭",
        highScore: "最高分",
        langName: "中文"
    },
    ar: {
        score: "النتيجة",
        settings: "الإعدادات",
        speed: "السرعة",
        gameOver: "انهيار النظام",
        close: "إغلاق",
        highScore: "أعلى نتيجة",
        langName: "العربية"
    }
};

/**
 * Otomatik Dil Algılama Sistemi
 * Kullanıcının tarayıcı diline göre sistemi ayarlar.
 */
let currentLang = localStorage.getItem('efe_lang') || 
                  (i18n[navigator.language.split('-')[0]] ? navigator.language.split('-')[0] : 'en');

function t(key) {
    return i18n[currentLang][key] || i18n['en'][key];
}

function setLanguage(lang) {
    if(i18n[lang]) {
        currentLang = lang;
        localStorage.setItem('efe_lang', lang);
        location.reload(); // Arayüzü güncellemek için
    }
}

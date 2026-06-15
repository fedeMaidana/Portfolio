export const LOCALES = ['es', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

const es = {
    'meta.title': 'Federico Maidana | Portafolio',
    'meta.description':
        'Backend Developer enfocado en rendimiento y código seguro. Mar del Plata, Argentina.',
    'meta.personDescription': 'Backend Developer enfocado en rendimiento y código seguro.',

    'skip.label': 'Saltar al contenido principal',
    'backToTop.aria': 'Volver arriba',

    'nav.aria': 'Navegación principal',
    'nav.logo': 'Portafolio',
    'nav.theme.aria': 'Cambiar entre modo claro y oscuro',
    'nav.theme.title': 'Cambiar tema',
    'nav.lang.aria': 'Cambiar idioma',
    'lang.es': 'Español',
    'lang.en': 'Inglés',
    'lang.fr': 'Francés',

    'hero.available': 'Disponible para proyectos',
    'hero.role': 'Backend Developer',
    'hero.location': 'Mar del Plata, Argentina',
    'hero.photoAlt': 'Foto de Federico Maidana',

    'about.title': 'Sobre mí',
    'about.history': 'Pasé de construir interfaces web a diseñar la logica del backend.',
    'about.focus.1': 'Actualmente mi ecosistema principal es ',
    'about.focus.2':
        '. Me da el control de un lenguaje de bajo nivel sin renunciar a la seguridad de memoria.',
    'about.perspective.1': 'Mi background en ',
    'about.perspective.strong1': 'frontend',
    'about.perspective.2': ' me permite diseñar ',
    'about.perspective.strong2': "API's",
    'about.perspective.3':
        ' y arquitecturas pensadas no solo desde el sistema, sino desde el producto y la experiencia de quien las utiliza.',

    'projects.title': 'Proyectos',

    'card.youAreHere': 'Estás aquí',
    'card.stars.aria': '{stars} estrellas en GitHub',
    'card.visit.aria': 'Visitar web del proyecto {title}',
    'card.repo.aria': 'Ver código fuente del proyecto {title} en GitHub',
    'card.details.aria': 'Ver detalles del proyecto {title}',

    'detail.back': 'Volver al inicio',
    'detail.view': 'Ver Proyecto',
    'detail.source': 'Código Fuente',

    'interests.title': 'Intereses',

    'contact.title': 'Contacto',
    'contact.cta.1': '¿Tenés un proyecto en mente o querés charlar sobre ',
    'contact.cta.2': ', arquitectura o sistemas?',
    'contact.form.aria': 'Formulario de contacto',
    'contact.form.name': 'Nombre',
    'contact.form.email': 'Tu correo',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar mensaje',
    'contact.footnote': 'Respondo en menos de 24h.',
} satisfies Record<string, string>;

export type UIKey = keyof typeof es;

const en: Record<UIKey, string> = {
    'meta.title': 'Federico Maidana | Portfolio',
    'meta.description':
        'Backend Developer focused on performance and safe code. Mar del Plata, Argentina.',
    'meta.personDescription': 'Backend Developer focused on performance and safe code.',

    'skip.label': 'Skip to main content',
    'backToTop.aria': 'Back to top',

    'nav.aria': 'Main navigation',
    'nav.logo': 'Portfolio',
    'nav.theme.aria': 'Switch between light and dark mode',
    'nav.theme.title': 'Change theme',
    'nav.lang.aria': 'Change language',
    'lang.es': 'Spanish',
    'lang.en': 'English',
    'lang.fr': 'French',

    'hero.available': 'Available for projects',
    'hero.role': 'Backend Developer',
    'hero.location': 'Mar del Plata, Argentina',
    'hero.photoAlt': 'Photo of Federico Maidana',

    'about.title': 'About me',
    'about.history': 'I went from building web interfaces to designing backend logic.',
    'about.focus.1': 'These days my main ecosystem is ',
    'about.focus.2':
        '. It gives me the control of a low-level language without giving up memory safety.',
    'about.perspective.1': 'My background in ',
    'about.perspective.strong1': 'frontend',
    'about.perspective.2': ' lets me design ',
    'about.perspective.strong2': 'APIs',
    'about.perspective.3':
        ' and architectures shaped not only by the system, but by the product and the experience of the people who use them.',

    'projects.title': 'Projects',

    'card.youAreHere': 'You are here',
    'card.stars.aria': '{stars} stars on GitHub',
    'card.visit.aria': 'Visit the {title} project website',
    'card.repo.aria': 'View the {title} source code on GitHub',
    'card.details.aria': 'View {title} project details',

    'detail.back': 'Back to home',
    'detail.view': 'View Project',
    'detail.source': 'Source Code',

    'interests.title': 'Interests',

    'contact.title': 'Contact',
    'contact.cta.1': 'Got a project in mind, or want to talk ',
    'contact.cta.2': ', architecture or systems?',
    'contact.form.aria': 'Contact form',
    'contact.form.name': 'Name',
    'contact.form.email': 'Your email',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send message',
    'contact.footnote': 'I reply within 24h.',
};

const fr: Record<UIKey, string> = {
    'meta.title': 'Federico Maidana | Portfolio',
    'meta.description':
        'Développeur backend axé sur la performance et le code sûr. Mar del Plata, Argentine.',
    'meta.personDescription': 'Développeur backend axé sur la performance et le code sûr.',

    'skip.label': 'Aller au contenu principal',
    'backToTop.aria': 'Revenir en haut',

    'nav.aria': 'Navigation principale',
    'nav.logo': 'Portfolio',
    'nav.theme.aria': 'Basculer entre le mode clair et sombre',
    'nav.theme.title': 'Changer de thème',
    'nav.lang.aria': 'Changer de langue',
    'lang.es': 'Espagnol',
    'lang.en': 'Anglais',
    'lang.fr': 'Français',

    'hero.available': 'Disponible pour des projets',
    'hero.role': 'Développeur Backend',
    'hero.location': 'Mar del Plata, Argentine',
    'hero.photoAlt': 'Photo de Federico Maidana',

    'about.title': 'À propos',
    'about.history':
        "Je suis passé de la création d'interfaces web à la conception de la logique backend.",
    'about.focus.1': 'Aujourd’hui, mon écosystème principal est ',
    'about.focus.2':
        '. Il me donne le contrôle d’un langage bas niveau sans renoncer à la sûreté mémoire.',
    'about.perspective.1': 'Mon parcours en ',
    'about.perspective.strong1': 'frontend',
    'about.perspective.2': ' me permet de concevoir des ',
    'about.perspective.strong2': 'API',
    'about.perspective.3':
        ' et des architectures pensées non seulement depuis le système, mais aussi depuis le produit et l’expérience de celles et ceux qui les utilisent.',

    'projects.title': 'Projets',

    'card.youAreHere': 'Vous êtes ici',
    'card.stars.aria': '{stars} étoiles sur GitHub',
    'card.visit.aria': 'Visiter le site du projet {title}',
    'card.repo.aria': 'Voir le code source du projet {title} sur GitHub',
    'card.details.aria': 'Voir les détails du projet {title}',

    'detail.back': 'Retour à l’accueil',
    'detail.view': 'Voir le projet',
    'detail.source': 'Code source',

    'interests.title': 'Centres d’intérêt',

    'contact.title': 'Contact',
    'contact.cta.1': 'Vous avez un projet en tête, ou envie de parler ',
    'contact.cta.2': ', architecture ou systèmes ?',
    'contact.form.aria': 'Formulaire de contact',
    'contact.form.name': 'Nom',
    'contact.form.email': 'Votre e-mail',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Envoyer le message',
    'contact.footnote': 'Je réponds en moins de 24h.',
};

export const ui = { es, en, fr } satisfies Record<Locale, Record<UIKey, string>>;

import type { LegalContent } from './index';

const NOTICE = 'Esta es una traducción. En caso de discrepancia con el texto original en inglés, prevalecerá la versión en inglés.';

const es: LegalContent = {
  terms: {
    title: 'Términos del servicio',
    lastUpdated: 'Última actualización: mayo de 2025',
    intro: 'Lee atentamente estos Términos del servicio antes de usar la aplicación Tavira. Estos términos regulan tu acceso y uso de todas las funciones de Tavira.',
    translationNotice: NOTICE,
    sections: [
      {
        title: 'Aceptación de los términos',
        body: 'Al acceder o utilizar Tavira, aceptas quedar vinculado por estos Términos del servicio. Si no estás de acuerdo con ellos, no utilices la aplicación. El uso continuado de Tavira después de cualquier actualización implica la aceptación de los términos revisados.',
      },
      {
        title: 'Uso del servicio',
        body: 'Tavira es una herramienta de presupuesto personal destinada exclusivamente a la gestión lícita de las finanzas personales. Te comprometes a usar el servicio solo para su finalidad prevista y de conformidad con todas las leyes y normativas aplicables. Queda estrictamente prohibido el uso comercial o la reventa del servicio.',
      },
      {
        title: 'Registro de la cuenta',
        body: 'Para acceder a Tavira debes autenticarte con una cuenta de Google válida. Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que se realicen con ella. Avísanos de inmediato si sospechas de un acceso no autorizado a tu cuenta.',
      },
      {
        title: 'Presupuestos y datos financieros',
        body: 'Los datos financieros que introduces en Tavira se almacenan de forma segura y se utilizan únicamente para ofrecer las funciones de presupuesto. Conservas la propiedad de todos los datos que introduces en la aplicación. No utilizamos tus datos financieros con fines publicitarios ni los vendemos a terceros.',
      },
      {
        title: 'Conexión de cuentas bancarias',
        body: 'Tavira se integra con servicios bancarios mediante protocolos seguros de banca abierta. Al conectar una cuenta bancaria, autorizas a Tavira a leer los datos de tus transacciones en tu nombre para el seguimiento del presupuesto. Puedes revocar el acceso bancario en cualquier momento desde los ajustes de la aplicación.',
      },
      {
        title: 'Actividades prohibidas',
        body: 'No puedes usar Tavira para actividades fraudulentas, ilegales o dañinas. Queda estrictamente prohibido intentar aplicar ingeniería inversa, extraer datos de forma automatizada o interrumpir el servicio. Las infracciones pueden conllevar el cierre inmediato de la cuenta y la comunicación a las autoridades competentes.',
      },
      {
        title: 'Terminación',
        body: 'Nos reservamos el derecho de suspender o cerrar tu cuenta si incumples estos términos. Puedes eliminar tu cuenta en cualquier momento desde los ajustes de la aplicación. Tras la terminación, tus datos se tratarán de acuerdo con nuestra Política de privacidad.',
      },
      {
        title: 'Cambios en los términos',
        body: 'Podemos actualizar estos Términos del servicio periódicamente para reflejar cambios en el servicio o en la legislación aplicable. Los cambios importantes se comunicarán mediante una notificación en la aplicación o por correo electrónico. El uso continuado de Tavira una vez que los cambios entren en vigor implica su aceptación.',
      },
      {
        title: 'Contáctanos',
        body: 'Si tienes preguntas o dudas sobre estos Términos del servicio, escríbenos a support@tavira.app. Intentamos responder a todas las consultas en un plazo de 48 horas hábiles.',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    lastUpdated: 'Última actualización: mayo de 2025',
    intro: 'Tu privacidad nos importa. Esta política explica qué datos recopila Tavira, cómo se utilizan y qué opciones tienes respecto a tu información.',
    translationNotice: NOTICE,
    sections: [
      {
        title: 'Información que recopilamos',
        body: 'Recopilamos la información que nos proporcionas directamente, incluidos tu nombre, dirección de correo electrónico y foto de perfil obtenidos mediante el inicio de sesión con Google. También podemos recopilar datos de uso, como interacciones con funciones y registros de errores, para mejorar el servicio.',
      },
      {
        title: 'Cómo usamos tu información',
        body: 'Tu información se utiliza para proporcionar, mantener y mejorar el servicio de presupuestos de Tavira. Usamos tus datos para personalizar tu experiencia, enviarte notificaciones relevantes y responder a solicitudes de soporte.',
      },
      {
        title: 'Compartición de datos',
        body: 'No vendemos ni alquilamos tu información personal. Compartimos datos con proveedores de servicios de confianza que ayudan a operar Tavira, como RevenueCat (gestión de suscripciones) y Google Firebase (autenticación). Estos proveedores pueden recopilar y tratar determinados datos de acuerdo con sus propias políticas de privacidad. También podemos divulgar información si la ley lo exige o para proteger los derechos de los usuarios.',
      },
      {
        title: 'Seguridad de los datos',
        body: 'Aplicamos medidas de seguridad estándar del sector, incluido el cifrado en tránsito (TLS) y en reposo, para proteger tus datos. El acceso a los datos de los usuarios está restringido únicamente al personal autorizado. Aunque nos esforzamos por proteger tu información, ningún método de transmisión por internet es completamente seguro.',
      },
      {
        title: 'Conservación de datos',
        body: 'Conservamos tus datos personales mientras tu cuenta permanezca activa o mientras sea necesario para prestar el servicio. Si eliminas tu cuenta, tus datos se eliminarán de forma permanente en un plazo de 30 días, salvo cuando la ley exija conservarlos.',
      },
      {
        title: 'Tus derechos',
        body: 'Tienes derecho a acceder, corregir o eliminar la información personal que tenemos sobre ti. Para ejercer cualquiera de estos derechos, contáctanos en support@tavira.app.',
      },
      {
        title: 'Privacidad de los menores',
        body: 'Tavira no está dirigida a personas menores de 16 años. No recopilamos conscientemente información personal de menores. Si descubrimos que un menor nos ha proporcionado información personal, la eliminaremos de inmediato.',
      },
      {
        title: 'Cambios en esta política',
        body: 'Podemos actualizar esta Política de privacidad periódicamente para reflejar cambios en nuestras prácticas o en la normativa aplicable. Los cambios importantes se comunicarán a través de la aplicación o por correo electrónico. Si sigues usando Tavira después de que se publiquen los cambios, aceptas la política actualizada.',
      },
      {
        title: 'Contáctanos',
        body: 'Si tienes alguna pregunta sobre esta Política de privacidad o sobre cómo tratamos tus datos, contáctanos en support@tavira.app. Nos comprometemos a atender las cuestiones de privacidad de forma rápida y transparente.',
      },
    ],
  },
};

export default es;

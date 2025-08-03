export async function onRequest(context) {
  const response = await context.next();

  // Solo procesar respuestas HTML
  if (!response.headers.get("content-type")?.startsWith("text/html")) {
    return response;
  }

  // Verificar que las variables de entorno existan
  const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !context.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Variables de entorno faltantes:', missingVars);
    // Continuar sin inyectar el script si faltan variables
    return response;
  }

  // Sanitizar valores para evitar inyección de código
  const sanitize = (value) => {
    if (!value) return '';
    return value.replace(/[<>"']/g, '');
  };

  const firebaseScript = `
  <script>
    // Esta variable global estará disponible para tus otros scripts.
    window.firebaseConfig = {
      apiKey: "${sanitize(context.env.FIREBASE_API_KEY)}",
      authDomain: "${sanitize(context.env.FIREBASE_AUTH_DOMAIN)}",
      projectId: "${sanitize(context.env.FIREBASE_PROJECT_ID)}",
      storageBucket: "${sanitize(context.env.FIREBASE_STORAGE_BUCKET)}",
      messagingSenderId: "${sanitize(context.env.FIREBASE_MESSAGING_SENDER_ID)}",
      appId: "${sanitize(context.env.FIREBASE_APP_ID)}",
      measurementId: "${sanitize(context.env.FIREBASE_MEASUREMENT_ID || '')}"
    };
    
    // También crear una variable global sin window para compatibilidad
    const firebaseConfig = window.firebaseConfig;
    
    console.log('Firebase config cargado correctamente desde middleware');
  </script>
  `;

  const rewriter = new HTMLRewriter().on("head", {
    element(element) {
      element.append(firebaseScript, { html: true });
    },
  });

  return rewriter.transform(response);
}

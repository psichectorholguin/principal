export async function onRequest(context) {
  const response = await context.next();

  if (!response.headers.get("content-type")?.startsWith("text/html")) {
    return response;
  }

  const firebaseScript = `
  <script>
    // Esta variable global estará disponible para tus otros scripts.
    const firebaseConfig = {
      apiKey: "${context.env.FIREBASE_API_KEY}",
      authDomain: "${context.env.FIREBASE_AUTH_DOMAIN}",
      projectId: "${context.env.FIREBASE_PROJECT_ID}",
      storageBucket: "${context.env.FIREBASE_STORAGE_BUCKET}",
      messagingSenderId: "${context.env.FIREBASE_MESSAGING_SENDER_ID}",
      appId: "${context.env.FIREBASE_APP_ID}",
      measurementId: "${context.env.FIREBASE_MEASUREMENT_ID}"
    };
  </script>
  `;

  const rewriter = new HTMLRewriter().on("head", {
    element(element) {
      element.append(firebaseScript, { html: true });
    },
  });

  return rewriter.transform(response);

export default {
  async fetch(request, env, ctx) {
    const FIREBASE_PROJECT_ID = "pap-chat-14552";
    const COLLECTION = "messages";
    const FIREBASE_API_KEY = env.FIREBASE_API_KEY;

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${COLLECTION}?key=${FIREBASE_API_KEY}`;

    const response = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: await request.text()
    });

    return response;
  }
}

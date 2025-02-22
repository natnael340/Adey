const PAYPAL_CLIENT_ID =
  "AVqCrRCFs9clJ0nAt_gb1nopw1gcjw-cFXqfA5JsNUePF9w_dYqldJb1MLZjDxLBaPNQcTxViD5Teqbu";
const PAYPAL_CLIENT_SECRET =
  "EF30t2oX5PJ3kZMworMmXWqOlVWWxXWq-VahqBNwmpPnLJGOrIvzZfCk-aIJ5YqjL-MgLnA4bf9IjOwa";

const auth = Buffer.from(
  PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
).toString("base64");

const x =
  "QVZxQ3JSQ0ZzOWNsSjBuQXRfZ2Ixbm9wdzFnY2p3LWNGWHFmQTVKc05VZVBGOXdfZFlxbGRKYjFNTFpqRHhMQmFQTlFjVHhWaUQ1VGVxYnU6RUYzMHQyb1g1UEoza1pNd29yTW1YV3FPbFZXV3hYV3EtVmFocUJOd21wUG5MSkdPckl2elpmQ2stYUlKNVlxakwtTWdMbkE0YmY5SWpPd2E=";
console.log(auth == x);

const response = fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
  method: "POST",
  body: "grant_type=client_credentials",
  headers: {
    Authorization: `Basic ${auth}`,
  },
});

console.log("hit it");

response.then((r) => console.log(r)).catch((err) => console.log(err));

import { cache } from "react";
import { auth } from "./auth";

/*

// Deduplicate auth() calls during a single server render/request.
// Useful when multiple server components call auth() on the same page.
// The first call resolves, subsequent calls reuse the cached result.
// Note: this is server-only; auth() is not usable on the client.
// With JWT sessions, auth() may not always hit the DB, so savings vary.

*/
export default cache(auth);
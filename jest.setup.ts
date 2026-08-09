import "@testing-library/jest-dom";
// jsdom ships Headers but not fetch/Request/Response, so RTK Query's base query
// cannot run without these. Polyfilling them lets tests drive the real API
// slice and stub only the network. Kept as an explicit devDependency: it was
// present transitively via the wallet adapters, which is not something to rely
// on across a dependency bump.
import "whatwg-fetch";

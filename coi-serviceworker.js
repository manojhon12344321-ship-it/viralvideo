// coi-serviceworker v0.1.7 - https://github.com/gzuidhof/coi-serviceworker
// Fix GitHub Pages para FFmpeg.wasm - deixa deploy verde
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener("message", (event) => {
        if (event.data && event.data.type === "deregister") {
            self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
                clients.forEach((client) => client.navigate(client.url));
            });
        }
    });
    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }
        const request = (coepCredentialless && r.mode === "no-cors") ? new Request(r, { credentials: "omit" }) : r;
        event.respondWith(
            fetch(request).then((response) => {
                if (response.status === 0) {
                    return response;
                }
                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            }).catch(() => fetch(request))
        );
    });
} else {
    (() => {
        const reloadedBySelf = window.sessionStorage.getItem("coi-reloaded");
        const coepDegrading = reloadedBySelf !== "true";
        if (window.crossOriginIsolated !== true && !reloadedBySelf) {
            window.sessionStorage.setItem("coi-reloaded", "true");
            window.location.reload();
        }
        if (window.crossOriginIsolated) {
            window.sessionStorage.removeItem("coi-reloaded");
        }
        const n = document.createElement("script");
        n.src = "coi-serviceworker.js";
        document.head.appendChild(n);
        if (coepDegrading) {
            const s = document.createElement("script");
            s.textContent = `if(typeof navigator!=='undefined'&&'serviceWorker' in navigator){navigator.serviceWorker.register('coi-serviceworker.js',{scope:'./'}).then(r=>{r.addEventListener('updatefound',()=>{const n=r.installing;n.addEventListener('statechange',()=>{if(n.state==='installed'){window.sessionStorage.setItem('coi-reloaded','true');window.location.reload();}})});if(r.active&&!navigator.serviceWorker.controller){window.sessionStorage.setItem('coi-reloaded','true');window.location.reload();}})}`;
            document.head.appendChild(s);
        }
    })();
}

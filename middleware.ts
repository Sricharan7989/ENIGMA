import { auth } from "@/lib/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    // Define route types
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isAuthRoute = nextUrl.pathname.startsWith("/auth");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    // Don't interfere with public API auth routes
    if (isApiAuthRoute) return undefined;

    // Redirect logged-in users away from auth pages
    if (isAuthRoute) {
        if (isLoggedIn) {
            if (req.auth?.user?.role === "ADMIN") {
                return Response.redirect(new URL("/admin", nextUrl));
            }
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return undefined;
    }

    // Protect private routes
    if (!isLoggedIn && (isAdminRoute || isDashboardRoute)) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(
            new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    // RBAC for Admin
    if (isLoggedIn && isAdminRoute && req.auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
    }

    return undefined;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

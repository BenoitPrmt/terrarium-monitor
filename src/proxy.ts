import {auth} from "@/auth"

export default auth((req) => {
    // Middleware logic
})

export const config = {
    matcher: ["/app/:path*"]
}
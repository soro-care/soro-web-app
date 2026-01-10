import jwt from 'jsonwebtoken'

const auth = async(request, response, next) => {
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];
       
        if(!token) {
            return response.status(401).json({
                message: "Provide token"
            });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!decode) {
            return response.status(401).json({
                message: "unauthorized access",
                error: true,
                success: false
            });
        }

        // Attach the entire decoded user, not just ID
        request.user = decode;
        request.userId = decode.id  // Changed from request.userId = decode.id

        next();
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Authentication failed",
            error: true,
            success: false
        });
    }
}

export default auth